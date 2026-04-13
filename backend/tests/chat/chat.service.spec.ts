import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ChatService } from 'src/chat/chat.service';
import { ChatRepository } from 'src/chat/chat.repository';
import { DatabaseService } from 'src/database/database.service';

const mockChatRepository = {
  findConversationByTrade: jest.fn(),
  getMessages: jest.fn(),
  sendMessage: jest.fn(),
  markRead: jest.fn().mockResolvedValue(undefined),
};

const mockTrader = { trader_id: 10, user_id: 1 };
const mockOtherTrader = { trader_id: 20, user_id: 2 };
const mockOutsider = { trader_id: 99, user_id: 5 };

const mockTrade = { trade_id: 1, proposer_id: 10, receiver_id: 20, status: 'ACCEPTED' };
const mockConversation = { conversation_id: 7, trade_id: 1 };

const mockDatabaseService = {
  client: {
    trader: { findUnique: jest.fn() },
    trade: { findUnique: jest.fn() },
  },
};

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: ChatRepository, useValue: mockChatRepository },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
  });

  // ─── getMessages ─────────────────────────────────────────────────────────────

  describe('getMessages', () => {
    it('proposer can read messages in their trade conversation', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockDatabaseService.client.trade.findUnique.mockResolvedValue(mockTrade);
      mockChatRepository.findConversationByTrade.mockResolvedValue(mockConversation);
      mockChatRepository.getMessages.mockResolvedValue([
        { message_id: 1, content: 'Hi!', sender_id: 10 },
      ]);

      const result = await service.getMessages(1, 1);

      expect(mockChatRepository.getMessages).toHaveBeenCalledWith(7);
      expect(result).toHaveLength(1);
    });

    it('receiver can read messages in their trade conversation', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockOtherTrader);
      mockDatabaseService.client.trade.findUnique.mockResolvedValue(mockTrade);
      mockChatRepository.findConversationByTrade.mockResolvedValue(mockConversation);
      mockChatRepository.getMessages.mockResolvedValue([]);

      await service.getMessages(2, 1);

      expect(mockChatRepository.getMessages).toHaveBeenCalledWith(7);
    });

    it('throws ForbiddenException if user is not part of the trade', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockOutsider);
      mockDatabaseService.client.trade.findUnique.mockResolvedValue(mockTrade);

      await expect(service.getMessages(5, 1)).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException if trade does not exist', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockDatabaseService.client.trade.findUnique.mockResolvedValue(null);

      await expect(service.getMessages(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException if conversation not found for trade', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockDatabaseService.client.trade.findUnique.mockResolvedValue(mockTrade);
      mockChatRepository.findConversationByTrade.mockResolvedValue(null);

      await expect(service.getMessages(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── sendMessage ─────────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('proposer can send a message in their trade conversation', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockDatabaseService.client.trade.findUnique.mockResolvedValue(mockTrade);
      mockChatRepository.findConversationByTrade.mockResolvedValue(mockConversation);
      mockChatRepository.sendMessage.mockResolvedValue({
        message_id: 1,
        content: 'Hello!',
        sender_id: 10,
      });

      const result = await service.sendMessage(1, 1, { content: 'Hello!' });

      expect(mockChatRepository.sendMessage).toHaveBeenCalledWith(7, 10, 'Hello!');
      expect(result.content).toBe('Hello!');
    });

    it('receiver can send a message in their trade conversation', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockOtherTrader);
      mockDatabaseService.client.trade.findUnique.mockResolvedValue(mockTrade);
      mockChatRepository.findConversationByTrade.mockResolvedValue(mockConversation);
      mockChatRepository.sendMessage.mockResolvedValue({
        message_id: 2,
        content: 'Sure!',
        sender_id: 20,
      });

      await service.sendMessage(2, 1, { content: 'Sure!' });

      expect(mockChatRepository.sendMessage).toHaveBeenCalledWith(7, 20, 'Sure!');
    });

    it('throws ForbiddenException if sender is not part of the trade', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockOutsider);
      mockDatabaseService.client.trade.findUnique.mockResolvedValue(mockTrade);

      await expect(
        service.sendMessage(5, 1, { content: 'Hello!' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException if trade does not exist', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockDatabaseService.client.trade.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessage(1, 999, { content: 'Hello!' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
