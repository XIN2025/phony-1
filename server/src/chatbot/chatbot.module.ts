import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ToolsService } from './tools.service';
import { RagService } from 'src/rag/rag.service';
import { DeploymentTrackingService } from './deployment-tracking.service';
import { ConversationService } from './conversation.service';

@Module({
  imports: [PrismaModule],
  controllers: [ChatbotController],
  providers: [
    ChatbotService,
    ToolsService,
    RagService,
    DeploymentTrackingService,
    ConversationService,
  ],
})
export class ChatbotModule {}
