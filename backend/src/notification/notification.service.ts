import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly repo: NotificationRepository,
    private readonly db: DatabaseService,
  ) {}

  /** Resolve trader_id → user_id and create notification */
  async notifyTrader(traderId: number, message: string) {
    const trader = await this.db.client.trader.findUnique({
      where: { trader_id: traderId },
      select: { user_id: true },
    });
    if (!trader) return;
    return this.repo.create(trader.user_id, message);
  }

  async notifyUser(userId: number, message: string) {
    return this.repo.create(userId, message);
  }

  async getMyNotifications(userId: number) {
    return this.repo.findByUser(userId);
  }

  async markAsRead(notificationId: number, userId: number) {
    return this.repo.markRead(notificationId, userId);
  }

  async markAllAsRead(userId: number) {
    return this.repo.markAllRead(userId);
  }

  async countUnread(userId: number) {
    return this.repo.countUnread(userId);
  }
}
