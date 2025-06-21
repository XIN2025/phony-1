import { Injectable } from '@nestjs/common';
import { RequestUser } from 'src/auth/decorators/user.decorator';
import { Response } from 'express';
import { ChatBotMessageDto } from './dto/chatbot-message.dto';
import { smoothStream, streamText } from 'ai';
import { pipeDataStreamToResponse } from 'ai';
import { getLLM } from 'src/common/utils/llm.util';
import { ModelType } from 'src/common/enums/ModelType.enum';
import { prompts } from 'src/common/prompts';
import { ToolsService } from './tools.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeploymentTrackingService } from './deployment-tracking.service';
import { ConversationService } from './conversation.service';

@Injectable()
export class ChatbotService {
  private readonly MAX_CHAT_MESSAGES_HISTORY = 15;
  constructor(
    private readonly toolsService: ToolsService,
    private readonly prisma: PrismaService,
    private readonly deploymentTrackingService: DeploymentTrackingService,
    private readonly conversationService: ConversationService,
  ) {}

  async processMessage(
    messageDto: ChatBotMessageDto,
    user: RequestUser,
    res: Response,
  ) {
    const project = await this.prisma.projects.findUnique({
      where: { unique_name: messageDto.projectName },
    });
    if (!project) {
      throw new Error('Project not found');
    }

    const conversation = await this.conversationService.getOrCreateConversation(
      project.id,
      user.id,
      messageDto.conversationId,
    );

    await this.conversationService.saveMessage(
      conversation.id,
      messageDto.role || 'user',
      messageDto.content,
    );

    if (!conversation.title) {
      const title = await this.conversationService.generateConversationTitle(
        messageDto.content,
      );
      await this.conversationService.updateConversationTitle(
        conversation.id,
        title,
      );
    }

    const messages = await this.conversationService.getRecentMessages(
      conversation.id,
      this.MAX_CHAT_MESSAGES_HISTORY,
    );

    pipeDataStreamToResponse(res, {
      execute: (dataStreamWriter) => {
        const result = streamText({
          model: getLLM(ModelType.GPT_4_1),
          messages,
          maxSteps: 25,
          system: prompts.getChatbotPrompt(),
          tools: this.toolsService.getTools(),
          toolCallStreaming: true,
          experimental_transform: smoothStream({ chunking: 'word' }),
          onStepFinish: async ({ toolCalls, toolResults, text }) => {
            if (text) {
              await this.conversationService.saveMessage(
                conversation.id,
                'assistant',
                text,
                toolCalls,
                toolResults,
              );
            }
          },
        });

        result.mergeIntoDataStream(dataStreamWriter);
      },
      onError: (error) => {
        return error instanceof Error ? error.message : String(error);
      },
    });
  }
}
