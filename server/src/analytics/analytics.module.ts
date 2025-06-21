import { Module } from '@nestjs/common';
import { UserStoriesAnalyticsService } from './user-stories-analytics.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [UserStoriesAnalyticsService, PrismaService],
  exports: [UserStoriesAnalyticsService],
})
export class AnalyticsModule {}
