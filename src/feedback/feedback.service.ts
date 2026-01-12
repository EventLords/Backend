import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}
  private readonly FEEDBACK_THRESHOLDS = [5, 10, 25]; 
  private readonly LOW_RATING_THRESHOLD = 3; 
  private readonly LOW_RATING_MIN_COUNT = 3; 

  async createFeedback(
    userId: number,
    dto: { event_id: number; rating: number; comment?: string },
  ) {
    
    const ev = await this.prisma.events.findUnique({
      where: { id_event: dto.event_id },
      select: {
        id_event: true,
        title: true,
        organizer_id: true,
        date_start: true,
        status: true,
        isArchived: true,
      },
    });

    if (!ev || ev.isArchived || ev.status !== 'active') {
      throw new NotFoundException(
        'Evenimentul nu există sau nu este disponibil',
      );
    }

    // 2) Evenimentul trebuie să fi trecut
    const now = new Date();
    // Permitem feedback DUPĂ CE A ÎNCEPUT
    if (now < ev.date_start) {
      throw new BadRequestException(
        'Poți lăsa feedback doar după ce evenimentul a început',
      );
    }

    // 3) Userul trebuie să fi fost înscris
    const reg = await this.prisma.registrations.findFirst({
      where: { user_id: userId, event_id: dto.event_id },
      select: { id_registration: true },
    });

    if (!reg) {
      throw new ForbiddenException(
        'Poți lăsa feedback doar dacă ai participat la eveniment',
      );
    }

    // 4) Creezi feedback (un singur feedback per event per user – enforced de unique)
    try {
      const created = await this.prisma.feedback.create({
        data: {
          user_id: userId,
          event_id: dto.event_id,
          rating: dto.rating,
          comment: dto.comment ?? null,
        },
      });

      if (ev.organizer_id) {
        
        const feedbackCount = await this.prisma.feedback.count({
          where: { event_id: ev.id_event },
        });

       
        const agg = await this.prisma.feedback.aggregate({
          where: { event_id: ev.id_event },
          _avg: { rating: true },
        });

        const avgRating = agg._avg.rating ?? 0;

      
        if (feedbackCount === 1) {
          await this.notificationsService.createNotification({
            userId: ev.organizer_id,
            eventId: ev.id_event,
            type: NotificationType.EVENT_FEEDBACK_STARTED,
            title: 'Ai primit primul feedback',
            message: `Evenimentul "${ev.title}" a primit primul feedback.`,
          });
        }

        
        if (this.FEEDBACK_THRESHOLDS.includes(feedbackCount)) {
          await this.notificationsService.createNotification({
            userId: ev.organizer_id,
            eventId: ev.id_event,
            type: NotificationType.EVENT_FEEDBACK_THRESHOLD_REACHED,
            title: 'Prag de feedback atins',
            message: `Evenimentul "${ev.title}" are acum ${feedbackCount} feedback-uri. Rating mediu: ${avgRating.toFixed(2)}.`,
          });
        }

        
        if (
          feedbackCount >= this.LOW_RATING_MIN_COUNT &&
          avgRating <= this.LOW_RATING_THRESHOLD
        ) {
          await this.notificationsService.createNotification({
            userId: ev.organizer_id,
            eventId: ev.id_event,
            type: NotificationType.EVENT_FEEDBACK_LOW_RATING,
            title: 'Rating scăzut',
            message: `Rating scăzut pentru "${ev.title}" (${avgRating.toFixed(2)} din 5) după ${feedbackCount} feedback-uri. Verifică comentariile.`,
          });
        }
      }

      return { success: true, feedback: created };
    } catch (e) {
      
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Ai lăsat deja feedback pentru acest eveniment',
        );
      }
      throw e;
    }
  }

  async getEventFeedback(eventId: number) {
    return this.prisma.feedback.findMany({
      where: { event_id: eventId },
      orderBy: { created_at: 'desc' },
      include: {
        users: { select: { id_user: true, first_name: true, last_name: true } },
      },
    });
  }

  async getMyFeedback(userId: number) {
    return this.prisma.feedback.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        events: { select: { id_event: true, title: true, date_start: true } },
      },
    });
  }

  async getEventRatingSummary(eventId: number) {
    const agg = await this.prisma.feedback.aggregate({
      where: { event_id: eventId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      event_id: eventId,
      avgRating: agg._avg.rating ?? 0,
      ratingsCount: agg._count.rating ?? 0,
    };
  }
  async getOrganizerEventFeedbackStats(organizerId: number, eventId: number) {
    const event = await this.prisma.events.findFirst({
      where: {
        id_event: eventId,
        organizer_id: organizerId,
      },
      select: { id_event: true },
    });

    if (!event) {
      throw new ForbiddenException('Nu ai acces la acest eveniment');
    }

  
    const totalRegistered = await this.prisma.registrations.count({
      where: { event_id: eventId },
    });

   
    const feedbackAgg = await this.prisma.feedback.aggregate({
      where: { event_id: eventId },
      _avg: { rating: true },
      _count: { rating: true },
    });

 
    const ratingDistribution = await this.prisma.feedback.groupBy({
      by: ['rating'],
      where: { event_id: eventId },
      _count: { rating: true },
    });

    return {
      eventId,
      totalRegistered,
      feedbackCount: feedbackAgg._count.rating ?? 0,
      avgRating: feedbackAgg._avg.rating ?? 0,
      engagementRate:
        totalRegistered === 0
          ? 0
          : Number(
              ((feedbackAgg._count.rating / totalRegistered) * 100).toFixed(2),
            ),
      ratingDistribution,
    };
  }
  async getOrganizerEventFeedback(organizerId: number, eventId: number) {
    const event = await this.prisma.events.findFirst({
      where: { id_event: eventId, organizer_id: organizerId },
      select: { id_event: true },
    });

    if (!event) throw new ForbiddenException('Nu ai acces la acest eveniment');

    return this.prisma.feedback.findMany({
      where: { event_id: eventId },
      orderBy: { created_at: 'desc' },
      select: {
        id_feedback: true,
        rating: true,
        comment: true,
        created_at: true,
      },
    });
  }
}
