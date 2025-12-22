import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type DateRange = { from?: string; to?: string };

function parseDateOrThrow(v?: string): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException(`Invalid date: ${v}`);
  }
  return d;
}

@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildEventWhere(range: DateRange) {
    const from = parseDateOrThrow(range.from);
    const to = parseDateOrThrow(range.to);

    // nu stricăm logica ta: luăm evenimente ne-arhivate
    const where: any = { isArchived: false };

    if (from || to) {
      where.date_start = {};
      if (from) where.date_start.gte = from;
      if (to) where.date_start.lte = to;
    }

    return where;
  }

  // 1) număr evenimente / lună
  async eventsPerMonth(range: DateRange) {
    const where = this.buildEventWhere(range);

    const events = await this.prisma.events.findMany({
      where,
      select: { id_event: true, date_start: true },
    });

    const map = new Map<string, number>();
    for (const e of events) {
      const d = new Date(e.date_start);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    const data = [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    return {
      from: range.from ?? null,
      to: range.to ?? null,
      totalEvents: events.length,
      data,
    };
  }

  // 2) participare medie + prezență medie
  async participationStats(range: DateRange) {
    const where = this.buildEventWhere(range);

    const events = await this.prisma.events.findMany({
      where,
      select: { id_event: true },
    });

    const eventIds = events.map((e) => e.id_event);

    if (eventIds.length === 0) {
      return {
        from: range.from ?? null,
        to: range.to ?? null,
        totalEvents: 0,
        totalRegistrations: 0,
        totalCheckedIn: 0,
        avgRegistrationsPerEvent: 0,
        avgCheckedInPerEvent: 0,
        attendanceRate: 0,
      };
    }

    const totalRegistrations = await this.prisma.registrations.count({
      where: { event_id: { in: eventIds } },
    });

    const totalCheckedIn = await this.prisma.registrations.count({
      where: { event_id: { in: eventIds }, checked_in: true },
    });

    const totalEvents = eventIds.length;

    const avgRegistrationsPerEvent = Number(
      (totalRegistrations / totalEvents).toFixed(2),
    );

    const avgCheckedInPerEvent = Number(
      (totalCheckedIn / totalEvents).toFixed(2),
    );

    const attendanceRate =
      totalRegistrations === 0
        ? 0
        : Number(((totalCheckedIn / totalRegistrations) * 100).toFixed(2));

    return {
      from: range.from ?? null,
      to: range.to ?? null,
      totalEvents,
      totalRegistrations,
      totalCheckedIn,
      avgRegistrationsPerEvent,
      avgCheckedInPerEvent,
      attendanceRate,
    };
  }

  // 3) top evenimente (după înscrieri sau după prezență)
  async topEvents(opts: {
    from?: string;
    to?: string;
    limit?: number;
    sort?: 'registrations' | 'checkedin';
  }) {
    const where = this.buildEventWhere({ from: opts.from, to: opts.to });
    const limit = opts.limit && opts.limit > 0 ? Math.min(opts.limit, 50) : 10;
    const sort = opts.sort ?? 'registrations';

    const events = await this.prisma.events.findMany({
      where,
      select: {
        id_event: true,
        title: true,
        date_start: true,
        users: { select: { first_name: true, last_name: true } }, // organizer
      },
    });

    const ids = events.map((e) => e.id_event);
    if (ids.length === 0) return { data: [] };

    const regs = await this.prisma.registrations.groupBy({
      by: ['event_id'],
      where: { event_id: { in: ids } },
      _count: { event_id: true },
    });

    const checks = await this.prisma.registrations.groupBy({
      by: ['event_id'],
      where: { event_id: { in: ids }, checked_in: true },
      _count: { event_id: true },
    });

    const regMap = new Map(regs.map((r) => [r.event_id, r._count.event_id]));
    const checkMap = new Map(
      checks.map((c) => [c.event_id, c._count.event_id]),
    );

    const data = events
      .map((e) => ({
        id_event: e.id_event,
        title: e.title,
        date_start: e.date_start,
        organizer: e.users
          ? `${e.users.first_name ?? ''} ${e.users.last_name ?? ''}`.trim()
          : null,
        registrationsCount: regMap.get(e.id_event) ?? 0,
        checkedInCount: checkMap.get(e.id_event) ?? 0,
      }))
      .sort((a, b) =>
        sort === 'checkedin'
          ? b.checkedInCount - a.checkedInCount
          : b.registrationsCount - a.registrationsCount,
      )
      .slice(0, limit);

    return {
      from: opts.from ?? null,
      to: opts.to ?? null,
      sort,
      limit,
      data,
    };
  }
}
