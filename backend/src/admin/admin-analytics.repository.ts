import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AdminAnalyticsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private buildRegistrationsByMonth(recentUsers: { created_at: Date }[]) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts: Record<string, number> = {};
    for (const u of recentUsers) {
      const key = monthNames[new Date(u.created_at).getMonth()];
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.entries(counts).map(([month, count]) => ({ month, count }));
  }

  async getAnalytics() {
    const db = this.databaseService.client;

    const [totalUsers, totalTraders, totalItems, totalTrades, tradesByStatus, itemsByStatus, topTraders, topCategories, recentUsers] =
      await Promise.all([
        db.user.count(),
        db.trader.count(),
        db.traderItem.count(),
        db.trade.count(),
        db.trade.groupBy({ by: ['status'], _count: { trade_id: true } }),
        db.traderItem.groupBy({ by: ['status'], _count: { item_id: true } }),
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
        db.category.findMany({
          select: { category_id: true, category_name: true, _count: { select: { items: true } } },
          orderBy: { items: { _count: 'desc' } },
          take: 5,
        }),
        db.user.findMany({
          where: { created_at: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } },
          select: { created_at: true },
        }),
      ]);

    const tradeStatusMap = Object.fromEntries(tradesByStatus.map((r) => [r.status, r._count.trade_id]));
    const itemStatusMap = Object.fromEntries(itemsByStatus.map((r) => [r.status, r._count.item_id]));
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
      registrationsByMonth: this.buildRegistrationsByMonth(recentUsers),
    };
  }
}
