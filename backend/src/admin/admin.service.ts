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
