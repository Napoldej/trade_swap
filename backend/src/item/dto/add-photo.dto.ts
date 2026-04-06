import { IsString, IsNumber } from 'class-validator';

export class AddPhotoDto {
  @IsString()
  photoUrl: string;

  @IsNumber()
  displayOrder: number;
}
