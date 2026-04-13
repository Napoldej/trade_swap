import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { computeTradeContext, computeItemTradeStatus } from './item-trade-context';

@Injectable()
export class ItemRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly itemInclude = {
    category: true,
    photos: { orderBy: { display_order: 'asc' } as const },
    trader: {
      include: {
        user: { select: { user_name: true, first_name: true, last_name: true } },
      },
    },
  };

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
      include: { category: true, photos: true },
    });
  }

  async findAll(traderId: number | null) {
    const items = await this.databaseService.client.traderItem.findMany({
      where: { status: 'APPROVED', is_available: true },
      include: this.itemInclude,
    });
    const ctx = await computeTradeContext(this.databaseService.client, items.map((i) => i.item_id), traderId);
    return items.map((item) => ({ ...item, ...computeItemTradeStatus(item, traderId, ctx) }));
  }

  async findById(id: number, traderId: number | null = null) {
    const item = await this.databaseService.client.traderItem.findUnique({
      where: { item_id: id },
      include: this.itemInclude,
    });
    if (!item) return null;
    const ctx = await computeTradeContext(this.databaseService.client, [id], traderId);
    return { ...item, ...computeItemTradeStatus(item, traderId, ctx) };
  }

  async findByTrader(traderId: number) {
    return this.databaseService.client.traderItem.findMany({
      where: { trader_id: traderId },
      include: { category: true, photos: { orderBy: { display_order: 'asc' } } },
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
      include: { category: true, photos: { orderBy: { display_order: 'asc' } } },
    });
  }

  async delete(id: number) {
    return this.databaseService.client.traderItem.delete({ where: { item_id: id } });
  }

  async addPhoto(itemId: number, photoUrl: string, displayOrder: number) {
    return this.databaseService.client.itemPhoto.create({
      data: { item_id: itemId, photo_url: photoUrl, display_order: displayOrder },
    });
  }
}
