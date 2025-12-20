import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Configurația finală a reminderelor:
   * - 24h înainte de eveniment
   * - 1h înainte de eveniment
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
   * Rulează la fiecare minut și trimite remindere
   * pentru evenimentele favorite care urmează să înceapă.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async sendFavoriteReminders(): Promise<void> {
    const now = new Date();
    this.logger.log(`CRON RUN @ ${now.toISOString()}`);

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

      if (favorites.length === 0) {
        continue;
      }

      this.logger.log(`Found ${favorites.length} favorite(s)`);

      for (const fav of favorites) {
        if (!fav.user_id || !fav.event_id || !fav.events) {
          continue;
        }

        try {
          /**
           * reminder_logs are constrângere unică:
           * (user_id, event_id, type)
           * => previne duplicatele
           */
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
            `✅ REMINDER SENT user=${fav.user_id} event=${fav.event_id} type=${cfg.type}`,
          );
        } catch (error) {
          /**
           * Dacă există deja un reminder log,
           * înseamnă că notificarea a fost trimisă anterior.
           */
          continue;
        }
      }
    }
  }

  /**
   * Returnează toate notificările utilizatorului
   */
  async getMyNotifications(userId: number) {
    return this.prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Returnează numărul de notificări necitite
   */
  async getUnreadCount(userId: number) {
    const count = await this.prisma.notifications.count({
      where: {
        user_id: userId,
        read_at: null,
      },
    });

    return { count };
  }

  /**
   * Marchează o notificare ca citită
   */
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
}
