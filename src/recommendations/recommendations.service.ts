import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

type ScoreMap = Record<number, number>;

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getRecommendationsForUser(userId: number) {
    // 1) Construim preferințele userului
    const { typeScores, facultyScores } =
      await this.buildUserPreferences(userId);

    // 2) Excludem evenimentele la care userul e deja înscris
    const registered = await this.prisma.registrations.findMany({
      where: { user_id: userId },
      select: { event_id: true },
    });
    const registeredIds = registered.map((r) => r.event_id);

    // 3) Evenimente candidate (active, viitoare)
    const now = new Date();
    const candidates = await this.prisma.events.findMany({
      where: {
        status: 'active',
        isArchived: false,
        date_start: { gt: now },
        id_event: registeredIds.length ? { notIn: registeredIds } : undefined,
      },
      take: 200,
      orderBy: { date_start: 'asc' },
    });

    // 4) Scorare
    const scored = candidates.map((ev) => {
      const t = ev.type_id ?? 0;
      const f = ev.faculty_id ?? 0;

      const typeScore = t ? (typeScores[t] ?? 0) : 0;
      const facultyScore = f ? (facultyScores[f] ?? 0) : 0;

      const score = typeScore * 1.0 + facultyScore * 0.6;

      const reasons: string[] = [];
      if (typeScore > 0)
        reasons.push('similar ca tip cu evenimentele apreciate');
      if (facultyScore > 0)
        reasons.push('din aceeași facultate / interes similar');
      if (reasons.length === 0) reasons.push('recomandare generală');

      return {
        event: ev,
        score,
        reason: reasons.join(', '),
      };
    });

    // 5) Sortare + top N
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 10);

    // ============================
    // 🔔 NOTIFICĂRI – DOAR PENTRU RECOMANDĂRI NOI
    // ============================

    // 5.1 Verificăm ce a mai fost recomandat deja
    const alreadyRecommended =
      await this.prisma.recommendation_history.findMany({
        where: {
          user_id: userId,
          action: 'recommended',
          event_id: {
            in: top.map((x) => x.event.id_event),
          },
        },
        select: { event_id: true },
      });

    const alreadyIds = new Set(alreadyRecommended.map((r) => r.event_id));

    const newOnes = top.filter((x) => !alreadyIds.has(x.event.id_event));

    // 5.2 Creăm notificări DOAR pentru cele noi
    for (const rec of newOnes) {
      await this.notificationsService.createNotification({
        userId: userId,
        eventId: rec.event.id_event,
        type: NotificationType.EVENT_RECOMMENDED,
        title: 'Recomandare pentru tine',
        message: `Evenimentul "${rec.event.title}" ar putea fi pe placul tău.`,
      });
    }

    // 6) Log în recommendation_history (EXACT cum aveai)
    await this.prisma.recommendation_history.createMany({
      data: top.map((x) => ({
        user_id: userId,
        event_id: x.event.id_event,
        action: 'recommended',
      })),
      skipDuplicates: false,
    });

    // 7) Răspuns către frontend
    return top.map((x) => ({
      ...x.event,
      recommendationScore: x.score,
      recommendationReason: x.reason,
    }));
  }

  // ============================
  // BUILD USER PREFERENCES
  // ============================

  private async buildUserPreferences(userId: number): Promise<{
    typeScores: ScoreMap;
    facultyScores: ScoreMap;
  }> {
    const typeScores: ScoreMap = {};
    const facultyScores: ScoreMap = {};

    // A) Favorite (+5)
    const favs = await this.prisma.favorite_events.findMany({
      where: { user_id: userId },
      include: { events: true },
    });

    for (const fav of favs) {
      const ev = fav.events;
      if (!ev) continue;
      if (ev.type_id)
        typeScores[ev.type_id] = (typeScores[ev.type_id] ?? 0) + 5;
      if (ev.faculty_id)
        facultyScores[ev.faculty_id] = (facultyScores[ev.faculty_id] ?? 0) + 3;
    }

    // B) Registrations (+3)
    const regs = await this.prisma.registrations.findMany({
      where: { user_id: userId },
      include: { events: true },
    });

    for (const reg of regs) {
      const ev = reg.events;
      if (!ev) continue;
      if (ev.type_id)
        typeScores[ev.type_id] = (typeScores[ev.type_id] ?? 0) + 3;
      if (ev.faculty_id)
        facultyScores[ev.faculty_id] = (facultyScores[ev.faculty_id] ?? 0) + 2;
    }

    // C) Feedback (rating influence)
    const fbs = await this.prisma.feedback.findMany({
      where: { user_id: userId },
      include: { events: true },
    });

    for (const fb of fbs) {
      const ev = fb.events;
      if (!ev) continue;

      const rating = fb.rating ?? 0;
      const delta = rating >= 4 ? 3 : rating === 3 ? 1 : rating > 0 ? -2 : 0;

      if (ev.type_id)
        typeScores[ev.type_id] = (typeScores[ev.type_id] ?? 0) + delta;
      if (ev.faculty_id)
        facultyScores[ev.faculty_id] =
          (facultyScores[ev.faculty_id] ?? 0) + delta * 0.5;
    }

    return { typeScores, facultyScores };
  }
}
