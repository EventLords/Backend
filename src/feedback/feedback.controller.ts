import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly service: FeedbackService) {}

  private getUserId(req: any): number {
    return Number(req.user.id);
  }


  @Post()
  create(@Req() req: any, @Body() dto: CreateFeedbackDto) {
    return this.service.createFeedback(this.getUserId(req), dto);
  }


  @Get('event/:eventId')
  getEventFeedback(@Param('eventId') eventId: string) {
    return this.service.getEventFeedback(Number(eventId));
  }

  
  @Get('event/:eventId/summary')
  getSummary(@Param('eventId') eventId: string) {
    return this.service.getEventRatingSummary(Number(eventId));
  }

  
  @Get('me')
  getMine(@Req() req: any) {
    return this.service.getMyFeedback(this.getUserId(req));
  }
 

  @Get('organizer/event/:eventId')
  @UseGuards(JwtAuthGuard)
  async getOrganizerFeedback(
    @Req() req: any,
    @Param('eventId') eventId: string,
  ) {
    const userId = Number(req.user.id);
    return this.service.getOrganizerEventFeedback(userId, Number(eventId));
  }
}
