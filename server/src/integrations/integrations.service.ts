import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StoryStatus } from './dto/update-story-status.dto';
import { project_resources } from '@prisma/client';
import { MeetingDataDto } from './dto/meeting-data';
import { ProjectUtils } from 'src/utils/development/utils.service';
import { CoverageDataDto, TestingDataDto } from './dto/testing-data.dto';
import { InputJsonValue } from '@prisma/client/runtime/library';
import xml2js from 'xml2js';
import { EnhancePromptDto } from './dto/enhance-prompt';
import {
  boltPrompt,
  lovablePrompt,
  replitPrompt,
} from './prompts/enhancePrompt';
import { ModelType } from 'src/common/enums/ModelType.enum';
import { prompts } from 'src/common/prompts';
import { generateObjectAI } from 'src/common/utils/llm.util';
import { z } from 'zod';

interface CoverageMetrics {
  coveredstatements: number;
  statements: number;
  coveredmethods: number;
  methods: number;
  coveredconditionals: number;
  conditionals: number;
}

interface FileCoverage {
  name: string;
  path: string;
  statements: CoverageStats;
  functions: CoverageStats;
  branches: CoverageStats;
  lines: CoverageStats;
}

interface CoverageStats {
  covered: number;
  total: number;
  percentage: number;
}
/**
 * Service handling project integrations and data retrieval
 * @class IntegrationsService
 */
