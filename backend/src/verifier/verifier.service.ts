import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { VerifierRepository } from './verifier.repository';
import { DatabaseService } from '../database/database.service';
import { RejectItemDto } from './dto/reject-item.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class VerifierService {
  constructor(
    private readonly verifierRepository: VerifierRepository,
    private readonly databaseService: DatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  async getItemsByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return this.verifierRepository.getItemsByStatus(status);
  }

  async approveItem(itemId: number, userId: number) {
    const item = await this.databaseService.client.traderItem.findUnique({
      where: { item_id: itemId },
      include: { trader: { select: { user_id: true } } },
    });

    if (!item) throw new NotFoundException('Item not found');
    if (item.status !== 'PENDING') throw new BadRequestException('Item is not in PENDING status');

    const result = await this.verifierRepository.approveItem(itemId, userId);

    // Notify item owner
    await this.notificationService.notifyUser(
      item.trader.user_id,
      `Your item "${item.item_name}" has been approved and is now live on the marketplace!`,
    );

    return result;
  }

  async rejectItem(itemId: number, userId: number, dto: RejectItemDto) {
    const item = await this.databaseService.client.traderItem.findUnique({
      where: { item_id: itemId },
      include: { trader: { select: { user_id: true } } },
    });

    if (!item) throw new NotFoundException('Item not found');
    if (item.status !== 'PENDING') throw new BadRequestException('Item is not in PENDING status');

    const result = await this.verifierRepository.rejectItem(itemId, userId, dto.rejection_reason);

    // Notify item owner
    await this.notificationService.notifyUser(
      item.trader.user_id,
      `Your item "${item.item_name}" was rejected. Reason: ${dto.rejection_reason}`,
    );

    return result;
  }

  async removeItem(itemId: number) {
    const item = await this.databaseService.client.traderItem.findUnique({
      where: { item_id: itemId },
    });

    if (!item) throw new NotFoundException('Item not found');

    return this.verifierRepository.removeItem(itemId);
  }
}
