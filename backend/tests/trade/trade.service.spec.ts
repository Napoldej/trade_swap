import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TradeService } from 'src/trade/trade.service';
import { TradeRepository } from 'src/trade/trade.repository';
import { TradeGuardService } from 'src/trade/trade.guard.service';
import { TradeProposalGuard } from 'src/trade/trade-proposal.guard';
import { NotificationService } from 'src/notification/notification.service';

const mockTradeRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByTrader: jest.fn(),
  updateStatus: jest.fn(),
  acceptAndCancelConflicts: jest.fn(),
  partialConfirm: jest.fn(),
  submitForVerification: jest.fn(),
};

const mockTradeGuardService = {
  assertIsParticipant: jest.fn(),
  assertCanAccept: jest.fn(),
  assertCanReject: jest.fn(),
  assertCanCancel: jest.fn(),
  assertCanComplete: jest.fn(),
  getTradeOrThrow: jest.fn(),
};

const mockTradeProposalGuard = {
  getTraderByUserId: jest.fn(),
  validateProposalItems: jest.fn(),
  checkNoAcceptedConflict: jest.fn(),
  getReceiverOrThrow: jest.fn(),
};

const mockNotificationService = {
  notifyTrader: jest.fn().mockResolvedValue(undefined),
};

const mockTrader = { trader_id: 10, user_id: 1 };
const mockOtherTrader = { trader_id: 20, user_id: 2 };

const approvedItem = (id: number, traderId: number, name = 'Item') => ({
  item_id: id,
  trader_id: traderId,
  item_name: name,
  status: 'APPROVED',
  is_available: true,
});

const makeTrade = (status: string, extra: Record<string, unknown> = {}) => ({
  trade_id: 1,
  proposer_id: 10,
  receiver_id: 20,
  proposer_item_id: 101,
  receiver_item_id: 201,
  proposer_item: approvedItem(101, 10, 'Item A'),
  receiver_item: approvedItem(201, 20, 'Item B'),
  proposer_confirmed: false,
  receiver_confirmed: false,
  status,
  ...extra,
});

