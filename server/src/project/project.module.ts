import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectService } from './project.service';
import { MailService } from 'src/mail/mail.service';
import { TextExtractorService } from 'src/text-extractor/text-extractor.service';
import { HelperService } from 'src/helper/helper.service';
import { GitService } from 'src/git/git.service';
import { ProjectUtils } from 'src/utils/development/utils.service';
import { EncryptionService } from 'src/utils/encrypt.service';
import { ProjectSprintService } from './project-sprint.service';
import { ProjectMemberService } from './project-member.service';
import { ProjectSummaryService } from 'src/helper/project-summary.service';
import { MonitoringService } from './monitoring.service';
import { TasksModule } from 'src/tasks/tasks.module';
import { ProjectTranscriptionService } from './project-transcription.service';
import { MeetingDataService } from 'src/meeting-data/meeting-data.service';
import { DeepgramService } from 'src/utils/deepgram.service';
import { S3Service } from 'src/utils/s3.service';
import { RagService } from 'src/rag/rag.service';

@Module({
  imports: [TasksModule],
  controllers: [ProjectController],
  providers: [
    PrismaService,
    ProjectService,
    MailService,
    TextExtractorService,
    HelperService,
    GitService,
    MonitoringService,
    EncryptionService,
    ProjectUtils,
    ProjectSprintService,
    ProjectMemberService,
    ProjectSummaryService,
    ProjectTranscriptionService,
    MeetingDataService,
    DeepgramService,
    S3Service,
    RagService,
  ],
})
export class ProjectModule {}
