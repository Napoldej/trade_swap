import { api } from '@/lib/api';
import { AdminAnalytics, Category, TraderItem, User } from '@/types/api';

export const adminService = {
  // ─── Users ──────────────────────────────────────────────────────────────────

  getUsers(): Promise<User[]> {
    return api.get('/admin/users');
  },

  updateUser(id: number, data: { first_name?: string; last_name?: string; role?: string }): Promise<User> {
    return api.patch(`/admin/users/${id}`, data);
  },

  deleteUser(id: number): Promise<void> {
    return api.delete(`/admin/users/${id}`);
  },

  verifyUser(id: number): Promise<User> {
    return api.put(`/admin/users/${id}/verify`);
  },

  unverifyUser(id: number): Promise<User> {
    return api.put(`/admin/users/${id}/unverify`);
  },

  // ─── Verifier approval ──────────────────────────────────────────────────────

  getPendingVerifiers(): Promise<User[]> {
    return api.get('/admin/verifiers/pending');
  },

  approveVerifier(id: number): Promise<User> {
    return api.put(`/admin/verifiers/${id}/approve`);
  },

  rejectVerifier(id: number): Promise<void> {
    return api.delete(`/admin/verifiers/${id}/reject`);
  },

  // ─── Items ──────────────────────────────────────────────────────────────────

  getAllItems(): Promise<TraderItem[]> {
    return api.get('/admin/items');
  },

  updateItem(id: number, data: { item_name?: string; description?: string; category_id?: number }): Promise<TraderItem> {
    return api.patch(`/admin/items/${id}`, data);
  },

  deleteItem(id: number): Promise<void> {
    return api.delete(`/admin/items/${id}`);
  },

  // ─── Analytics ──────────────────────────────────────────────────────────────

  getAnalytics(): Promise<AdminAnalytics> {
    return api.get('/admin/analytics');
  },

  // ─── Categories ─────────────────────────────────────────────────────────────

  createCategory(category_name: string): Promise<Category> {
    return api.post('/categories', { category_name });
  },

  deleteCategory(id: number): Promise<void> {
    return api.delete(`/categories/${id}`);
  },
};
