import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { VerifierService } from 'src/verifier/verifier.service';
import { VerifierRepository } from 'src/verifier/verifier.repository';
import { DatabaseService } from 'src/database/database.service';

const mockVerifierRepository = {
  getPendingItems: jest.fn(),
  approveItem: jest.fn(),
  rejectItem: jest.fn(),
  removeItem: jest.fn(),
};

const mockDatabaseService = {
  client: {
    traderItem: {
      findUnique: jest.fn(),
    },
  },
};

const pendingItem = { item_id: 1, status: 'PENDING', trader_id: 10 };
const approvedItem = { item_id: 2, status: 'APPROVED', trader_id: 10 };

describe('VerifierService', () => {
  let service: VerifierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifierService,
        { provide: VerifierRepository, useValue: mockVerifierRepository },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<VerifierService>(VerifierService);
    jest.clearAllMocks();
  });

  // ─── getPendingItems ──────────────────────────────────────────────────────────

  describe('getPendingItems', () => {
    it('returns all PENDING items for verifier review', async () => {
      mockVerifierRepository.getPendingItems.mockResolvedValue([pendingItem]);

      const result = await service.getPendingItems();

      expect(mockVerifierRepository.getPendingItems).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('PENDING');
    });
  });

  // ─── approveItem ─────────────────────────────────────────────────────────────

  describe('approveItem', () => {
    it('approves a PENDING item and records the verifier', async () => {
      mockDatabaseService.client.traderItem.findUnique.mockResolvedValue(pendingItem);
      mockVerifierRepository.approveItem.mockResolvedValue({ ...pendingItem, status: 'APPROVED', verified_by: 5 });

      const result = await service.approveItem(1, 5);

      expect(mockVerifierRepository.approveItem).toHaveBeenCalledWith(1, 5);
      expect(result.status).toBe('APPROVED');
      expect(result.verified_by).toBe(5);
    });

    it('throws NotFoundException if item does not exist', async () => {
      mockDatabaseService.client.traderItem.findUnique.mockResolvedValue(null);

      await expect(service.approveItem(999, 5)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if item is already APPROVED (not PENDING)', async () => {
      mockDatabaseService.client.traderItem.findUnique.mockResolvedValue(approvedItem);

      await expect(service.approveItem(2, 5)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if item is REJECTED', async () => {
      mockDatabaseService.client.traderItem.findUnique.mockResolvedValue({
        ...pendingItem,
        status: 'REJECTED',
      });

      await expect(service.approveItem(1, 5)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── rejectItem ──────────────────────────────────────────────────────────────

  describe('rejectItem', () => {
    it('rejects a PENDING item with a reason', async () => {
      mockDatabaseService.client.traderItem.findUnique.mockResolvedValue(pendingItem);
      mockVerifierRepository.rejectItem.mockResolvedValue({
        ...pendingItem,
        status: 'REJECTED',
        rejection_reason: 'Stock image used',
      });

      const result = await service.rejectItem(1, 5, { rejectionReason: 'Stock image used' });

      expect(mockVerifierRepository.rejectItem).toHaveBeenCalledWith(1, 5, 'Stock image used');
      expect(result.status).toBe('REJECTED');
      expect(result.rejection_reason).toBe('Stock image used');
    });

    it('throws NotFoundException if item does not exist', async () => {
      mockDatabaseService.client.traderItem.findUnique.mockResolvedValue(null);

      await expect(
        service.rejectItem(999, 5, { rejectionReason: 'Bad item' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if item is not PENDING', async () => {
      mockDatabaseService.client.traderItem.findUnique.mockResolvedValue(approvedItem);

      await expect(
        service.rejectItem(2, 5, { rejectionReason: 'Too late' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── removeItem ───────────────────────────────────────────────────────────────

  describe('removeItem', () => {
    it('removes a fraudulent item regardless of status', async () => {
      mockDatabaseService.client.traderItem.findUnique.mockResolvedValue(approvedItem);
      mockVerifierRepository.removeItem.mockResolvedValue(approvedItem);

      await service.removeItem(2);

      expect(mockVerifierRepository.removeItem).toHaveBeenCalledWith(2);
    });

    it('throws NotFoundException if item does not exist', async () => {
      mockDatabaseService.client.traderItem.findUnique.mockResolvedValue(null);

      await expect(service.removeItem(999)).rejects.toThrow(NotFoundException);
    });
  });
});
