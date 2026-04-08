import { api } from '@/lib/api';
import { CreateTradeDto, Trade } from '@/types/api';

export const tradesService = {
  /** Create a new trade proposal */
  create(dto: CreateTradeDto): Promise<Trade> {
    return api.post('/trades', dto);
  },

  /** Trader — own sent & received proposals */
  getMyTrades(): Promise<Trade[]> {
    return api.get('/trades');
  },

  getById(id: number): Promise<Trade> {
    return api.get(`/trades/${id}`);
  },

  accept(id: number): Promise<Trade> {
    return api.put(`/trades/${id}/accept`);
  },

  reject(id: number): Promise<Trade> {
    return api.put(`/trades/${id}/reject`);
  },

  complete(id: number): Promise<Trade> {
    return api.put(`/trades/${id}/complete`);
  },

  cancel(id: number): Promise<Trade> {
    return api.put(`/trades/${id}/cancel`);
  },
};
