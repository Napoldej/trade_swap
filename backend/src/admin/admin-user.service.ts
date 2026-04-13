import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { DatabaseService } from '../database/database.service';
import { ChangeRoleDto } from './dto/change-role.dto';

@Injectable()
export class AdminUserService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly databaseService: DatabaseService,
  ) {}

  private async findUserOrThrow(userId: number) {
    const user = await this.databaseService.client.user.findUnique({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async findPendingVerifierOrThrow(userId: number) {
    const user = await this.findUserOrThrow(userId);
    if (user.role !== 'VERIFIER' || user.verified) throw new BadRequestException('User is not a pending verifier');
    return user;
  }

  async getAllUsers() {
    return this.adminRepository.getAllUsers();
  }

  async updateUserRole(userId: number, dto: ChangeRoleDto) {
    await this.findUserOrThrow(userId);
    return this.adminRepository.updateUserRole(userId, dto.role);
  }

  async deleteUser(userId: number) {
    await this.findUserOrThrow(userId);
    return this.adminRepository.deleteUser(userId);
  }

  async updateUser(userId: number, data: { first_name?: string; last_name?: string; role?: string }) {
    await this.findUserOrThrow(userId);
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

  async verifyUser(userId: number) {
    await this.findUserOrThrow(userId);
    return this.adminRepository.setVerified(userId, true);
  }

  async unverifyUser(userId: number) {
    await this.findUserOrThrow(userId);
    return this.adminRepository.setVerified(userId, false);
  }

  async getPendingVerifiers() {
    return this.adminRepository.getPendingVerifiers();
  }

  async approveVerifier(userId: number) {
    await this.findPendingVerifierOrThrow(userId);
    return this.adminRepository.approveVerifier(userId);
  }

  async rejectVerifier(userId: number) {
    await this.findPendingVerifierOrThrow(userId);
    return this.adminRepository.rejectVerifier(userId);
  }
}
