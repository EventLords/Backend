import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { EventsModule } from './events/events.module';
import { RegistrationsModule } from './registrations/registrations.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminModule,
    EventsModule,
    RegistrationsModule, // 👈 modulul de înscrieri
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
