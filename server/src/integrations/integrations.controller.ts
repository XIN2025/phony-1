import {
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Body,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { UpdateStoryStatusDto } from './dto/update-story-status.dto';
import { MeetingDataDto } from './dto/meeting-data';
import { ApiTags } from '@nestjs/swagger';
import { CoverageDataDto, TestingDataDto } from './dto/testing-data.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EnhancePromptDto } from './dto/enhance-prompt';

/**
 * Controller managing integration endpoints with API key authentication
 * @class IntegrationsController
 */
@Controller('integrations')
@ApiTags('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  /**
   * POST /integrations/meeting-data
   * Adds meeting data to the database
   */
  @Post('meeting-data')
  async addMeetingData(
    @Headers('x-api-key') apiKey: string,
    @Body() meetingData: MeetingDataDto,
  ) {
    if (apiKey !== process.env.DEVTOOLS_SECRET) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.integrationsService.addMeetingData(meetingData);
  }

  /**
   * GET /integrations/stories/:projectName
   * Fetches project user stories
   */
  @Get('stories/:projectName')
  async getUserStoriesByProjectName(
    @Param('projectName') projectName: string,
    @Headers('x-api-key') apiKey: string,
  ) {
    if (apiKey !== process.env.DEVTOOLS_SECRET) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.integrationsService.getUserStoriesByProjectName(projectName);
  }
  @Get('user-stories/:projectName')
  @UseGuards(JWTAuthGuard)
  async getUserStoriesByProjectName2(
    @Param('projectName') projectName: string,
  ) {
    return this.integrationsService.getUserStoriesByProjectName(projectName);
  }
  /**
   * GET /integrations/tasks/:projectName
   * Fetches tasks for a project
   */
  @Get('tasks/:projectName')
  async getTasksByProjectName(
    @Param('projectName') projectName: string,
    @Headers('x-api-key') apiKey: string,
  ) {
    if (apiKey !== process.env.DEVTOOLS_SECRET) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.integrationsService.getTasksByProjectName(projectName);
  }
  /**
   * GET /integrations/bugs/:projectName
   * Fetches tasks for a project
   */
  @Get('bugs/:projectName')
  async getBugsByProjectName(
    @Param('projectName') projectName: string,
    @Headers('x-api-key') apiKey: string,
  ) {
    if (apiKey !== process.env.DEVTOOLS_SECRET) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.integrationsService.getBugsByProjectName(projectName);
  }
  /**
   * GET /integrations/mom/:projectName
   * Fetches tasks for a project
   */
  @Get('mom/:projectName')
  async getMomByProjectName(
    @Param('projectName') projectName: string,
    @Headers('x-api-key') apiKey: string,
  ) {
    if (apiKey !== process.env.DEVTOOLS_SECRET) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.integrationsService.getMomByProjectName(projectName);
  }
  /**
   * GET /integrations/projects/:userEmail
   * Lists all projects for a user
   */
  @Get('projects/:userEmail')
  async getProjectsByUserEmail(
    @Param('userEmail') userEmail: string,
    @Headers('x-api-key') apiKey: string,
  ) {
    if (apiKey !== process.env.DEVTOOLS_SECRET) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.integrationsService.getProjectsByUserEmail(userEmail);
  }

  @Get('stories/byId/:id')
  async getStoryById(@Param('id') id: string) {
    return this.integrationsService.getStoryById(id);
  }

  @Get('bugs/byId/:id')
  async getBugById(@Param('id') id: string) {
    return this.integrationsService.getBugById(id);
  }

  @Get('meetings/byId/:id')
  async getMeetingById(@Param('id') id: string) {
    return this.integrationsService.getMeetingById(id);
  }

  @Get('wikis/byId/:id')
  async getWikiById(@Param('id') id: string) {
    return this.integrationsService.getWikiById(id);
  }

  @Get('tasks/byId/:id')
  async getTaskById(@Param('id') id: string) {
    return this.integrationsService.getTaskById(id);
  }

  /**
   * PATCH /integrations/stories/:projectName/:storyId/status
   * Updates story status
   */
  @Patch('stories/:projectName/:storyId/status')
  async updateStoryStatus(
    @Param('projectName') projectName: string,
    @Param('storyId') storyId: string,
    @Body() updateStoryStatusDto: UpdateStoryStatusDto,
    @Headers('x-api-key') apiKey: string,
  ) {
    if (apiKey !== process.env.DEVTOOLS_SECRET) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.integrationsService.updateStoryStatus(
      projectName,
      storyId,
      updateStoryStatusDto.status,
    );
  }

  /**
   * POST /integrations/testing-data
   * Adds test results to the database
   */
  @Post('testing-data')
  async addTestingData(@Body() testingData: TestingDataDto) {
    return this.integrationsService.addTestingData(testingData);
  }
  /**
   * POST /integrations/testing-data/coverage
   * Adds test coverage to the database
   */
  @Post('testing-data/coverage')
  async addTestingCoverageData(@Body() testingData: CoverageDataDto) {
    return this.integrationsService.addTestingCoverageData(testingData);
  }

  @Get('testing-data/:projectId/:type')
  async getTestingData(
    @Param('projectId') projectId: string,
    @Param('type') type: 'jest' | 'cypress' | 'coverage',
  ) {
    return this.integrationsService.getTestingData(projectId, type);
  }

  @Post('enhance-prompt')
  async enhancePrompt(@Body() dto: EnhancePromptDto) {
    return this.integrationsService.enhancePrompt(dto);
  }
}
