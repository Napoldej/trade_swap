import {
  Controller,
  Get,
  Post,
  Put,
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

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllUsers() {
    return this.adminService.getAllUsers();
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

  @Delete('users/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.deleteUser(id);
  }

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
