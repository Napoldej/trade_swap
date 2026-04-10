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
    if (!trader) {
      throw new NotFoundException('Trader profile not found');
    }
    return trader;
  }

  async createItem(userId: number, dto: CreateItemDto) {
    const trader = await this.getTraderByUserId(userId);
    return this.itemRepository.create(trader.trader_id, dto);
  }

  async getAllItems(userId: number | null) {
    // Resolve trader_id from userId if authenticated
    let traderId: number | null = null;
    if (userId) {
      const trader = await this.databaseService.client.trader.findUnique({
        where: { user_id: userId },
        select: { trader_id: true },
      });
      traderId = trader?.trader_id ?? null;
    }
    return this.itemRepository.findAll(traderId);
  }

  async getItemById(id: number, userId: number | null = null) {
    let traderId: number | null = null;
    if (userId) {
      const trader = await this.databaseService.client.trader.findUnique({
        where: { user_id: userId },
        select: { trader_id: true },
      });
      traderId = trader?.trader_id ?? null;
    }
    const item = await this.itemRepository.findById(id, traderId);
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async getMyItems(userId: number) {
    const trader = await this.getTraderByUserId(userId);
    return this.itemRepository.findByTrader(trader.trader_id);
  }

  async updateItem(userId: number, itemId: number, dto: UpdateItemDto) {
    const trader = await this.getTraderByUserId(userId);
    const item = await this.itemRepository.findById(itemId);

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.trader_id !== trader.trader_id) {
      throw new ForbiddenException('You do not own this item');
    }

    return this.itemRepository.update(itemId, dto);
  }

  async deleteItem(userId: number, itemId: number) {
    const trader = await this.getTraderByUserId(userId);
    const item = await this.itemRepository.findById(itemId);

    if (!item) {
      throw new NotFoundException('Item not found');
    }
    

    if (item.trader_id !== trader.trader_id) {
      throw new ForbiddenException('You do not own this item');
    }

    return this.itemRepository.delete(itemId);
  }

  async addPhoto(userId: number, itemId: number, photoUrl: string, displayOrder: number) {
    const trader = await this.getTraderByUserId(userId);
    const item = await this.itemRepository.findById(itemId);

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.trader_id !== trader.trader_id) {
      throw new ForbiddenException('You do not own this item');
    }

    return this.itemRepository.addPhoto(itemId, photoUrl, displayOrder);
  }
}
