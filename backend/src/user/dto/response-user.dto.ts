import { Expose } from 'class-transformer';
import { IsString,  IsOptional, IsEmail } from 'class-validator';

export class ResponseUserDto {

  @IsOptional()
  @IsEmail()
  @Expose()
  email?: string;

  @IsOptional()
  @IsString()
  @Expose()
  user_name?: string;

  @IsOptional()
  @IsString()
  @Expose()
  verified?: boolean;

  @IsOptional()
  @IsString()
  @Expose()
  first_name?: string;

  @IsOptional()
  @IsString()
  @Expose()
  last_name?: string; 

}
