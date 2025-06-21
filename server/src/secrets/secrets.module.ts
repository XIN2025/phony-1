import { Module } from '@nestjs/common';
import { SecretsController } from './secrets.controller';
import { SecretsService } from './secrets.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../utils/encrypt.service';

@Module({
  imports: [PrismaModule],
  controllers: [SecretsController],
  providers: [SecretsService, EncryptionService, PrismaService],
})
export class SecretsModule {}
