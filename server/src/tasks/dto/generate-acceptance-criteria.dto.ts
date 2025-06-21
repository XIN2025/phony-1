import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateAcceptanceCriteriaDto {
  @IsString()
  @IsNotEmpty()
  storyId: string;

  @IsString()
  @IsNotEmpty()
  projectId: string;
}
