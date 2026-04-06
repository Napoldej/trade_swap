import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateItemDto {
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  itemName?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
