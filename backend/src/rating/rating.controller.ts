import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TRADER')
  async rate(@Request() req: any, @Body() dto: CreateRatingDto) {
    return this.ratingService.rate(req.user.userId, dto);
  }
}

@Controller('traders')
export class TraderRatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get(':traderId/ratings')
  async getRatingsByTrader(@Param('traderId', ParseIntPipe) traderId: number) {
    return this.ratingService.getRatingsByTrader(traderId);
  }
}
