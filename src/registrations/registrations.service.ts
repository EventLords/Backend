import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ================= STUDENT =================

  async registerStudent(userId: number, eventId: number) {
    try {
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

      // 🔔 NOTIFICARE: înscriere + QR
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
        throw new BadRequestException(
          'You are already registered for this event',
        );
      }
      throw e;
    }
  }

  async unregisterStudent(userId: number, eventId: number) {
    return this.prisma.registrations.deleteMany({
      where: {
        user_id: userId,
        event_id: eventId,
      },
    });
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
