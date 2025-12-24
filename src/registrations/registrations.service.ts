import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}
  private readonly REGISTRATION_THRESHOLDS = [1];

  // ================= STUDENT =================

  async registerStudent(userId: number, eventId: number) {
    // 1) ia evenimentul
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

    if (!event) {
      throw new BadRequestException('Eveniment inexistent');
    }

    // (opțional, dar recomandat) nu te lăsa să te înscrii la evenimente inactive/arhivate
    if (event.isArchived) {
      throw new BadRequestException('Eveniment arhivat');
    }

    // 2) dacă există limită, verifică dacă e plin (înainte de create)
    if (event.max_participants) {
      const currentCount = await this.prisma.registrations.count({
        where: { event_id: eventId },
      });

      if (currentCount >= event.max_participants) {
        throw new BadRequestException('Evenimentul este plin');
      }
    }

    try {
      // 3) creează registration
      const registration = await this.prisma.registrations.create({
        data: {
          user_id: userId,
          event_id: eventId,
          qr_token: crypto.randomUUID(),
        },
        include: {
          events: true,
        },
      });
      // 4️⃣ număr total înscrieri DUPĂ create
      const totalRegistrations = await this.prisma.registrations.count({
        where: { event_id: eventId },
      });

      // 5️⃣ verificăm pragurile
      if (event.organizer_id) {
        for (const threshold of this.REGISTRATION_THRESHOLDS) {
          if (totalRegistrations === threshold) {
            await this.notificationsService.createNotification({
              userId: event.organizer_id,
              eventId: eventId,
              type: NotificationType.EVENT_THRESHOLD_REACHED,
              title: 'Prag de participanți atins',
              message: `Evenimentul "${event.title}" a ajuns la ${threshold} participanți înscriși.`,
            });
          }
        }
      }

      // 🔔 NOTIFICARE: înscriere + QR (student)
      await this.notificationsService.createNotification({
        userId: userId,
        eventId: eventId,
        type: NotificationType.EVENT_REGISTERED,
        title: 'Înscriere confirmată',
        message: `Te-ai înscris cu succes la evenimentul "${registration.events.title}". Biletul cu QR code este disponibil.`,
      });

      // 4) după create: dacă s-a atins limita → notifică organizerul
      if (event.max_participants && event.organizer_id) {
        const countAfter = await this.prisma.registrations.count({
          where: { event_id: eventId },
        });

        if (countAfter === event.max_participants) {
          await this.notificationsService.createNotification({
            userId: event.organizer_id,
            eventId: eventId,
            type: NotificationType.EVENT_FULL, // vezi PAS 3
            title: 'Eveniment plin',
            message: `Evenimentul "${event.title}" a atins numărul maxim de participanți (${event.max_participants}).`,
          });
        }
      }

      return registration;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new BadRequestException(
          'You are already registered for this event',
        );
      }
      throw e;
    }
  }

  async unregisterStudent(userId: number, eventId: number) {
    const registration = await this.prisma.registrations.findFirst({
      where: {
        user_id: userId,
        event_id: eventId,
      },
      include: {
        events: true,
      },
    });

    if (!registration) {
      throw new BadRequestException('Nu ești înscris la acest eveniment');
    }

    await this.prisma.registrations.delete({
      where: {
        id_registration: registration.id_registration,
      },
    });

    // 🔔 notificare student
    await this.notificationsService.createNotification({
      userId,
      eventId,
      type: NotificationType.EVENT_UNREGISTERED,
      title: 'Retragere confirmată',
      message: `Te-ai retras de la evenimentul "${registration.events.title}".`,
    });
    // DUPĂ delete
    const countAfter = await this.prisma.registrations.count({
      where: { event_id: eventId },
    });

    const event = registration.events;

    // dacă înainte era plin și acum nu mai e
    if (
      event.max_participants &&
      countAfter === event.max_participants - 1 &&
      event.organizer_id
    ) {
      await this.notificationsService.createNotification({
        userId: event.organizer_id,
        eventId,
        type: NotificationType.EVENT_UPDATED,
        title: 'Locuri disponibile',
        message: `Un participant s-a retras. Evenimentul "${event.title}" are din nou locuri disponibile.`,
      });
    }

    return { message: 'Retragere realizată cu succes' };
  }

  async getMyRegistrations(userId: number) {
    return this.prisma.registrations.findMany({
      where: {
        user_id: userId,
      },
      include: {
        events: true,
      },
    });
  }

  // ================= ORGANIZER =================

  async getParticipants(
    organizerId: number,
    eventId: number,
    status?: 'all' | 'checked-in' | 'absent',
  ) {
    const where: any = {
      event_id: eventId,
      events: {
        organizer_id: organizerId,
      },
    };

    if (status === 'checked-in') {
      where.checked_in = true;
    }

    if (status === 'absent') {
      where.checked_in = false;
    }

    return this.prisma.registrations.findMany({
      where,
      include: {
        users: true,
      },
    });
  }

  async checkInParticipant(
    organizerId: number,
    eventId: number,
    qrToken: string,
  ) {
    // 1️⃣ cautăm înregistrarea
    const registration = await this.prisma.registrations.findFirst({
      where: {
        event_id: eventId,
        qr_token: qrToken,
        events: {
          organizer_id: organizerId,
        },
      },
    });

    if (!registration) {
      throw new BadRequestException(
        'QR invalid sau nu aparține acestui eveniment',
      );
    }

    // 2️⃣ verificăm dacă nu e deja check-in
    if (registration.checked_in) {
      throw new BadRequestException('Participantul este deja bifat ca prezent');
    }

    // 3️⃣ facem check-in
    const updated = await this.prisma.registrations.update({
      where: {
        id_registration: registration.id_registration,
      },
      data: {
        checked_in: true,
      },
    });

    return {
      message: 'Check-in realizat cu succes',
      registrationId: updated.id_registration,
    };
  }

  async exportParticipantsCsv(organizerId: number, eventId: number) {
    const participants = await this.prisma.registrations.findMany({
      where: {
        event_id: eventId,
        events: {
          organizer_id: organizerId,
        },
      },
      include: {
        users: true,
      },
    });

    const header = 'Last Name,First Name,Email,Checked In\n';
    const rows = participants
      .map(
        (p) =>
          `${p.users.last_name},${p.users.first_name},${p.users.email},${
            p.checked_in ? 'YES' : 'NO'
          }`,
      )
      .join('\n');

    return header + rows;
  }

  // ================= ✅ STATISTICI PARTICIPARE =================

  async getEventParticipationStats(organizerId: number, eventId: number) {
    const event = await this.prisma.events.findFirst({
      where: {
        id_event: eventId,
        organizer_id: organizerId,
      },
    });

    if (!event) {
      throw new ForbiddenException('Nu ai acces la acest eveniment');
    }

    const totalRegistered = await this.prisma.registrations.count({
      where: {
        event_id: eventId,
      },
    });

    const totalCheckedIn = await this.prisma.registrations.count({
      where: {
        event_id: eventId,
        checked_in: true,
      },
    });

    return {
      eventId,
      totalRegistered,
      totalCheckedIn,
      totalAbsent: totalRegistered - totalCheckedIn,
    };
  }
}
