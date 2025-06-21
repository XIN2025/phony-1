import { Module } from '@nestjs/common';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [PrismaModule],
  controllers: [WaitlistController],
  providers: [WaitlistService, MailService],
  exports: [WaitlistService],
})
export class WaitlistModule {}
