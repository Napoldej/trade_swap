import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TradeService } from './trade.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('trades')
@UseGuards(AuthGuard, RolesGuard)
@Roles('TRADER')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Post()
  async proposeTrade(@Request() req: any, @Body() dto: CreateTradeDto) {
    return this.tradeService.proposeTrade(req.user.userId, dto);
  }

  @Get()
  async getMyTrades(@Request() req: any) {
    return this.tradeService.getMyTrades(req.user.userId);
  }

  @Get(':id')
  async getTradeById(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tradeService.getTradeById(req.user.userId, id);
  }

  @Put(':id/accept')
  async acceptTrade(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tradeService.acceptTrade(req.user.userId, id);
  }

  @Put(':id/reject')
  async rejectTrade(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tradeService.rejectTrade(req.user.userId, id);
  }

  @Put(':id/cancel')
  async cancelTrade(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tradeService.cancelTrade(req.user.userId, id);
  }

  @Put(':id/complete')
  async completeTrade(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tradeService.completeTrade(req.user.userId, id);
  }
}
