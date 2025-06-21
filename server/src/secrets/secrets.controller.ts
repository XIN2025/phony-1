import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SecretsService } from './secrets.service';
import {
  CreateEnvironmentDto,
  UpdateSecretsDto,
} from './dto/create-environment.dto';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { RequestUser } from 'src/auth/decorators/user.decorator';
import { GetUser } from 'src/auth/decorators/user.decorator';
@Controller('secrets')
@UseGuards(JWTAuthGuard)
@ApiTags('Secrets')
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) {}

  @Get('environmentsByProject/:projectId')
  getEnvironmentsByProject(@Param('projectId') projectId: string) {
    return this.secretsService.getEnvironmentsByProject(projectId);
  }

  @Post('environments')
  createEnvironment(
    @Body() createEnvironmentDto: CreateEnvironmentDto,
    @GetUser() user: RequestUser,
  ) {
    return this.secretsService.createEnvironment(
      createEnvironmentDto,
      user.email,
    );
  }

  @Delete('environments/:environmentId')
  deleteEnvironment(
    @Param('environmentId') environmentId: string,
    @GetUser() user: RequestUser,
  ) {
    return this.secretsService.deleteEnvironment(environmentId, user.id);
  }

  @Put('environments/:environmentId')
  updateSecrets(
    @Param('environmentId') environmentId: string,
    @Body() updateSecretsDto: UpdateSecretsDto,
    @GetUser() user: RequestUser,
  ) {
    return this.secretsService.updateSecrets(
      environmentId,
      updateSecretsDto,
      user.id,
    );
  }

  @Get('environments/:environmentId/versions')
  getVersions(@Param('environmentId') environmentId: string) {
    return this.secretsService.getVersions(environmentId);
  }

  @Get('environments/:environmentId/versions/latest')
  getLatestVersion(@Param('environmentId') environmentId: string) {
    return this.secretsService.getLatestVersion(environmentId);
  }

  @Get('environments/:environmentId/versions/:versionNumber')
  getSpecificVersion(
    @Param('environmentId') environmentId: string,
    @Param('versionNumber') versionNumber: string,
  ) {
    return this.secretsService.getSpecificVersion(
      environmentId,
      parseInt(versionNumber, 10),
    );
  }
}
