import { Controller, Get, Patch, Param, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('me')
  async getMyNotifications(@Request() req: any) {
    return this.notificationService.getMyNotifications(req.user.userId);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationService.countUnread(req.user.userId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.notificationService.markAsRead(id, req.user.userId);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationService.markAllAsRead(req.user.userId);
  }
}
