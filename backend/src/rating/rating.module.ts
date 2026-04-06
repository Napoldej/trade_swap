import { Module } from '@nestjs/common';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { RatingRepository } from './rating.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RatingController],
  providers: [RatingService, RatingRepository],
  exports: [RatingService, RatingRepository],
})
export class RatingModule {}
