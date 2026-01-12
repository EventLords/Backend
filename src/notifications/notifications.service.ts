import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * ============================
   * CONFIG REMINDERE FAVORITE
   * ============================
   */
  private readonly reminderConfigs = [
    {
      type: NotificationType.FAVORITE_REMINDER_24H,
      minutesBefore: 24 * 60,
    },
    {
      type: NotificationType.FAVORITE_REMINDER_1H,
      minutesBefore: 60,
    },
  ];

  /**
   * ============================
   * CRON – FAVORITE REMINDERS
   * ============================
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async sendFavoriteReminders(): Promise<void> {
    const now = new Date();
    this.logger.log(`CRON FAVORITES @ ${now.toISOString()}`);

    for (const cfg of this.reminderConfigs) {
      const start = new Date(now.getTime() + cfg.minutesBefore * 60_000);
      const end = new Date(start.getTime() + 60_000);

      const favorites = await this.prisma.favorite_events.findMany({
        where: {
          user_id: { not: null },
          event_id: { not: null },
          events: {
            date_start: { gte: start, lt: end },
            status: 'active',
            isArchived: false,
          },
        },
        include: { events: true },
      });

      for (const fav of favorites) {
        if (!fav.user_id || !fav.event_id || !fav.events) continue;

        try {
          await this.prisma.reminder_logs.create({
            data: {
              user_id: fav.user_id,
              event_id: fav.event_id,
              type: cfg.type,
            },
          });

          await this.prisma.notifications.create({
            data: {
              user_id: fav.user_id,
              event_id: fav.event_id,
              type: cfg.type,
              title: 'Evenimentul începe curând',
              message: `Evenimentul "${fav.events.title}" începe la ${fav.events.date_start.toLocaleString()}`,
            },
          });
        } catch {
          continue;
        }
      }
    }
  }

  /**
   * ============================
   * CRON – FEEDBACK REQUEST
   * ============================
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendFeedbackRequests(): Promise<void> {
    const now = new Date();

    const pastEvents = await this.prisma.events.findMany({
      where: {
        date_start: { lt: now },
        status: 'active',
        isArchived: false,
      },
      select: { id_event: true, title: true },
    });

    for (const ev of pastEvents) {
      const registrations = await this.prisma.registrations.findMany({
        where: { event_id: ev.id_event },
        select: { user_id: true },
      });

      for (const reg of registrations) {
        const feedbackExists = await this.prisma.feedback.findFirst({
          where: {
            user_id: reg.user_id,
            event_id: ev.id_event,
          },
        });
        if (feedbackExists) continue;

        const notificationExists = await this.prisma.notifications.findFirst({
          where: {
            user_id: reg.user_id,
            event_id: ev.id_event,
            type: NotificationType.FEEDBACK_REQUESTED,
          },
        });
        if (notificationExists) continue;

        await this.createNotification({
          userId: reg.user_id,
          eventId: ev.id_event,
          type: NotificationType.FEEDBACK_REQUESTED,
          title: 'Spune-ne părerea ta',
          message: `Cum ți s-a părut evenimentul "${ev.title}"?`,
        });
      }
    }
  }

  /**
   * ============================
   * API
   * ============================
   */
  async getMyNotifications(userId: number) {
    return this.prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notifications.count({
      where: { user_id: userId, read_at: null },
    });
    return { count };
  }

  async markAsRead(userId: number, notificationId: number) {
    await this.prisma.notifications.updateMany({
      where: {
        id_notification: notificationId,
        user_id: userId,
      },
      data: { read_at: new Date() },
    });

    return { success: true };
  }

  async markAllAsRead(userId: number) {
    await this.prisma.notifications.updateMany({
      where: {
        user_id: userId,
        read_at: null,
      },
      data: { read_at: new Date() },
    });

    return { success: true };
  }

  /**
   * ============================
   * UTIL
   * ============================
   */
  async createNotification(data: {
    userId: number;
    eventId?: number | null;
    type: NotificationType;
    title: string;
    message: string;
  }) {
    return this.prisma.notifications.create({
      data: {
        user_id: data.userId,
        event_id: data.eventId,
        type: data.type,
        title: data.title,
        message: data.message,
      },
    });
  }

  async deleteOne(userId: number, notificationId: number) {
    const result = await this.prisma.notifications.deleteMany({
      where: {
        id_notification: notificationId,
        user_id: userId, // Security check
      },
    });

    return { success: result.count > 0 };
  }

  async deleteAll(userId: number) {
    const result = await this.prisma.notifications.deleteMany({
      where: {
        user_id: userId,
      },
    });

    return { success: true, count: result.count };
  }
}
