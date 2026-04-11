import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(userId: number, message: string) {
    return this.db.client.notification.create({
      data: { user_id: userId, message },
    });
  }

  async findByUser(userId: number) {
    return this.db.client.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async markRead(notificationId: number, userId: number) {
    return this.db.client.notification.update({
      where: { notification_id: notificationId },
      data: { is_read: true },
    });
  }

  async markAllRead(userId: number) {
    return this.db.client.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
  }

  async countUnread(userId: number) {
    return this.db.client.notification.count({
      where: { user_id: userId, is_read: false },
    });
  }
}
