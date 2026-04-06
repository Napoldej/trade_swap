import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { DatabaseService } from '../database/database.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly databaseService: DatabaseService,
  ) {}

  private async getTraderByUserId(userId: number) {
    const trader = await this.databaseService.client.trader.findUnique({
      where: { user_id: userId },
    });
    if (!trader) {
      throw new NotFoundException('Trader profile not found');
    }
    return trader;
  }

  private async getTradeAndVerifyAccess(userId: number, tradeId: number) {
    const trader = await this.getTraderByUserId(userId);

    const trade = await this.databaseService.client.trade.findUnique({
      where: { trade_id: tradeId },
    });

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    if (trade.proposer_id !== trader.trader_id && trade.receiver_id !== trader.trader_id) {
      throw new ForbiddenException('You are not part of this trade');
    }

    return { trader, trade };
  }

  async getMessages(userId: number, tradeId: number) {
    await this.getTradeAndVerifyAccess(userId, tradeId);

    const conversation = await this.chatRepository.findConversationByTrade(tradeId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found for this trade');
    }

    return this.chatRepository.getMessages(conversation.conversation_id);
  }

  async sendMessage(userId: number, tradeId: number, dto: SendMessageDto) {
    const { trader } = await this.getTradeAndVerifyAccess(userId, tradeId);

    const conversation = await this.chatRepository.findConversationByTrade(tradeId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found for this trade');
    }

    return this.chatRepository.sendMessage(
      conversation.conversation_id,
      trader.trader_id,
      dto.content,
    );
  }
}
