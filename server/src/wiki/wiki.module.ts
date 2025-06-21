import { Module } from '@nestjs/common';
import { WikiController } from './wiki.controller';
import { WikiService } from './wiki.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [PrismaModule],
  controllers: [WikiController],
  providers: [WikiService, MailService],
  exports: [WikiService],
})
export class WikiModule {}
