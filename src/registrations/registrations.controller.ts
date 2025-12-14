import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrationsController {
  constructor(private readonly service: RegistrationsService) {}

  // ✅ STUDENT → înscriere la eveniment
  @Post('events/:id')
  @Roles('STUDENT')
  register(@Req() req, @Param('id', ParseIntPipe) eventId: number) {
    return this.service.registerStudent(req.user.id, eventId);
  }

  // ✅ STUDENT → renunțare la eveniment
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
}
