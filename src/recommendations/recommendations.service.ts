import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ScoreMap = Record<number, number>;

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendationsForUser(userId: number) {
    // 1) Construim preferințe user din istoricul lui
    const { typeScores, facultyScores } =
      await this.buildUserPreferences(userId);

    // 2) Alegem candidați (evenimente viitoare active, ne-arhivate)
    // Excludem evenimentele la care userul e deja înscris
    const registered = await this.prisma.registrations.findMany({
      where: { user_id: userId },
      select: { event_id: true },
    });
    const registeredIds = registered.map((r) => r.event_id);

    const now = new Date();
    const candidates = await this.prisma.events.findMany({
      where: {
        status: 'active',
        isArchived: false,
        date_start: { gt: now },
        id_event: registeredIds.length ? { notIn: registeredIds } : undefined,
      },
      take: 200, // limită safety
      orderBy: { date_start: 'asc' },
    });

    // 3) Scorăm
    const scored = candidates.map((ev) => {
      const t = ev.type_id ?? 0;
      const f = ev.faculty_id ?? 0;

      const typeScore = t ? (typeScores[t] ?? 0) : 0;
      const facultyScore = f ? (facultyScores[f] ?? 0) : 0;

      const score = typeScore * 1.0 + facultyScore * 0.6;

      // "reason" pentru demo/UX
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

    // 4) Sortare + top N
    scored.sort((a, b) => b.score - a.score);

    const top = scored.slice(0, 10);

    // 5) Log în recommendation_history (pentru trasabilitate)
    // (nu dă fail dacă unele sunt null)
    await this.prisma.recommendation_history.createMany({
      data: top.map((x) => ({
        user_id: userId,
        event_id: x.event.id_event,
        action: 'recommended',
      })),
      skipDuplicates: false, // în schema ta nu ai unique aici
    });

    return top.map((x) => ({
      ...x.event,
      recommendationScore: x.score,
      recommendationReason: x.reason,
    }));
  }

  private async buildUserPreferences(userId: number): Promise<{
    typeScores: ScoreMap;
    facultyScores: ScoreMap;
  }> {
    const typeScores: ScoreMap = {};
    const facultyScores: ScoreMap = {};

    // A) Favorites (+5)
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
