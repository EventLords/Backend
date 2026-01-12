import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  private getUserId(req: any): number {
    return Number(req.user.id);
  }

  @Get('me')
  getMyNotifications(@Req() req: any) {
    return this.service.getMyNotifications(this.getUserId(req));
  }

  @Get('me/unread-count')
  getUnreadCount(@Req() req: any) {
    return this.service.getUnreadCount(this.getUserId(req));
  }

  @Patch(':id/read')
  markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.service.markAsRead(this.getUserId(req), Number(id));
  }

  @Patch('me/read-all')
  markAllAsRead(@Req() req: any) {
    return this.service.markAllAsRead(this.getUserId(req));
  }
  @Delete('me/all')
  deleteAll(@Req() req: any) {
    return this.service.deleteAll(this.getUserId(req));
  }

  @Delete(':id')
  deleteOne(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteOne(this.getUserId(req), Number(id));
  }
}
