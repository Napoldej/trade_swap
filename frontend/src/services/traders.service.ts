import { api } from '@/lib/api';
import { Rating, Trader } from '@/types/api';

export const tradersService = {
  getProfile(traderId: number): Promise<Trader> {
    return api.get(`/traders/${traderId}`);
  },

  getRatings(traderId: number): Promise<Rating[]> {
    return api.get(`/traders/${traderId}/ratings`);
  },
};
