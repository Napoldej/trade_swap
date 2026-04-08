import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { ItemRepository } from './item.repository';
import { AuthModule } from '../auth/auth.module';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';

@Module({
  imports: [AuthModule],
  controllers: [ItemController],
  providers: [ItemService, ItemRepository, OptionalAuthGuard],
  exports: [ItemService, ItemRepository],
})
export class ItemModule {}
