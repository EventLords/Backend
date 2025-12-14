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
}
