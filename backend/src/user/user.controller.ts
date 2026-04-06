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
  Patch,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ResponseUserDto } from './dto/response-user.dto';
import { plainToInstance } from 'class-transformer';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@Roles('TRADER', 'ADMIN')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Roles()
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req: any):  Promise<{ message: string ,data : ResponseUserDto }>{
    try {
      const user = await this.userService.get_user_by_username(req.user.username);
      const reponseDTO = plainToInstance(ResponseUserDto, user, { excludeExtraneousValues: true });
      return { message: "User profile fetched successfully", data: reponseDTO };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw new HttpException(error.message, error.status);
    }
  }

  @Patch("me")
  @HttpCode(HttpStatus.OK)
  async updateUser(@Request() req: any, @Body() dto: UpdateUserDto) : Promise<{ message: string ,data : ResponseUserDto }>{
    try{
      const updateUser =  await this.userService.update_user(req.user.userId, dto);

      const responseDTO = plainToInstance(ResponseUserDto, updateUser, { excludeExtraneousValues: true });
      console.log("Response DTO:", responseDTO)
      return { message: "User updated successfully", data: responseDTO };
    }
    catch(error){
      console.error("Error updating user:", error);
      throw new HttpException('Internal server error: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }      
  }
  
  @Delete("me")
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Request() req: any) : Promise<{ message: string, data: ResponseUserDto }>{
    try{
      const deletedUser = await this.userService.delete_user(req.user.userId);
      const responseDTO = plainToInstance(ResponseUserDto, deletedUser, { excludeExtraneousValues: true });
      return { message: "User deleted successfully", data: responseDTO };
    }
    catch(error){
      console.error("Error deleting user:", error);
      throw new HttpException('Internal server error: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
