import { Injectable, Logger } from '@nestjs/common';
import { GenerationStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { customsearch_v1 } from '@googleapis/customsearch';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface SearchOptions {
  query: string;
  limit?: number;
  startIndex?: number;
  language?: string;
  countryCode?: string;
  safeSearch?: 'off' | 'medium' | 'high';
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  image?: {
    byteSize?: number;
    contextLink?: string;
    height?: number;
    thumbnailHeight?: number;
    thumbnailLink?: string;
    thumbnailWidth?: number;
    width?: number;
  };
}

@Injectable()
export class HelperService {
  logger = new Logger(HelperService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async searchGoogle(options: SearchOptions): Promise<SearchResult[]> {
    try {
      const customsearch = google.customsearch('v1');
      console.log('Google search : ', options.query);
      const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
      const searchEngineId = this.configService.get<string>(
        'GOOGLE_SEARCH_ENGINE_ID',
      );

      if (!apiKey || !searchEngineId) {
        throw new Error('Google API credentials not configured');
      }

      const searchOptions: customsearch_v1.Params$Resource$Cse$List = {
        q: options.query,
        cx: searchEngineId,
        auth: apiKey,
        num: options.limit || 10,
        start: options.startIndex || 1,
        hl: options.language,
        cr: options.countryCode ? `country${options.countryCode}` : undefined,
        safe: options.safeSearch || 'medium',
      };

      const response = await customsearch.cse.list(searchOptions);

      if (!response.data.items) {
        return [];
      }
      return response.data.items.map((item) => ({
        title: item.title || '',
        link: item.link || '',
        snippet: item.snippet || '',
        image: item.image,
      }));
    } catch (error) {
      this.logger.error(`Google search error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getExistingProject(projectId: string) {
    const existingProject = await this.prismaService.projects.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return null;
    }
    return existingProject;
  }

  async updateTaskStatus(sprintId: string, status: GenerationStatus) {
    try {
      await this.prismaService.sprints.update({
        where: { id: sprintId },
        data: { task_status: status },
      });
    } catch (error) {
      this.logger.log(`Error updating task status: ${error.message}`);
    }
  }
  async updateStoryStatus(taskId: string, status: GenerationStatus) {
    try {
      await this.prismaService.task.update({
        where: { id: taskId },
        data: { story_status: status },
      });
    } catch (error) {
      this.logger.log(`Error updating story status: ${error.message}`);
    }
  }
  async updateAcceptanceCriteriaStatus(
    storyId: string,
    status: GenerationStatus,
  ) {
    try {
      await this.prismaService.story.update({
        where: { id: storyId },
        data: { criterion_status: status },
      });
    } catch (error) {
      this.logger.log(
        `Error updating acceptance criteria status: ${error.message}`,
      );
    }
  }

  async sanitizeUrl(url: string): Promise<string> {
    try {
      console.log('Sanitizing URL: ', url);
      // Fetch the webpage content
      const response = await axios.get(url);
      const html = response.data;

      // Load HTML into cheerio
      const $ = cheerio.load(html);

      // Remove common unnecessary elements
      $('script').remove();
      $('style').remove();
      $('nav').remove();
      $('img').remove();
      $('head').remove();
      $('header').remove();
      $('footer').remove();
      $('.advertisement').remove();
      $('.ads').remove();
      $('.social-share').remove();
      $('iframe').remove();
      $('noscript').remove();

      const cleanHtml = $('html *')
        .contents()
        .toArray()
        .map((element) =>
          element.type === 'text' ? $(element).text().trim() : null,
        )
        .filter((text) => text)
        .join(' ');

      return cleanHtml;
    } catch (error) {
      this.logger.error(`Error sanitizing URL ${url}: ${error.message}`);
      return 'Error sanitizing URL please use different URL';
    }
  }
}
