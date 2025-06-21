import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  Delete,
  UploadedFile,
  HttpException,
  Query,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import {
  TemplateProjectDto,
  CreateProjectWithoutRepoDto,
  UpdateProjectDto,
} from './dtos/CreateProjectDto.dto';
import { GetUser, RequestUser } from 'src/auth/decorators/user.decorator';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { ProjectDto, SprintDto } from './dtos/ProjectDto.dto';
import { ProjectAnalyticsDto } from './dtos/ProjectAnalyticsDto.dto';
import { mapToProjectDto } from './mapper/plainToProjectDto';
import { OwnershipInterceptor } from 'src/auth/interceptor/ownershipInterceptor';
import { AddProjectMemberDto } from './dtos/AddProjectMemberDto.dto';
import {
  ProjectMemberDto,
  UpdateMemberRoleDto,
} from './dtos/ProjectMemberDto.dto';
import { mapToProjectMemberDto } from './mapper/plainToProjectMemberDto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportProjectDto } from './dtos/ImportProjectDto.dto';
import { mapToSprintDto } from './dtos/ProjectDto.dto';
import { ProjectMemberService } from './project-member.service';
import { ProjectSprintService } from './project-sprint.service';
import { CreateSprintDto, UpdateSprintDto } from './dtos/sprint.dto';
import { UpdateModelTypeDto } from './dtos/update-model-type.dto';
import { ProjectTranscriptionService } from './project-transcription.service';
import { SprintDashboardQueryDto } from './dtos/sprint-dashboard.dto';
import { TranscribeDto } from './dtos/transcribe.dto';

