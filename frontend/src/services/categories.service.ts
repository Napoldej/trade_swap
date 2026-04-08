import { api } from '@/lib/api';
import { Category } from '@/types/api';

export const categoriesService = {
  getAll(): Promise<Category[]> {
    return api.get('/categories');
  },

  getById(id: number): Promise<Category> {
    return api.get(`/categories/${id}`);
  },

  create(category_name: string): Promise<Category> {
    return api.post('/categories', { category_name });
  },

  update(id: number, category_name: string): Promise<Category> {
    return api.patch(`/categories/${id}`, { category_name });
  },

  remove(id: number): Promise<void> {
    return api.delete(`/categories/${id}`);
  },
};
