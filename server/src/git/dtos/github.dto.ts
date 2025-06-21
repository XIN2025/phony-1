import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetOrgsReposQueryDto {
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsString()
  @IsNotEmpty()
  ownerType: string;
}
export class ConnectGithubRepoDto {
  @IsString()
  @IsNotEmpty()
  githubBranch: string;

  @IsString()
  @IsNotEmpty()
  githubRepo: string;

  @IsString()
  @IsNotEmpty()
  githubOwner: string;

  @IsString()
  @IsNotEmpty()
  projectId: string;
}
