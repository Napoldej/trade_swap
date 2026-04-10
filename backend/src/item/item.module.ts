import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { ItemRepository } from './item.repository';
import { AuthModule } from '../auth/auth.module';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { S3Module } from '../common/s3/s3.module';

@Module({
  imports: [AuthModule, S3Module],
  controllers: [ItemController],
  providers: [ItemService, ItemRepository, OptionalAuthGuard],
  exports: [ItemService, ItemRepository],
})
export class ItemModule {}
