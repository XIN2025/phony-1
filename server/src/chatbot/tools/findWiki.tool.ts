import { PrismaService } from 'src/prisma/prisma.service';
import { tool } from 'ai';
import { z } from 'zod';

export type FindWikiListResponseType = {
  id: string;
  title: string;
  createdBy: string | null;
  createdAt: Date;
};

export type FindWikiListSchemaType = {
  projectId: string;
  limit?: number;
};

export const getFindWikiListTool = (prisma: PrismaService) =>
  tool({
    description:
      'Fetches the last N wikis for a given project ID. Defaults to 3 if no limit is provided.',
    parameters: z.object({
      projectId: z
        .string()
        .describe('The ID of the project to find wikis for.'),
      limit: z
        .number()
        .optional()
        .describe('Number of recent wikis to fetch (default is 3).'),
    }),
    execute: async ({ projectId, limit = 3 }: FindWikiListSchemaType) => {
      try {
        const wikis = await prisma.project_wiki.findMany({
          where: {
            project_id: projectId,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: limit,
          select: {
            id: true,
            title: true,
            created_at: true,
            creator: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        });

        const formattedWikis: FindWikiListResponseType[] = wikis.map(
          (wiki) => ({
            id: wiki.id,
            title: wiki.title,
            createdBy: wiki.creator
              ? `${wiki.creator.first_name} ${wiki.creator.last_name}`
              : null,
            createdAt: wiki.created_at,
          }),
        );

        return formattedWikis;
      } catch (error) {
        console.error('Error fetching wikis:', error);
        return {
          error: 'Unable to fetch wikis. Please try again.',
        };
      }
    },
  });
