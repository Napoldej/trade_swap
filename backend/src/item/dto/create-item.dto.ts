import { IsString, IsNumber } from 'class-validator';

export class CreateItemDto {
  @IsNumber()
  categoryId: number;

  @IsString()
  itemName: string;

  @IsString()
  description: string;
}
