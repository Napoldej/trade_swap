import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Role } from '../infrastructure/generated/prisma/enums';

@Injectable()
export class AdminRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllUsers() {
    return this.databaseService.client.user.findMany({
      select: {
        user_id: true,
        user_name: true,
        role: true,
        created_at: true,
        updated_at: true,
        verified: true,
        trader: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateUserRole(userId: number, role: Role) {
    return this.databaseService.client.user.update({
      where: { user_id: userId },
      data: { role },
      select: {
        user_id: true,
        user_name: true,
        role: true,
        created_at: true,
        updated_at: true,
        verified: true,
      },
    });
  }

  async deleteUser(userId: number) {
    return this.databaseService.client.user.delete({
      where: { user_id: userId },
    });
  }

  async createCategory(name: string) {
    return this.databaseService.client.category.create({
      data: { category_name: name },
    });
  }

  async getAllCategories() {
    return this.databaseService.client.category.findMany({
      orderBy: { category_name: 'asc' },
    });
  }

  async deleteCategory(id: number) {
    return this.databaseService.client.category.delete({
      where: { category_id: id },
    });
  }

  async getPendingVerifiers() {
    return this.databaseService.client.user.findMany({
      where: { role: 'VERIFIER', verified: false },
      select: {
        user_id: true,
        user_name: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        verified: true,
        created_at: true,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async approveVerifier(userId: number) {
    return this.databaseService.client.user.update({
      where: { user_id: userId },
      data: { verified: true },
      select: {
        user_id: true,
        user_name: true,
        role: true,
        verified: true,
      },
    });
  }

  async setVerified(userId: number, verified: boolean) {
    return this.databaseService.client.user.update({
      where: { user_id: userId },
      data: { verified },
      select: {
        user_id: true,
        user_name: true,
        role: true,
        verified: true,
      },
    });
  }

  async rejectVerifier(userId: number) {
    return this.databaseService.client.user.delete({
      where: { user_id: userId },
    });
  }

  async getAnalytics() {
    const db = this.databaseService.client;

    const [
      totalUsers,
      totalTraders,
      totalItems,
      totalTrades,
      tradesByStatus,
      itemsByStatus,
      topTraders,
      topCategories,
      recentUsers,
    ] = await Promise.all([
      db.user.count(),
      db.trader.count(),
      db.traderItem.count(),
      db.trade.count(),

      // Trades grouped by status
      db.trade.groupBy({ by: ['status'], _count: { trade_id: true } }),

      // Items grouped by status
      db.traderItem.groupBy({ by: ['status'], _count: { item_id: true } }),

      // Top 5 traders by total_trades
      db.trader.findMany({
        take: 5,
        orderBy: { total_trades: 'desc' },
        select: {
          trader_id: true,
          rating: true,
          total_trades: true,
          user: { select: { user_name: true, first_name: true, last_name: true } },
        },
      }),

      // Top 5 categories by approved item count
      db.category.findMany({
        select: {
          category_id: true,
          category_name: true,
          _count: { select: { items: true } },
        },
        orderBy: { items: { _count: 'desc' } },
        take: 5,
      }),

      // All users created in the last 12 months for manual bucketing
      db.user.findMany({
        where: { created_at: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } },
        select: { created_at: true },
      }),
    ]);

    const tradeStatusMap = Object.fromEntries(
      tradesByStatus.map((r) => [r.status, r._count.trade_id]),
    );
    const itemStatusMap = Object.fromEntries(
      itemsByStatus.map((r) => [r.status, r._count.item_id]),
    );

    const completed = tradeStatusMap['COMPLETED'] ?? 0;
    const completionRate = totalTrades > 0 ? ((completed / totalTrades) * 100).toFixed(1) : '0.0';

    return {
      totalUsers,
      totalTraders,
      totalItems,
      totalTrades,
      completionRate: Number(completionRate),
      tradesByStatus: tradeStatusMap,
      itemsByStatus: itemStatusMap,
      topTraders: topTraders.map((t) => ({
        trader_id: t.trader_id,
        name: [t.user.first_name, t.user.last_name].filter(Boolean).join(' ') || t.user.user_name,
        user_name: t.user.user_name,
        rating: t.rating,
        total_trades: t.total_trades,
      })),
      topCategories: topCategories.map((c) => ({
        category_id: c.category_id,
        name: c.category_name,
        item_count: c._count.items,
      })),
      registrationsByMonth: (() => {
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const counts: Record<string, number> = {};
        for (const u of recentUsers) {
          const key = monthNames[new Date(u.created_at).getMonth()];
          counts[key] = (counts[key] ?? 0) + 1;
        }
        return Object.entries(counts).map(([month, count]) => ({ month, count }));
      })(),
    };
  }
}
