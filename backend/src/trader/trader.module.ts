import { Module } from '@nestjs/common';
import { TraderController } from './trader.controller';
import { TraderService } from './trader.service';
import { TraderRepository } from './trader.repository';

@Module({
  controllers: [TraderController],
  providers: [TraderService, TraderRepository],
})
export class TraderModule {}
