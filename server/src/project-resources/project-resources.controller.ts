import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectResourcesService } from './project-resources.service';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateProjectResourceDto,
  ProjectResourceDto,
  mapToProjectResourceDto,
  mapToProjectResourceDtoArray,
} from './dtos/project-resources.dto';
import { GetUser, RequestUser } from 'src/auth/decorators/user.decorator';

@ApiTags('project-resources')
@Controller('project-resources')
@ApiBearerAuth()
export class ProjectResourcesController {
  constructor(
    private readonly projectResourcesService: ProjectResourcesService,
  ) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  async createProjectResource(
    @Body()
    data: CreateProjectResourceDto,
    @GetUser() user: RequestUser,
  ): Promise<ProjectResourceDto> {
    const {
      scheduleType,
      scheduleTime,
      scheduleDays,
      scheduleDate,
      cronExpression,
    } = data;
    const meetingData = {
      scheduleType,
      scheduleTime,
      scheduleDays,
      scheduleDate,
      cronExpression,
    };
    const resource = await this.projectResourcesService.createProjectResource(
      data.projectId,
      data.resourceType,
      data.resourceURL,
      data.resourceName,
      user.email,
      meetingData,
    );
    return mapToProjectResourceDto(resource);
  }

  @Get(':projectId')
  @UseGuards(JWTAuthGuard)
  async getProjectResources(
    @Param('projectId') projectId: string,
  ): Promise<ProjectResourceDto[]> {
    const resources =
      await this.projectResourcesService.getProjectResources(projectId);
    return mapToProjectResourceDtoArray(resources);
  }

  @Put(':resourceId')
  @UseGuards(JWTAuthGuard)
  async updateProjectResource(
    @Param('resourceId') resourceId: string,
    @Body()
    data: CreateProjectResourceDto,
  ): Promise<ProjectResourceDto> {
    const {
      scheduleType,
      scheduleTime,
      scheduleDays,
      scheduleDate,
      cronExpression,
    } = data;
    const meetingData = {
      scheduleType,
      scheduleTime,
      scheduleDays,
      scheduleDate,
      cronExpression,
    };
    const resource = await this.projectResourcesService.updateProjectResource(
      resourceId,
      data.resourceType,
      data.resourceURL,
      data.resourceName,
      meetingData,
    );
    return mapToProjectResourceDto(resource);
  }

  @Delete(':resourceId')
  @UseGuards(JWTAuthGuard)
  async deleteProjectResource(
    @Param('resourceId') resourceId: string,
  ): Promise<boolean> {
    await this.projectResourcesService.deleteProjectResource(resourceId);
    return true;
  }

  @Post('/meeting/reminder')
  async meetingReminder(
    @Body() { resourceId }: { resourceId: string },
  ): Promise<true> {
    await this.projectResourcesService.meetingReminder(resourceId);
    return true;
  }
}
