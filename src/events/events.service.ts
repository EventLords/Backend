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
import { EventFilterDto } from './dto/event-filter.dto';

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
  async listActiveEvents(filters: EventFilterDto = {}) {
    const { facultyId, typeId, organizerId, search, dateFrom, dateTo } =
      filters;

    return this.prisma.events.findMany({
      where: {
        status: EventStatus.active,
        isArchived: false,

        faculty_id: facultyId ? Number(facultyId) : undefined,
        type_id: typeId ? Number(typeId) : undefined,
        organizer_id: organizerId ? Number(organizerId) : undefined,

        ...(search && {
          OR: [
            {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              location: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              users: {
                OR: [
                  {
                    first_name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    last_name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          ],
        }),

        date_start: {
          gte: dateFrom ? new Date(dateFrom) : undefined,
          lte: dateTo ? new Date(dateTo) : undefined,
        },
      },
      orderBy: {
        date_start: 'asc',
      },
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
  async getEventById(eventId: number) {
    const event = await this.prisma.events.findFirst({
      where: {
        id_event: eventId,
        status: EventStatus.active,
        isArchived: false,
      },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            organization_name: true,
          },
        },
        event_types: true,
        faculties: true,
        files: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Eveniment inexistent');
    }

    return event;
  }
  async getEventByIdOrganizer(eventId: number, userId: number) {
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
      include: {
        registrations: true,
        feedback: true,
        files: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Eveniment inexistent');
    }

    if (event.organizer_id !== userId) {
      throw new ForbiddenException('Nu ai acces la acest eveniment');
    }

    return event;
  }
  async toggleFavorite(userId: number, eventId: number) {
    // verifică dacă eventul există și e activ
    const event = await this.prisma.events.findFirst({
      where: {
        id_event: eventId,
        status: EventStatus.active,
        isArchived: false,
      },
    });

    if (!event) {
      throw new NotFoundException('Eveniment indisponibil');
    }

    // verifică dacă e deja favorit
    const existing = await this.prisma.favorite_events.findUnique({
      where: {
        user_id_event_id: {
          user_id: userId,
          event_id: eventId,
        },
      },
    });

    // dacă există → remove (toggle OFF)
    if (existing) {
      await this.prisma.favorite_events.delete({
        where: {
          user_id_event_id: {
            user_id: userId,
            event_id: eventId,
          },
        },
      });

      return { favorited: false };
    }

    // dacă NU există → add (toggle ON)
    await this.prisma.favorite_events.create({
      data: {
        user_id: userId,
        event_id: eventId,
      },
    });

    return { favorited: true };
  }
}
