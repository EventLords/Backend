import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminService } from './admin.service';
import { Body } from '@nestjs/common';
import { RejectOrganizerDto } from './dto/reject-organizer.dto';
import { RejectEventDto } from './dto/reject-event.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // =========================
  // EVENTS
  // =========================

  @Get('events/pending')
  @Roles('ADMIN')
  getPendingEvents() {
    return this.adminService.getPendingEvents();
  }

  @Patch('events/:id/approve')
  @Roles('ADMIN')
  approveEvent(@Param('id') id: string) {
    return this.adminService.approveEvent(Number(id));
  }

  @Patch('events/:id/reject')
  rejectEvent(@Param('id') id: string, @Body() dto: RejectEventDto) {
    return this.adminService.rejectEvent(Number(id), dto.reason);
  }

  // =========================
  // ORGANIZERS
  // =========================

  @Get('organizers/pending')
  @Roles('ADMIN')
  getPendingOrganizers() {
    return this.adminService.getPendingOrganizers();
  }

  @Patch('organizers/:id/approve')
  @Roles('ADMIN')
  approveOrganizer(@Param('id') id: string) {
    return this.adminService.approveOrganizer(Number(id));
  }

  @Patch('organizers/:id/reject')
  rejectOrganizer(@Param('id') id: string, @Body() dto: RejectOrganizerDto) {
    return this.adminService.rejectOrganizer(Number(id), dto.reason);
  }
  @Get('dashboard')
  @Roles('ADMIN')
  getDashboard(@Req() req: any) {
    return this.adminService.getDashboard(Number(req.user.id));
  }
  @Get('events/:id')
  @Roles('ADMIN')
  getEventDetails(@Param('id') id: string) {
    return this.adminService.getEventDetails(Number(id));
  }
}
