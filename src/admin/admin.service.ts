import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

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

    if (!event.organizer_id) {
      throw new BadRequestException('Evenimentul nu are organizer');
    }

    const updated = await this.prisma.events.update({
      where: { id_event: eventId },
      data: { status: EventStatus.active },
    });

    // 🔔 NOTIFICARE PENTRU ORGANIZER
    await this.notificationsService.createNotification({
      userId: event.organizer_id,
      eventId: event.id_event,
      type: NotificationType.EVENT_APPROVED,
      title: 'Eveniment aprobat',
      message: `Evenimentul "${event.title}" a fost aprobat și este acum public.`,
    });

    return updated;
  }

  async rejectEvent(eventId: number, reason: string) {
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

    if (!event.organizer_id) {
      throw new BadRequestException('Evenimentul nu are organizer asociat');
    }

    const updated = await this.prisma.events.update({
      where: { id_event: eventId },
      data: {
        status: EventStatus.rejected,
        rejection_reason: reason,
      },
    });

    await this.notificationsService.createNotification({
      userId: event.organizer_id,
      eventId: event.id_event,
      type: NotificationType.EVENT_REJECTED,
      title: 'Eveniment respins',
      message: `Evenimentul "${event.title}" a fost respins. Motiv: ${reason}`,
    });

    return updated;
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

    // 1) update user
    const updated = await this.prisma.users.update({
      where: { id_user: userId },
      data: {
        isApproved: true,
        isRejected: false,
      },
    });

    // 2) create notification
    await this.notificationsService.createNotification({
      userId: updated.id_user,
      type: NotificationType.ACCOUNT_APPROVED,
      title: 'Cont aprobat',
      message: 'Contul tău de organizer a fost aprobat. Poți crea evenimente.',
    });

    return updated;
  }
  async rejectOrganizer(userId: number, reason: string) {
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

    const updated = await this.prisma.users.update({
      where: { id_user: userId },
      data: {
        isRejected: true,
        isApproved: false,
        rejection_reason: reason,
      },
    });

    await this.notificationsService.createNotification({
      userId: updated.id_user,
      type: NotificationType.ACCOUNT_REJECTED,
      title: 'Cont respins',
      message: `Contul tău a fost respins. Motiv: ${reason}`,
    });

    return updated;
  }
  async getDashboard(adminUserId: number) {
    // 1) pending events
    const pendingEvents = await this.prisma.events.count({
      where: { status: EventStatus.pending, isArchived: false },
    });

    // 2) pending organizers
    const pendingOrganizers = await this.prisma.users.count({
      where: {
        role: 'ORGANIZER',
        isApproved: false,
        isRejected: false,
      },
    });

    // 3) unread notifications pentru admin
    const unreadNotifications = await this.prisma.notifications.count({
      where: { user_id: adminUserId, read_at: null },
    });

    return {
      pendingEvents,
      pendingOrganizers,
      unreadNotifications,
    };
  }
  async getEventDetails(eventId: number) {
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
      include: {
        users: {
          select: {
            id_user: true,
            email: true,
            first_name: true,
            last_name: true,
            organization_name: true,
            organization_type: true,
          },
        },
        event_types: true,
        faculties: true,
        files: true,
        registrations: true,
        feedback: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Eveniment inexistent');
    }

    return event;
  }
}
