import { api } from '@/lib/api';
import { Trade, TraderItem } from '@/types/api';

export const verifierService = {
  getPendingItems(): Promise<TraderItem[]> {
    return api.get('/verifier/items/pending');
  },

  getApprovedItems(): Promise<TraderItem[]> {
    return api.get('/verifier/items/approved');
  },

  getRejectedItems(): Promise<TraderItem[]> {
    return api.get('/verifier/items/rejected');
  },

  approveItem(id: number): Promise<TraderItem> {
    return api.patch(`/verifier/items/${id}/approve`);
  },

  rejectItem(id: number, rejection_reason: string): Promise<TraderItem> {
    return api.patch(`/verifier/items/${id}/reject`, { rejection_reason });
  },

  removeItem(id: number): Promise<void> {
    return api.delete(`/verifier/items/${id}`);
  },

  // Trade verification
  getPendingTrades(): Promise<Trade[]> {
    return api.get('/verifier/trades/pending');
  },

  getTradeById(id: number): Promise<Trade> {
    return api.get(`/verifier/trades/${id}`);
  },

  confirmTrade(id: number, note?: string): Promise<Trade> {
    return api.patch(`/verifier/trades/${id}/confirm`, { note });
  },

  rejectTrade(id: number, reason: string): Promise<Trade> {
    return api.patch(`/verifier/trades/${id}/reject`, { reason });
  },
};
