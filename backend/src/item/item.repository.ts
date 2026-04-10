import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(traderId: number, dto: CreateItemDto) {
    return this.databaseService.client.traderItem.create({
      data: {
        trader_id: traderId,
        category_id: dto.categoryId,
        item_name: dto.itemName,
        description: dto.description,
        is_available: true,
        status: 'PENDING',
      },
      include: {
        category: true,
        photos: true,
      },
    });
  }

  private readonly itemInclude = {
    category: true,
    photos: { orderBy: { display_order: 'asc' } as const },
    trader: {
      include: {
        user: { select: { user_name: true, first_name: true, last_name: true } },
      },
    },
  };

  private async computeTradeContext(itemIds: number[], traderId: number | null) {
    const acceptedTrades = await this.databaseService.client.trade.findMany({
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
      const userPendingTrades = await this.databaseService.client.trade.findMany({
        where: {
          status: 'PENDING',
          OR: [{ proposer_id: traderId }, { receiver_id: traderId }],
        },
        select: {
          proposer_id: true,
          receiver_id: true,
          proposer_item_id: true,
          receiver_item_id: true,
        },
      });

      userPendingTrades.forEach((t) => {
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
      });
    }

    return { acceptedItemIds, userOutgoingItemIds, offeredToUserItemIds, incomingProposalCounts };
  }

  private computeStatus(
    item: { item_id: number; trader_id: number },
    traderId: number | null,
    acceptedItemIds: Set<number>,
    userOutgoingItemIds: Set<number>,
    offeredToUserItemIds: Set<number>,
    incomingProposalCounts: Map<number, number>,
  ) {
    const isOwn = traderId !== null && item.trader_id === traderId;
    const inAccepted = acceptedItemIds.has(item.item_id);
    const incoming_proposals_count = incomingProposalCounts.get(item.item_id) ?? 0;

    let user_trade_status: string;
    if (isOwn) {
      if (inAccepted) {
        user_trade_status = 'own_item_in_trade';
      } else if (incoming_proposals_count > 0) {
        user_trade_status = 'own_item_has_proposals';
      } else {
        user_trade_status = 'own_item';
      }
    } else if (inAccepted) {
      user_trade_status = 'in_trade';
    } else if (offeredToUserItemIds.has(item.item_id)) {
      user_trade_status = 'offered_to_you';
    } else if (userOutgoingItemIds.has(item.item_id)) {
      user_trade_status = 'user_pending';
    } else {
      user_trade_status = 'available';
    }

    return { user_trade_status, incoming_proposals_count };
  }

  async findAll(traderId: number | null) {
    const items = await this.databaseService.client.traderItem.findMany({
      where: { status: 'APPROVED', is_available: true },
      include: this.itemInclude,
    });

    const itemIds = items.map((i) => i.item_id);
    const ctx = await this.computeTradeContext(itemIds, traderId);

    return items.map((item) => ({
      ...item,
      ...this.computeStatus(item, traderId, ctx.acceptedItemIds, ctx.userOutgoingItemIds, ctx.offeredToUserItemIds, ctx.incomingProposalCounts),
    }));
  }

  async findById(id: number, traderId: number | null = null) {
    const item = await this.databaseService.client.traderItem.findUnique({
      where: { item_id: id },
      include: this.itemInclude,
    });

    if (!item) return null;

    const ctx = await this.computeTradeContext([id], traderId);
    const { user_trade_status, incoming_proposals_count } = this.computeStatus(
      item, traderId, ctx.acceptedItemIds, ctx.userOutgoingItemIds, ctx.offeredToUserItemIds, ctx.incomingProposalCounts,
    );

    return { ...item, user_trade_status, incoming_proposals_count };
  }

  async findByTrader(traderId: number) {
    return this.databaseService.client.traderItem.findMany({
      where: { trader_id: traderId },
      include: {
        category: true,
        photos: { orderBy: { display_order: 'asc' } },
      },
    });
  }

  async update(id: number, data: Partial<UpdateItemDto>) {
    const updateData: Record<string, unknown> = { status: 'PENDING', rejection_reason: null };
    if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
    if (data.itemName !== undefined) updateData.item_name = data.itemName;
    if (data.description !== undefined) updateData.description = data.description;

    return this.databaseService.client.traderItem.update({
      where: { item_id: id },
      data: updateData,
      include: {
        category: true,
        photos: { orderBy: { display_order: 'asc' } },
      },
    });
  }

  async delete(id: number) {
    return this.databaseService.client.traderItem.delete({
      where: { item_id: id },
    });
  }

  async addPhoto(itemId: number, photoUrl: string, displayOrder: number) {
    return this.databaseService.client.itemPhoto.create({
      data: {
        item_id: itemId,
        photo_url: photoUrl,
        display_order: displayOrder,
      },
    });
  }
}
