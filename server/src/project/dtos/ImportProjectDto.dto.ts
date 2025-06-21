import {
  IsNotEmpty,
  IsUrl,
  IsString,
  IsArray,
  IsOptional,
} from 'class-validator';

export class ImportProjectDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsUrl()
  @IsNotEmpty()
  githubUrl: string;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsString()
  @IsNotEmpty()
  githubBranch: string;

  @IsString()
  @IsNotEmpty()
  modelType: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  thirdPartyIntegrations: string[];
}
