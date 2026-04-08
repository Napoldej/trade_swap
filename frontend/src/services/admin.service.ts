import { api } from '@/lib/api';
import { AdminAnalytics, Category, User } from '@/types/api';

export const adminService = {
  // ─── Users ──────────────────────────────────────────────────────────────────

  getUsers(): Promise<User[]> {
    return api.get('/admin/users');
  },

  banUser(id: number): Promise<User> {
    return api.patch(`/admin/users/${id}/ban`);
  },

  unbanUser(id: number): Promise<User> {
    return api.patch(`/admin/users/${id}/unban`);
  },

  promoteToVerifier(id: number): Promise<User> {
    return api.patch(`/admin/users/${id}/role`);
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

  // ─── Analytics ──────────────────────────────────────────────────────────────

  getAnalytics(): Promise<AdminAnalytics> {
    return api.get('/admin/analytics');
  },

  // ─── Categories ─────────────────────────────────────────────────────────────

  createCategory(category_name: string): Promise<Category> {
    return api.post('/categories', { category_name });
  },

  updateCategory(id: number, category_name: string): Promise<Category> {
    return api.patch(`/categories/${id}`, { category_name });
  },

  deleteCategory(id: number): Promise<void> {
    return api.delete(`/categories/${id}`);
  },
};
