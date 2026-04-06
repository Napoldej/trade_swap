import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { VerifierRepository } from './verifier.repository';
import { DatabaseService } from '../database/database.service';
import { RejectItemDto } from './dto/reject-item.dto';

@Injectable()
export class VerifierService {
  constructor(
    private readonly verifierRepository: VerifierRepository,
    private readonly databaseService: DatabaseService,
  ) {}

  async getPendingItems() {
    return this.verifierRepository.getPendingItems();
  }

  async approveItem(itemId: number, userId: number) {
    const item = await this.databaseService.client.traderItem.findUnique({
      where: { item_id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.status !== 'PENDING') {
      throw new BadRequestException('Item is not in PENDING status');
    }

    return this.verifierRepository.approveItem(itemId, userId);
  }

  async rejectItem(itemId: number, userId: number, dto: RejectItemDto) {
    const item = await this.databaseService.client.traderItem.findUnique({
      where: { item_id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.status !== 'PENDING') {
      throw new BadRequestException('Item is not in PENDING status');
    }

    return this.verifierRepository.rejectItem(itemId, userId, dto.rejectionReason);
  }

  async removeItem(itemId: number) {
    const item = await this.databaseService.client.traderItem.findUnique({
      where: { item_id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return this.verifierRepository.removeItem(itemId);
  }
}
