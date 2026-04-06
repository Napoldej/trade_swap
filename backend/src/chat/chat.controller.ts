import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('trades/:tradeId/messages')
@UseGuards(AuthGuard, RolesGuard)
@Roles('TRADER')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getMessages(
    @Request() req: any,
    @Param('tradeId', ParseIntPipe) tradeId: number,
  ) {
    return this.chatService.getMessages(req.user.userId, tradeId);
  }

  @Post()
  async sendMessage(
    @Request() req: any,
    @Param('tradeId', ParseIntPipe) tradeId: number,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(req.user.userId, tradeId, dto);
  }
}
