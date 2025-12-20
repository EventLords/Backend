import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { EventsModule } from './events/events.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FacultiesModule } from './faculties/faculties.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { FeedbackModule } from './feedback/feedback.module';
import { FilesModule } from './files/files.module';
@Module({
  imports: [
    // 🔹 CRON / SCHEDULER (OBLIGATORIU pentru remindere)
    ScheduleModule.forRoot(),

    // 🔹 MODULE DE BAZĂ
    PrismaModule,
    AuthModule,
    AdminModule,
    EventsModule,
    RegistrationsModule,
    FacultiesModule,
    RecommendationsModule,
    FeedbackModule,
    FilesModule,
    // 🔔 NOTIFICĂRI (favorite reminders + clopoțel)
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
