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


  @Get('events-per-month')
  eventsPerMonth(@Query('from') from?: string, @Query('to') to?: string) {
    return this.service.eventsPerMonth({ from, to });
  }

  @Get('participation')
  participation(@Query('from') from?: string, @Query('to') to?: string) {
    return this.service.participationStats({ from, to });
  }

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
