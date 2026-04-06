import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { TradeStatus } from '../infrastructure/generated/prisma/enums';

@Injectable()
export class TradeRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(proposerId: number, dto: CreateTradeDto) {
    const trade = await this.databaseService.client.trade.create({
      data: {
        proposer_id: proposerId,
        proposer_item_id: dto.proposerItemId,
        receiver_id: dto.receiverId,
        receiver_item_id: dto.receiverItemId,
        status: 'PENDING',
        conversation: {
          create: {},
        },
      },
      include: {
        proposer: true,
        receiver: true,
        proposer_item: { include: { photos: true } },
        receiver_item: { include: { photos: true } },
        conversation: true,
      },
    });
    return trade;
  }

  async findById(id: number) {
    return this.databaseService.client.trade.findUnique({
      where: { trade_id: id },
      include: {
        proposer: true,
        receiver: true,
        proposer_item: { include: { photos: true, category: true } },
        receiver_item: { include: { photos: true, category: true } },
        conversation: true,
      },
    });
  }

  async findByTrader(traderId: number) {
    return this.databaseService.client.trade.findMany({
      where: {
        OR: [{ proposer_id: traderId }, { receiver_id: traderId }],
      },
      include: {
        proposer: true,
        receiver: true,
        proposer_item: { include: { photos: true } },
        receiver_item: { include: { photos: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateStatus(
    id: number,
    status: TradeStatus,
    completedAt?: Date,
  ) {
    return this.databaseService.client.trade.update({
      where: { trade_id: id },
      data: {
        status,
        ...(completedAt ? { completed_at: completedAt } : {}),
      },
      include: {
        proposer: true,
        receiver: true,
        proposer_item: true,
        receiver_item: true,
      },
    });
  }
}
