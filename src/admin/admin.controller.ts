import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
  @Roles('ADMIN')
  rejectEvent(@Param('id') id: string) {
    return this.adminService.rejectEvent(Number(id));
  }
}
