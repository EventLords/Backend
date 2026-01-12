import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import * as crypto from 'crypto';
import { EventStatus } from '@prisma/client';

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private readonly REGISTRATION_THRESHOLDS = [1];

  async registerStudent(userId: number, eventId: number) {
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
      select: {
        id_event: true,
        title: true,
        max_participants: true,
        organizer_id: true,
        status: true,
        isArchived: true,
      },
    });

    if (!event) throw new BadRequestException('Eveniment inexistent');
    if (event.isArchived) throw new BadRequestException('Eveniment arhivat');

    if (event.max_participants) {
      const currentCount = await this.prisma.registrations.count({
        where: { event_id: eventId },
      });
      if (currentCount >= event.max_participants) {
        throw new BadRequestException('Evenimentul este plin');
      }
    }

    try {
      const registration = await this.prisma.registrations.create({
        data: {
          user_id: userId,
          event_id: eventId,
          qr_token: crypto.randomUUID(),
        },
        include: {
          events: {
            include: {
              files: true,
              event_types: true,
              users: true,
            },
          },
        },
      });

      const totalRegistrations = await this.prisma.registrations.count({
        where: { event_id: eventId },
      });

      if (event.organizer_id) {
        if (this.REGISTRATION_THRESHOLDS.includes(totalRegistrations)) {
          await this.notificationsService.createNotification({
            userId: event.organizer_id,
            eventId: eventId,
            type: NotificationType.EVENT_THRESHOLD_REACHED,
            title: 'Prag de participanți atins',
            message: `Evenimentul "${event.title}" a ajuns la ${totalRegistrations} participanți înscriși.`,
          });
        }
      }

      await this.notificationsService.createNotification({
        userId: userId,
        eventId: eventId,
        type: NotificationType.EVENT_REGISTERED,
        title: 'Înscriere confirmată',
        message: `Te-ai înscris cu succes la evenimentul "${registration.events.title}". Biletul cu QR code este disponibil.`,
      });

      return registration;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new BadRequestException('Ești deja înscris la acest eveniment');
      }
      throw e;
    }
  }

  async getMyRegistrations(userId: number) {
    return this.prisma.registrations.findMany({
      where: { user_id: userId },
      include: {
        events: {
          include: {
            files: true, // 👈 Aici stau pozele
            event_types: true, // Pentru categorie
            users: true, // Pentru organizator
            faculties: true,
          },
        },
      },
      orderBy: {
        id_registration: 'desc',
      },
    });
  }

  async unregisterStudent(userId: number, eventId: number) {
    const registration = await this.prisma.registrations.findFirst({
      where: { user_id: userId, event_id: eventId },
      include: { events: true },
    });

    if (!registration)
      throw new BadRequestException('Nu ești înscris la acest eveniment');

    await this.prisma.registrations.delete({
      where: { id_registration: registration.id_registration },
    });

    await this.notificationsService.createNotification({
      userId,
      eventId,
      type: NotificationType.EVENT_UNREGISTERED,
      title: 'Retragere confirmată',
      message: `Te-ai retras de la evenimentul "${registration.events.title}".`,
    });

    return { message: 'Retragere realizată cu succes' };
  }

  async getParticipants(
    organizerId: number,
    eventId: number,
    status?: 'all' | 'checked-in' | 'absent',
  ) {
    const where: any = {
      event_id: eventId,
      events: { organizer_id: organizerId },
    };
    if (status === 'checked-in') where.checked_in = true;
    if (status === 'absent') where.checked_in = false;

    return this.prisma.registrations.findMany({
      where,
      include: { users: true },
    });
  }

  async checkInParticipant(
    organizerId: number,
    eventId: number,
    qrToken: string,
  ) {
    const registration = await this.prisma.registrations.findFirst({
      where: {
        event_id: eventId,
        qr_token: qrToken,
        events: { organizer_id: organizerId },
      },
    });

    if (!registration) throw new BadRequestException('QR invalid');
    if (registration.checked_in) throw new BadRequestException('Deja prezent');

    const updated = await this.prisma.registrations.update({
      where: { id_registration: registration.id_registration },
      data: { checked_in: true },
    });

    return {
      message: 'Check-in realizat cu succes',
      registrationId: updated.id_registration,
    };
  }

  async exportParticipantsCsv(organizerId: number, eventId: number) {
    const participants = await this.prisma.registrations.findMany({
      where: { event_id: eventId, events: { organizer_id: organizerId } },
      include: { users: true },
    });

    const delimiter = ';';
    const bom = '\uFEFF';
    const header = `Nume${delimiter}Prenume${delimiter}Email${delimiter}Status Check-In\n`;
    const rows = participants
      .map((p) => {
        const lastName = (p.users.last_name || '').replace(/;/g, ' ');
        const firstName = (p.users.first_name || '').replace(/;/g, ' ');
        const email = (p.users.email || '').replace(/;/g, ' ');
        return `${lastName}${delimiter}${firstName}${delimiter}${email}${delimiter}${p.checked_in ? 'PREZENT' : 'ABSENT'}`;
      })
      .join('\n');

    return bom + `sep=${delimiter}\n` + header + rows;
  }

  async getEventParticipationStats(organizerId: number, eventId: number) {
    const event = await this.prisma.events.findFirst({
      where: { id_event: eventId, organizer_id: organizerId },
    });
    if (!event) throw new ForbiddenException('Acces refuzat');

    const totalRegistered = await this.prisma.registrations.count({
      where: { event_id: eventId },
    });
    const totalCheckedIn = await this.prisma.registrations.count({
      where: { event_id: eventId, checked_in: true },
    });

    return {
      eventId,
      totalRegistered,
      totalCheckedIn,
      totalAbsent: totalRegistered - totalCheckedIn,
    };
  }

  async getStudentDashboardStats(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const regs = await this.prisma.registrations.findMany({
      where: { user_id: userId },
      include: {
        events: {
          select: {
            id_event: true,
            date_start: true,
            duration: true,
            status: true,
            isArchived: true,
          },
        },
      },
    });

    const enrolledEvents = regs
      .map((r) => r.events)
      .filter(Boolean)
      .filter((e) => e.status === EventStatus.active && !e.isArchived);

    const upcoming = enrolledEvents.filter(
      (e) => new Date(e.date_start) >= today,
    );
    const completed = enrolledEvents.filter(
      (e) => new Date(e.date_start) < today,
    );
    const totalHours = completed.reduce(
      (sum, e) => sum + (Number(e.duration) || 0),
      0,
    );

    return {
      enrolledEvents: enrolledEvents.length,
      upcomingEvents: upcoming.length,
      completedEvents: completed.length,
      totalHours,
    };
  }
}
