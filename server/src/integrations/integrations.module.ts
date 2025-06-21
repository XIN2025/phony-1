import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectUtils } from 'src/utils/development/utils.service';

@Module({
  imports: [PrismaModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, ProjectUtils],
})
export class IntegrationsModule {}
