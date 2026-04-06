import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  user_name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;
  
}
