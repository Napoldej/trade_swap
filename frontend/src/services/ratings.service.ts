import { api } from '@/lib/api';
import { CreateRatingDto, Rating } from '@/types/api';

export const ratingsService = {
  create(dto: CreateRatingDto): Promise<Rating> {
    return api.post('/ratings', dto);
  },

  getByTrader(traderId: number): Promise<Rating[]> {
    return api.get(`/traders/${traderId}/ratings`);
  },
};
