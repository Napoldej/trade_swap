import { api } from '@/lib/api';
import { CreateItemDto, TraderItem, UpdateItemDto } from '@/types/api';

export const itemsService = {
  /** Public — returns all APPROVED, available items */
  getAll(): Promise<TraderItem[]> {
    return api.get('/items');
  },

  getById(id: number): Promise<TraderItem> {
    return api.get(`/items/${id}`);
  },

  /** Trader — own items (all statuses) */
  getMyItems(): Promise<TraderItem[]> {
    return api.get('/items/my');
  },

  create(dto: CreateItemDto): Promise<TraderItem> {
    return api.post('/items', dto);
  },

  update(id: number, dto: UpdateItemDto): Promise<TraderItem> {
    return api.patch(`/items/${id}`, dto);
  },

  remove(id: number): Promise<void> {
    return api.delete(`/items/${id}`);
  },
};
