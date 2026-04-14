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

  private async findItemPendingOrThrow(itemId: number) {
    const item = await this.databaseService.client.traderItem.findUnique({
      where: { item_id: itemId },
      include: { trader: { select: { user_id: true } } },
    });
    if (!item) throw new NotFoundException('Item not found');
    if (item.status !== 'PENDING') throw new BadRequestException('Item is not in PENDING status');
    return item;
  }

  private async findTradeAwaitingOrThrow(tradeId: number) {
    const trade = await this.verifierRepository.getTradeById(tradeId);
    if (!trade) throw new NotFoundException('Trade not found');
    if (trade.status !== 'AWAITING_VERIFICATION')
      throw new BadRequestException('Trade is not awaiting verification');
    return trade;
  }

  async getItemsByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return this.verifierRepository.getItemsByStatus(status);
  }

  async approveItem(itemId: number, userId: number) {
    const item = await this.findItemPendingOrThrow(itemId);
    const result = await this.verifierRepository.approveItem(itemId, userId);
    await this.notificationService.notifyUser(
      item.trader.user_id,
      `Your item "${item.item_name}" has been approved and is now live on the marketplace!`,
    );
    return result;
  }

  async rejectItem(itemId: number, userId: number, dto: RejectItemDto) {
    const item = await this.findItemPendingOrThrow(itemId);
    const result = await this.verifierRepository.rejectItem(itemId, userId, dto.rejection_reason);
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

  // ── Trade Verification ────────────────────────────────────────────────────────

  async getPendingTrades() {
    return this.verifierRepository.getPendingTrades();
  }

  async getTradeById(tradeId: number) {
    return this.findTradeAwaitingOrThrow(tradeId);
  }

  async confirmTrade(tradeId: number, userId: number, note?: string) {
    const trade = await this.findTradeAwaitingOrThrow(tradeId);
    const result = await this.verifierRepository.confirmTrade(tradeId, userId, note);
    const message = `Your trade for "${trade.proposer_item.item_name}" ↔ "${trade.receiver_item.item_name}" has been verified and completed! You can now rate each other.`;
    await Promise.all([
      this.notificationService.notifyTrader(trade.proposer_id, message),
      this.notificationService.notifyTrader(trade.receiver_id, message),
    ]);
    return result;
  }

  // ── Trader Account Approval ──────────────────────────────────────────────────

  async getPendingTraders() {
    return this.databaseService.client.user.findMany({
      where: { role: 'TRADER', verified: false },
      select: { user_id: true, user_name: true, first_name: true, last_name: true, email: true, created_at: true, verified: true, role: true },
      orderBy: { created_at: 'asc' },
    });
  }

  async approveTrader(userId: number) {
    const user = await this.databaseService.client.user.findUnique({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'TRADER') throw new BadRequestException('User is not a trader');
    return this.databaseService.client.user.update({
      where: { user_id: userId },
      data: { verified: true },
      select: { user_id: true, user_name: true, verified: true },
    });
  }

  async rejectTrader(userId: number) {
    const user = await this.databaseService.client.user.findUnique({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'TRADER') throw new BadRequestException('User is not a trader');
    await this.databaseService.client.user.delete({ where: { user_id: userId } });
  }

  async rejectTradeVerification(tradeId: number, userId: number, reason: string) {
    const trade = await this.findTradeAwaitingOrThrow(tradeId);
    const result = await this.verifierRepository.rejectTradeVerification(tradeId, userId, reason);
    const message = `Your trade verification was rejected. Reason: ${reason}`;
    await Promise.all([
      this.notificationService.notifyTrader(trade.proposer_id, message),
      this.notificationService.notifyTrader(trade.receiver_id, message),
    ]);
    return result;
  }
}
