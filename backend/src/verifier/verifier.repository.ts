import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const ITEM_INCLUDE = {
  category: true,
  photos: { orderBy: { display_order: 'asc' as const } },
  trader: {
    include: {
      user: { select: { user_name: true, first_name: true, last_name: true } },
    },
  },
};

@Injectable()
export class VerifierRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  getItemsByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return this.databaseService.client.traderItem.findMany({
      where: { status },
      include: ITEM_INCLUDE,
      orderBy: { created_at: 'asc' },
    });
  }

  approveItem(itemId: number, verifierId: number) {
    return this.databaseService.client.traderItem.update({
      where: { item_id: itemId },
      data: { status: 'APPROVED', verified_by: verifierId, rejection_reason: null },
      include: ITEM_INCLUDE,
    });
  }

  rejectItem(itemId: number, verifierId: number, reason: string) {
    return this.databaseService.client.traderItem.update({
      where: { item_id: itemId },
      data: { status: 'REJECTED', verified_by: verifierId, rejection_reason: reason },
      include: ITEM_INCLUDE,
    });
  }

  removeItem(itemId: number) {
    return this.databaseService.client.traderItem.delete({
      where: { item_id: itemId },
    });
  }
}
