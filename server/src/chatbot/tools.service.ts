/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { getFetchMeetingDetailsByIdTool } from './tools/fetchMeetingDetailsById.tool';
import { getFetchWikiDetailsByIdTool } from './tools/fetchWikiDetailsById.tool';
import { getFindMeetingListTool } from './tools/findMeetting.tool';
import { getFindWikiListTool } from './tools/findWiki.tool';
import { getFetchSprintDetailsByIdTool } from './tools/fetchSprintDetailsById.tool';
import { RagService } from 'src/rag/rag.service';
import { getSemanticSearchTool } from './tools/semanticSearchById.tool';
import { getFetchTaskDetailByIdTool } from './tools/fetchTaskDetailById.tool';
import { getDocumentationMCPTools } from './tools/documentation.tool';
import { getGitIngestMCPTools } from './tools/gitingest.tool';
import { getGitHubTools } from './tools/github.tool';
@Injectable()
export class ToolsService implements OnModuleInit {
  private docTools: any; //TODO: add explicit type
  private gitIngestTools: any;
  private githubTools: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ragService: RagService,
  ) {}

  async onModuleInit() {
    try {
      this.docTools = await getDocumentationMCPTools();
      console.log('Documentation MCP tools initialized successfully');
    } catch (error) {
      console.error('Failed to initialize documentation MCP tools:', error);
      this.docTools = {};
    }

    try {
      this.gitIngestTools = await getGitIngestMCPTools();
      console.log('Git ingest MCP tools initialized successfully');
    } catch (error) {
      console.error('Failed to initialize git ingest MCP tools:', error);
      this.gitIngestTools = {};
    }

    try {
      this.githubTools = getGitHubTools();
      console.log('GitHub tools initialized successfully');
    } catch (error) {
      console.error('Failed to initialize GitHub tools:', error);
      this.githubTools = {};
    }
  }

  getTools() {
    const baseTools = {
      semanticSearch: getSemanticSearchTool(this.prisma, this.ragService),
      fetchMeetingDetailsById: getFetchMeetingDetailsByIdTool(this.prisma),
      findWikiList: getFindWikiListTool(this.prisma),
      findMeetingList: getFindMeetingListTool(this.prisma),
      fetchWikiDetailsById: getFetchWikiDetailsByIdTool(this.prisma),
      fetchSprintDetailsById: getFetchSprintDetailsByIdTool(this.prisma),
      fetchTaskDetailById: getFetchTaskDetailByIdTool(this.prisma),
    };

    return {
      ...baseTools,
      ...(this.docTools || {}),
      ...(this.gitIngestTools || {}),
      ...(this.githubTools || {}),
    };
  }
}
