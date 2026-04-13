import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { AdminUserService } from 'src/admin/admin-user.service';
import { AdminRepository } from 'src/admin/admin.repository';
import { AdminAnalyticsRepository } from 'src/admin/admin-analytics.repository';
import { DatabaseService } from 'src/database/database.service';

const mockAdminRepository = {
  getAllUsers: jest.fn(),
  updateUserRole: jest.fn(),
  deleteUser: jest.fn(),
  createCategory: jest.fn(),
  getAllCategories: jest.fn(),
  deleteCategory: jest.fn(),
  getPendingVerifiers: jest.fn(),
  approveVerifier: jest.fn(),
  rejectVerifier: jest.fn(),
  setVerified: jest.fn(),
  getAllItems: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
};

const mockAdminAnalyticsRepository = {
  getAnalytics: jest.fn(),
};

const mockDatabaseService = {
  client: {
    user: {
      findUnique: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    traderItem: {
      findUnique: jest.fn(),
    },
  },
};

const mockUser = { user_id: 1, user_name: 'trader1', role: 'TRADER', verified: true };
const mockVerifierPending = { user_id: 2, user_name: 'verifier1', role: 'VERIFIER', verified: false };
const mockVerifierApproved = { user_id: 3, user_name: 'verifier2', role: 'VERIFIER', verified: true };

// ─── AdminService (categories & analytics) ────────────────────────────────────

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: AdminRepository, useValue: mockAdminRepository },
        { provide: AdminAnalyticsRepository, useValue: mockAdminAnalyticsRepository },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  // ─── createCategory ───────────────────────────────────────────────────────────

  describe('createCategory', () => {
    it('creates a new category', async () => {
      mockAdminRepository.createCategory.mockResolvedValue({ category_id: 1, category_name: 'Electronics' });

      const result = await service.createCategory({ name: 'Electronics' });

      expect(mockAdminRepository.createCategory).toHaveBeenCalledWith('Electronics');
      expect(result.category_name).toBe('Electronics');
    });
  });

  // ─── deleteCategory ───────────────────────────────────────────────────────────

  describe('deleteCategory', () => {
    it('deletes a category by id', async () => {
      mockDatabaseService.client.category.findUnique.mockResolvedValue({ category_id: 1 });
      mockAdminRepository.deleteCategory.mockResolvedValue({});

      await service.deleteCategory(1);

      expect(mockAdminRepository.deleteCategory).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundException if category does not exist', async () => {
      mockDatabaseService.client.category.findUnique.mockResolvedValue(null);

      await expect(service.deleteCategory(999)).rejects.toThrow(NotFoundException);
    });
  });
});

// ─── AdminUserService (user management) ──────────────────────────────────────

describe('AdminUserService', () => {
  let userService: AdminUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserService,
        { provide: AdminRepository, useValue: mockAdminRepository },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    userService = module.get<AdminUserService>(AdminUserService);
    jest.clearAllMocks();
  });

  // ─── getAllUsers ──────────────────────────────────────────────────────────────

  describe('getAllUsers', () => {
    it('returns all users on the platform', async () => {
      mockAdminRepository.getAllUsers.mockResolvedValue([mockUser, mockVerifierPending]);

      const result = await userService.getAllUsers();

      expect(mockAdminRepository.getAllUsers).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  // ─── updateUserRole ───────────────────────────────────────────────────────────

  describe('updateUserRole', () => {
    it('promotes a user to VERIFIER role', async () => {
      mockDatabaseService.client.user.findUnique.mockResolvedValue(mockUser);
      mockAdminRepository.updateUserRole.mockResolvedValue({ ...mockUser, role: 'VERIFIER' });

      const result = await userService.updateUserRole(1, { role: 'VERIFIER' as any });

      expect(mockAdminRepository.updateUserRole).toHaveBeenCalledWith(1, 'VERIFIER');
      expect(result.role).toBe('VERIFIER');
    });

    it('throws NotFoundException if user does not exist', async () => {
      mockDatabaseService.client.user.findUnique.mockResolvedValue(null);

      await expect(userService.updateUserRole(999, { role: 'VERIFIER' as any })).rejects.toThrow(NotFoundException);
    });
  });

  // ─── deleteUser ───────────────────────────────────────────────────────────────

  describe('deleteUser', () => {
    it('deletes a user by id', async () => {
      mockDatabaseService.client.user.findUnique.mockResolvedValue(mockUser);
      mockAdminRepository.deleteUser.mockResolvedValue(mockUser);

      await userService.deleteUser(1);

      expect(mockAdminRepository.deleteUser).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundException if user does not exist', async () => {
      mockDatabaseService.client.user.findUnique.mockResolvedValue(null);

      await expect(userService.deleteUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getPendingVerifiers ──────────────────────────────────────────────────────

  describe('getPendingVerifiers', () => {
    it('returns all verifier accounts awaiting admin approval', async () => {
      mockAdminRepository.getPendingVerifiers.mockResolvedValue([mockVerifierPending]);

      const result = await userService.getPendingVerifiers();

      expect(mockAdminRepository.getPendingVerifiers).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].verified).toBe(false);
    });
  });

  // ─── approveVerifier ─────────────────────────────────────────────────────────

  describe('approveVerifier', () => {
    it('approves a pending verifier account (sets verified=true)', async () => {
      mockDatabaseService.client.user.findUnique.mockResolvedValue(mockVerifierPending);
      mockAdminRepository.approveVerifier.mockResolvedValue({ ...mockVerifierPending, verified: true });

      const result = await userService.approveVerifier(2);

      expect(mockAdminRepository.approveVerifier).toHaveBeenCalledWith(2);
      expect(result.verified).toBe(true);
    });

    it('throws NotFoundException if user does not exist', async () => {
      mockDatabaseService.client.user.findUnique.mockResolvedValue(null);

      await expect(userService.approveVerifier(999)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if user is not a VERIFIER role', async () => {
      mockDatabaseService.client.user.findUnique.mockResolvedValue(mockUser);

      await expect(userService.approveVerifier(1)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if verifier is already approved', async () => {
      mockDatabaseService.client.user.findUnique.mockResolvedValue(mockVerifierApproved);

      await expect(userService.approveVerifier(3)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── rejectVerifier ───────────────────────────────────────────────────────────

  describe('rejectVerifier', () => {
    it('deletes a pending verifier application', async () => {
      mockDatabaseService.client.user.findUnique.mockResolvedValue(mockVerifierPending);
      mockAdminRepository.rejectVerifier.mockResolvedValue({});

      await userService.rejectVerifier(2);

      expect(mockAdminRepository.rejectVerifier).toHaveBeenCalledWith(2);
    });

    it('throws NotFoundException if user does not exist', async () => {
      mockDatabaseService.client.user.findUnique.mockResolvedValue(null);

      await expect(userService.rejectVerifier(999)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if account is already approved (cannot reject approved verifier)', async () => {
      mockDatabaseService.client.user.findUnique.mockResolvedValue(mockVerifierApproved);

      await expect(userService.rejectVerifier(3)).rejects.toThrow(BadRequestException);
    });
  });
});
