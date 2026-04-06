import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean } from 'class-validator';

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

    @IsString()
    @IsNotEmpty()
    readonly first_name: string;

    @IsString()
    @IsNotEmpty()
    readonly last_name: string;

    @IsOptional()
    @IsString()
    readonly role?: 'TRADER' | 'VERIFIER';

    @IsOptional()
    @IsBoolean()
    readonly verified?: boolean;
}
