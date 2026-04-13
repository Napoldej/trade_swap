import { DatabaseService } from '../database/database.service';

export interface TradeContext {
  acceptedItemIds: Set<number>;
  userOutgoingItemIds: Set<number>;
  offeredToUserItemIds: Set<number>;
  incomingProposalCounts: Map<number, number>;
}

export async function computeTradeContext(
  db: DatabaseService['client'],
  itemIds: number[],
  traderId: number | null,
): Promise<TradeContext> {
  const acceptedTrades = await db.trade.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [
        { proposer_item_id: { in: itemIds } },
        { receiver_item_id: { in: itemIds } },
      ],
    },
    select: { proposer_item_id: true, receiver_item_id: true },
  });

  const acceptedItemIds = new Set(
    acceptedTrades.flatMap((t) => [t.proposer_item_id, t.receiver_item_id]),
  );

  const userOutgoingItemIds = new Set<number>();
  const offeredToUserItemIds = new Set<number>();
  const incomingProposalCounts = new Map<number, number>();

  if (traderId) {
    const pending = await db.trade.findMany({
      where: { status: 'PENDING', OR: [{ proposer_id: traderId }, { receiver_id: traderId }] },
      select: { proposer_id: true, receiver_id: true, proposer_item_id: true, receiver_item_id: true },
    });

    for (const t of pending) {
      if (t.proposer_id === traderId) {
        userOutgoingItemIds.add(t.proposer_item_id);
        userOutgoingItemIds.add(t.receiver_item_id);
      } else {
        offeredToUserItemIds.add(t.proposer_item_id);
        incomingProposalCounts.set(
          t.receiver_item_id,
          (incomingProposalCounts.get(t.receiver_item_id) ?? 0) + 1,
        );
      }
    }
  }

  return { acceptedItemIds, userOutgoingItemIds, offeredToUserItemIds, incomingProposalCounts };
}

export function computeItemTradeStatus(
  item: { item_id: number; trader_id: number },
  traderId: number | null,
  ctx: TradeContext,
): { user_trade_status: string; incoming_proposals_count: number } {
  const isOwn = traderId !== null && item.trader_id === traderId;
  const inAccepted = ctx.acceptedItemIds.has(item.item_id);
  const incoming_proposals_count = ctx.incomingProposalCounts.get(item.item_id) ?? 0;

  if (isOwn && inAccepted)            return { user_trade_status: 'own_item_in_trade', incoming_proposals_count };
  if (isOwn && incoming_proposals_count > 0) return { user_trade_status: 'own_item_has_proposals', incoming_proposals_count };
  if (isOwn)                          return { user_trade_status: 'own_item', incoming_proposals_count };
  if (inAccepted)                     return { user_trade_status: 'in_trade', incoming_proposals_count };
  if (ctx.offeredToUserItemIds.has(item.item_id)) return { user_trade_status: 'offered_to_you', incoming_proposals_count };
  if (ctx.userOutgoingItemIds.has(item.item_id))  return { user_trade_status: 'user_pending', incoming_proposals_count };
  return { user_trade_status: 'available', incoming_proposals_count };
}
