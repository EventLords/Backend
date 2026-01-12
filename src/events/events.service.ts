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
import { fromZonedTime } from 'date-fns-tz';
import { promises as fs } from 'fs';

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

  async createEvent(userId: number, isApproved: boolean, dto: CreateEventDto) {
    if (!isApproved) {
      throw new ForbiddenException('Contul tău de organizator nu este aprobat');
    }

    const timeZone = 'Europe/Bucharest';

    const startDate = fromZonedTime(dto.date_start, timeZone);
    const deadlineDate = fromZonedTime(dto.date_start, timeZone);

    const now = new Date();

    if (startDate < now) {
      throw new BadRequestException('Data evenimentului nu poate fi în trecut');
    }

    if (deadlineDate < now) {
    }

    if (deadlineDate > startDate) {
      throw new BadRequestException(
        'Deadline-ul înscrierilor nu poate fi după data de începere a evenimentului',
      );
    }

    if (dto.max_participants <= 0) {
      throw new BadRequestException(
        'Numărul maxim de participanți trebuie să fie mai mare decât 0',
      );
    }

    const created = await this.prisma.events.create({
      data: {
        title: dto.title,
        description: dto.description,
        date_start: startDate,
        deadline: deadlineDate,
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

    return created;
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

    if (
      event.status !== EventStatus.draft &&
      event.status !== EventStatus.rejected &&
      event.status !== EventStatus.active
    ) {
      throw new BadRequestException(
        'Nu poți edita un eveniment aflat în verificare (pending) sau arhivat.',
      );
    }

    const updateData: any = { ...dto };

    const timeZone = 'Europe/Bucharest';

    if ((dto as any)['date']) {
      updateData.date_start = fromZonedTime((dto as any)['date'], timeZone);
      delete updateData['date'];
    } else if (dto.date_start) {
      updateData.date_start = fromZonedTime(dto.date_start, timeZone);
    }

    if (dto.deadline) {
      updateData.deadline = fromZonedTime(dto.deadline, timeZone);
    }

    if ((dto as any)['name']) {
      updateData.title = (dto as any)['name'];
      delete updateData['name'];
    }

    if (updateData.max_participants)
      updateData.max_participants = Number(updateData.max_participants);
    if (updateData.faculty_id) {
      const fId = Number(updateData.faculty_id);
      if (fId > 0) updateData.faculty_id = fId;
      else delete updateData.faculty_id;
    }
    if (updateData.type_id) {
      const tId = Number(updateData.type_id);
      if (tId > 0) updateData.type_id = tId;
      else delete updateData.type_id;
    }

    delete updateData.status;

    const isSensitive = this.isSensitiveUpdate(updateData);
    let nextStatus: EventStatus = event.status;

    if (event.status === EventStatus.rejected) {
      nextStatus = EventStatus.pending;
    } else if (event.status === EventStatus.active && isSensitive) {
      nextStatus = EventStatus.pending;
    }

    updateData.status = nextStatus;

    const updated = await this.prisma.events.update({
      where: { id_event: eventId },
      data: updateData,
    });

    if (nextStatus === EventStatus.pending) {
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

  async deleteEvent(eventId: number, userId: number) {
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
      include: { files: true },
    });

    if (!event) throw new NotFoundException('Eveniment inexistent');
    if (event.organizer_id !== userId)
      throw new ForbiddenException('Nu ai acces');

    if (event.status === EventStatus.active)
      throw new BadRequestException(
        'Evenimentul este activ. Arhivează-l în loc să-l ștergi.',
      );

    await this.prisma.$transaction(async (tx) => {
      await tx.registrations.deleteMany({ where: { event_id: eventId } });
      await tx.feedback.deleteMany({ where: { event_id: eventId } });
      await tx.favorite_events.deleteMany({ where: { event_id: eventId } });
      await tx.reminder_logs.deleteMany({ where: { event_id: eventId } });
      await tx.files.deleteMany({ where: { event_id: eventId } });
      await tx.events.delete({ where: { id_event: eventId } });
    });

    if (event.files && event.files.length > 0) {
      for (const file of event.files) {
        try {
          await fs.unlink(file.file_path);
        } catch (err) {
          console.error(
            `Nu s-a putut șterge fișierul fizic: ${file.file_path}`,
          );
        }
      }
    }

    await this.notificationsService.createNotification({
      userId: userId,
      eventId: null,
      type: NotificationType.EVENT_DELETED,
      title: 'Eveniment șters',
      message: `Evenimentul "${event.title}" a fost șters definitiv împreună cu toate datele asociate.`,
    });

    return { message: 'Eveniment și datele asociate au fost șterse definitiv' };
  }

  async listActiveEvents(filters: EventFilterDto = {}) {
    const {
      facultyId,
      typeId,
      organizerId,
      search,
      dateFrom,
      dateTo,
      location,
    } = filters;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return this.prisma.events.findMany({
      where: {
        status: EventStatus.active,
        isArchived: false,
        faculty_id: facultyId ? Number(facultyId) : undefined,
        type_id: typeId ? Number(typeId) : undefined,
        organizer_id: organizerId ? Number(organizerId) : undefined,
        ...(location && {
          location: { contains: location, mode: 'insensitive' },
        }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        }),

        date_start: {
          gte: dateFrom ? new Date(dateFrom) : todayStart,
          lte: dateTo ? new Date(dateTo) : undefined,
        },
      },
      include: {
        users: { select: { organization_name: true } },
        event_types: true,
        faculties: true,
        files: true,
        registrations: true,
      },
      orderBy: { date_start: 'asc' },
    });
  }

  async toggleFavorite(userId: number, eventId: number) {
    const event = await this.prisma.events.findFirst({
      where: {
        id_event: eventId,
        status: EventStatus.active,
        isArchived: false,
      },
    });
    if (!event) throw new NotFoundException('Eveniment indisponibil');

    const existing = await this.prisma.favorite_events.findUnique({
      where: { user_id_event_id: { user_id: userId, event_id: eventId } },
    });

    if (existing) {
      await this.prisma.favorite_events.delete({
        where: { user_id_event_id: { user_id: userId, event_id: eventId } },
      });
      return { favorited: false };
    }

    await this.prisma.favorite_events.create({
      data: { user_id: userId, event_id: eventId },
    });

    return { favorited: true };
  }

  async getMyArchivedEvents(userId: number) {
    return this.prisma.events.findMany({
      where: { organizer_id: userId, isArchived: true },
      orderBy: { created_at: 'desc' },
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
        registrations: true,
      },
    });

    if (!event) throw new NotFoundException('Eveniment inexistent');

    return {
      ...event,
      currentParticipants: event.registrations.length,
    };
  }

  async getEventByIdOrganizer(eventId: number, userId: number) {
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
      include: { registrations: true, feedback: true, files: true },
    });
    if (!event) throw new NotFoundException('Eveniment inexistent');
    if (event.organizer_id !== userId)
      throw new ForbiddenException('Nu ai acces');
    return event;
  }

  async getOrganizerDashboard(userId: number) {
    const events = await this.prisma.events.findMany({
      where: { organizer_id: userId, isArchived: false },
      include: { registrations: true, files: true },
    });
    const activeEvents = events.filter(
      (e) => e.status === EventStatus.active,
    ).length;
    const totalParticipants = events.reduce(
      (sum, e) => sum + e.registrations.length,
      0,
    );
    const uploadedMaterials = events.reduce(
      (sum, e) => sum + e.files.length,
      0,
    );
    return {
      stats: { activeEvents, totalParticipants, uploadedMaterials },
      events,
    };
  }

  async getMyFavoriteEvents(userId: number) {
    const favorites = await this.prisma.favorite_events.findMany({
      where: { user_id: userId },
      include: {
        events: {
          include: {
            users: {
              select: { organization_name: true },
            },
            files: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return favorites.map((f) => f.events);
  }

  async getEventDetailsForAdmin(eventId: number) {
    const event = await this.prisma.events.findUnique({
      where: {
        id_event: eventId,
      },
      include: {
        users: {
          select: {
            id_user: true,
            first_name: true,
            last_name: true,
            email: true,
            organization_name: true,
            organization_type: true,
          },
        },
        event_types: true,
        faculties: true,
        files: true,
        registrations: true,
        feedback: {
          include: { users: { select: { first_name: true, last_name: true } } },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Evenimentul nu a fost găsit.');
    }

    return event;
  }
}
