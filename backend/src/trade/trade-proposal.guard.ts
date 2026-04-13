import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TradeProposalGuard {
  constructor(private readonly databaseService: DatabaseService) {}

  async getTraderByUserId(userId: number) {
    const trader = await this.databaseService.client.trader.findUnique({ where: { user_id: userId } });
    if (!trader) throw new NotFoundException('Trader profile not found');
    return trader;
  }

  async getReceiverOrThrow(receiverId: number) {
    const receiver = await this.databaseService.client.trader.findUnique({ where: { trader_id: receiverId } });
    if (!receiver) throw new NotFoundException('Receiver trader not found');
    return receiver;
  }

  async validateProposalItems(traderId: number, proposerItemId: number, receiverItemId: number) {
    const [proposerItem, receiverItem] = await Promise.all([
      this.databaseService.client.traderItem.findUnique({ where: { item_id: proposerItemId } }),
      this.databaseService.client.traderItem.findUnique({ where: { item_id: receiverItemId } }),
    ]);
    if (!proposerItem) throw new NotFoundException('Your item not found');
    if (!receiverItem) throw new NotFoundException('Their item not found');
    if (proposerItem.status !== 'APPROVED') throw new BadRequestException('Your item must be APPROVED');
    if (receiverItem.status !== 'APPROVED') throw new BadRequestException('Their item must be APPROVED');
    if (!proposerItem.is_available) throw new BadRequestException('Your item is not available for trading');
    if (!receiverItem.is_available) throw new BadRequestException('That item is not available for trading');
    if (proposerItem.trader_id !== traderId) throw new ForbiddenException('You do not own the proposer item');
    if (receiverItem.trader_id === traderId) throw new ForbiddenException('You cannot trade with yourself');
    return { proposerItem, receiverItem };
  }

  async checkNoAcceptedConflict(proposerItemId: number, receiverItemId: number) {
    const conflict = await this.databaseService.client.trade.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { proposer_item_id: { in: [proposerItemId, receiverItemId] } },
          { receiver_item_id: { in: [proposerItemId, receiverItemId] } },
        ],
      },
    });
    if (conflict) throw new ConflictException('One of the items is already in an accepted trade');
  }
}
