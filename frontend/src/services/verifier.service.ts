import { api } from '@/lib/api';
import { TraderItem } from '@/types/api';

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
};
