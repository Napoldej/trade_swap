import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { DatabaseService } from '../database/database.service';
import { ChangeRoleDto } from './dto/change-role.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly databaseService: DatabaseService,
  ) {}

  async getAllUsers() {
    return this.adminRepository.getAllUsers();
  }

  async updateUserRole(userId: number, dto: ChangeRoleDto) {
    const user = await this.databaseService.client.user.findUnique({
      where: { user_id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.adminRepository.updateUserRole(userId, dto.role);
  }

  async deleteUser(userId: number) {
    const user = await this.databaseService.client.user.findUnique({
      where: { user_id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.adminRepository.deleteUser(userId);
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.adminRepository.createCategory(dto.name);
  }

  async getAllCategories() {
    return this.adminRepository.getAllCategories();
  }

  async deleteCategory(id: number) {
    const category = await this.databaseService.client.category.findUnique({
      where: { category_id: id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.adminRepository.deleteCategory(id);
  }

  async updateUser(userId: number, data: { first_name?: string; last_name?: string; role?: string }) {
    const user = await this.databaseService.client.user.findUnique({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const updateData: Record<string, unknown> = {};
    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.last_name !== undefined) updateData.last_name = data.last_name;
    if (data.role !== undefined) updateData.role = data.role as any;
    return this.databaseService.client.user.update({
      where: { user_id: userId },
      data: updateData,
      select: { user_id: true, user_name: true, first_name: true, last_name: true, role: true, verified: true, created_at: true },
    });
  }

  async getAnalytics() {
    return this.adminRepository.getAnalytics();
  }

  async getAllItems() {
    return this.adminRepository.getAllItems();
  }

  async updateItem(itemId: number, data: { item_name?: string; description?: string; category_id?: number }) {
    const item = await this.databaseService.client.traderItem.findUnique({ where: { item_id: itemId } });
    if (!item) throw new NotFoundException('Item not found');
    return this.adminRepository.updateItem(itemId, data);
  }

  async deleteItem(itemId: number) {
    const item = await this.databaseService.client.traderItem.findUnique({ where: { item_id: itemId } });
    if (!item) throw new NotFoundException('Item not found');
    return this.adminRepository.deleteItem(itemId);
  }

  async verifyUser(userId: number) {
    const user = await this.databaseService.client.user.findUnique({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.adminRepository.setVerified(userId, true);
  }

  async unverifyUser(userId: number) {
    const user = await this.databaseService.client.user.findUnique({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.adminRepository.setVerified(userId, false);
  }

  async getPendingVerifiers() {
    return this.adminRepository.getPendingVerifiers();
  }

  async approveVerifier(userId: number) {
    const user = await this.databaseService.client.user.findUnique({
      where: { user_id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== 'VERIFIER' || user.verified) {
      throw new BadRequestException('User is not a pending verifier');
    }
    return this.adminRepository.approveVerifier(userId);
  }

  async rejectVerifier(userId: number) {
    const user = await this.databaseService.client.user.findUnique({
      where: { user_id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== 'VERIFIER' || user.verified) {
      throw new BadRequestException('User is not a pending verifier');
    }
    return this.adminRepository.rejectVerifier(userId);
  }
}
