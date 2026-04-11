import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ChangeRoleDto } from './dto/change-role.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { IsOptional, IsString, IsNumber } from 'class-validator';

class AdminUpdateUserDto {
  @IsOptional() @IsString() first_name?: string;
  @IsOptional() @IsString() last_name?: string;
  @IsOptional() @IsString() role?: string;
}

class AdminUpdateItemDto {
  @IsOptional() @IsString() item_name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() category_id?: number;
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Users ───────────────────────────────────────────────────────────────────

  @Get('users')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.deleteUser(id);
  }

  @Put('users/:id/role')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeRoleDto,
  ) {
    return this.adminService.updateUserRole(id, dto);
  }

  @Put('users/:id/verify')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async verifyUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.verifyUser(id);
  }

  @Put('users/:id/unverify')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async unverifyUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.unverifyUser(id);
  }

  // ─── Items ───────────────────────────────────────────────────────────────────

  @Get('items')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllItems() {
    return this.adminService.getAllItems();
  }

  @Patch('items/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateItemDto,
  ) {
    return this.adminService.updateItem(id, dto);
  }

  @Delete('items/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteItem(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.deleteItem(id);
  }

  // ─── Categories ──────────────────────────────────────────────────────────────

  @Post('categories')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Get('categories')
  async getAllCategories() {
    return this.adminService.getAllCategories();
  }

  @Delete('categories/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.deleteCategory(id);
  }

  // ─── Analytics ───────────────────────────────────────────────────────────────

  @Get('analytics')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  // ─── Verifiers ───────────────────────────────────────────────────────────────

  @Get('verifiers/pending')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getPendingVerifiers() {
    return this.adminService.getPendingVerifiers();
  }

  @Put('verifiers/:id/approve')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async approveVerifier(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveVerifier(id);
  }

  @Delete('verifiers/:id/reject')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectVerifier(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.rejectVerifier(id);
  }
}
