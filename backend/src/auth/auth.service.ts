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

export interface AuthResult {
  access_token: string;
  refresh_token: string;
  user_id: number;
  user_name: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult | { message: string }> {
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
      verified: !isVerifier,
    });

    if (!user) {
      throw new ConflictException('Failed to create user');
    }

    if (!isVerifier) {
      await this.databaseService.client.trader.create({
        data: { user_id: user.user_id, rating: 0, total_trades: 0 },
      });

      return this.buildTokens(user.user_id, user.user_name, user.role);
    }

    return {
      message: 'Verifier account created. Please wait for admin approval before logging in.',
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.userService.get_exist_user(dto.user_name);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role === 'VERIFIER' && !user.verified) {
      throw new ForbiddenException('Your verifier account is pending admin approval');
    }

    return this.buildTokens(user.user_id, user.user_name, user.role);
  }

  private async buildTokens(userId: number, userName: string, role: string): Promise<AuthResult> {
    const payload = { sub: userId, username: userName, role };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return { access_token, refresh_token, user_id: userId, user_name: userName, role };
  }
}
