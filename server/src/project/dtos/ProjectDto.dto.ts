import {
  IsString,
  IsArray,
  IsDate,
  IsNumber,
  IsBoolean,
  IsObject,
  IsOptional,
} from 'class-validator';
import { ProjectMemberDto } from './ProjectMemberDto.dto';
export class ProjectDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  uniqueName: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  ownerId: string;

  @IsArray()
  @IsString({ each: true })
  monitoringUrls: string[];

  @IsDate()
  @IsOptional()
  lastErrorMail?: Date;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @IsString()
  @IsOptional()
  countryOrigin?: string;

  @IsString()
  @IsOptional()
  projectType?: string;

  @IsString()
  modelType: string;

  @IsString()
  projectContext?: string;

  @IsString()
  clientRequirements: string;

  @IsObject()
  docsContext?: any;

  @IsArray()
  @IsString({ each: true })
  thirdPartyIntegrations: string[];

  @IsObject()
  designTheme: any;

  @IsObject()
  owner: any;

  @IsArray()
  projectMembers: ProjectMemberDto[];

  sprints?: SprintDto[];

  @IsArray()
  githubRepos?: GithubRepoDto[];

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export class GithubRepoDto {
  @IsString()
  id: string;

  @IsString()
  projectId: string;

  @IsString()
  githubRepoUrl?: string;

  @IsString()
  githubBranch?: string;

  @IsString()
  codespaceUrl?: string;

  @IsDate()
  codespaceExpiry?: Date;

  @IsBoolean()
  isError: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export const mapToGithubRepoDto = (repo: any): GithubRepoDto => {
  return {
    id: repo.id,
    projectId: repo.project_id,
    githubRepoUrl: repo.github_repo_url,
    githubBranch: repo.github_branch,
    codespaceUrl: repo.codespace_url,
    codespaceExpiry: repo.codespace_expiry,
    isError: repo.isError || false,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
  };
};

export class SprintDto {
  @IsString()
  id: string;

  @IsString()
  projectId: string;

  @IsString()
  name: string;

  @IsString()
  requirements: string;

  @IsString()
  status: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsString()
  payment: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  feedback: string;

  @IsArray()
  userPersonas: string[];

  @IsString()
  taskStatus: string;

  @IsObject()
  project?: ProjectDto;

  @IsNumber()
  sprintNumber: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export function mapToSprintDto(sprint: any): SprintDto {
  return {
    id: sprint.id,
    name: sprint.name,
    projectId: sprint.project_id,
    requirements: sprint.requirements,
    status: sprint.status,
    startDate: sprint.start_date,
    endDate: sprint.end_date,
    payment: sprint.payment,
    price: sprint.price,
    feedback: sprint.feedback,
    userPersonas: sprint.user_personas,
    taskStatus: sprint.task_status,
    sprintNumber: sprint.sprint_number,
    project: sprint.projects,
    createdAt: sprint.created_at,
    updatedAt: sprint.updated_at,
  };
}
