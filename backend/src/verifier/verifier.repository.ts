import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class VerifierRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getPendingItems() {
    return this.databaseService.client.traderItem.findMany({
      where: { status: 'PENDING' },
      include: {
        category: true,
        photos: { orderBy: { display_order: 'asc' } },
        trader: true,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async approveItem(itemId: number, verifierId: number) {
    return this.databaseService.client.traderItem.update({
      where: { item_id: itemId },
      data: {
        status: 'APPROVED',
        verified_by: verifierId,
        rejection_reason: null,
      },
      include: {
        category: true,
        photos: true,
        trader: true,
      },
    });
  }

  async rejectItem(itemId: number, verifierId: number, reason: string) {
    return this.databaseService.client.traderItem.update({
      where: { item_id: itemId },
      data: {
        status: 'REJECTED',
        verified_by: verifierId,
        rejection_reason: reason,
      },
      include: {
        category: true,
        photos: true,
        trader: true,
      },
    });
  }

  async removeItem(itemId: number) {
    return this.databaseService.client.traderItem.delete({
      where: { item_id: itemId },
    });
  }
}
