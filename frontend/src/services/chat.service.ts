import { api } from '@/lib/api';
import { Message, SendMessageDto } from '@/types/api';

export const chatService = {
  getMessages(tradeId: number): Promise<Message[]> {
    return api.get(`/trades/${tradeId}/messages`);
  },

  sendMessage(tradeId: number, dto: SendMessageDto): Promise<Message> {
    return api.post(`/trades/${tradeId}/messages`, dto);
  },

  getUnreadCount(): Promise<{ count: number }> {
    return api.get('/chat/unread-count');
  },
};
