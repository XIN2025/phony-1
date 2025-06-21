import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from 'ai';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateConversation(
    projectId: string,
    userId: string,
    conversationId?: string,
  ) {
    if (conversationId) {
      const conversation = await this.prisma.chat_conversations.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      });

      if (
        conversation &&
        conversation.project_id === projectId &&
        conversation.user_id === userId
      ) {
        return conversation;
      }
    }

    return await this.prisma.chat_conversations.create({
      data: {
        project_id: projectId,
        user_id: userId,
        title: null,
      },
      include: { messages: true },
    });
  }

  async saveMessage(
    conversationId: string,
    role: string,
    content: string,
    toolCalls?: any,
    toolResults?: any,
  ) {
    return await this.prisma.chat_messages.create({
      data: {
        conversation_id: conversationId,
        role,
        content,
        tool_calls: toolCalls,
        tool_results: toolResults,
      },
    });
  }

  async getConversationContext(
    conversationId: string,
    maxMessages: number = 20,
  ): Promise<Message[]> {
    const messages = await this.prisma.chat_messages.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'asc' },
      take: maxMessages,
    });

    return messages.map((msg) => ({
      id: msg.id,
      role: msg.role as any,
      content: msg.content,
      toolInvocations: msg.tool_calls ? (msg.tool_calls as any) : undefined,
    }));
  }

  async updateConversationTitle(conversationId: string, title: string) {
    return await this.prisma.chat_conversations.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  async generateConversationTitle(firstMessage: string): Promise<string> {
    const title =
      firstMessage.length > 50
        ? firstMessage.substring(0, 47) + '...'
        : firstMessage;

    return title;
  }

  async getConversationsByProject(projectId: string, userId: string) {
    return await this.prisma.chat_conversations.findMany({
      where: {
        project_id: projectId,
        user_id: userId,
      },
      orderBy: { updated_at: 'desc' },
      select: {
        id: true,
        title: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.chat_conversations.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.user_id !== userId) {
      throw new Error('Conversation not found or access denied');
    }

    return await this.prisma.chat_conversations.delete({
      where: { id: conversationId },
    });
  }

  async getRecentMessages(
    conversationId: string,
    limit: number = 15,
  ): Promise<Message[]> {
    const messages = await this.prisma.chat_messages.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    return messages.reverse().map((msg) => ({
      id: msg.id,
      role: msg.role as any,
      content: msg.content,
      toolInvocations: msg.tool_calls ? (msg.tool_calls as any) : undefined,
    }));
  }

  async getConversationWithContext(conversationId: string, userId: string) {
    const conversation = await this.prisma.chat_conversations.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { created_at: 'asc' },
          take: 20,
        },
      },
    });

    if (!conversation || conversation.user_id !== userId) {
      throw new Error('Conversation not found or access denied');
    }

    return conversation;
  }
}
