import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ChatRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getMessages(conversationId: number) {
    return this.databaseService.client.message.findMany({
      where: { conversation_id: conversationId },
      include: {
        sender: true,
      },
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
      include: {
        sender: true,
      },
    });
  }

  async findConversationByTrade(tradeId: number) {
    return this.databaseService.client.conversation.findUnique({
      where: { trade_id: tradeId },
    });
  }
}
