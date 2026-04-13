import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { AdminAnalyticsRepository } from './admin-analytics.repository';
import { DatabaseService } from '../database/database.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly adminAnalyticsRepository: AdminAnalyticsRepository,
    private readonly databaseService: DatabaseService,
  ) {}

  private async findItemOrThrow(itemId: number) {
    const item = await this.databaseService.client.traderItem.findUnique({ where: { item_id: itemId } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  private async findCategoryOrThrow(id: number) {
    const category = await this.databaseService.client.category.findUnique({ where: { category_id: id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.adminRepository.createCategory(dto.name);
  }

  async getAllCategories() {
    return this.adminRepository.getAllCategories();
  }

  async deleteCategory(id: number) {
    await this.findCategoryOrThrow(id);
    return this.adminRepository.deleteCategory(id);
  }

  async getAnalytics() {
    return this.adminAnalyticsRepository.getAnalytics();
  }

  async getAllItems() {
    return this.adminRepository.getAllItems();
  }

  async updateItem(itemId: number, data: { item_name?: string; description?: string; category_id?: number }) {
    await this.findItemOrThrow(itemId);
    return this.adminRepository.updateItem(itemId, data);
  }

  async deleteItem(itemId: number) {
    await this.findItemOrThrow(itemId);
    return this.adminRepository.deleteItem(itemId);
  }
}
