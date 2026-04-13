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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { S3Service } from '../common/s3/s3.service';

@Controller('items')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TRADER')
  async createItem(@Request() req: any, @Body() dto: CreateItemDto) {
    return this.itemService.createItem(req.user.userId, dto);
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async getAllItems(@Request() req: any) {
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
  @UseGuards(OptionalAuthGuard)
  async getItemById(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId: number | null = req.user?.userId ?? null;
    return this.itemService.getItemById(id, userId);
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

  /**
   * POST /items/:id/photos
   * Accepts multipart/form-data with field "file".
   * Optionally accepts "displayOrder" as form field (default 0).
   * Uploads to S3 and saves the URL in ItemPhoto table.
   */
  @Post(':id/photos')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TRADER')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async addPhoto(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('displayOrder') displayOrder?: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const photoUrl = await this.s3Service.uploadFile(file, 'items');
    const order = displayOrder ? parseInt(displayOrder, 10) : 0;

    return this.itemService.addPhoto(req.user.userId, id, { photoUrl, displayOrder: order });
  }
}
