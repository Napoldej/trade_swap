import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TradeRepository } from './trade.repository';

@Injectable()
export class TradeGuardService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly tradeRepository: TradeRepository,
  ) {}

  async getTradeOrThrow(tradeId: number) {
    const trade = await this.tradeRepository.findById(tradeId);
    if (!trade) throw new NotFoundException('Trade not found');
    return trade;
  }

  async assertCanAccept(userId: number, tradeId: number) {
    const trader = await this.checkUserExist(userId);
    const trade = await this.getTradeOrThrow(tradeId);
    if (trade.receiver_id !== trader.trader_id) throw new ForbiddenException('Only the receiver can accept this trade');
    if (trade.status !== 'PENDING') throw new BadRequestException('Trade is not in PENDING status');
    return { trader, trade };
  }

  async assertCanReject(userId: number, tradeId: number) {
    const trader = await this.checkUserExist(userId);
    const trade = await this.getTradeOrThrow(tradeId);
    if (trade.receiver_id !== trader.trader_id) throw new ForbiddenException('Only the receiver can reject this trade');
    if (trade.status !== 'PENDING') throw new BadRequestException('Trade is not in PENDING status');
    return { trader, trade };
  }

  async assertCanCancel(userId: number, tradeId: number) {
    const trader = await this.checkUserExist(userId);
    const trade = await this.getTradeOrThrow(tradeId);
    if (trade.proposer_id !== trader.trader_id) throw new ForbiddenException('Only the proposer can cancel this trade');
    if (trade.status !== 'PENDING') throw new BadRequestException('Only PENDING trades can be cancelled');
    return { trader, trade };
  }

  async assertIsParticipant(userId: number, tradeId: number) {
    const trader = await this.checkUserExist(userId);
    const trade = await this.getTradeOrThrow(tradeId);
    if (trade.proposer_id !== trader.trader_id && trade.receiver_id !== trader.trader_id)
      throw new ForbiddenException('You are not part of this trade');
    return { trader, trade };
  }

  async assertCanComplete(userId: number, tradeId: number) {
    const trader = await this.checkUserExist(userId);
    const trade = await this.getTradeOrThrow(tradeId);
    const isProposer = trade.proposer_id === trader.trader_id;
    const isReceiver = trade.receiver_id === trader.trader_id;
    if (!isProposer && !isReceiver) throw new ForbiddenException('You are not part of this trade');
    if (trade.status !== 'ACCEPTED') throw new BadRequestException('Trade must be ACCEPTED before completing');
    if (isProposer && trade.proposer_confirmed) throw new BadRequestException('You have already confirmed this trade');
    if (isReceiver && trade.receiver_confirmed) throw new BadRequestException('You have already confirmed this trade');
    const newProposerConfirmed = isProposer || trade.proposer_confirmed;
    const newReceiverConfirmed = isReceiver || trade.receiver_confirmed;
    return { trade, isProposer, newProposerConfirmed, newReceiverConfirmed, bothConfirmed: newProposerConfirmed && newReceiverConfirmed };
  }

  async checkUserExist(userId: number){
    const trader = await this.databaseService.client.trader.findUnique({
      where: {user_id: userId}
    });
    if (!trader) throw new NotFoundException('Trader profile not found');
    return trader;
  }
}
