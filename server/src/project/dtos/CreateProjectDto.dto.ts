import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { IsArray } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  thirdPartyIntegrations: string[];

  @IsString()
  @IsOptional()
  projectContext?: string;

  @IsString()
  clientRequirements: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsObject()
  @IsOptional()
  docsContext?: {
    [integration: string]: string;
  };

  @IsObject()
  @IsOptional()
  designTheme?: any;

  @IsString()
  @IsOptional()
  countryOrigin?: string;

  @IsString()
  @IsOptional()
  projectType?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  monitoringUrls?: string[];
}
export class TemplateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsString()
  @IsOptional()
  clientRequirements?: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  thirdPartyIntegrations: string[];

  @IsString()
  @IsNotEmpty()
  modelType: string;

  @IsString()
  @IsNotEmpty()
  visibility: string;

  @IsString()
  @IsNotEmpty()
  ownerType: string;

  @IsString()
  @IsNotEmpty()
  githubUrl: string;
}

export class CreateProjectWithoutRepoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  modelType: string;

  @IsString()
  @IsOptional()
  clientRequirements?: string;
}
