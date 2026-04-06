import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { RatingRepository } from './rating.repository';
import { DatabaseService } from '../database/database.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingService {
  constructor(
    private readonly ratingRepository: RatingRepository,
    private readonly databaseService: DatabaseService,
  ) {}

  private async getTraderByUserId(userId: number) {
    const trader = await this.databaseService.client.trader.findUnique({
      where: { user_id: userId },
    });
    if (!trader) {
      throw new NotFoundException('Trader profile not found');
    }
    return trader;
  }

  async rate(userId: number, dto: CreateRatingDto) {
    const trader = await this.getTraderByUserId(userId);

    const trade = await this.databaseService.client.trade.findUnique({
      where: { trade_id: dto.tradeId },
    });

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    if (trade.status !== 'COMPLETED') {
      throw new BadRequestException('Trade must be COMPLETED to submit a rating');
    }

    if (trade.proposer_id !== trader.trader_id && trade.receiver_id !== trader.trader_id) {
      throw new ForbiddenException('You are not part of this trade');
    }

    const ratee = await this.databaseService.client.trader.findUnique({
      where: { trader_id: dto.rateeId },
    });

    if (!ratee) {
      throw new NotFoundException('Ratee trader not found');
    }

    if (dto.rateeId === trader.trader_id) {
      throw new BadRequestException('You cannot rate yourself');
    }

    const alreadyRated = await this.ratingRepository.exists(dto.tradeId, trader.trader_id);
    if (alreadyRated) {
      throw new ConflictException('You have already rated this trade');
    }

    const rating = await this.ratingRepository.create(trader.trader_id, dto);

    // Update ratee's rating average and total_trades
    const allRatings = await this.databaseService.client.rating.findMany({
      where: { ratee_id: dto.rateeId },
    });

    const avgRating =
      allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;

    await this.databaseService.client.trader.update({
      where: { trader_id: dto.rateeId },
      data: {
        rating: avgRating,
        total_trades: allRatings.length,
      },
    });

    return rating;
  }

}
