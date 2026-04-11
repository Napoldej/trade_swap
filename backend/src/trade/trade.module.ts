import { Module } from '@nestjs/common';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { TradeRepository } from './trade.repository';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuthModule, NotificationModule],
  controllers: [TradeController],
  providers: [TradeService, TradeRepository],
  exports: [TradeService, TradeRepository],
})
export class TradeModule {}
