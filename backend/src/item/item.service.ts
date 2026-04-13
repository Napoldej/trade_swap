import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ItemRepository } from './item.repository';
import { DatabaseService } from '../database/database.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemService {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly databaseService: DatabaseService,
  ) {}

  private async getTraderByUserId(userId: number) {
    const trader = await this.databaseService.client.trader.findUnique({
      where: { user_id: userId },
    });
    if (!trader) throw new NotFoundException('Trader profile not found');
    return trader;
  }

  private async resolveTraderIdFromUser(userId: number | null): Promise<number | null> {
    if (!userId) return null;
    const trader = await this.databaseService.client.trader.findUnique({
      where: { user_id: userId },
      select: { trader_id: true },
    });
    return trader?.trader_id ?? null;
  }

  async createItem(userId: number, dto: CreateItemDto) {
    const trader = await this.getTraderByUserId(userId);
    return this.itemRepository.create(trader.trader_id, dto);
  }

  async getAllItems(userId: number | null) {
    const traderId = await this.resolveTraderIdFromUser(userId);
    return this.itemRepository.findAll(traderId);
  }

  async getItemById(id: number, userId: number | null = null) {
    const traderId = await this.resolveTraderIdFromUser(userId);
    const item = await this.itemRepository.findById(id, traderId);
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async getMyItems(userId: number) {
    const trader = await this.getTraderByUserId(userId);
    return this.itemRepository.findByTrader(trader.trader_id);
  }

  private async getItemAndVerifyOwnership(userId: number, itemId: number) {
    const trader = await this.getTraderByUserId(userId);
    const item = await this.itemRepository.findById(itemId);
    if (!item) throw new NotFoundException('Item not found');
    if (item.trader_id !== trader.trader_id) throw new ForbiddenException('You do not own this item');
    return { trader, item };
  }

  async updateItem(userId: number, itemId: number, dto: UpdateItemDto) {
    await this.getItemAndVerifyOwnership(userId, itemId);
    return this.itemRepository.update(itemId, dto);
  }

  async deleteItem(userId: number, itemId: number) {
    await this.getItemAndVerifyOwnership(userId, itemId);
    return this.itemRepository.delete(itemId);
  }

  async addPhoto(userId: number, itemId: number, photoUrl: string, displayOrder: number) {
    await this.getItemAndVerifyOwnership(userId, itemId);
    return this.itemRepository.addPhoto(itemId, photoUrl, displayOrder);
  }
}
