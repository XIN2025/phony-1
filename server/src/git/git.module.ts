import { Module } from '@nestjs/common';
import { GitService } from './git.service';
import { GitController } from './git.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { EncryptionService } from 'src/utils/encrypt.service';

@Module({
  controllers: [GitController],
  providers: [GitService, PrismaService, EncryptionService],
})
export class GitModule {}
