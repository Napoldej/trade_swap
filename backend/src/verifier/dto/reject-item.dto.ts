import { IsString, MinLength } from 'class-validator';

export class RejectItemDto {
  @IsString()
  @MinLength(1)
  rejectionReason: string;
}
