import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule, // ✅ OBLIGATORIU
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
