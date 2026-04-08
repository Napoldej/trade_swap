import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { TradeStatus } from '../infrastructure/generated/prisma/enums';

@Injectable()
export class TradeRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  readonly tradeInclude = {
    proposer: { include: { user: { select: { user_name: true, first_name: true, last_name: true } } } },
    receiver: { include: { user: { select: { user_name: true, first_name: true, last_name: true } } } },
    proposer_item: { include: { photos: true, category: true } },
    receiver_item: { include: { photos: true, category: true } },
    conversation: true,
  } as const;

  async create(proposerId: number, dto: CreateTradeDto) {
    return this.databaseService.client.trade.create({
      data: {
        proposer_id: proposerId,
        proposer_item_id: dto.proposerItemId,
        receiver_id: dto.receiverId,
        receiver_item_id: dto.receiverItemId,
        status: 'PENDING',
        conversation: { create: {} },
      },
      include: this.tradeInclude,
    });
  }

  async findById(id: number) {
    return this.databaseService.client.trade.findUnique({
      where: { trade_id: id },
      include: this.tradeInclude,
    });
  }

  async findByTrader(traderId: number) {
    return this.databaseService.client.trade.findMany({
      where: {
        OR: [{ proposer_id: traderId }, { receiver_id: traderId }],
      },
      include: this.tradeInclude,
      orderBy: { created_at: 'desc' },
    });
  }

  async updateStatus(id: number, status: TradeStatus, completedAt?: Date) {
    return this.databaseService.client.trade.update({
      where: { trade_id: id },
      data: {
        status,
        ...(completedAt ? { completed_at: completedAt } : {}),
      },
      include: this.tradeInclude,
    });
  }
}
