import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TraderRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(traderId: number) {
    return this.databaseService.client.trader.findUnique({
      where: { trader_id: traderId },
      include: {
        user: {
          select: {
            user_name: true,
            first_name: true,
            last_name: true,
            created_at: true,
          },
        },
        items: {
          where: { status: 'APPROVED', is_available: true },
          include: {
            category: true,
            photos: { orderBy: { display_order: 'asc' } },
          },
        },
      },
    });
  }

  async findRatings(traderId: number) {
    return this.databaseService.client.rating.findMany({
      where: { ratee_id: traderId },
      include: {
        rater: {
          include: {
            user: {
              select: { user_name: true, first_name: true, last_name: true },
            },
          },
        },
        trade: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
