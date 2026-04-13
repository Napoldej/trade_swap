import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { DatabaseService } from 'src/database/database.service';

jest.mock('bcrypt');

const mockUserService = {
  check_user_exists: jest.fn(),
  create_user: jest.fn(),
  get_exist_user: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mock_token'),
};

const mockDatabaseService = {
  client: {
    trader: {
      create: jest.fn(),
      findUnique: jest.fn().mockResolvedValue({ trader_id: 1 }),
    },
  },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    mockJwtService.signAsync.mockResolvedValue('mock_token');
  });

  // ─── Register ────────────────────────────────────────────────────────────────

  describe('register', () => {
    it('TRADER: creates user, trader profile, and returns JWT tokens', async () => {
      mockUserService.check_user_exists.mockResolvedValue(false);
      mockUserService.create_user.mockResolvedValue({
        user_id: 1,
        user_name: 'trader1',
        role: 'TRADER',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockDatabaseService.client.trader.create.mockResolvedValue({});

      const result = await service.register({
        user_name: 'trader1',
        email: 'trader1@test.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      });

      expect(mockUserService.create_user).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'TRADER', verified: true }),
      );
      expect(mockDatabaseService.client.trader.create).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('VERIFIER: creates user with verified=false, no trader profile, returns pending message', async () => {
      mockUserService.check_user_exists.mockResolvedValue(false);
      mockUserService.create_user.mockResolvedValue({
        user_id: 2,
        user_name: 'verifier1',
        role: 'VERIFIER',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await service.register({
        user_name: 'verifier1',
        email: 'verifier1@test.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Doe',
        role: 'VERIFIER',
      });

      expect(mockUserService.create_user).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'VERIFIER', verified: false }),
      );
      expect(mockDatabaseService.client.trader.create).not.toHaveBeenCalled();
      expect(result).toHaveProperty('message');
      expect((result as any).message).toContain('admin approval');
    });

    it('defaults to TRADER role if no role provided', async () => {
      mockUserService.check_user_exists.mockResolvedValue(false);
      mockUserService.create_user.mockResolvedValue({
        user_id: 3,
        user_name: 'user1',
        role: 'TRADER',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      await service.register({
        user_name: 'user1',
        email: 'user1@test.com',
        password: 'password123',
        first_name: 'A',
        last_name: 'B',
      });

      expect(mockUserService.create_user).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'TRADER', verified: true }),
      );
    });

    it('throws ConflictException if username or email already exists', async () => {
      mockUserService.check_user_exists.mockRejectedValue(
        new ConflictException('Username already taken'),
      );

      await expect(
        service.register({
          user_name: 'existing',
          email: 'existing@test.com',
          password: 'password123',
          first_name: 'A',
          last_name: 'B',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── Login ────────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('returns tokens for valid TRADER credentials', async () => {
      mockUserService.get_exist_user.mockResolvedValue({
        user_id: 1,
        user_name: 'trader1',
        password_hash: 'hashed',
        role: 'TRADER',
        verified: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ user_name: 'trader1', password: 'password123' });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user_name).toBe('trader1');
    });

    it('returns tokens for approved VERIFIER', async () => {
      mockUserService.get_exist_user.mockResolvedValue({
        user_id: 2,
        user_name: 'verifier1',
        password_hash: 'hashed',
        role: 'VERIFIER',
        verified: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ user_name: 'verifier1', password: 'password123' });

      expect(result).toHaveProperty('access_token');
    });

    it('throws UnauthorizedException for non-existent user', async () => {
      mockUserService.get_exist_user.mockResolvedValue(null);

      await expect(
        service.login({ user_name: 'nobody', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      mockUserService.get_exist_user.mockResolvedValue({
        user_id: 1,
        user_name: 'trader1',
        password_hash: 'hashed',
        role: 'TRADER',
        verified: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ user_name: 'trader1', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException when VERIFIER account is not yet approved', async () => {
      mockUserService.get_exist_user.mockResolvedValue({
        user_id: 2,
        user_name: 'verifier1',
        password_hash: 'hashed',
        role: 'VERIFIER',
        verified: false,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ user_name: 'verifier1', password: 'password123' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
