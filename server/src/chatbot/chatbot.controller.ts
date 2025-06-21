import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { RagService } from 'src/rag/rag.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChatBotQueryDto } from './dto/chatbot-query.dto';
import { ChatBotMessageDto } from './dto/chatbot-message.dto';
import { ChatBotGenerateEmbeddingDto } from './dto/chatbot.dto';
import { Response } from 'express';
import { GetUser, RequestUser } from 'src/auth/decorators/user.decorator';

@Controller('chatbot')
@ApiTags('Chatbot')
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class ChatbotController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly chatbotService: ChatbotService,
    private readonly ragService: RagService,
  ) {}

  @Post('create-conversation')
  async createConversation(
    @Body() body: { projectName: string },
    @GetUser() user: RequestUser,
  ) {
    const project = await this.prismaService.projects.findUnique({
      where: { unique_name: body.projectName },
    });
    if (!project) {
      return { error: 'Project not found' };
    }

    const conversation = await this.prismaService.chat_conversations.create({
      data: {
        project_id: project.id,
        user_id: user.id,
        title: null,
      },
    });

    return { conversationId: conversation.id };
  }

  @Post('send-message')
  async processMessage(
    @Body() messageDto: ChatBotMessageDto,
    @GetUser() user: RequestUser,
    @Res() res: Response,
  ) {
    return this.chatbotService.processMessage(messageDto, user, res);
  }

  @Post('send-message-legacy')
  async processQuery(
    @Body() queryDto: ChatBotQueryDto,
    @GetUser() user: RequestUser,
    @Res() res: Response,
  ) {
    const lastMessage = queryDto.messages[queryDto.messages.length - 1];
    const messageDto: ChatBotMessageDto = {
      content: lastMessage.content,
      projectName: queryDto.projectName,
      role: lastMessage.role,
    };
    return this.chatbotService.processMessage(messageDto, user, res);
  }

  @Post('generate-embedding')
  async generateEmbedding(
    @Body() chatBotGenerateEmbeddingDto: ChatBotGenerateEmbeddingDto,
  ) {
    try {
      const project = await this.prismaService.projects.findUnique({
        where: {
          unique_name: chatBotGenerateEmbeddingDto.projectName,
        },
      });
      if (!project) {
        return { error: 'Project not found' };
      }

      const wikis = await this.prismaService.project_wiki.findMany({
        where: {
          project_id: project.id,
        },
      });

      const meetings = await this.prismaService.meeting_data.findMany({
        where: {
          project_id: project.id,
        },
      });

      const tasks = await this.prismaService.task.findMany({
        where: {
          project_id: project.id,
        },
      });

      const stories = await this.prismaService.story.findMany({
        where: {
          project_id: project.id,
        },
      });

      if (wikis && wikis.length > 0) {
        await Promise.all(
          wikis.map(async (wiki) => {
            this.ragService.embedAndStoreWiki(wiki);
          }),
        );
      }

      if (meetings && meetings.length > 0) {
        await Promise.all(
          meetings.map(async (meeting) => {
            this.ragService.embedAndStoreMeeting(meeting);
          }),
        );
      }
      if (tasks && tasks.length > 0) {
        await Promise.all(
          tasks.map(async (task) => {
            this.ragService.embedAndStoreTask(task);
          }),
        );
      }
      if (stories && stories.length > 0) {
        await Promise.all(
          stories.map(async (story) => {
            this.ragService.embedAndStoreStory(story);
          }),
        );
      }
      return { message: 'Embeddings generated successfully' };
    } catch (error) {
      console.error('Error generating embedding:', error);
      return { error: 'Failed to generate embedding' };
    }
  }
}
