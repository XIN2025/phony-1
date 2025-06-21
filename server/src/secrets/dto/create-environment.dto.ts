import { IsString, IsNotEmpty } from 'class-validator';

export class CreateEnvironmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  projectId: string;
}

export class UpdateSecretsDto {
  @IsString()
  @IsNotEmpty()
  secrets: string;
}
