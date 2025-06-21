import {
  Controller,
  Get,
  UseGuards,
  Param,
  Query,
  Post,
  Body,
} from '@nestjs/common';
import { GitService } from './git.service';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser, RequestUser } from 'src/auth/decorators/user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { mapToGithubRepoDto } from 'src/project/dtos/ProjectDto.dto';
import { ConnectGithubRepoDto, GetOrgsReposQueryDto } from './dtos/github.dto';

@Controller('github')
@ApiTags('Github')
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class GitController {
  constructor(private readonly gitService: GitService) {}

  @Get('status')
  async getGithubStatus(@GetUser() user: RequestUser) {
    return await this.gitService.getGithubStatus(user.id);
  }

  @Get('owners')
  async getGithubOwners(@GetUser() user: RequestUser) {
    return await this.gitService.getGithubOrgs(user.id);
  }

  @Get(':owner/repos')
  async getGithubRepos(
    @GetUser() user: RequestUser,
    @Param('owner') owner: string,
    @Query() query: GetOrgsReposQueryDto,
  ) {
    return await this.gitService.getGithubRepos(
      user.id,
      owner,
      query.ownerType || 'User',
      query.page || 1,
    );
  }

  @Get(':owner/:repo/check')
  async checkGithubRepositoryAvailability(
    @GetUser() user: RequestUser,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return await this.gitService.checkGithubRepositoryAvailability(
      user.id,
      owner,
      repo,
    );
  }

  @Get(':owner/:repo/branches')
  async getGithubBranches(
    @GetUser() user: RequestUser,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return await this.gitService.getGithubBranches(user.id, owner, repo);
  }

  @Post(':projectId/createCodespace')
  async createCodespace(
    @GetUser() user: RequestUser,
    @Param('projectId') projectId: string,
  ) {
    return await this.gitService.createCodeSpace(user.id, projectId);
  }

  @Post('connect')
  async connectGithubRepo(@Body() connectGithubRepoDto: ConnectGithubRepoDto) {
    const repo = await this.gitService.connectRepo(connectGithubRepoDto);
    return mapToGithubRepoDto(repo);
  }

  @Get('repo/:projectId')
  async getGithubRepoByProjectId(@Param('projectId') projectId: string) {
    return mapToGithubRepoDto(
      await this.gitService.getGithubRepoByProjectId(projectId),
    );
  }
}
