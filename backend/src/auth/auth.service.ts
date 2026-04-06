import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  async register(dto: RegisterDto): Promise<
    | { access_token: string; refresh_token: string }
    | { message: string }
  > {
    await this.userService.check_user_exists(dto.user_name, dto.email);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const role = dto.role ?? 'TRADER';
    const isVerifier = role === 'VERIFIER';

    const user = await this.userService.create_user({
      user_name: dto.user_name,
      password: passwordHash,
      first_name: dto.first_name,
      last_name: dto.last_name,
      email: dto.email,
      role,
      verified: !isVerifier, // TRADER: auto-verified, VERIFIER: waits for admin approval
    });

    if (!user) {
      throw new ConflictException('Failed to create user');
    }

    // Only TRADER gets a Trader profile and immediate tokens
    if (!isVerifier) {
      await this.databaseService.client.trader.create({
        data: {
          user_id: user.user_id,
          rating: 0,
          total_trades: 0,
        },
      });

      const payload = {
        sub: user.user_id,
        username: user.user_name,
        role: user.role,
      };
      const refresh_token = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      });

      return {
        access_token: await this.jwtService.signAsync(payload),
        refresh_token,
      };
    }

    // VERIFIER: just notify that account is pending admin approval
    return {
      message: 'Verifier account created. Please wait for admin approval before logging in.',
    };
  }

  async login(dto: LoginDto): Promise<{ user_name: string; access_token: string; refresh_token: string }> {
    const user = await this.userService.get_exist_user(dto.user_name);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Block VERIFIER accounts that have not yet been approved by an admin
    if (user.role === 'VERIFIER' && !user.verified) {
      throw new ForbiddenException('Your verifier account is pending admin approval');
    }

    const payload = {
      sub: user.user_id,
      username: user.user_name,
      role: user.role,
    };

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      user_name: user.user_name,
      access_token: await this.jwtService.signAsync(payload),
      refresh_token,
    };
  }
}
