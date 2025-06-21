import { Module } from '@nestjs/common';
import { BugsService } from './bugs.service';
import { S3Service } from 'src/utils/s3.service';
import { BugsController } from './bugs.controller';
import { DeepgramService } from 'src/utils/deepgram.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
@Module({
  imports: [PrismaModule, MailModule],
  providers: [BugsService, S3Service, DeepgramService],
  controllers: [BugsController],
})
export class BugsModule {}
