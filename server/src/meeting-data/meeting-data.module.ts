import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MeetingDataController } from './meeting-data.controller';
import { MeetingDataService } from './meeting-data.service';
import { TextExtractorService } from 'src/text-extractor/text-extractor.service';
import { HelperService } from 'src/helper/helper.service';
import { MailService } from 'src/mail/mail.service';
import { RagModule } from 'src/rag/rag.module';

@Module({
  controllers: [MeetingDataController],
  imports: [RagModule],
  providers: [
    MeetingDataService,
    PrismaService,
    TextExtractorService,
    HelperService,
    MailService,
  ],
})
export class MeetingDataModule {}
