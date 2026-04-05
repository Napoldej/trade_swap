import {
  Controller,
  Get,
  Put,
  Body,
  Request,
  UseGuards,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getProfile(@Request() req: any) {
    return this.userService.get_user_by_username(req.user.username);
  }

  @Post('me')
  async createUser(@Request() req: any, @Body() dto: CreateUserDto) {
    try {
      return await this.userService.create_user(dto);
    } catch (error) {
      console.error("Error creating user:", error);
      throw new HttpException('Internal server error: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
