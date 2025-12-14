import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async createEvent(userId: number, isApproved: boolean, dto: CreateEventDto) {
    if (!isApproved) {
      throw new ForbiddenException('Contul tău de organizator nu este aprobat');
    }

    return this.prisma.events.create({
      data: {
        title: dto.title,
        description: dto.description,
        date_start: new Date(dto.date_start),
        deadline: new Date(dto.deadline),
        location: dto.location,
        duration: dto.duration,
        max_participants: dto.max_participants,
        faculty_id: dto.faculty_id,
        type_id: dto.type_id,
        organizer_id: userId,
        status: EventStatus.draft,
        isArchived: false,
      },
    });
  }

  async getMyEvents(userId: number) {
    return this.prisma.events.findMany({
      where: { organizer_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateEvent(eventId: number, userId: number, dto: UpdateEventDto) {
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
    });

    if (!event) throw new NotFoundException('Eveniment inexistent');
    if (event.organizer_id !== userId)
      throw new ForbiddenException('Nu ai acces');
    if (event.status !== EventStatus.draft)
      throw new BadRequestException('Poți edita doar evenimente draft');

    return this.prisma.events.update({
      where: { id_event: eventId },
      data: dto,
    });
  }

  async submitEvent(eventId: number, userId: number, isApproved: boolean) {
    if (!isApproved) throw new ForbiddenException('Organizer neaprobat');

    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
    });

    if (!event) throw new NotFoundException('Eveniment inexistent');
    if (event.organizer_id !== userId)
      throw new ForbiddenException('Nu ai acces');
    if (event.status !== EventStatus.draft)
      throw new BadRequestException('Doar draft poate fi trimis');

    return this.prisma.events.update({
      where: { id_event: eventId },
      data: { status: EventStatus.pending },
    });
  }

  async archiveEvent(eventId: number, userId: number) {
    return this.prisma.events.update({
      where: { id_event: eventId },
      data: {
        isArchived: true,
        status: EventStatus.inactive,
      },
    });
  }

  async deleteEvent(eventId: number, userId: number) {
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
    });

    if (!event) throw new NotFoundException('Eveniment inexistent');
    if (event.organizer_id !== userId)
      throw new ForbiddenException('Nu ai acces');
    if (event.status === EventStatus.active)
      throw new BadRequestException('Eveniment activ – arhivează-l');

    await this.prisma.events.delete({
      where: { id_event: eventId },
    });

    return { message: 'Eveniment șters definitiv' };
  }

  async listActiveEvents() {
    return this.prisma.events.findMany({
      where: {
        status: EventStatus.active,
        isArchived: false,
      },
      orderBy: { date_start: 'asc' },
    });
  }
  async getMyArchivedEvents(userId: number) {
    return this.prisma.events.findMany({
      where: {
        organizer_id: userId,
        isArchived: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
