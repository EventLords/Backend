import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus, NotificationType } from '@prisma/client';
import { EventFilterDto } from './dto/event-filter.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private readonly SENSITIVE_FIELDS = [
    'title',
    'date_start',
    'deadline',
    'location',
    'faculty_id',
    'type_id',
    'max_participants',
  ];

  private isSensitiveUpdate(dto: Record<string, any>): boolean {
    return Object.keys(dto).some((key) => this.SENSITIVE_FIELDS.includes(key));
  }
  private async notifyAdmins(data: {
    eventId: number;
    title: string;
    message: string;
    type: NotificationType;
  }) {
    const admins = await this.prisma.users.findMany({
      where: { role: 'ADMIN' },
      select: { id_user: true },
    });

    for (const admin of admins) {
      const exists = await this.prisma.notifications.findFirst({
        where: {
          user_id: admin.id_user,
          event_id: data.eventId,
          type: data.type,
          read_at: null,
        },
      });

      if (!exists) {
        await this.notificationsService.createNotification({
          userId: admin.id_user,
          eventId: data.eventId,
          type: data.type,
          title: data.title,
          message: data.message,
        });
      }
    }
  }

  // =========================
  // CREATE EVENT
  // =========================
  async createEvent(userId: number, isApproved: boolean, dto: CreateEventDto) {
    if (!isApproved) {
      throw new ForbiddenException('Contul tău de organizator nu este aprobat');
    }

    const created = await this.prisma.events.create({
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

    // 🔔 NOTIFICARE: event creat
    await this.notificationsService.createNotification({
      userId: userId,
      eventId: created.id_event,
      type: NotificationType.EVENT_CREATED,
      title: 'Eveniment creat',
      message: `Evenimentul "${created.title}" a fost creat (draft).`,
    });

    return created;
  }

  // =========================
  // GET MY EVENTS
  // =========================
  async getMyEvents(userId: number) {
    return this.prisma.events.findMany({
      where: { organizer_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  // =========================
  // UPDATE EVENT
  // =========================
  async updateEvent(eventId: number, userId: number, dto: UpdateEventDto) {
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
    });

    if (!event) throw new NotFoundException('Eveniment inexistent');
    if (event.organizer_id !== userId)
      throw new ForbiddenException('Nu ai acces');

    // ✅ Permitem editare pentru: draft, rejected, active
    if (
      event.status !== EventStatus.draft &&
      event.status !== EventStatus.rejected &&
      event.status !== EventStatus.active
    ) {
      throw new BadRequestException(
        'Nu poți edita un eveniment aflat în verificare (pending) sau inactiv.',
      );
    }

    const isSensitive = this.isSensitiveUpdate(dto as any);

    // 🔁 dacă e ACTIVE și modificarea e sensibilă → revalidare
    const nextStatus =
      event.status === EventStatus.rejected
        ? EventStatus.pending
        : event.status === EventStatus.active && isSensitive
          ? EventStatus.pending
          : event.status;

    const updated = await this.prisma.events.update({
      where: { id_event: eventId },
      data: {
        ...dto,
        status: nextStatus,
      },
    });

    // 🔔 NOTIFICĂRI
    if (nextStatus === EventStatus.pending) {
      // 🔔 organizer
      await this.notificationsService.createNotification({
        userId,
        eventId: updated.id_event,
        type: NotificationType.EVENT_SUBMITTED_FOR_REVIEW,
        title: 'Eveniment trimis spre reaprobare',
        message:
          event.status === EventStatus.rejected
            ? `Evenimentul "${updated.title}" a fost corectat și retrimis spre verificare.`
            : `Ai modificat informații importante la "${updated.title}". Evenimentul a fost retrimis spre aprobare.`,
      });

      // 🔔 admin
      await this.notifyAdmins({
        eventId: updated.id_event,
        type: NotificationType.EVENT_SUBMITTED_FOR_REVIEW,
        title: 'Eveniment necesită revalidare',
        message:
          event.status === EventStatus.rejected
            ? `Evenimentul "${updated.title}" a fost corectat după respingere și necesită reevaluare.`
            : `Evenimentul "${updated.title}" a fost modificat și trebuie reevaluat.`,
      });
    } else {
      await this.notificationsService.createNotification({
        userId,
        eventId: updated.id_event,
        type: NotificationType.EVENT_UPDATED,
        title: 'Eveniment actualizat',
        message: `Evenimentul "${updated.title}" a fost actualizat.`,
      });
    }

    return updated;
  }

  // =========================
  // SUBMIT EVENT
  // =========================
  async submitEvent(eventId: number, userId: number, isApproved: boolean) {
    if (!isApproved) {
      throw new ForbiddenException('Organizer neaprobat');
    }

    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
    });

    if (!event) throw new NotFoundException('Eveniment inexistent');
    if (event.organizer_id !== userId)
      throw new ForbiddenException('Nu ai acces');
    if (event.status !== EventStatus.draft)
      throw new BadRequestException('Doar draft poate fi trimis');

    const updated = await this.prisma.events.update({
      where: { id_event: eventId },
      data: { status: EventStatus.pending },
    });

    // 🔔 NOTIFICARE: trimis spre aprobare
    await this.notificationsService.createNotification({
      userId: userId,
      eventId: updated.id_event,
      type: NotificationType.EVENT_SUBMITTED_FOR_REVIEW,
      title: 'Trimis spre aprobare',
      message: `Evenimentul "${updated.title}" a fost trimis spre verificare.`,
    });
    await this.notifyAdmins({
      eventId: updated.id_event,
      type: NotificationType.ADMIN_EVENT_PENDING,
      title: 'Eveniment nou spre aprobare',
      message: `Evenimentul "${updated.title}" a fost trimis spre aprobare de organizer.`,
    });

    return updated;
  }

  // =========================
  // ARCHIVE EVENT
  // =========================
  async archiveEvent(eventId: number, userId: number) {
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
    });

    if (!event) throw new NotFoundException('Eveniment inexistent');
    if (event.organizer_id !== userId)
      throw new ForbiddenException('Nu ai acces');

    return this.prisma.events.update({
      where: { id_event: eventId },
      data: {
        isArchived: true,
        status: EventStatus.inactive,
      },
    });
  }

  // =========================
  // DELETE EVENT
  // =========================
  async deleteEvent(eventId: number, userId: number) {
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
    });

    if (!event) throw new NotFoundException('Eveniment inexistent');
    if (event.organizer_id !== userId)
      throw new ForbiddenException('Nu ai acces');
    if (event.status === EventStatus.active)
      throw new BadRequestException('Eveniment activ – arhivează-l');

    // 🔔 NOTIFICARE: event șters
    await this.notificationsService.createNotification({
      userId: userId,
      eventId: event.id_event,
      type: NotificationType.EVENT_DELETED,
      title: 'Eveniment șters',
      message: `Evenimentul "${event.title}" a fost șters.`,
    });

    await this.prisma.events.delete({
      where: { id_event: eventId },
    });

    return { message: 'Eveniment șters definitiv' };
  }

  // =========================
  // LIST ACTIVE EVENTS (PUBLIC)
  // =========================
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
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        }),
        date_start: {
          gte: dateFrom ? new Date(dateFrom) : undefined,
          lte: dateTo ? new Date(dateTo) : undefined,
        },
      },
      orderBy: { date_start: 'asc' },
    });
  }

  // =========================
  // FAVORITES
  // =========================
  async toggleFavorite(userId: number, eventId: number) {
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

    const existing = await this.prisma.favorite_events.findUnique({
      where: {
        user_id_event_id: {
          user_id: userId,
          event_id: eventId,
        },
      },
    });

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

    await this.prisma.favorite_events.create({
      data: {
        user_id: userId,
        event_id: eventId,
      },
    });

    await this.notificationsService.createNotification({
      userId: userId,
      eventId: eventId,
      type: NotificationType.EVENT_FAVORITED,
      title: 'Eveniment salvat',
      message: `Evenimentul "${event.title}" a fost adăugat la favorite.`,
    });

    return { favorited: true };
  }
  // =========================
  // GET MY ARCHIVED EVENTS
  // =========================
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

  // =========================
  // GET EVENT BY ID (PUBLIC - only active)
  // =========================
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

  // =========================
  // GET EVENT BY ID FOR ORGANIZER (full details)
  // =========================
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
}
