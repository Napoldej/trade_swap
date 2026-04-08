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
import { VerifierService } from './verifier.service';
import { RejectItemDto } from './dto/reject-item.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

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
}
