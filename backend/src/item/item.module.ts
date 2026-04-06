import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { ItemRepository } from './item.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ItemController],
  providers: [ItemService, ItemRepository],
  exports: [ItemService, ItemRepository],
})
export class ItemModule {}
