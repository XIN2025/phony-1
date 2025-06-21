import { IsNumber, IsPositive } from 'class-validator';

export class ReduceCreditsDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}
