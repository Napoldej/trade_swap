import { Injectable } from '@nestjs/common';
import { TradeRepository } from './trade.repository';
import { TradeGuardService } from './trade.guard.service';
import { TradeProposalGuard } from './trade-proposal.guard';
import { CreateTradeDto } from './dto/create-trade.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TradeService {
  constructor(
    private readonly tradeRepository: TradeRepository,
    private readonly tradeGuard: TradeGuardService,
    private readonly tradeProposalGuard: TradeProposalGuard,
    private readonly notificationService: NotificationService,
  ) {}

  async proposeTrade(userId: number, dto: CreateTradeDto) {
    const trader = await this.tradeProposalGuard.getTraderByUserId(userId);
    const { proposerItem, receiverItem } = await this.tradeProposalGuard.validateProposalItems(
      trader.trader_id, dto.proposerItemId, dto.receiverItemId,
    );
    await this.tradeProposalGuard.checkNoAcceptedConflict(dto.proposerItemId, dto.receiverItemId);
    await this.tradeProposalGuard.getReceiverOrThrow(dto.receiverId);
    const trade = await this.tradeRepository.create(trader.trader_id, dto);
    await this.notificationService.notifyTrader(
      dto.receiverId,
      `Someone proposed a trade: "${proposerItem.item_name}" for your "${receiverItem.item_name}".`,
    );
    return trade;
  }

  async getMyTrades(userId: number) {
    const trader = await this.tradeProposalGuard.getTraderByUserId(userId);
    return this.tradeRepository.findByTrader(trader.trader_id);
  }

  async getTradeById(userId: number, tradeId: number) {
    const { trade } = await this.tradeGuard.assertIsParticipant(userId, tradeId);
    return trade;
  }

  async acceptTrade(userId: number, tradeId: number) {
    const { trade } = await this.tradeGuard.assertCanAccept(userId, tradeId);
    const result = await this.tradeRepository.acceptAndCancelConflicts(
      tradeId, trade.proposer_item_id, trade.receiver_item_id,
    );
    await this.notificationService.notifyTrader(
      trade.proposer_id,
      `Your trade proposal for "${trade.proposer_item.item_name}" ↔ "${trade.receiver_item.item_name}" was accepted!`,
    );
    return result;
  }

  async rejectTrade(userId: number, tradeId: number) {
    const { trade } = await this.tradeGuard.assertCanReject(userId, tradeId);
    const result = await this.tradeRepository.updateStatus(tradeId, 'REJECTED');
    await this.notificationService.notifyTrader(
      trade.proposer_id,
      `Your trade proposal for "${trade.proposer_item.item_name}" ↔ "${trade.receiver_item.item_name}" was rejected.`,
    );
    return result;
  }

  async cancelTrade(userId: number, tradeId: number) {
    const { trade } = await this.tradeGuard.assertCanCancel(userId, tradeId);
    const result = await this.tradeRepository.updateStatus(tradeId, 'CANCELLED');
    await this.notificationService.notifyTrader(
      trade.receiver_id,
      `A trade proposal for your "${trade.receiver_item.item_name}" was cancelled by the other party.`,
    );
    return result;
  }

  async completeTrade(userId: number, tradeId: number) {
    const { trade, isProposer, newProposerConfirmed, newReceiverConfirmed, bothConfirmed } =
      await this.tradeGuard.assertCanComplete(userId, tradeId);

    if (!bothConfirmed) {
      const result = await this.tradeRepository.partialConfirm(tradeId, newProposerConfirmed, newReceiverConfirmed);
      const otherTraderId = isProposer ? trade.receiver_id : trade.proposer_id;
      await this.notificationService.notifyTrader(
        otherTraderId,
        `Your trade partner confirmed the trade for "${trade.proposer_item.item_name}" ↔ "${trade.receiver_item.item_name}". Confirm now to complete!`,
      );
      return result;
    }

    const result = await this.tradeRepository.submitForVerification(tradeId);
    const message = `Both parties confirmed! Your trade for "${trade.proposer_item.item_name}" ↔ "${trade.receiver_item.item_name}" is now awaiting verifier review.`;
    await Promise.all([
      this.notificationService.notifyTrader(trade.proposer_id, message),
      this.notificationService.notifyTrader(trade.receiver_id, message),
    ]);
    return result;
  }
}
