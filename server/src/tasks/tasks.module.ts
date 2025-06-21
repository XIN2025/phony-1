import { Module } from '@nestjs/common';
import { HelperService } from 'src/helper/helper.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { MailService } from 'src/mail/mail.service';
import { AnalyticsModule } from 'src/analytics/analytics.module';

@Module({
  imports: [AnalyticsModule],
  controllers: [TasksController],
  exports: [TasksService],
  providers: [PrismaService, HelperService, TasksService, MailService],
})
export class TasksModule {}
