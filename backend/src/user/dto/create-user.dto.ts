import { IsString, IsNotEmpty, IsEmail, isEmail } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    readonly password: string;
    
    @IsString()
    @IsNotEmpty()
    readonly user_name: string;
}
