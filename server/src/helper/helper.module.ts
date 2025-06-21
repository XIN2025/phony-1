import { Module } from '@nestjs/common';
import { HelperService } from './helper.service';
import { HelperController } from './helper.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectSummaryService } from './project-summary.service';
import { MailService } from 'src/mail/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';

@Module({
  imports: [ConfigModule],
  controllers: [HelperController],
  providers: [
    HelperService,
    PrismaService,
    ProjectSummaryService,
    MailService,
    ConfigService,
    NotificationService,
  ],
})
export class HelperModule {}
