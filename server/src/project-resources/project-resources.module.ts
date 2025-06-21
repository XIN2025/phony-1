import { Module } from '@nestjs/common';
import { ProjectResourcesController } from './project-resources.controller';
import { ProjectResourcesService } from './project-resources.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { SchedulerService } from 'src/helper/scheduler.service';
@Module({
  controllers: [ProjectResourcesController],
  providers: [
    ProjectResourcesService,
    PrismaService,
    MailService,
    SchedulerService,
  ],
})
export class ProjectResourcesModule {}
