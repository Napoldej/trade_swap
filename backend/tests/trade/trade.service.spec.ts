import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TradeService } from 'src/trade/trade.service';
import { TradeRepository } from 'src/trade/trade.repository';
import { DatabaseService } from 'src/database/database.service';

const mockTradeRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByTrader: jest.fn(),
  updateStatus: jest.fn(),
};

const mockTrader = { trader_id: 10, user_id: 1 };
const mockOtherTrader = { trader_id: 20, user_id: 2 };

const approvedItem = (id: number, traderId: number) => ({
  item_id: id,
  trader_id: traderId,
  status: 'APPROVED',
  is_available: true,
});

const makeTrade = (status: string) => ({
  trade_id: 1,
  proposer_id: 10,
  receiver_id: 20,
  proposer_item_id: 101,
  receiver_item_id: 201,
  status,
});

const mockDatabaseService = {
  client: {
    trader: {
      findUnique: jest.fn(),
    },
    traderItem: {
      findUnique: jest.fn(),
    },
  },
};

describe('TradeService', () => {
  let service: TradeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeService,
        { provide: TradeRepository, useValue: mockTradeRepository },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<TradeService>(TradeService);
    jest.clearAllMocks();
  });

  // ─── proposeTrade ─────────────────────────────────────────────────────────────

  describe('proposeTrade', () => {
    const dto = { proposerItemId: 101, receiverItemId: 201, receiverId: 20 };

    it('creates a trade when both items are APPROVED and proposer owns their item', async () => {
      mockDatabaseService.client.trader.findUnique
        .mockResolvedValueOnce(mockTrader)          // proposer lookup
        .mockResolvedValueOnce(mockOtherTrader);    // receiver lookup
      mockDatabaseService.client.traderItem.findUnique
        .mockResolvedValueOnce(approvedItem(101, 10))  // proposer item
        .mockResolvedValueOnce(approvedItem(201, 20)); // receiver item
      mockTradeRepository.create.mockResolvedValue(makeTrade('PENDING'));

      const result = await service.proposeTrade(1, dto);

      expect(mockTradeRepository.create).toHaveBeenCalledWith(10, dto);
      expect(result.status).toBe('PENDING');
    });

    it('throws BadRequestException if proposer item is not APPROVED', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockDatabaseService.client.traderItem.findUnique.mockResolvedValueOnce({
        ...approvedItem(101, 10),
        status: 'PENDING',
      });

      await expect(service.proposeTrade(1, dto)).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException if proposer does not own the proposer item', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockDatabaseService.client.traderItem.findUnique.mockResolvedValueOnce(
        approvedItem(101, 99), // owned by someone else
      );

      await expect(service.proposeTrade(1, dto)).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if receiver item is not APPROVED', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockDatabaseService.client.traderItem.findUnique
        .mockResolvedValueOnce(approvedItem(101, 10))
        .mockResolvedValueOnce({ ...approvedItem(201, 20), status: 'PENDING' });

      await expect(service.proposeTrade(1, dto)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if receiver trader does not exist', async () => {
      mockDatabaseService.client.trader.findUnique
        .mockResolvedValueOnce(mockTrader)
        .mockResolvedValueOnce(null); // receiver not found
      mockDatabaseService.client.traderItem.findUnique
        .mockResolvedValueOnce(approvedItem(101, 10))
        .mockResolvedValueOnce(approvedItem(201, 20));

      await expect(service.proposeTrade(1, dto)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── acceptTrade ─────────────────────────────────────────────────────────────

  describe('acceptTrade', () => {
    it('receiver can accept a PENDING trade', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockOtherTrader);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('PENDING'));
      mockTradeRepository.updateStatus.mockResolvedValue(makeTrade('ACCEPTED'));

      const result = await service.acceptTrade(2, 1);

      expect(mockTradeRepository.updateStatus).toHaveBeenCalledWith(1, 'ACCEPTED');
      expect(result.status).toBe('ACCEPTED');
    });

    it('throws ForbiddenException if caller is not the receiver', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader); // proposer, not receiver
      mockTradeRepository.findById.mockResolvedValue(makeTrade('PENDING'));

      await expect(service.acceptTrade(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if trade is not PENDING', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockOtherTrader);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('ACCEPTED'));

      await expect(service.acceptTrade(2, 1)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if trade does not exist', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockOtherTrader);
      mockTradeRepository.findById.mockResolvedValue(null);

      await expect(service.acceptTrade(2, 999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── rejectTrade ─────────────────────────────────────────────────────────────

  describe('rejectTrade', () => {
    it('receiver can reject a PENDING trade', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockOtherTrader);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('PENDING'));
      mockTradeRepository.updateStatus.mockResolvedValue(makeTrade('REJECTED'));

      const result = await service.rejectTrade(2, 1);

      expect(mockTradeRepository.updateStatus).toHaveBeenCalledWith(1, 'REJECTED');
      expect(result.status).toBe('REJECTED');
    });

    it('throws ForbiddenException if caller is not the receiver', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('PENDING'));

      await expect(service.rejectTrade(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if trade is not PENDING', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockOtherTrader);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('CANCELLED'));

      await expect(service.rejectTrade(2, 1)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── cancelTrade ─────────────────────────────────────────────────────────────

  describe('cancelTrade', () => {
    it('proposer can cancel a PENDING trade', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('PENDING'));
      mockTradeRepository.updateStatus.mockResolvedValue(makeTrade('CANCELLED'));

      await service.cancelTrade(1, 1);

      expect(mockTradeRepository.updateStatus).toHaveBeenCalledWith(1, 'CANCELLED');
    });

    it('proposer can cancel an ACCEPTED trade', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('ACCEPTED'));
      mockTradeRepository.updateStatus.mockResolvedValue(makeTrade('CANCELLED'));

      await service.cancelTrade(1, 1);

      expect(mockTradeRepository.updateStatus).toHaveBeenCalledWith(1, 'CANCELLED');
    });

    it('throws ForbiddenException if caller is not the proposer', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockOtherTrader);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('PENDING'));

      await expect(service.cancelTrade(2, 1)).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if trade is already COMPLETED or REJECTED', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('COMPLETED'));

      await expect(service.cancelTrade(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── completeTrade ────────────────────────────────────────────────────────────

  describe('completeTrade', () => {
    it('proposer can complete an ACCEPTED trade', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('ACCEPTED'));
      mockTradeRepository.updateStatus.mockResolvedValue(makeTrade('COMPLETED'));

      const result = await service.completeTrade(1, 1);

      expect(mockTradeRepository.updateStatus).toHaveBeenCalledWith(1, 'COMPLETED', expect.any(Date));
      expect(result.status).toBe('COMPLETED');
    });

    it('receiver can complete an ACCEPTED trade', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockOtherTrader);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('ACCEPTED'));
      mockTradeRepository.updateStatus.mockResolvedValue(makeTrade('COMPLETED'));

      await service.completeTrade(2, 1);

      expect(mockTradeRepository.updateStatus).toHaveBeenCalledWith(1, 'COMPLETED', expect.any(Date));
    });

    it('throws BadRequestException if trade is still PENDING (not yet accepted)', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('PENDING'));

      await expect(service.completeTrade(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException if caller is not part of the trade', async () => {
      const outsider = { trader_id: 99, user_id: 5 };
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(outsider);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('ACCEPTED'));

      await expect(service.completeTrade(5, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── getTradeById ─────────────────────────────────────────────────────────────

  describe('getTradeById', () => {
    it('returns trade when caller is a participant', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('PENDING'));

      const result = await service.getTradeById(1, 1);

      expect(result).toBeDefined();
    });

    it('throws ForbiddenException when caller is not part of the trade', async () => {
      const outsider = { trader_id: 99, user_id: 5 };
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(outsider);
      mockTradeRepository.findById.mockResolvedValue(makeTrade('PENDING'));

      await expect(service.getTradeById(5, 1)).rejects.toThrow(ForbiddenException);
    });
  });
});