@Controller()
@ApiBearerAuth()
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectMemberService: ProjectMemberService,
    private readonly projectSprintService: ProjectSprintService,
    private readonly projectTranscriptionService: ProjectTranscriptionService,
  ) {}

  // Projects Endpoints
  @Post('projects')
  @UseGuards(JWTAuthGuard)
  @ApiTags('Projects')
  async createProjectWithoutRepo(
    @Body() projectDetails: CreateProjectWithoutRepoDto,
    @GetUser() user: RequestUser,
  ): Promise<ProjectDto> {
    const project = await this.projectService.createProjectWithoutRepo(
      projectDetails,
      user.id,
    );
    return mapToProjectDto(project);
  }
  @Post('projects/import')
  @UseGuards(JWTAuthGuard)
  @ApiTags('Projects')
  async importProject(
    @Body() importDetails: ImportProjectDto,
    @GetUser() user: RequestUser,
  ): Promise<ProjectDto> {
    const project = await this.projectService.importProject(
      importDetails,
      user.id,
    );
    return mapToProjectDto(project);
  }
  @Post('projects/template')
  @UseGuards(JWTAuthGuard)
  @ApiTags('Projects')
  async templateProject(
    @Body() templateDetails: TemplateProjectDto,
    @GetUser() user: RequestUser,
  ): Promise<ProjectDto> {
    const project = await this.projectService.templateProject(
      templateDetails,
      user.id,
    );
    return mapToProjectDto(project);
  }

  @Get('projects')
  @UseGuards(JWTAuthGuard)
  @ApiTags('Projects')
  async getProjects(
    @GetUser() user: RequestUser,
    @Query('active') active: boolean,
  ): Promise<ProjectDto[]> {
    const projects = await this.projectService.getProjects(user.email, active);
    return projects.map((project) => mapToProjectDto(project));
  }
  @Get('projects/name/:name')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(OwnershipInterceptor)
  @ApiTags('Projects')
  async getProjectByName(
    @Param('name') name: string,
    @GetUser() user: RequestUser,
  ): Promise<ProjectDto> {
    const project = await this.projectService.getProjectByUniqueName(
      name,
      user.email,
    );
    if (!project) {
      throw new HttpException('Project not found', 404);
    }
    return mapToProjectDto(project);
  }
  @Get('projects/archived')
  @UseGuards(JWTAuthGuard)
  @ApiTags('Projects')
  async getArchivedProjects(
    @GetUser() user: RequestUser,
  ): Promise<ProjectDto[]> {
    const projects = await this.projectService.getArchivedProjects(user.email);
    return projects.map((project) => mapToProjectDto(project));
  }
  @Put('projects/:projectId/archive')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(OwnershipInterceptor)
  @ApiTags('Projects')
  async archiveProject(
    @Param('projectId') projectId: string,
  ): Promise<ProjectDto> {
    const project = await this.projectService.archiveProject(projectId);
    return mapToProjectDto(project);
  }
  @Put('projects/:projectId/unarchive')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(OwnershipInterceptor)
  @ApiTags('Projects')
  async unarchiveProject(
    @Param('projectId') projectId: string,
  ): Promise<ProjectDto> {
    const project = await this.projectService.unarchiveProject(projectId);
    return mapToProjectDto(project);
  }

  @Put('projects/:projectId')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(OwnershipInterceptor)
  @ApiTags('Projects')
  async updateProject(
    @Param('projectId') id: string,
    @Body() projectDetails: UpdateProjectDto,
  ): Promise<ProjectDto> {
    const project = await this.projectService.updateProject(id, projectDetails);
    return mapToProjectDto(project);
  }
  @Put('projects/:projectId/model-type')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(OwnershipInterceptor)
  @ApiTags('Projects')
  async updateModelType(
    @Param('projectId') projectId: string,
    @Body() updateModelTypeDto: UpdateModelTypeDto,
  ): Promise<ProjectDto> {
    const project = await this.projectService.updateModelType(
      projectId,
      updateModelTypeDto.model_type,
    );
    return mapToProjectDto(project);
  }

  @Get('projects/:projectId/analytics')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(OwnershipInterceptor)
  @ApiTags('Projects')
  @ApiResponse({
    status: 200,
    description: 'Project analytics fetched successfully',
    type: ProjectAnalyticsDto,
  })
  async getProjectAnalytics(
    @Param('projectId') projectId: string,
  ): Promise<ProjectAnalyticsDto> {
    const analytics = await this.projectService.getProjectAnalytics(projectId);
    return analytics;
  }

  @Delete('projects/:projectId')
  @UseGuards(JWTAuthGuard)
  @ApiTags('Projects')
  async deleteProject(
    @Param('projectId') projectId: string,
    @GetUser() user: RequestUser,
  ) {
    try {
      await this.projectService.deleteProject(projectId, user.id);
      return true;
    } catch (error) {
      throw new BadRequestException('Failed to delete project', {
        cause: new Error(error.message),
        description: error.message,
      });
    }
  }

  // Project Members Endpoints
  @Post('projects/:projectId/members')
  @UseGuards(JWTAuthGuard)
  @ApiTags('Project Members')
  async addProjectMember(
    @Param('projectId') projectId: string,
    @Body() addMemberDto: AddProjectMemberDto,
    @GetUser() user: RequestUser,
  ) {
    const member = await this.projectMemberService.addProjectMember(
      projectId,
      addMemberDto.email,
      addMemberDto.role,
      user.id,
    );
    return mapToProjectMemberDto(member);
  }

  @Delete('projects/:projectId/members/:memberId')
  @UseGuards(JWTAuthGuard)
  @ApiTags('Project Members')
  async removeProjectMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @GetUser() user: RequestUser,
  ) {
    await this.projectMemberService.removeProjectMember(
      projectId,
      memberId,
      user.id,
    );
    return true;
  }

  @Get('projects/:projectId/members')
  @UseGuards(JWTAuthGuard)
  @ApiTags('Project Members')
  async getProjectMembers(
    @Param('projectId') projectId: string,
  ): Promise<ProjectMemberDto[]> {
    const members =
      await this.projectMemberService.getProjectMembers(projectId);
    return members.map((member) => mapToProjectMemberDto(member));
  }
  @Put('projects/:projectId/members/:memberId/role')
  @UseGuards(JWTAuthGuard)
  @ApiTags('Project Members')
  async updateProjectMemberRole(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
    @GetUser() user: RequestUser,
  ) {
    const member = await this.projectMemberService.updateProjectMemberRole(
      projectId,
      memberId,
      updateMemberRoleDto.role,
      user.id,
    );
    return mapToProjectMemberDto(member);
  }

  // Sprints Endpoints
  @Post('projects/:projectId/sprints')
  @UseGuards(JWTAuthGuard)
  @ApiTags('Sprints')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: 200,
    description: 'Sprint created successfully',
    type: SprintDto,
  })
  async createSprint(
    @Param('projectId') projectId: string,
    @Body()
    data: CreateSprintDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<SprintDto> {
    const sprint = await this.projectSprintService.createSprint(
      projectId,
      data.title,
      data.shiftData,
      data.requirements,
      data.startDate ? new Date(data.startDate) : undefined,
      data.endDate ? new Date(data.endDate) : undefined,
      file,
    );

    return mapToSprintDto(sprint);
  }

  @Get('user/sprints')
  @UseGuards(JWTAuthGuard)
  @ApiTags('Sprints')
  async getUserSprints(
    @Query() query: SprintDashboardQueryDto,
    @GetUser() user: RequestUser,
  ) {
    const sprints = await this.projectSprintService.getSprintDashboardData(
      user.email,
      query,
    );
    return sprints;
  }

  @Put('sprints/:sprintId')
  @UseGuards(JWTAuthGuard)
  @ApiTags('Sprints')
  @ApiResponse({
    status: 200,
    description: 'Sprint updated successfully',
    type: SprintDto,
  })
  async updateSprint(
    @Param('sprintId') sprintId: string,
    @Body() sprint: UpdateSprintDto,
  ): Promise<SprintDto> {
    const updatedSprint = await this.projectSprintService.updateSprint(
      sprintId,
      sprint,
    );
    return mapToSprintDto(updatedSprint);
  }

  @Delete('sprints/:sprintId')
  @UseGuards(JWTAuthGuard)
  @ApiTags('Sprints')
  @ApiResponse({ status: 200, description: 'Sprint deleted successfully' })
  @ApiResponse({ status: 400, description: 'Failed to delete sprint' })
  async deleteSprint(@Param('sprintId') sprintId: string) {
    await this.projectSprintService.deleteSprint(sprintId);
    return true;
  }

  @Post('projects/transcribe')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FileInterceptor('audio'))
  @ApiTags('Projects')
  async transcribeAudio(
    @UploadedFile() audioFile: Express.Multer.File,
    @GetUser() user: RequestUser,
    @Body()
    data: TranscribeDto,
  ) {
    if (!audioFile) {
      throw new BadRequestException('No audio file provided');
    }

    await this.projectTranscriptionService.transcribeAudio(
      audioFile,
      data.projectId || null,
      data.startDate,
      data.endDate,
      data.audioDuration,
      user.id,
    );
    return true;
  }
}
