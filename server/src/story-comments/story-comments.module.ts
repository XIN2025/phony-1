import { Module } from '@nestjs/common';
import { StoryCommentsController } from './story-comments.controller';
import { StoryCommentsService } from './story-comments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [PrismaModule],
  controllers: [StoryCommentsController],
  providers: [StoryCommentsService, MailService],
  exports: [StoryCommentsService],
})
export class StoryCommentsModule {}
