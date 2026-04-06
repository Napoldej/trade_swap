import { Injectable, NotFoundException } from '@nestjs/common';
import { TraderRepository } from './trader.repository';

@Injectable()
export class TraderService {
  constructor(private readonly traderRepository: TraderRepository) {}

  async getTraderProfile(traderId: number) {
    const trader = await this.traderRepository.findById(traderId);
    if (!trader) {
      throw new NotFoundException('Trader not found');
    }
    return trader;
  }

  async getTraderRatings(traderId: number) {
    const trader = await this.traderRepository.findById(traderId);
    if (!trader) {
      throw new NotFoundException('Trader not found');
    }
    return this.traderRepository.findRatings(traderId);
  }
}
