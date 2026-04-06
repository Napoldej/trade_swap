import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TraderService } from './trader.service';

@Controller('traders')
export class TraderController {
  constructor(private readonly traderService: TraderService) {}

  @Get(':traderId')
  async getTraderProfile(@Param('traderId', ParseIntPipe) traderId: number) {
    return this.traderService.getTraderProfile(traderId);
  }

  @Get(':traderId/ratings')
  async getTraderRatings(@Param('traderId', ParseIntPipe) traderId: number) {
    return this.traderService.getTraderRatings(traderId);
  }
}
