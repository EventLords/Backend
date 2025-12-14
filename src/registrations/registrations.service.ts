import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus } from '@prisma/client';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  // ======================================================
  // ÎNSCRIERE STUDENT
  // ======================================================
  async registerStudent(userId: number, eventId: number) {
    // 1. verificăm evenimentul
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
    });

    if (!event) {
      throw new NotFoundException('Eveniment inexistent');
    }

    if (event.status !== EventStatus.active || event.isArchived) {
      throw new BadRequestException('Eveniment indisponibil');
    }

    // 2. verificăm dacă studentul e deja înscris
    const existing = await this.prisma.registrations.findUnique({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Ești deja înscris la acest eveniment');
    }

    // 3. înscriere
    return this.prisma.registrations.create({
      data: {
        event_id: eventId,
        user_id: userId,
      },
    });
  }

  // ======================================================
  // RENUNȚARE STUDENT
  // ======================================================
  async unregisterStudent(userId: number, eventId: number) {
    // 1. verificăm dacă există înscrierea
    const registration = await this.prisma.registrations.findUnique({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId,
        },
      },
    });

    if (!registration) {
      throw new BadRequestException('Nu ești înscris la acest eveniment');
    }

    // 2. ștergem înscrierea
    await this.prisma.registrations.delete({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId,
        },
      },
    });

    return {
      message: 'Ai renunțat cu succes la eveniment',
    };
  }
  async getMyRegistrations(userId: number) {
    return this.prisma.registrations.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        registration_date: 'desc',
      },
      include: {
        events: {
          select: {
            id_event: true,
            title: true,
            description: true,
            date_start: true,
            deadline: true,
            location: true,
            status: true,
            isArchived: true,
          },
        },
      },
    });
  }
}
