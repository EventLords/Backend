import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Body,
  Res,
  Query,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { Response } from 'express';

@Controller('registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrationsController {
  constructor(private readonly service: RegistrationsService) {}

  @Post('events/:id')
  @Roles('STUDENT')
  register(@Req() req, @Param('id', ParseIntPipe) eventId: number) {
    return this.service.registerStudent(req.user.id, eventId);
  }

  @Delete('events/:id')
  @Roles('STUDENT')
  unregister(@Req() req, @Param('id', ParseIntPipe) eventId: number) {
    return this.service.unregisterStudent(req.user.id, eventId);
  }

  @Get('myevents')
  @Roles('STUDENT')
  getMyRegistrations(@Req() req) {
    return this.service.getMyRegistrations(req.user.id);
  }
  @Get('me/stats')
  @Roles('STUDENT')
  getMyStats(@Req() req) {
    return this.service.getStudentDashboardStats(req.user.id);
  }

  @Get('events/:id/participants')
  @Roles('ORGANIZER')
  async getParticipants(
    @Req() req,
    @Param('id', ParseIntPipe) eventId: number,
    @Query('status') status?: 'all' | 'checked-in' | 'absent',
  ) {
    const participants = await this.service.getParticipants(
      req.user.id,
      eventId,
      status,
    );

    return {
      count: participants.length,
      participants,
    };
  }

  @Patch('events/:id/check-in')
  @Roles('ORGANIZER')
  checkIn(
    @Req() req,
    @Param('id', ParseIntPipe) eventId: number,
    @Body('qr_token') qrToken: string,
  ) {
    return this.service.checkInParticipant(req.user.id, eventId, qrToken);
  }

  @Get('events/:id/participants/export')
  @Roles('ORGANIZER')
  async exportParticipants(
    @Req() req,
    @Param('id', ParseIntPipe) eventId: number,
    @Res() res: Response,
  ) {
    const csv = await this.service.exportParticipantsCsv(req.user.id, eventId);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="participants_event_${eventId}.csv"`,
    );

    res.send(csv);
  }

  @Get('events/:id/stats')
  @Roles('ORGANIZER')
  getEventStats(@Req() req, @Param('id', ParseIntPipe) eventId: number) {
    return this.service.getEventParticipationStats(req.user.id, eventId);
  }
}