@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly projectUtils: ProjectUtils,
  ) {}

  /**
   * Adds meeting data to the database
   * @param meetingLink - The meeting link
   * @param transcript - The transcript of the meeting
   * @param summary - The summary of the meeting
   */
  async addMeetingData(meetingData: MeetingDataDto) {
    const { transcript, metadata } = meetingData;
    const meetingLink = meetingData.meetingLink.split('?')[0];
    // Fetch projects with the given meeting link
    const resources = await this.prismaService.project_resources.findMany({
      where: {
        resource_url: meetingLink,
        resource_type: 'meeting',
        isActive: true,
      },
    });

    if (resources.length === 0) {
      throw new NotFoundException('Resources  not found');
    }
    // group resources by project
    const resourcesByProject = resources.reduce((acc, resource) => {
      const project = acc.get(resource.project_id);
      if (!project) {
        acc.set(resource.project_id, resource);
      }
      return acc;
    }, new Map<string, project_resources>());

    const res = await generateObjectAI({
      model: ModelType.GEMINI_2_0_FLASH,
      system: prompts.getMeetingSummaryPrompt(),
      prompt: `Transcript: \n${transcript}`,
      schema: z.object({
        summary: z.string(),
        title: z.string(),
      }),
    });

    for (const [projectId, resource] of resourcesByProject.entries()) {
      await this.prismaService.meeting_data.create({
        data: {
          project_id: projectId,
          resource_id: resource.id,
          transcript: transcript,
          metadata: metadata,
          summary: res.summary,
          title: res.title,
          createdBy: meetingData.createdBy,
        },
      });
    }
  }

  /**
   * Fetches active user stories for a project
   * @param projectName - Project's unique identifier
   * @returns Stories excluding 'Done' status
   */
  async getUserStoriesByProjectName(projectName: string) {
    const project = await this.prismaService.projects.findUnique({
      where: { unique_name: projectName },
    });
    return this.prismaService.story.findMany({
      where: {
        project_id: project.id,
        sprint_id: { not: null },
        status: {
          notIn: ['Done'],
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        estimation: true,
        priority: true,
        acceptance_criteria: true,
        db_schema_prompt: true,
        api_prompt: true,
        ui_prompt: true,
      },
    });
  }

  /**
   * Retrieves all projects associated with a user
   * @param userEmail - User's email address
   * @returns Project details including title, category, and requirements
   */
  async getProjectsByUserEmail(userEmail: string) {
    return this.prismaService.projects.findMany({
      where: {
        project_members: {
          some: {
            user_email: userEmail,
          },
        },
      },
      select: {
        id: true,
        title: true,
        unique_name: true,
        client_requirements: true,
      },
    });
  }

  async getStoryById(id: string) {
    console.log(id);
    return this.prismaService.story.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });
  }

  async getBugById(id: string) {
    return this.prismaService.project_bugs.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        summary: true,
      },
    });
  }

  async getMeetingById(id: string) {
    return this.prismaService.meeting_data.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        metadata: true,
      },
    });
  }

  async getWikiById(id: string) {
    return this.prismaService.project_wiki.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
      },
    });
  }

  async getTaskById(id: string) {
    return this.prismaService.task.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
      },
    });
  }

  /**
   * Updates story status
   */
  async updateStoryStatus(
    projectName: string,
    storyId: string,
    status: StoryStatus,
  ) {
    const project = await this.prismaService.projects.findUnique({
      where: { unique_name: projectName },
    });

    return this.prismaService.story.update({
      where: {
        id: storyId,
        project_id: project.id,
      },
      data: { status },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });
  }

  async getTasksByProjectName(projectName: string) {
    return this.prismaService.task.findMany({
      where: {
        project: {
          unique_name: projectName,
        },
        sprint_id: { not: null },
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
      },
    });
  }
  async getBugsByProjectName(projectName: string) {
    return this.prismaService.project_bugs.findMany({
      where: {
        project: {
          unique_name: projectName,
        },
        status: {
          notIn: ['CLOSED'],
        },
      },
    });
  }
  async getMomByProjectName(projectName: string) {
    return this.prismaService.meeting_data.findMany({
      where: {
        projects: {
          unique_name: projectName,
        },
      },
      select: {
        id: true,
        metadata: true,
        title: true,
        resources: {
          select: {
            resource_name: true,
            resource_url: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Adds test results to the database
   */
  async addTestingData(testingData: TestingDataDto) {
    const { type, projectName, testResults } = testingData;

    const project = await this.prismaService.projects.findUnique({
      where: { unique_name: projectName },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prismaService.testing_data.create({
      data: {
        project_id: project.id,
        type,
        testResults: testResults as unknown as InputJsonValue[],
      },
    });
  }

  async addTestingCoverageData(coverageData: CoverageDataDto) {
    const { projectName, content } = coverageData;

    const project = await this.prismaService.projects.findUnique({
      where: { unique_name: projectName },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const testResults = await this.processCoverageData(content);
    return this.prismaService.testing_data.create({
      data: { project_id: project.id, type: 'coverage', testResults },
    });
  }

  private calculateCoveragePercentage(covered: number, total: number): number {
    return total ? (covered / total) * 100 : 0;
  }

  private processFileMetrics(file: {
    name: string;
    path: string;
    metrics: CoverageMetrics;
  }): FileCoverage {
    const { metrics } = file;

    return {
      name: file.name,
      path: file.path,
      statements: {
        covered: metrics.coveredstatements,
        total: metrics.statements,
        percentage: this.calculateCoveragePercentage(
          metrics.coveredstatements,
          metrics.statements,
        ),
      },
      functions: {
        covered: metrics.coveredmethods,
        total: metrics.methods,
        percentage: this.calculateCoveragePercentage(
          metrics.coveredmethods,
          metrics.methods,
        ),
      },
      branches: {
        covered: metrics.coveredconditionals,
        total: metrics.conditionals,
        percentage: this.calculateCoveragePercentage(
          metrics.coveredconditionals,
          metrics.conditionals,
        ),
      },
      lines: {
        covered: metrics.coveredstatements,
        total: metrics.statements,
        percentage: this.calculateCoveragePercentage(
          metrics.coveredstatements,
          metrics.statements,
        ),
      },
    };
  }

  private async processCoverageData(
    content: string,
  ): Promise<InputJsonValue[]> {
    try {
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: true,
        valueProcessors: [
          (value) => (isNaN(Number(value)) ? value : Number(value)),
        ],
      });

      const result = await parser.parseStringPromise(content);
      const packages = result.coverage.project.package;
      const coverageData: FileCoverage[] = [];

      if (packages) {
        const packageArray = Array.isArray(packages) ? packages : [packages];

        packageArray.forEach((pkg) => {
          const files = Array.isArray(pkg.file) ? pkg.file : [pkg.file];
          files.forEach((file) => {
            if (!file || !file.metrics) return;
            coverageData.push(this.processFileMetrics(file));
          });
        });
      }

      return coverageData as unknown as InputJsonValue[];
    } catch (error) {
      this.logger.error('Failed to process coverage data:', error);
      throw new Error('Failed to process coverage data');
    }
  }

  async getTestingData(
    projectId: string,
    type: 'jest' | 'cypress' | 'coverage',
  ) {
    return this.prismaService.testing_data.findMany({
      where: {
        project_id: projectId,
        type: type,
      },
      orderBy: { created_at: 'desc' },
    });
  }
  async enhancePrompt(dto: EnhancePromptDto) {
    const { currentPrompt, codeContext, url } = dto;
    const domain = new URL(url).hostname;
    const prompt = this.getPrompt(domain, codeContext, currentPrompt);
    const res = await generateObjectAI({
      model: ModelType.GEMINI_2_0_FLASH,
      system: prompt,
      prompt: `Current Prompt: ${currentPrompt}, enhance it to be more descriptive and detailed`,
      schema: z.object({
        enhanced_prompt: z.string(),
      }),
    });
    return res;
  }
  private getPrompt(domain: string, codeContext: string, userPrompt: string) {
    switch (domain) {
      case 'replit.com':
        return replitPrompt(codeContext, userPrompt);
      case 'bolt.new':
        return boltPrompt(codeContext, userPrompt);
      case 'lovable.dev':
        return lovablePrompt(codeContext, userPrompt);
      default:
        throw new NotFoundException('Prompt not found');
    }
  }
}
