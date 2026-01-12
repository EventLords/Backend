import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus, NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async getAllUsers() {
    const users = await this.prisma.users.findMany({
      where: { role: { not: 'ADMIN' } },
      select: {
        id_user: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        created_at: true,
        organization_name: true,
        organization_type: true,
        isApproved: true,
        isRejected: true,
        faculties: { select: { name: true } },
      } as any,
      orderBy: { created_at: 'desc' },
    });

    return users.map((user: any) => {
      let status = 'active';
      if (user.role === 'ORGANIZER') {
        if (!user.isApproved && !user.isRejected) status = 'pending';
        else if (user.isRejected) status = 'suspended';
        else status = 'active';
      }
      let department =
        user.role === 'STUDENT'
          ? user.faculties?.name || 'Student USV'
          : user.organization_type || 'N/A';
      const displayName =
        user.role === 'ORGANIZER'
          ? user.organization_name || user.email
          : `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
            user.email;

      return {
        id_user: user.id_user,
        email: user.email,
        displayName,
        role: user.role,
        department,
        status,
        created_at: user.created_at,
      };
    });
  }

  // =========================
  // EVENTS
  // =========================
  async getActiveEvents() {
    return this.prisma.events.findMany({
      where: { status: EventStatus.active, isArchived: false },
      select: {
        id_event: true,
        title: true,
        status: true,
        date_start: true,
        created_at: true,
        location: true,
        users: { select: { organization_name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getPendingEvents() {
    return this.prisma.events.findMany({
      where: { status: EventStatus.pending, isArchived: false },
      include: {
        users: {
          select: {
            organization_name: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async getRejectedEvents() {
    return this.prisma.events.findMany({
      where: { status: EventStatus.rejected, isArchived: false },
      include: {
        users: { select: { organization_name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getEventDetails(eventId: number) {
    // ✅ Prisma expects an actual number. We ensure eventId is valid here.
    if (!eventId || isNaN(eventId)) {
      throw new BadRequestException('ID eveniment invalid');
    }

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
          include: { users: { select: { first_name: true, last_name: true } } },
        },
      },
    });
    if (!event) throw new NotFoundException('Eveniment inexistent');
    return event;
  }

  async approveEvent(eventId: number) {
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
    });
    if (!event) throw new NotFoundException('Eveniment inexistent');

    const updated = await this.prisma.events.update({
      where: { id_event: eventId },
      data: { status: EventStatus.active },
    });

    if (event.organizer_id) {
      await this.notificationsService.createNotification({
        userId: event.organizer_id,
        eventId: event.id_event,
        type: NotificationType.EVENT_APPROVED,
        title: 'Eveniment aprobat',
        message: `Evenimentul "${event.title}" a fost aprobat și este acum public.`,
      });
    }
    return updated;
  }

  async rejectEvent(eventId: number, reason: string) {
    const event = await this.prisma.events.findUnique({
      where: { id_event: eventId },
    });
    if (!event) throw new NotFoundException('Eveniment inexistent');

    const updated = await this.prisma.events.update({
      where: { id_event: eventId },
      data: { status: EventStatus.rejected, rejection_reason: reason },
    });

    if (event.organizer_id) {
      await this.notificationsService.createNotification({
        userId: event.organizer_id,
        eventId: event.id_event,
        type: NotificationType.EVENT_REJECTED,
        title: 'Eveniment respins',
        message: `Evenimentul "${event.title}" a fost respins. Motiv: ${reason}`,
      });
    }
    return updated;
  }

  async getPendingOrganizers() {
    return this.prisma.users.findMany({
      where: { role: 'ORGANIZER', isApproved: false, isRejected: false },
      select: {
        id_user: true,
        email: true,
        organization_name: true,
        organization_type: true,
        created_at: true,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async approveOrganizer(userId: number) {
    const updated = await this.prisma.users.update({
      where: { id_user: userId },
      data: { isApproved: true, isRejected: false },
    });
    await this.notificationsService.createNotification({
      userId: updated.id_user,
      type: NotificationType.ACCOUNT_APPROVED,
      title: 'Cont aprobat',
      message: 'Contul tău de organizer a fost aprobat.',
    });
    return updated;
  }

  async rejectOrganizer(userId: number, reason: string) {
    const updated = await this.prisma.users.update({
      where: { id_user: userId },
      data: { isRejected: true, isApproved: false, rejection_reason: reason },
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
    const [pendingEvents, pendingOrganizers, unreadNotifications] =
      await Promise.all([
        this.prisma.events.count({
          where: { status: EventStatus.pending, isArchived: false },
        }),
        this.prisma.users.count({
          where: { role: 'ORGANIZER', isApproved: false, isRejected: false },
        }),
        this.prisma.notifications.count({
          where: { user_id: adminUserId, read_at: null },
        }),
      ]);
    return { pendingEvents, pendingOrganizers, unreadNotifications };
  }
}
