import { IsString, MinLength, IsOptional, IsEmail } from 'class-validator';

export class UpdateUserDto {

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  user_name?: string;

}
