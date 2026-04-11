import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ChatRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly senderInclude = {
    sender: {
      include: {
        user: { select: { user_name: true, first_name: true, last_name: true } },
      },
    },
  };

  async getMessages(conversationId: number) {
    return this.databaseService.client.message.findMany({
      where: { conversation_id: conversationId },
      include: this.senderInclude,
      orderBy: { created_at: 'asc' },
    });
  }

  async sendMessage(conversationId: number, senderId: number, content: string) {
    return this.databaseService.client.message.create({
      data: {
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      },
      include: this.senderInclude,
    });
  }

  async findConversationByTrade(tradeId: number) {
    return this.databaseService.client.conversation.findUnique({
      where: { trade_id: tradeId },
    });
  }

  async markRead(conversationId: number, traderId: number) {
    return this.databaseService.client.conversationRead.upsert({
      where: { conversation_id_trader_id: { conversation_id: conversationId, trader_id: traderId } },
      update: { last_read_at: new Date() },
      create: { conversation_id: conversationId, trader_id: traderId },
    });
  }

  async getUnreadCount(traderId: number) {
    // Get all conversations where this trader participates (via accepted/pending trades)
    const trades = await this.databaseService.client.trade.findMany({
      where: {
        OR: [{ proposer_id: traderId }, { receiver_id: traderId }],
        status: { in: ['ACCEPTED', 'PENDING', 'COMPLETED'] },
      },
      select: { conversation: { select: { conversation_id: true } } },
    });

    const conversationIds = trades
      .map((t) => t.conversation?.conversation_id)
      .filter((id): id is number => id !== undefined);

    if (conversationIds.length === 0) return 0;

    // Get last_read_at for each conversation
    const reads = await this.databaseService.client.conversationRead.findMany({
      where: { trader_id: traderId, conversation_id: { in: conversationIds } },
    });
    const readMap = new Map(reads.map((r) => [r.conversation_id, r.last_read_at]));

    // Count messages sent by others after last_read_at
    let total = 0;
    for (const convId of conversationIds) {
      const lastRead = readMap.get(convId) ?? new Date(0);
      const count = await this.databaseService.client.message.count({
        where: {
          conversation_id: convId,
          sender_id: { not: traderId },
          created_at: { gt: lastRead },
        },
      });
      total += count;
    }
    return total;
  }
}
