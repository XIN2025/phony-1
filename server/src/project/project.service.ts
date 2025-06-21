import { HttpException, Injectable, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  UpdateProjectDto,
  CreateProjectWithoutRepoDto,
  TemplateProjectDto,
} from './dtos/CreateProjectDto.dto';
import { projects, ProjectType } from '@prisma/client';
import { GitService } from 'src/git/git.service';
import { ImportProjectDto } from './dtos/ImportProjectDto.dto';
import { ProjectAnalyticsDto } from './dtos/ProjectAnalyticsDto.dto';
import { SprintStatus, UserStoryStatus } from '@prisma/client';
import path from 'path';
import { TEMPLATE_PROJECTS } from 'src/common/constants/templates';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { ProjectUtils } from 'src/utils/development/utils.service';
import { TasksService } from 'src/tasks/tasks.service';
import { HttpStatusCode } from 'axios';
import { integrationDocs, rules } from 'src/common/constants/rules';
import { WaitlistStatus } from 'src/waitlist/dtos/waitlist.dto';

@Injectable()
export class ProjectService {
  logger = new Logger(ProjectService.name);
  constructor(
    private prismaService: PrismaService,
    private readonly tasksService: TasksService,
    private readonly gitService: GitService,
    private projectUtils: ProjectUtils,
  ) {}
  async validateUserProjectLimit(userId: string) {
    const user = await this.prismaService.users.findUnique({
      where: { id: userId },
    });
    const projects = await this.prismaService.projects.count({
      where: {
        project_members: {
          some: {
            user_email: user.email,
          },
        },
      },
    });
    console.log('projects', projects);
    const isUserWaitListed = await this.prismaService.waitlist.count({
      where: {
        email: user.email,
        status: WaitlistStatus.APPROVED,
      },
    });
    console.log('isUserWaitListed', isUserWaitListed);
    if (isUserWaitListed) return;
    if (projects >= user.max_projects) {
      throw new HttpException(
        `You have reached the maximum number of projects allowed. Please contact the team if you think this is a mistake`,
        HttpStatusCode.BadRequest,
      );
    }
    return;
  }
  async createProjectWithoutRepo(
    project: CreateProjectWithoutRepoDto,
    userId: string,
  ) {
    try {
      await this.validateUserProjectLimit(userId);
      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });
      const unique_name = `${project.title.replace(/\s/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;

      const requirementText = project.clientRequirements;
      const newProject = await this.prismaService.projects.create({
        data: {
          title: project.title,
          client_requirements: requirementText,
          unique_name: unique_name,
          owner_id: userId,
          third_party_integrations: [],
          project_context: rules.common(),
          model_type: project.modelType,
        },
      });
      await this.prismaService.project_members.create({
        data: {
          project_id: newProject.id,
          user_email: user.email,
          role: 'Admin',
        },
      });
      if (requirementText) {
        const sprint = await this.prismaService.sprints.create({
          data: {
            project_id: newProject.id,
            name: 'Initial Sprint',
            requirements: requirementText,
            start_date: new Date(),
            end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        });
        this.tasksService.generateTasks({
          projectId: newProject.id,
          sprintId: sprint.id,
        });
      }
      await this.prismaService.users.update({
        where: { id: userId },
        data: { project_count: user.project_count + 1 },
      });
      return newProject;
    } catch (error) {
      this.logger.error(`Failed to create project: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to create project`,
        HttpStatusCode.BadRequest,
      );
    }
  }

  async importProject(importDetails: ImportProjectDto, userId: string) {
    try {
      await this.validateUserProjectLimit(userId);
      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });
      const unique_name = `${importDetails.title.replace(/\s/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;

      const requirementText = importDetails.requirements;
      const newProject = await this.prismaService.projects.create({
        data: {
          title: importDetails.title,
          client_requirements: requirementText || '',
          third_party_integrations: importDetails.thirdPartyIntegrations,
          owner_id: userId,
          unique_name: unique_name,
          project_context: rules.common(),
          model_type: importDetails.modelType,
        },
      });
      await this.prismaService.project_members.create({
        data: {
          project_id: newProject.id,
          user_email: user.email,
          role: 'Admin',
        },
      });
      if (requirementText) {
        const sprint = await this.prismaService.sprints.create({
          data: {
            project_id: newProject.id,
            name: 'Initial Sprint',
            requirements: requirementText,
            start_date: new Date(),
            end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        });
        this.tasksService.generateTasks({
          projectId: newProject.id,
          sprintId: sprint.id,
        });
      }
      await this.prismaService.github_repos.create({
        data: {
          project_id: newProject.id,
          github_repo_url: importDetails.githubUrl,
          github_branch: importDetails.githubBranch,
          isError: false,
        },
      });
      await this.prismaService.users.update({
        where: { id: userId },
        data: { project_count: user.project_count + 1 },
      });
      this.logger.log(
        `New project created with name: ${newProject.unique_name}`,
      );
      return newProject;
    } catch (error) {
      this.logger.error(`Failed to create new project: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to create new project`,
        HttpStatusCode.BadRequest,
      );
    }
  }
  async templateProject(importDetails: TemplateProjectDto, userId: string) {
    try {
      await this.validateUserProjectLimit(userId);
      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });
      const unique_name = `${importDetails.title.replace(/\s/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;

      const requirementText = importDetails.clientRequirements;

      const newProject = await this.prismaService.projects.create({
        data: {
          title: importDetails.title,
          client_requirements: requirementText,
          third_party_integrations: importDetails.thirdPartyIntegrations,
          owner_id: userId,
          unique_name: unique_name,
          project_context: rules[importDetails.template.toLowerCase()](),
          template: importDetails.template,
          model_type: importDetails.modelType,
        },
      });
      await this.prismaService.project_members.create({
        data: {
          project_id: newProject.id,
          user_email: user.email,
          role: 'Admin',
        },
      });
      if (requirementText) {
        const sprint = await this.prismaService.sprints.create({
          data: {
            project_id: newProject.id,
            name: 'Initial Sprint',
            requirements: requirementText,
            start_date: new Date(),
            end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        });
        this.tasksService.generateTasks({
          projectId: newProject.id,
          sprintId: sprint.id,
        });
      }
      await this.setupTemplateProject(
        newProject,
        importDetails.githubUrl,
        importDetails.ownerType,
        importDetails.visibility,
      );
      await this.prismaService.users.update({
        where: { id: userId },
        data: { project_count: user.project_count + 1 },
      });
      this.logger.log(`New project created with ID: ${newProject.id}`);
      return newProject;
    } catch (error) {
      this.logger.error(`Failed to create new project: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to create new project`,
        HttpStatusCode.BadRequest,
      );
    }
  }

  async replaceProjectNameInFile(
    project: projects,
    projectFolder: string,
    file: string,
  ) {
    const filePath = path.join(projectFolder, file);
    if (existsSync(filePath)) {
      const content = await fs.readFile(filePath, 'utf-8');
      const newContent = content.replace(
        '{{PROJECT_NAME}}',
        project.unique_name,
      );
      await this.projectUtils.writeFileOrCreate(filePath, newContent);
    }
  }

  async setupTemplateProject(
    project: projects,
    repoUrl: string,
    ownerType: string,
    visibility: string,
  ) {
    try {
      this.logger.log('creating folder');
      const projectFolder = await this.projectUtils.createProjectFolder(
        project.id,
      );
      const templateRepo = TEMPLATE_PROJECTS[project.template];
      if (!templateRepo) {
        throw new Error('Template not found');
      }
      console.log('Cloning, ', repoUrl);

      await this.gitService.cloneRepository(templateRepo, projectFolder);
      // jest.yml
      await this.replaceProjectNameInFile(
        project,
        projectFolder,
        '.github/workflows/jest.yml',
      );
      // cypress.yml
      await this.replaceProjectNameInFile(
        project,
        projectFolder,
        '.github/workflows/cypress.yml',
      );
      const owner = repoUrl.split('/')[3];
      const repo = repoUrl.split('/')[4];
      const githubUrl = await this.gitService.createUserRepo(
        project.owner_id,
        project.id,
        {
          owner,
          repoName: repo,
          ownerType,
          visibility,
        },
      );
      if (!githubUrl) {
        throw new Error('Failed to create repository');
      }
      await this.gitService.pushTemplateRepo(
        project.owner_id,
        projectFolder,
        githubUrl,
      );
      await this.projectUtils.cleanupProject(project.id);
      await this.prismaService.github_repos.create({
        data: {
          project_id: project.id,
          github_repo_url: githubUrl,
          github_branch: 'master',
          isError: false,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to setup github repository: ${error.message}`);
      throw new HttpException(
        `Failed to setup github repository`,
        HttpStatusCode.BadRequest,
      );
    }
  }

  async getProjects(email: string, active: boolean) {
    try {
      // Get projects where user is a member
      let collaboratedProjects = await this.prismaService.projects.findMany({
        where: {
          OR: [
            {
              is_archived: false,
            },
            {
              is_archived: {
                isSet: false,
              },
            },
          ],
          project_members: {
            some: {
              user_email: email,
            },
          },
        },
        select: {
          id: true,
          title: true,
          unique_name: true,
          updated_at: true,
          logo_url: true,
          project_members: {
            include: {
              users: {
                select: {
                  first_name: true,
                  last_name: true,
                  avatar_url: true,
                },
              },
            },
          },
          sprints: {
            where: {
              status: 'Active',
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          updated_at: 'desc',
        },
      });

      if (active) {
        collaboratedProjects = collaboratedProjects
          .filter((project) => project.sprints.length > 0)
          .map((project) => ({
            ...project,
            sprints: undefined,
          }));
      }

      return collaboratedProjects;
    } catch (error) {
      this.logger.error(`Failed to fetch projects: ${error.message}`);
      throw new HttpException(
        `Failed to fetch projects`,
        HttpStatusCode.BadRequest,
      );
    }
  }

  async getProjectById(projectId: string) {
    try {
      const project = await this.prismaService.projects.findUnique({
        where: { id: projectId },
      });
      return project;
    } catch (error) {
      return null;
    }
  }
  async getProjectByUniqueName(uniqueName: string, userEmail: string) {
    try {
      const project = await this.prismaService.projects.findUnique({
        where: {
          unique_name: uniqueName,
          project_members: {
            some: {
              user_email: userEmail,
            },
          },
        },
        include: {
          sprints: true,
          users: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              avatar_url: true,
            },
          },
          project_members: {
            include: {
              users: {
                select: {
                  first_name: true,
                  avatar_url: true,
                  id: true,
                  last_name: true,
                },
              },
            },
          },
          github_repos: true,
        },
      });
      return project;
    } catch (error) {
      this.logger.error(`Failed to fetch project: ${error.message}`);
      return null;
    }
  }
  async updateModelType(
    projectId: string,
    modelType: string,
  ): Promise<projects> {
    try {
      const updatedProject = await this.prismaService.projects.update({
        where: { id: projectId },
        data: {
          model_type: modelType,
          updated_at: new Date(),
        },
      });
      return updatedProject;
    } catch (error) {
      this.logger.error(`Failed to update model type: ${error.message}`);
      throw new HttpException(
        `Failed to update model type`,
        HttpStatusCode.BadRequest,
      );
    }
  }

  async archiveProject(projectId: string) {
    try {
      const updatedProject = await this.prismaService.projects.update({
        where: { id: projectId },
        data: { is_archived: true },
      });
      return updatedProject;
    } catch (error) {
      this.logger.error(`Failed to archive project: ${error.message}`);
      throw new HttpException(
        `Failed to archive project`,
        HttpStatusCode.BadRequest,
      );
    }
  }
  async unarchiveProject(projectId: string) {
    try {
      const updatedProject = await this.prismaService.projects.update({
        where: { id: projectId },
        data: { is_archived: false },
      });
      return updatedProject;
    } catch (error) {
      this.logger.error(`Failed to unarchive project: ${error.message}`);
      throw new HttpException(
        `Failed to unarchive project`,
        HttpStatusCode.BadRequest,
      );
    }
  }

  async getArchivedProjects(userEmail: string) {
    try {
      const archivedProjects = await this.prismaService.projects.findMany({
        where: {
          is_archived: true,
          project_members: {
            some: {
              user_email: userEmail,
            },
          },
        },
        select: {
          id: true,
          title: true,
          unique_name: true,
          updated_at: true,
          logo_url: true,
          project_members: {
            include: {
              users: {
                select: {
                  first_name: true,
                  last_name: true,
                  avatar_url: true,
                },
              },
            },
          },
        },
        orderBy: {
          updated_at: 'desc',
        },
      });
      return archivedProjects;
    } catch (error) {
      this.logger.error(`Failed to get archived projects: ${error.message}`);
      throw new HttpException(
        `Failed to get archived projects`,
        HttpStatusCode.BadRequest,
      );
    }
  }

  async updateProject(projectId: string, projectDetails: UpdateProjectDto) {
    try {
      // Retrieve the current project to check existing design_theme
      const oldProject = await this.prismaService.projects.findUnique({
        where: { id: projectId },
      });
      const newIntegrations = projectDetails.thirdPartyIntegrations?.filter(
        (integration) =>
          !(oldProject.third_party_integrations ?? []).includes(integration),
      );

      if (newIntegrations && newIntegrations.length > 0) {
        if (
          newIntegrations
            .map((integration) => integration.toLowerCase())
            .includes('stripe')
        ) {
          const docsContext = integrationDocs.stripe();
          projectDetails.docsContext = {
            ...(projectDetails.docsContext ?? {}),
            Stripe: docsContext,
          };
        }
      }

      // Update the project record
      const updatedProject = await this.prismaService.projects.update({
        where: { id: projectId },
        data: {
          title: projectDetails.title,
          country_origin: projectDetails.countryOrigin,
          project_type: projectDetails.projectType as ProjectType,
          client_requirements: projectDetails.clientRequirements,
          third_party_integrations: projectDetails.thirdPartyIntegrations,
          design_theme: projectDetails.designTheme,
          project_context: projectDetails.projectContext,
          docs_context: projectDetails.docsContext,
          monitoring_urls: projectDetails.monitoringUrls,
          logo_url: projectDetails.logoUrl,
        },
      });

      // Create a story only when design_theme is being added for the first time
      if (!oldProject.design_theme && projectDetails.designTheme) {
        // Retrieve active sprint for the project; use placeholder if none found
        const sprint = await this.prismaService.sprints.findFirst({
          where: { project_id: projectId },
          orderBy: {
            sprint_number: 'desc',
          },
        });
        if (!sprint) {
          return updatedProject;
        }
        const task = await this.prismaService.task.create({
          data: {
            project_id: projectId,
            sprint_id: sprint ? sprint.id : '',
            title: 'Implement Design Theme for Project',
            description: 'Implement the design theme for the project.',
            type: 'Feature',
          },
        });
        const theme = projectDetails.designTheme;
        const storyDescription = `Implement the design theme for the project.`;
        const uiPrompt = `This story implements the design theme for the project.
Design Theme Details (will be added to global css file):
Colors:
  :root ${JSON.stringify(theme.colors.light, null, 2)}
  .dark ${JSON.stringify(theme.colors.dark, null, 2)}
Typography:
  Heading: ${theme.typography.heading}
  Body: ${theme.typography.body}
  Font Links: ${theme.typography.fontLinks.join(', ')}
Style: ${theme.style}

example to use fonts in css:
${theme?.typography?.fontLinks?.map((link) => {
  return `@import url('${link}');`;
})}
h1,h2,h3,h4,h5,h6 {
  font-family: ${theme.typography?.heading};
}
*{
  font-family: ${theme.typography?.body};
}
.font-${theme.typography.heading.toLowerCase().replace(' ', '-')} {
  font-family: ${theme.typography?.heading};
}
.font-${theme.typography.body.toLowerCase().replace(' ', '-')} {
  font-family: ${theme.typography?.body};
}

This story was auto-generated when the design theme was applied for the first time.
Ensure that all UI components adopt the above design tokens.`;
        await this.prismaService.story.create({
          data: {
            project_id: projectId,
            sprint_id: sprint ? sprint.id : 'defaultSprintId',
            title: 'Implement Design Theme for Project',
            description: storyDescription,
            estimation: 3,
            priority: 0,
            task_id: task.id,
            acceptance_criteria: [
              {
                criteria: 'Design theme is applied to all UI components',
                is_completed: false,
              },
              {
                criteria:
                  'Color scheme matches the specified light and dark mode colors',
                is_completed: false,
              },
              {
                criteria:
                  'Typography is correctly implemented with specified heading and body fonts',
                is_completed: false,
              },
              {
                criteria: 'Font imports are properly configured in the CSS',
                is_completed: false,
              },
              {
                criteria: 'Color contrast meets accessibility standards',
                is_completed: false,
              },
              {
                criteria:
                  'Theme styling is consistent across all pages and components',
                is_completed: false,
              },
              {
                criteria:
                  'Dark mode implementation follows the specified color palette',
                is_completed: false,
              },
            ],
            ui_prompt: uiPrompt,
          },
        });
        await this.prismaService.projects.update({
          where: { id: projectId },
          data: {
            updated_at: new Date(),
          },
        });
      }

      return updatedProject;
    } catch (error) {
      this.logger.error(`Failed to update project: ${error.message}`);
      throw new HttpException(
        `Failed to update project`,
        HttpStatusCode.BadRequest,
      );
    }
  }

  async getProjectAnalytics(projectId: string): Promise<ProjectAnalyticsDto> {
    try {
      // Get project to verify it exists and get creation/update dates
      const project = await this.prismaService.projects.findUnique({
        where: { id: projectId },
        select: {
          created_at: true,
          updated_at: true,
        },
      });

      if (!project) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
      }

      // Get sprint statistics
      const sprints = await this.prismaService.sprints.findMany({
        where: { project_id: projectId },
        select: {
          status: true,
          id: true,
        },
        orderBy: {
          sprint_number: 'desc',
        },
      });
      if (sprints.length === 0) {
        throw new HttpException('No sprints found', HttpStatus.NOT_FOUND);
      }
      const currentSprint = sprints[0];

      const totalSprints = sprints.length;
      const activeSprints = sprints.filter(
        (s) => s.status === SprintStatus.Active,
      ).length;
      const completedSprints = sprints.filter(
        (s) => s.status === SprintStatus.Completed,
      ).length;

      // Get meeting data
      const meetings = await this.prismaService.meeting_data.count({
        where: { project_id: projectId },
      });

      // Get task data
      const tasks = await this.prismaService.task.count({
        where: {
          sprint_id: currentSprint.id,
        },
      });

      // Get story statistics
      const stories = await this.prismaService.story.findMany({
        where: { sprint_id: currentSprint.id },
        select: {
          status: true,
        },
      });

      const totalStories = stories.length;
      const completedStories = stories.filter(
        (s) => s.status === UserStoryStatus.Done,
      ).length;
      const inProgressStories = stories.filter(
        (s) => s.status === UserStoryStatus.InProgress,
      ).length;
      const testingStories = stories.filter(
        (s) => s.status === UserStoryStatus.Testing,
      ).length;
      const todoStories = stories.filter(
        (s) => s.status === UserStoryStatus.Todo,
      ).length;

      return {
        totalSprints,
        activeSprints,
        completedSprints,
        totalMeetings: meetings,
        totalTasks: tasks,
        totalStories,
        completedStories,
        inProgressStories,
        testingStories,
        todoStories,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      };
    } catch (error) {
      this.logger.error(`Failed to get project analytics: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to get project analytics`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteProject(projectId: string, requestUserId: string) {
    try {
      const project = await this.prismaService.projects.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      const requestMember = await this.prismaService.project_members.findFirst({
        where: {
          project_id: projectId,
          users: {
            id: requestUserId,
          },
          role: 'Admin',
        },
      });

      if (!requestMember) {
        throw new Error('Only project owner can remove members');
      }

      await this.prismaService.$transaction([
        // Delete stories first due to relation with user_stories
        this.prismaService.meeting_data.deleteMany({
          where: {
            project_id: projectId,
          },
        }),
        this.prismaService.user_story_analytics.deleteMany({
          where: {
            projectId: projectId,
          },
        }),
        this.prismaService.cicd.deleteMany({
          where: {
            project_id: projectId,
          },
        }),
        this.prismaService.testing_data.deleteMany({
          where: {
            project_id: projectId,
          },
        }),
        this.prismaService.project_resources.deleteMany({
          where: {
            project_id: projectId,
          },
        }),
        this.prismaService.story.deleteMany({
          where: {
            project_id: projectId,
          },
        }),
        this.prismaService.task.deleteMany({
          where: {
            project_id: projectId,
          },
        }),

        this.prismaService.deployments.deleteMany({
          where: { project_id: projectId },
        }),
        this.prismaService.github_repos.deleteMany({
          where: { project_id: projectId },
        }),
        this.prismaService.project_members.deleteMany({
          where: { project_id: projectId },
        }),
        this.prismaService.sprints.deleteMany({
          where: { project_id: projectId },
        }),

        // Finally delete the project
        this.prismaService.projects.delete({
          where: { id: projectId },
        }),
      ]);

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete project: ${error.message}`);
      throw new HttpException(
        `Failed to delete project`,
        HttpStatusCode.BadRequest,
      );
    }
  }
}
