import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
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
    if (!trader) throw new NotFoundException('Trader profile not found');
    return trader;
  }

  async proposeTrade(userId: number, dto: CreateTradeDto) {
    const trader = await this.getTraderByUserId(userId);

    const [proposerItem, receiverItem] = await Promise.all([
      this.databaseService.client.traderItem.findUnique({ where: { item_id: dto.proposerItemId } }),
      this.databaseService.client.traderItem.findUnique({ where: { item_id: dto.receiverItemId } }),
    ]);

    if (!proposerItem) throw new NotFoundException('Your item not found');
    if (!receiverItem) throw new NotFoundException('Their item not found');

    if (proposerItem.status !== 'APPROVED') throw new BadRequestException('Your item must be APPROVED');
    if (receiverItem.status !== 'APPROVED') throw new BadRequestException('Their item must be APPROVED');

    if (!proposerItem.is_available) throw new BadRequestException('Your item is not available for trading');
    if (!receiverItem.is_available) throw new BadRequestException('That item is not available for trading');

    if (proposerItem.trader_id !== trader.trader_id)
      throw new ForbiddenException('You do not own the proposer item');

    if (receiverItem.trader_id === trader.trader_id)
      throw new ForbiddenException('You cannot trade with yourself');

    // Block if either item already has an ACCEPTED trade
    const acceptedConflict = await this.databaseService.client.trade.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { proposer_item_id: { in: [dto.proposerItemId, dto.receiverItemId] } },
          { receiver_item_id: { in: [dto.proposerItemId, dto.receiverItemId] } },
        ],
      },
    });
    if (acceptedConflict) throw new ConflictException('One of the items is already in an accepted trade');

    const receiver = await this.databaseService.client.trader.findUnique({
      where: { trader_id: dto.receiverId },
    });
    if (!receiver) throw new NotFoundException('Receiver trader not found');

    return this.tradeRepository.create(trader.trader_id, dto);
  }

  async getMyTrades(userId: number) {
    const trader = await this.getTraderByUserId(userId);
    return this.tradeRepository.findByTrader(trader.trader_id);
  }

  async getTradeById(userId: number, tradeId: number) {
    const trader = await this.getTraderByUserId(userId);
    const trade = await this.tradeRepository.findById(tradeId);
    if (!trade) throw new NotFoundException('Trade not found');
    if (trade.proposer_id !== trader.trader_id && trade.receiver_id !== trader.trader_id)
      throw new ForbiddenException('You are not part of this trade');
    return trade;
  }

  async acceptTrade(userId: number, tradeId: number) {
    const trader = await this.getTraderByUserId(userId);
    const trade = await this.tradeRepository.findById(tradeId);
    if (!trade) throw new NotFoundException('Trade not found');
    if (trade.receiver_id !== trader.trader_id) throw new ForbiddenException('Only the receiver can accept this trade');
    if (trade.status !== 'PENDING') throw new BadRequestException('Trade is not in PENDING status');

    // Transaction: accept this trade + cancel all other PENDING trades involving either item
    return this.databaseService.client.$transaction(async (tx) => {
      const itemIds = [trade.proposer_item_id, trade.receiver_item_id];

      // Cancel all other pending trades involving either item
      await tx.trade.updateMany({
        where: {
          trade_id: { not: tradeId },
          status: 'PENDING',
          OR: [
            { proposer_item_id: { in: itemIds } },
            { receiver_item_id: { in: itemIds } },
          ],
        },
        data: { status: 'CANCELLED' },
      });

      return tx.trade.update({
        where: { trade_id: tradeId },
        data: { status: 'ACCEPTED' },
        include: this.tradeRepository.tradeInclude,
      });
    });
  }

  async rejectTrade(userId: number, tradeId: number) {
    const trader = await this.getTraderByUserId(userId);
    const trade = await this.tradeRepository.findById(tradeId);
    if (!trade) throw new NotFoundException('Trade not found');
    if (trade.receiver_id !== trader.trader_id) throw new ForbiddenException('Only the receiver can reject this trade');
    if (trade.status !== 'PENDING') throw new BadRequestException('Trade is not in PENDING status');

    return this.tradeRepository.updateStatus(tradeId, 'REJECTED');
  }

  async cancelTrade(userId: number, tradeId: number) {
    const trader = await this.getTraderByUserId(userId);
    const trade = await this.tradeRepository.findById(tradeId);
    if (!trade) throw new NotFoundException('Trade not found');
    if (trade.proposer_id !== trader.trader_id) throw new ForbiddenException('Only the proposer can cancel this trade');
    if (trade.status !== 'PENDING') throw new BadRequestException('Only PENDING trades can be cancelled');

    return this.tradeRepository.updateStatus(tradeId, 'CANCELLED');
  }

  async completeTrade(userId: number, tradeId: number) {
    const trader = await this.getTraderByUserId(userId);
    const trade = await this.tradeRepository.findById(tradeId);
    if (!trade) throw new NotFoundException('Trade not found');

    const isProposer = trade.proposer_id === trader.trader_id;
    const isReceiver = trade.receiver_id === trader.trader_id;
    if (!isProposer && !isReceiver)
      throw new ForbiddenException('You are not part of this trade');
    if (trade.status !== 'ACCEPTED') throw new BadRequestException('Trade must be ACCEPTED before completing');

    // Check if already confirmed
    if (isProposer && trade.proposer_confirmed)
      throw new BadRequestException('You have already confirmed this trade');
    if (isReceiver && trade.receiver_confirmed)
      throw new BadRequestException('You have already confirmed this trade');

    const newProposerConfirmed = isProposer ? true : trade.proposer_confirmed;
    const newReceiverConfirmed = isReceiver ? true : trade.receiver_confirmed;
    const bothConfirmed = newProposerConfirmed && newReceiverConfirmed;

    if (!bothConfirmed) {
      // Save partial confirmation — keep status ACCEPTED
      return this.databaseService.client.trade.update({
        where: { trade_id: tradeId },
        data: {
          proposer_confirmed: newProposerConfirmed,
          receiver_confirmed: newReceiverConfirmed,
        },
        include: this.tradeRepository.tradeInclude,
      });
    }

    // Both confirmed — complete the trade
    return this.databaseService.client.$transaction(async (tx) => {
      const itemIds = [trade.proposer_item_id, trade.receiver_item_id];

      await tx.traderItem.updateMany({
        where: { item_id: { in: itemIds } },
        data: { is_available: false },
      });

      await tx.trade.updateMany({
        where: {
          trade_id: { not: tradeId },
          status: 'PENDING',
          OR: [
            { proposer_item_id: { in: itemIds } },
            { receiver_item_id: { in: itemIds } },
          ],
        },
        data: { status: 'CANCELLED' },
      });

      return tx.trade.update({
        where: { trade_id: tradeId },
        data: {
          status: 'COMPLETED',
          completed_at: new Date(),
          proposer_confirmed: true,
          receiver_confirmed: true,
        },
        include: this.tradeRepository.tradeInclude,
      });
    });
  }
}