describe('TradeService', () => {
  let service: TradeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeService,
        { provide: TradeRepository, useValue: mockTradeRepository },
        { provide: TradeGuardService, useValue: mockTradeGuardService },
        { provide: TradeProposalGuard, useValue: mockTradeProposalGuard },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<TradeService>(TradeService);
    jest.clearAllMocks();
    mockNotificationService.notifyTrader.mockResolvedValue(undefined);
  });

  // ─── proposeTrade ─────────────────────────────────────────────────────────────

  describe('proposeTrade', () => {
    const dto = { proposerItemId: 101, receiverItemId: 201, receiverId: 20 };

    it('creates a trade when both items are APPROVED and proposer owns their item', async () => {
      mockTradeProposalGuard.getTraderByUserId.mockResolvedValue(mockTrader);
      mockTradeProposalGuard.validateProposalItems.mockResolvedValue({
        proposerItem: approvedItem(101, 10, 'Item A'),
        receiverItem: approvedItem(201, 20, 'Item B'),
      });
      mockTradeProposalGuard.checkNoAcceptedConflict.mockResolvedValue(undefined);
      mockTradeProposalGuard.getReceiverOrThrow.mockResolvedValue(mockOtherTrader);
      mockTradeRepository.create.mockResolvedValue(makeTrade('PENDING'));

      const result = await service.proposeTrade(1, dto);

      expect(mockTradeRepository.create).toHaveBeenCalledWith(10, dto);
      expect(result.status).toBe('PENDING');
    });

    it('throws BadRequestException if proposer item is not APPROVED', async () => {
      mockTradeProposalGuard.getTraderByUserId.mockResolvedValue(mockTrader);
      mockTradeProposalGuard.validateProposalItems.mockRejectedValue(
        new BadRequestException('Proposer item is not APPROVED'),
      );

      await expect(service.proposeTrade(1, dto)).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException if proposer does not own the proposer item', async () => {
      mockTradeProposalGuard.getTraderByUserId.mockResolvedValue(mockTrader);
      mockTradeProposalGuard.validateProposalItems.mockRejectedValue(
        new ForbiddenException('You do not own this item'),
      );

      await expect(service.proposeTrade(1, dto)).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if receiver item is not APPROVED', async () => {
      mockTradeProposalGuard.getTraderByUserId.mockResolvedValue(mockTrader);
      mockTradeProposalGuard.validateProposalItems.mockRejectedValue(
        new BadRequestException('Receiver item is not APPROVED'),
      );

      await expect(service.proposeTrade(1, dto)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if receiver trader does not exist', async () => {
      mockTradeProposalGuard.getTraderByUserId.mockResolvedValue(mockTrader);
      mockTradeProposalGuard.validateProposalItems.mockResolvedValue({
        proposerItem: approvedItem(101, 10, 'Item A'),
        receiverItem: approvedItem(201, 20, 'Item B'),
      });
      mockTradeProposalGuard.checkNoAcceptedConflict.mockResolvedValue(undefined);
      mockTradeProposalGuard.getReceiverOrThrow.mockRejectedValue(
        new NotFoundException('Receiver not found'),
      );

      await expect(service.proposeTrade(1, dto)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── acceptTrade ─────────────────────────────────────────────────────────────

  describe('acceptTrade', () => {
    it('receiver can accept a PENDING trade', async () => {
      mockTradeGuardService.assertCanAccept.mockResolvedValue({
        trader: mockOtherTrader,
        trade: makeTrade('PENDING'),
      });
      mockTradeRepository.acceptAndCancelConflicts.mockResolvedValue(makeTrade('ACCEPTED'));

      const result = await service.acceptTrade(2, 1);

      expect(mockTradeRepository.acceptAndCancelConflicts).toHaveBeenCalledWith(1, 101, 201);
      expect(result.status).toBe('ACCEPTED');
    });

    it('throws ForbiddenException if caller is not the receiver', async () => {
      mockTradeGuardService.assertCanAccept.mockRejectedValue(
        new ForbiddenException('Only the receiver can accept this trade'),
      );

      await expect(service.acceptTrade(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if trade is not PENDING', async () => {
      mockTradeGuardService.assertCanAccept.mockRejectedValue(
        new BadRequestException('Trade is not in PENDING status'),
      );

      await expect(service.acceptTrade(2, 1)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if trade does not exist', async () => {
      mockTradeGuardService.assertCanAccept.mockRejectedValue(
        new NotFoundException('Trade not found'),
      );

      await expect(service.acceptTrade(2, 999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── rejectTrade ─────────────────────────────────────────────────────────────

  describe('rejectTrade', () => {
    it('receiver can reject a PENDING trade', async () => {
      mockTradeGuardService.assertCanReject.mockResolvedValue({
        trader: mockOtherTrader,
        trade: makeTrade('PENDING'),
      });
      mockTradeRepository.updateStatus.mockResolvedValue(makeTrade('REJECTED'));

      const result = await service.rejectTrade(2, 1);

      expect(mockTradeRepository.updateStatus).toHaveBeenCalledWith(1, 'REJECTED');
      expect(result.status).toBe('REJECTED');
    });

    it('throws ForbiddenException if caller is not the receiver', async () => {
      mockTradeGuardService.assertCanReject.mockRejectedValue(
        new ForbiddenException('Only the receiver can reject this trade'),
      );

      await expect(service.rejectTrade(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if trade is not PENDING', async () => {
      mockTradeGuardService.assertCanReject.mockRejectedValue(
        new BadRequestException('Trade is not in PENDING status'),
      );

      await expect(service.rejectTrade(2, 1)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── cancelTrade ─────────────────────────────────────────────────────────────

  describe('cancelTrade', () => {
    it('proposer can cancel a PENDING trade', async () => {
      mockTradeGuardService.assertCanCancel.mockResolvedValue({
        trader: mockTrader,
        trade: makeTrade('PENDING'),
      });
      mockTradeRepository.updateStatus.mockResolvedValue(makeTrade('CANCELLED'));

      await service.cancelTrade(1, 1);

      expect(mockTradeRepository.updateStatus).toHaveBeenCalledWith(1, 'CANCELLED');
    });

    it('throws BadRequestException if trade is ACCEPTED (only PENDING can be cancelled)', async () => {
      mockTradeGuardService.assertCanCancel.mockRejectedValue(
        new BadRequestException('Only PENDING trades can be cancelled'),
      );

      await expect(service.cancelTrade(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException if caller is not the proposer', async () => {
      mockTradeGuardService.assertCanCancel.mockRejectedValue(
        new ForbiddenException('Only the proposer can cancel this trade'),
      );

      await expect(service.cancelTrade(2, 1)).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if trade is already COMPLETED or REJECTED', async () => {
      mockTradeGuardService.assertCanCancel.mockRejectedValue(
        new BadRequestException('Only PENDING trades can be cancelled'),
      );

      await expect(service.cancelTrade(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── completeTrade ────────────────────────────────────────────────────────────

  describe('completeTrade', () => {
    it('proposer confirms — waits for receiver (partial confirm)', async () => {
      mockTradeGuardService.assertCanComplete.mockResolvedValue({
        trade: makeTrade('ACCEPTED'),
        isProposer: true,
        newProposerConfirmed: true,
        newReceiverConfirmed: false,
        bothConfirmed: false,
      });
      mockTradeRepository.partialConfirm.mockResolvedValue(
        makeTrade('ACCEPTED', { proposer_confirmed: true }),
      );

      await service.completeTrade(1, 1);

      expect(mockTradeRepository.partialConfirm).toHaveBeenCalledWith(1, true, false);
    });

    it('receiver can complete an ACCEPTED trade (both confirmed)', async () => {
      mockTradeGuardService.assertCanComplete.mockResolvedValue({
        trade: makeTrade('ACCEPTED', { proposer_confirmed: true }),
        isProposer: false,
        newProposerConfirmed: true,
        newReceiverConfirmed: true,
        bothConfirmed: true,
      });
      mockTradeRepository.submitForVerification.mockResolvedValue(
        makeTrade('PENDING_VERIFICATION'),
      );

      await service.completeTrade(2, 1);

      expect(mockTradeRepository.submitForVerification).toHaveBeenCalledWith(1);
    });

    it('throws BadRequestException if trade is still PENDING (not yet accepted)', async () => {
      mockTradeGuardService.assertCanComplete.mockRejectedValue(
        new BadRequestException('Trade must be ACCEPTED before completing'),
      );

      await expect(service.completeTrade(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException if caller is not part of the trade', async () => {
      mockTradeGuardService.assertCanComplete.mockRejectedValue(
        new ForbiddenException('You are not part of this trade'),
      );

      await expect(service.completeTrade(5, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── getTradeById ─────────────────────────────────────────────────────────────

  describe('getTradeById', () => {
    it('returns trade when caller is a participant', async () => {
      mockTradeGuardService.assertIsParticipant.mockResolvedValue({
        trader: mockTrader,
        trade: makeTrade('PENDING'),
      });

      const result = await service.getTradeById(1, 1);

      expect(result).toBeDefined();
    });

    it('throws ForbiddenException when caller is not part of the trade', async () => {
      mockTradeGuardService.assertIsParticipant.mockRejectedValue(
        new ForbiddenException('You are not part of this trade'),
      );

      await expect(service.getTradeById(5, 1)).rejects.toThrow(ForbiddenException);
    });
  });
});
