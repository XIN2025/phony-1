import {
  github_repos,
  project_members,
  projects,
  sprints,
  users,
} from '@prisma/client';
import {
  mapToGithubRepoDto,
  mapToSprintDto,
  ProjectDto,
} from '../dtos/ProjectDto.dto';
import { mapToProjectMemberDto } from './plainToProjectMemberDto';
type FullProject = projects & {
  users?: Partial<users>;
  project_members?: Partial<project_members>[];
  sprints?: Partial<sprints>[];
  github_repos?: Partial<github_repos>[];
};

export const mapToProjectDto = (project: Partial<FullProject>) => {
  const newProject: ProjectDto = {
    id: project.id,
    title: project.title,
    countryOrigin: project?.country_origin,
    projectType: project?.project_type,
    modelType: project.model_type,
    designTheme: project.design_theme,
    logoUrl: project.logo_url,
    owner: project.users,
    isArchived: project.is_archived ?? false,
    monitoringUrls: project.monitoring_urls,
    docsContext: project.docs_context,
    clientRequirements: project.client_requirements,
    projectContext: project.project_context,
    thirdPartyIntegrations: project.third_party_integrations,
    projectMembers: project.project_members?.map(mapToProjectMemberDto),
    ownerId: project.owner_id,
    sprints: project.sprints?.map(mapToSprintDto),
    githubRepos: project.github_repos?.map(mapToGithubRepoDto),
    uniqueName: project.unique_name,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  };
  return newProject;
};
