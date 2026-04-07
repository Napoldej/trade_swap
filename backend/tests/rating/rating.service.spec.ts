import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { RatingService } from 'src/rating/rating.service';
import { RatingRepository } from 'src/rating/rating.repository';
import { DatabaseService } from 'src/database/database.service';

const mockRatingRepository = {
  create: jest.fn(),
  exists: jest.fn(),
  findByTrader: jest.fn(),
};

const mockTrader = { trader_id: 10, user_id: 1 };
const mockRatee = { trader_id: 20, user_id: 2 };

const completedTrade = {
  trade_id: 1,
  proposer_id: 10,
  receiver_id: 20,
  status: 'COMPLETED',
};

const mockDatabaseService = {
  client: {
    trader: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    trade: {
      findUnique: jest.fn(),
    },
    rating: {
      findMany: jest.fn(),
    },
  },
};

describe('RatingService', () => {
  let service: RatingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        { provide: RatingRepository, useValue: mockRatingRepository },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
    jest.clearAllMocks();
  });

  // ─── rate ─────────────────────────────────────────────────────────────────────

  describe('rate', () => {
    const dto = { tradeId: 1, rateeId: 20, score: 5, comment: 'Great trader!' };

    beforeEach(() => {
      mockDatabaseService.client.trader.findUnique
        .mockResolvedValueOnce(mockTrader)  // rater lookup
        .mockResolvedValueOnce(mockRatee);  // ratee lookup
      mockDatabaseService.client.trade.findUnique.mockResolvedValue(completedTrade);
      mockRatingRepository.exists.mockResolvedValue(false);
      mockRatingRepository.create.mockResolvedValue({ rating_id: 1, ...dto, rater_id: 10 });
      mockDatabaseService.client.rating.findMany.mockResolvedValue([{ score: 5 }]);
      mockDatabaseService.client.trader.update.mockResolvedValue({});
    });

    it('creates a rating after a COMPLETED trade', async () => {
      const result = await service.rate(1, dto);

      expect(mockRatingRepository.create).toHaveBeenCalledWith(10, dto);
      expect(result.rating_id).toBe(1);
    });

    it('recalculates ratee average rating and total_trades after rating', async () => {
      mockDatabaseService.client.rating.findMany.mockResolvedValue([{ score: 4 }, { score: 5 }]);

      await service.rate(1, dto);

      expect(mockDatabaseService.client.trader.update).toHaveBeenCalledWith({
        where: { trader_id: 20 },
        data: { rating: 4.5, total_trades: 2 },
      });
    });

    it('throws BadRequestException if trade is not COMPLETED', async () => {
      mockDatabaseService.client.trader.findUnique.mockReset();
      mockDatabaseService.client.trader.findUnique.mockResolvedValueOnce(mockTrader);
      mockDatabaseService.client.trade.findUnique.mockResolvedValue({
        ...completedTrade,
        status: 'ACCEPTED',
      });

      await expect(service.rate(1, dto)).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException if caller is not part of the trade', async () => {
      const outsider = { trader_id: 99, user_id: 5 };
      mockDatabaseService.client.trader.findUnique.mockReset();
      mockDatabaseService.client.trader.findUnique.mockResolvedValueOnce(outsider);
      mockDatabaseService.client.trade.findUnique.mockResolvedValue(completedTrade);

      await expect(service.rate(5, dto)).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if rater tries to rate themselves', async () => {
      const selfRateDto = { ...dto, rateeId: 10 }; // rater and ratee are both trader_id 10
      mockDatabaseService.client.trader.findUnique.mockReset();
      mockDatabaseService.client.trader.findUnique
        .mockResolvedValueOnce(mockTrader)
        .mockResolvedValueOnce(mockTrader); // ratee is same as rater
      mockDatabaseService.client.trade.findUnique.mockResolvedValue({
        ...completedTrade,
        proposer_id: 10,
        receiver_id: 10,
      });

      await expect(service.rate(1, selfRateDto)).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException if trader already rated this trade', async () => {
      mockRatingRepository.exists.mockResolvedValue(true);

      await expect(service.rate(1, dto)).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException if trade does not exist', async () => {
      mockDatabaseService.client.trader.findUnique.mockReset();
      mockDatabaseService.client.trader.findUnique.mockResolvedValueOnce(mockTrader);
      mockDatabaseService.client.trade.findUnique.mockResolvedValue(null);

      await expect(service.rate(1, dto)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getRatingsByTrader ───────────────────────────────────────────────────────

  describe('getRatingsByTrader', () => {
    it('returns all ratings received by a trader', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValueOnce(mockRatee);
      mockRatingRepository.findByTrader.mockResolvedValue([
        { rating_id: 1, score: 5, rater_id: 10 },
      ]);

      const result = await service.getRatingsByTrader(20);

      expect(mockRatingRepository.findByTrader).toHaveBeenCalledWith(20);
      expect(result).toHaveLength(1);
    });

    it('throws NotFoundException if trader does not exist', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValueOnce(null);

      await expect(service.getRatingsByTrader(999)).rejects.toThrow(NotFoundException);
    });
  });
});
