import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateRequirementDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  sprintId: string;
}
