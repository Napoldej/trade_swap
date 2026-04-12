import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const ITEM_INCLUDE = {
  category: true,
  photos: { orderBy: { display_order: 'asc' as const } },
  trader: {
    include: {
      user: { select: { user_name: true, first_name: true, last_name: true } },
    },
  },
};

const TRADE_INCLUDE = {
  proposer: {
    include: { user: { select: { user_name: true, first_name: true, last_name: true, verified: true } } },
  },
  receiver: {
    include: { user: { select: { user_name: true, first_name: true, last_name: true, verified: true } } },
  },
  proposer_item: { include: { photos: { orderBy: { display_order: 'asc' as const } }, category: true } },
  receiver_item: { include: { photos: { orderBy: { display_order: 'asc' as const } }, category: true } },
} as const;

@Injectable()
export class VerifierRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  getItemsByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return this.databaseService.client.traderItem.findMany({
      where: { status },
      include: ITEM_INCLUDE,
      orderBy: { created_at: 'asc' },
    });
  }

  approveItem(itemId: number, verifierId: number) {
    return this.databaseService.client.traderItem.update({
      where: { item_id: itemId },
      data: { status: 'APPROVED', verified_by: verifierId, rejection_reason: null },
      include: ITEM_INCLUDE,
    });
  }

  rejectItem(itemId: number, verifierId: number, reason: string) {
    return this.databaseService.client.traderItem.update({
      where: { item_id: itemId },
      data: { status: 'REJECTED', verified_by: verifierId, rejection_reason: reason },
      include: ITEM_INCLUDE,
    });
  }

  removeItem(itemId: number) {
    return this.databaseService.client.traderItem.delete({
      where: { item_id: itemId },
    });
  }

  // ── Trade Verification ────────────────────────────────────────────────────────

  getPendingTrades() {
    return this.databaseService.client.trade.findMany({
      where: { status: 'AWAITING_VERIFICATION' },
      include: TRADE_INCLUDE,
      orderBy: { updated_at: 'asc' },
    });
  }

  getTradeById(tradeId: number) {
    return this.databaseService.client.trade.findUnique({
      where: { trade_id: tradeId },
      include: TRADE_INCLUDE,
    });
  }

  async confirmTrade(tradeId: number, verifierId: number, note?: string) {
    return this.databaseService.client.$transaction(async (tx) => {
      const trade = await tx.trade.findUnique({ where: { trade_id: tradeId } });
      if (!trade) throw new Error('Trade not found');

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
          verified_by: verifierId,
          verification_note: note ?? null,
          verified_at: new Date(),
          completed_at: new Date(),
        },
        include: TRADE_INCLUDE,
      });
    });
  }

  rejectTradeVerification(tradeId: number, verifierId: number, reason: string) {
    return this.databaseService.client.trade.update({
      where: { trade_id: tradeId },
      data: {
        status: 'REJECTED',
        verified_by: verifierId,
        verified_at: new Date(),
        verification_rejected_reason: reason,
        proposer_confirmed: false,
        receiver_confirmed: false,
      },
      include: TRADE_INCLUDE,
    });
  }
}
