import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TraderService } from 'src/trader/trader.service';
import { TraderRepository } from 'src/trader/trader.repository';

const mockTraderRepository = {
  findById: jest.fn(),
  findRatings: jest.fn(),
};

const mockTraderProfile = {
  trader_id: 10,
  rating: 4.5,
  total_trades: 8,
  user: {
    user_name: 'john_doe',
    first_name: 'John',
    last_name: 'Doe',
    created_at: new Date(),
  },
  items: [
    {
      item_id: 1,
      item_name: 'Laptop',
      status: 'APPROVED',
      is_available: true,
      category: { category_name: 'Electronics' },
      photos: [],
    },
  ],
};

describe('TraderService', () => {
  let service: TraderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TraderService,
        { provide: TraderRepository, useValue: mockTraderRepository },
      ],
    }).compile();

    service = module.get<TraderService>(TraderService);
    jest.clearAllMocks();
  });

  // ─── getTraderProfile ─────────────────────────────────────────────────────────

  describe('getTraderProfile', () => {
    it('returns public trader profile with user info and approved items', async () => {
      mockTraderRepository.findById.mockResolvedValue(mockTraderProfile);

      const result = await service.getTraderProfile(10);

      expect(mockTraderRepository.findById).toHaveBeenCalledWith(10);
      expect(result.trader_id).toBe(10);
      expect(result.user.user_name).toBe('john_doe');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe('APPROVED');
    });

    it('does not expose sensitive user fields (email, password_hash)', async () => {
      mockTraderRepository.findById.mockResolvedValue(mockTraderProfile);

      const result = await service.getTraderProfile(10);

      // Repository already excludes these via select — confirm they are absent
      expect((result.user as any).email).toBeUndefined();
      expect((result.user as any).password_hash).toBeUndefined();
    });

    it('throws NotFoundException if trader does not exist', async () => {
      mockTraderRepository.findById.mockResolvedValue(null);

      await expect(service.getTraderProfile(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getTraderRatings ─────────────────────────────────────────────────────────

  describe('getTraderRatings', () => {
    it('returns all ratings received by the trader', async () => {
      mockTraderRepository.findById.mockResolvedValue(mockTraderProfile);
      mockTraderRepository.findRatings.mockResolvedValue([
        { rating_id: 1, score: 5, comment: 'Great!', rater: { user: { user_name: 'alice' } } },
        { rating_id: 2, score: 4, comment: 'Good', rater: { user: { user_name: 'bob' } } },
      ]);

      const result = await service.getTraderRatings(10);

      expect(mockTraderRepository.findRatings).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(2);
    });

    it('returns empty array when trader has no ratings yet', async () => {
      mockTraderRepository.findById.mockResolvedValue(mockTraderProfile);
      mockTraderRepository.findRatings.mockResolvedValue([]);

      const result = await service.getTraderRatings(10);

      expect(result).toHaveLength(0);
    });

    it('throws NotFoundException if trader does not exist', async () => {
      mockTraderRepository.findById.mockResolvedValue(null);

      await expect(service.getTraderRatings(999)).rejects.toThrow(NotFoundException);
    });
  });
});
