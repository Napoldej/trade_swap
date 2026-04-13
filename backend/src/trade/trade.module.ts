import { Module } from '@nestjs/common';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { TradeRepository } from './trade.repository';
import { TradeGuardService } from './trade.guard.service';
import { TradeProposalGuard } from './trade-proposal.guard';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuthModule, NotificationModule],
  controllers: [TradeController],
  providers: [TradeService, TradeRepository, TradeGuardService, TradeProposalGuard],
  exports: [TradeService, TradeRepository],
})
export class TradeModule {}
