import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  category_name: string;
}
