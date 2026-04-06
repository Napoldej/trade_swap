import {
  Controller,
  Get,
  Put,
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
@Roles('VERIFIER')
export class VerifierController {
  constructor(private readonly verifierService: VerifierService) {}

  @Get('items')
  async getPendingItems() {
    return this.verifierService.getPendingItems();
  }

  @Put('items/:id/approve')
  async approveItem(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.verifierService.approveItem(id, req.user.userId);
  }

  @Put('items/:id/reject')
  async rejectItem(
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
