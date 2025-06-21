import { IsDateString } from 'class-validator';

export class GetUsersByDateRangeDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
