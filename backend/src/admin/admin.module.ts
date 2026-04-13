import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUserService } from './admin-user.service';
import { AdminRepository } from './admin.repository';
import { AdminAnalyticsRepository } from './admin-analytics.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, AdminUserService, AdminRepository, AdminAnalyticsRepository],
  exports: [AdminService, AdminUserService, AdminRepository],
})
export class AdminModule {}
