import { IsNumber } from 'class-validator';

export class AddDeductCreditsDto {
  @IsNumber()
  credits: number;
}

export class UpdateMaxProjectsDto {
  @IsNumber()
  maxProjects: number;
}
