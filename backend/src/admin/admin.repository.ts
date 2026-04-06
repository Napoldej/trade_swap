import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Role } from '../infrastructure/generated/prisma/enums';

@Injectable()
export class AdminRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllUsers() {
    return this.databaseService.client.user.findMany({
      select: {
        user_id: true,
        user_name: true,
        role: true,
        created_at: true,
        updated_at: true,
        verified: true,
        trader: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateUserRole(userId: number, role: Role) {
    return this.databaseService.client.user.update({
      where: { user_id: userId },
      data: { role },
      select: {
        user_id: true,
        user_name: true,
        role: true,
        created_at: true,
        updated_at: true,
        verified: true,
      },
    });
  }

  async deleteUser(userId: number) {
    return this.databaseService.client.user.delete({
      where: { user_id: userId },
    });
  }

  async createCategory(name: string) {
    return this.databaseService.client.category.create({
      data: { category_name: name },
    });
  }

  async getAllCategories() {
    return this.databaseService.client.category.findMany({
      orderBy: { category_name: 'asc' },
    });
  }

  async deleteCategory(id: number) {
    return this.databaseService.client.category.delete({
      where: { category_id: id },
    });
  }

  async getPendingVerifiers() {
    return this.databaseService.client.user.findMany({
      where: { role: 'VERIFIER', verified: false },
      select: {
        user_id: true,
        user_name: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        verified: true,
        created_at: true,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async approveVerifier(userId: number) {
    return this.databaseService.client.user.update({
      where: { user_id: userId },
      data: { verified: true },
      select: {
        user_id: true,
        user_name: true,
        role: true,
        verified: true,
      },
    });
  }

  async rejectVerifier(userId: number) {
    return this.databaseService.client.user.delete({
      where: { user_id: userId },
    });
  }
}
