import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [UsersController, AdminController],
  providers: [UsersService, AdminService],
  exports: [UsersService, AdminService],
})
export class UsersModule {}
