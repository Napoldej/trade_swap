import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  user_name: string;

  @IsString()
  password: string;
}
