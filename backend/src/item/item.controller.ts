import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AddPhotoDto } from './dto/add-photo.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TRADER')
  async createItem(@Request() req: any, @Body() dto: CreateItemDto) {
    return this.itemService.createItem(req.user.userId, dto);
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async getAllItems(@Request() req: any) {
    // Optionally pass the logged-in user's ID (null if unauthenticated)
    const userId: number | null = req.user?.userId ?? null;
    return this.itemService.getAllItems(userId);
  }

  @Get('my')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TRADER')
  async getMyItems(@Request() req: any) {
    return this.itemService.getMyItems(req.user.userId);
  }

  @Get(':id')
  async getItemById(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.getItemById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TRADER')
  async updateItem(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemService.updateItem(req.user.userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TRADER')
  async deleteItem(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.itemService.deleteItem(req.user.userId, id);
  }

  @Post(':id/photos')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TRADER')
  async addPhoto(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddPhotoDto,
  ) {
    return this.itemService.addPhoto(req.user.userId, id, dto);
  }
}
