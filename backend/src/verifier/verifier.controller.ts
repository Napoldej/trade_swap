import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VerifierService } from './verifier.service';
import { RejectItemDto } from './dto/reject-item.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

class ConfirmTradeDto {
  @IsOptional()
  @IsString()
  note?: string;
}

class RejectTradeDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}

@Controller('verifier')
@UseGuards(AuthGuard, RolesGuard)
@Roles('VERIFIER', 'ADMIN')
export class VerifierController {
  constructor(private readonly verifierService: VerifierService) {}

  @Get('items/pending')
  getPendingItems() {
    return this.verifierService.getItemsByStatus('PENDING');
  }

  @Get('items/approved')
  getApprovedItems() {
    return this.verifierService.getItemsByStatus('APPROVED');
  }

  @Get('items/rejected')
  getRejectedItems() {
    return this.verifierService.getItemsByStatus('REJECTED');
  }

  @Patch('items/:id/approve')
  approveItem(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.verifierService.approveItem(id, req.user.userId);
  }

  @Patch('items/:id/reject')
  rejectItem(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectItemDto,
  ) {
    return this.verifierService.rejectItem(id, req.user.userId, dto);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(@Param('id', ParseIntPipe) id: number) {
    await this.verifierService.removeItem(id);
  }

  // ── Trade Verification ────────────────────────────────────────────────────────

  @Get('trades/pending')
  getPendingTrades() {
    return this.verifierService.getPendingTrades();
  }

  @Get('trades/:id')
  getTradeById(@Param('id', ParseIntPipe) id: number) {
    return this.verifierService.getTradeById(id);
  }

  @Patch('trades/:id/confirm')
  confirmTrade(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConfirmTradeDto,
  ) {
    return this.verifierService.confirmTrade(id, req.user.userId, dto.note);
  }

  @Patch('trades/:id/reject')
  rejectTradeVerification(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectTradeDto,
  ) {
    return this.verifierService.rejectTradeVerification(id, req.user.userId, dto.reason);
  }
}
