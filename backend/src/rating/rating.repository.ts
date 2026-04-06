import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(raterId: number, dto: CreateRatingDto) {
    return this.databaseService.client.rating.create({
      data: {
        trade_id: dto.tradeId,
        rater_id: raterId,
        ratee_id: dto.rateeId,
        score: dto.score,
        comment: dto.comment,
      },
      include: {
        rater: true,
        ratee: true,
        trade: true,
      },
    });
  }

  async findByTrader(traderId: number) {
    return this.databaseService.client.rating.findMany({
      where: { ratee_id: traderId },
      include: {
        rater: true,
        trade: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async exists(tradeId: number, raterId: number): Promise<boolean> {
    const rating = await this.databaseService.client.rating.findFirst({
      where: { trade_id: tradeId, rater_id: raterId },
    });
    return !!rating;
  }
}
