import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TradeRepository } from './trade.repository';
import { DatabaseService } from '../database/database.service';
import { CreateTradeDto } from './dto/create-trade.dto';

@Injectable()
export class TradeService {
  constructor(
    private readonly tradeRepository: TradeRepository,
    private readonly databaseService: DatabaseService,
  ) {}

  private async getTraderByUserId(userId: number) {
    const trader = await this.databaseService.client.trader.findUnique({
      where: { user_id: userId },
    });
    if (!trader) {
      throw new NotFoundException('Trader profile not found');
    }
    return trader;
  }

  async proposeTrade(userId: number, dto: CreateTradeDto) {
    const trader = await this.getTraderByUserId(userId);

    const proposerItem = await this.databaseService.client.traderItem.findUnique({
      where: { item_id: dto.proposerItemId },
    });
    if (!proposerItem) {
      throw new NotFoundException('Proposer item not found');
    }
    if (proposerItem.status !== 'APPROVED') {
      throw new BadRequestException('Proposer item must be APPROVED');
    }
    if (proposerItem.trader_id !== trader.trader_id) {
      throw new ForbiddenException('You do not own the proposer item');
    }

    // Block if proposer's item is already in an active trade
    const proposerActiveTrade = await this.databaseService.client.trade.findFirst({
      where: {
        status: { in: ['PENDING', 'ACCEPTED'] },
        OR: [
          { proposer_item_id: dto.proposerItemId },
          { receiver_item_id: dto.proposerItemId },
        ],
      },
    });
    if (proposerActiveTrade) {
      throw new BadRequestException('Your item is already involved in an active trade');
    }

    const receiverItem = await this.databaseService.client.traderItem.findUnique({
      where: { item_id: dto.receiverItemId },
    });
    if (!receiverItem) {
      throw new NotFoundException('Receiver item not found');
    }
    if (receiverItem.status !== 'APPROVED') {
      throw new BadRequestException('Receiver item must be APPROVED');
    }

    // Block if receiver's item is already in an active trade
    const receiverActiveTrade = await this.databaseService.client.trade.findFirst({
      where: {
        status: { in: ['PENDING', 'ACCEPTED'] },
        OR: [
          { proposer_item_id: dto.receiverItemId },
          { receiver_item_id: dto.receiverItemId },
        ],
      },
    });
    if (receiverActiveTrade) {
      throw new BadRequestException('That item is already involved in an active trade');
    }

    const receiver = await this.databaseService.client.trader.findUnique({
      where: { trader_id: dto.receiverId },
    });
    if (!receiver) {
      throw new NotFoundException('Receiver trader not found');
    }

    return this.tradeRepository.create(trader.trader_id, dto);
  }

  async getMyTrades(userId: number) {
    const trader = await this.getTraderByUserId(userId);
    return this.tradeRepository.findByTrader(trader.trader_id);
  }

  async getTradeById(userId: number, tradeId: number) {
    const trader = await this.getTraderByUserId(userId);
    const trade = await this.tradeRepository.findById(tradeId);

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    if (trade.proposer_id !== trader.trader_id && trade.receiver_id !== trader.trader_id) {
      throw new ForbiddenException('You are not part of this trade');
    }

    return trade;
  }

  async acceptTrade(userId: number, tradeId: number) {
    const trader = await this.getTraderByUserId(userId);
    const trade = await this.tradeRepository.findById(tradeId);

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    if (trade.receiver_id !== trader.trader_id) {
      throw new ForbiddenException('Only the receiver can accept this trade');
    }

    if (trade.status !== 'PENDING') {
      throw new BadRequestException('Trade is not in PENDING status');
    }

    return this.tradeRepository.updateStatus(tradeId, 'ACCEPTED');
  }

  async rejectTrade(userId: number, tradeId: number) {
    const trader = await this.getTraderByUserId(userId);
    const trade = await this.tradeRepository.findById(tradeId);

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    if (trade.receiver_id !== trader.trader_id) {
      throw new ForbiddenException('Only the receiver can reject this trade');
    }

    if (trade.status !== 'PENDING') {
      throw new BadRequestException('Trade is not in PENDING status');
    }

    return this.tradeRepository.updateStatus(tradeId, 'REJECTED');
  }

  async cancelTrade(userId: number, tradeId: number) {
    const trader = await this.getTraderByUserId(userId);
    const trade = await this.tradeRepository.findById(tradeId);

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    if (trade.proposer_id !== trader.trader_id) {
      throw new ForbiddenException('Only the proposer can cancel this trade');
    }

    if (!['PENDING', 'ACCEPTED'].includes(trade.status)) {
      throw new BadRequestException('Trade cannot be cancelled in its current status');
    }

    return this.tradeRepository.updateStatus(tradeId, 'CANCELLED');
  }

  async completeTrade(userId: number, tradeId: number) {
    const trader = await this.getTraderByUserId(userId);
    const trade = await this.tradeRepository.findById(tradeId);

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    if (trade.proposer_id !== trader.trader_id && trade.receiver_id !== trader.trader_id) {
      throw new ForbiddenException('You are not part of this trade');
    }

    if (trade.status !== 'ACCEPTED') {
      throw new BadRequestException('Trade must be ACCEPTED before it can be completed');
    }

    return this.tradeRepository.updateStatus(tradeId, 'COMPLETED', new Date());
  }
}
