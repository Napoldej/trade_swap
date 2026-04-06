import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsNumber()
  tradeId: number;

  @IsNumber()
  rateeId: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
