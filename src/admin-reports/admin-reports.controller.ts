import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminReportsService } from './admin-reports.service';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminReportsController {
  constructor(private readonly service: AdminReportsService) {}

  // GET /api/admin/reports/events-per-month?from=2025-01-01&to=2025-12-31
  @Get('events-per-month')
  eventsPerMonth(@Query('from') from?: string, @Query('to') to?: string) {
    return this.service.eventsPerMonth({ from, to });
  }

  // GET /api/admin/reports/participation?from=...&to=...
  @Get('participation')
  participation(@Query('from') from?: string, @Query('to') to?: string) {
    return this.service.participationStats({ from, to });
  }

  // GET /api/admin/reports/top-events?from=...&to=...&limit=10&sort=registrations|checkedin
  @Get('top-events')
  topEvents(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: 'registrations' | 'checkedin',
  ) {
    return this.service.topEvents({
      from,
      to,
      limit: limit ? Number(limit) : undefined,
      sort,
    });
  }
}
