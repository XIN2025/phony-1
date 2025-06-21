import { Controller, Post, Param, Body, Sse, UseGuards } from '@nestjs/common';
import { CicdService } from './cicd.service';
import {
  CreateVmDto,
  mapToCicdDto,
  mapToCicdUserOnlyDto,
} from './dtos/cicd.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { interval, Observable, startWith, switchMap } from 'rxjs';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Cicd')
@Controller('cicd')
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class CicdController {
  constructor(private readonly cicdService: CicdService) {}

  @Post('create-vm')
  async createVm(@Body() createVmDto: CreateVmDto): Promise<boolean> {
    this.cicdService.createVm(createVmDto);
    return true;
  }

  @Post('deploy/:projectId')
  async deploy(@Param('projectId') projectId: string): Promise<boolean> {
    await this.cicdService.deploy(projectId);
    return true;
  }
  @Sse('/:projectId/status')
  getDeploymentSSE(
    @Param('projectId') projectId: string,
  ): Observable<MessageEvent> {
    return interval(3000).pipe(
      startWith(0),
      switchMap(async () => {
        const cicd = await this.cicdService.getCicd(projectId);
        if (!cicd) {
          return new MessageEvent('message', {
            data: { type: 'setup_pending', data: 'Project not found' },
          });
        }
        const mappedCicd = mapToCicdDto(cicd);
        const mappedCicdUserOnly = mapToCicdUserOnlyDto(cicd);

        const response = !mappedCicd
          ? { type: 'error', data: 'Project not found' }
          : mappedCicd.status === 'null' || mappedCicd.status === null
            ? { type: 'setup_pending', data: mappedCicdUserOnly }
            : mappedCicd.status === 'setup_pending'
              ? { type: 'setup_pending', data: mappedCicdUserOnly }
              : mappedCicd.status === 'deploying'
                ? { type: 'in_progress', data: mappedCicdUserOnly }
                : mappedCicd.status === 'failed'
                  ? { type: 'failed', data: mappedCicdUserOnly }
                  : mappedCicd.status === 'success'
                    ? { type: 'success', data: mappedCicdUserOnly }
                    : { type: 'pending', data: mappedCicdUserOnly };

        return new MessageEvent('message', { data: response });
      }),
    );
  }
}
