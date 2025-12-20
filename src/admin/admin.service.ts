import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // EVENTS
  // =========================

  async getPendingEvents() {
    return this.prisma.events.findMany({
      where: {
        status: EventStatus.pending,
        isArchived: false,
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  }

  async approveEvent(eventId: number) {
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
    });

    if (!event) {
      throw new NotFoundException('Eveniment inexistent');
    }

    if (event.status !== EventStatus.pending) {
      throw new BadRequestException(
        'Doar evenimentele pending pot fi aprobate',
      );
    }

    return this.prisma.events.update({
      where: { id_event: eventId },
      data: { status: EventStatus.active },
    });
  }

  async rejectEvent(eventId: number) {
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
    });

    if (!event) {
      throw new NotFoundException('Eveniment inexistent');
    }

    if (event.status !== EventStatus.pending) {
      throw new BadRequestException(
        'Doar evenimentele pending pot fi respinse',
      );
    }

    return this.prisma.events.update({
      where: { id_event: eventId },
      data: { status: EventStatus.rejected },
    });
  }

  // =========================
  // ORGANIZERS
  // =========================

  async getPendingOrganizers() {
    return this.prisma.users.findMany({
      where: {
        role: 'ORGANIZER',
        isApproved: false,
        isRejected: false,
      },
      select: {
        id_user: true,
        email: true,
        organization_name: true,
        organization_type: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  }

  async approveOrganizer(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { id_user: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilizator inexistent');
    }

    if (user.role !== 'ORGANIZER') {
      throw new BadRequestException('Utilizatorul nu este organizer');
    }

    if (user.isApproved) {
      throw new BadRequestException('Organizer deja aprobat');
    }

    return this.prisma.users.update({
      where: { id_user: userId },
      data: {
        isApproved: true,
        isRejected: false,
      },
    });
  }

  async rejectOrganizer(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { id_user: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilizator inexistent');
    }

    if (user.role !== 'ORGANIZER') {
      throw new BadRequestException('Utilizatorul nu este organizer');
    }

    if (user.isRejected) {
      throw new BadRequestException('Organizer deja respins');
    }

    return this.prisma.users.update({
      where: { id_user: userId },
      data: {
        isRejected: true,
        isApproved: false,
      },
    });
  }
}
