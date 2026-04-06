import { IsNumber } from 'class-validator';

export class CreateTradeDto {
  @IsNumber()
  proposerItemId: number;

  @IsNumber()
  receiverItemId: number;

  @IsNumber()
  receiverId: number;
}
