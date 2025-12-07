import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard, new RolesGuard(['ADMIN']))
  @Get('pending-organizers')
  async getPendingOrganizers() {
    return this.prisma.users.findMany({
      where: { role: 'ORGANIZER', isApproved: false },
    });
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['ADMIN']))
  @Patch('approve-organizer/:id')
  async approveOrganizer(@Param('id') id: string) {
    return this.prisma.users.update({
      where: { id_user: Number(id) },
      data: { isApproved: true },
    });
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['ADMIN']))
  @Patch('reject-organizer/:id')
  async rejectOrganizer(@Param('id') id: string) {
    return this.prisma.users.delete({
      where: { id_user: Number(id) },
    });
  }
}
