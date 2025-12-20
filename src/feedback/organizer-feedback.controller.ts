import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('organizer/events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ORGANIZER')
export class OrganizerFeedbackController {
  constructor(private readonly service: FeedbackService) {}

  @Get(':eventId/feedback/stats')
  getEventFeedbackStats(
    @Req() req,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.service.getOrganizerEventFeedbackStats(req.user.id, eventId);
  }
  @Get(':eventId/feedback')
  getEventFeedback(
    @Req() req,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.service.getOrganizerEventFeedback(req.user.id, eventId);
  }
}
