import { api } from '@/lib/api';

export interface UserProfile {
  user_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  verified: boolean;
}

export const usersService = {
  getMe(): Promise<{ message: string; data: UserProfile }> {
    return api.get('/users/me');
  },

  updateMe(dto: Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'email'>>): Promise<{ message: string; data: UserProfile }> {
    return api.patch('/users/me', dto);
  },
};
