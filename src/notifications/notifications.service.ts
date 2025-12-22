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
  private readonly reminderConfigs: {
    type: NotificationType;
    minutesBefore: number;
  }[] = [
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
   * CRON – REMINDERE EVENIMENTE FAVORITE
   * (NU SE MODIFICĂ)
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
            date_start: {
              gte: start,
              lt: end,
            },
            status: 'active',
            isArchived: false,
          },
        },
        include: {
          events: true,
        },
      });

      for (const fav of favorites) {
        if (!fav.user_id || !fav.event_id || !fav.events) continue;

        try {
          // previne duplicatele
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

          this.logger.log(
            `✅ FAVORITE REMINDER user=${fav.user_id} event=${fav.event_id} type=${cfg.type}`,
          );
        } catch {
          // reminder deja trimis
          continue;
        }
      }
    }
  }

  /**
   * ============================
   * CRON – CERERE FEEDBACK DUPĂ EVENIMENT
   * (FUNCȚIONALITATE NOUĂ)
   * ============================
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendFeedbackRequests(): Promise<void> {
    const now = new Date();
    this.logger.log(`CRON FEEDBACK @ ${now.toISOString()}`);

    // 1️⃣ Evenimente care AU AVUT LOC
    const pastEvents = await this.prisma.events.findMany({
      where: {
        date_start: { lt: now },
        status: 'active',
        isArchived: false,
      },
      select: {
        id_event: true,
        title: true,
      },
    });

    if (!pastEvents.length) return;

    for (const ev of pastEvents) {
      // 2️⃣ Participanți
      const registrations = await this.prisma.registrations.findMany({
        where: { event_id: ev.id_event },
        select: { user_id: true },
      });

      for (const reg of registrations) {
        const userId = reg.user_id;

        // 3️⃣ Dacă există feedback → skip
        const feedbackExists = await this.prisma.feedback.findFirst({
          where: {
            user_id: userId,
            event_id: ev.id_event,
          },
        });
        if (feedbackExists) continue;

        // 4️⃣ Dacă notificarea a fost deja trimisă → skip
        const notificationExists = await this.prisma.notifications.findFirst({
          where: {
            user_id: userId,
            event_id: ev.id_event,
            type: NotificationType.FEEDBACK_REQUESTED,
          },
        });
        if (notificationExists) continue;

        // 5️⃣ Creăm notificarea
        await this.createNotification({
          userId: userId,
          eventId: ev.id_event,
          type: NotificationType.FEEDBACK_REQUESTED,
          title: 'Spune-ne părerea ta',
          message: `Cum ți s-a părut evenimentul "${ev.title}"? Oferă un rating și un feedback.`,
        });

        this.logger.log(
          `✅ FEEDBACK REQUEST user=${userId} event=${ev.id_event}`,
        );
      }
    }
  }

  /**
   * ============================
   * API NOTIFICĂRI (EXISTENT)
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
      where: {
        user_id: userId,
        read_at: null,
      },
    });

    return { count };
  }

  async markAsRead(userId: number, notificationId: number) {
    await this.prisma.notifications.updateMany({
      where: {
        id_notification: notificationId,
        user_id: userId,
      },
      data: {
        read_at: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * ============================
   * CREATE NOTIFICATION (UTILITAR)
   * ============================
   */
  async createNotification(data: {
    userId: number;
    eventId?: number;
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
}
