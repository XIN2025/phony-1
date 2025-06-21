import { Module } from '@nestjs/common';
import { WorklogController } from './worklog.controller';
import { WorklogService } from './worklog.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [WorklogController],
  providers: [WorklogService, PrismaService],
  exports: [WorklogService],
})
export class WorklogModule {}
