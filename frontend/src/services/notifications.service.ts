import { api } from '@/lib/api';
import { Notification } from '@/types/api';

export const notificationsService = {
  getMyNotifications(): Promise<Notification[]> {
    return api.get('/notifications/me');
  },

  markAsRead(id: number): Promise<Notification> {
    return api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead(): Promise<void> {
    return api.patch('/notifications/read-all');
  },
};
