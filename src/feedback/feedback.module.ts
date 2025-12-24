import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { OrganizerFeedbackController } from './organizer-feedback.controller';
import { NotificationsModule } from '../notifications/notifications.module'; // ✅

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [FeedbackController, OrganizerFeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
