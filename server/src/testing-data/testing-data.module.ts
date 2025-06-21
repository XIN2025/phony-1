import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TestingDataController } from './testing-data.controller';
import { TestingDataService } from './testing-data.service';

@Module({
  controllers: [TestingDataController],
  providers: [TestingDataService, PrismaService],
})
export class TestingDataModule {}
