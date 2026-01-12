import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Req,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminService } from './admin.service';
import { RejectOrganizerDto } from './dto/reject-organizer.dto';
import { RejectEventDto } from './dto/reject-event.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @Roles('ADMIN')
  getDashboard(@Req() req: any) {
    return this.adminService.getDashboard(Number(req.user.id));
  }

  @Get('users')
  @Roles('ADMIN')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  // =========================
  // EVENTS
  // =========================

  @Get('events/active')
  @Roles('ADMIN')
  getActiveEvents() {
    return this.adminService.getActiveEvents();
  }

  @Get('events/pending')
  @Roles('ADMIN')
  getPendingEvents() {
    return this.adminService.getPendingEvents();
  }

  @Get('events/rejected')
  @Roles('ADMIN')
  getRejectedEvents() {
    return this.adminService.getRejectedEvents();
  }

  @Get('events/:id')
  @Roles('ADMIN')
  getEventDetails(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getEventDetails(id);
  }

  @Patch('events/:id/approve')
  @Roles('ADMIN')
  approveEvent(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveEvent(id);
  }

  @Patch('events/:id/reject')
  @Roles('ADMIN')
  rejectEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectEventDto,
  ) {
    return this.adminService.rejectEvent(id, dto.reason);
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
  approveOrganizer(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveOrganizer(id);
  }

  @Patch('organizers/:id/reject')
  @Roles('ADMIN')
  rejectOrganizer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectOrganizerDto,
  ) {
    return this.adminService.rejectOrganizer(id, dto.reason);
  }
}
