import { api, API_BASE_URL, ApiException } from '@/lib/api';
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
    return api.put(`/items/${id}`, dto);
  },

  remove(id: number): Promise<void> {
    return api.delete(`/items/${id}`);
  },

  deletePhoto(itemId: number, photoId: number): Promise<void> {
    return api.delete(`/items/${itemId}/photos/${photoId}`);
  },

  /** Upload a photo to an item — uses FormData (multipart/form-data) */
  async uploadPhoto(itemId: number, file: File, displayOrder = 0): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('displayOrder', String(displayOrder));

    const response = await fetch(`${API_BASE_URL}/items/${itemId}/photos`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // Do NOT set Content-Type — browser sets it automatically with boundary
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message ?? `HTTP ${response.status}`;
      throw new ApiException(response.status, msg, data);
    }

    return response.json();
  },
};
