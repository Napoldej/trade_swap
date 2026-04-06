import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'trade_swap_secret',
      signOptions: { expiresIn: '7d' },
    }),
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
