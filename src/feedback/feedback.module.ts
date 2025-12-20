import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { OrganizerFeedbackController } from './organizer-feedback.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FeedbackController, OrganizerFeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
