import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CicdController } from './cicd.controller';
import { CicdService } from './cicd.service';
import { FeatureFlagsModule } from 'src/feature-flags/feature-flags.module';

@Module({
  imports: [FeatureFlagsModule],
  controllers: [CicdController],
  providers: [CicdService, PrismaService],
})
export class CicdModule {}
