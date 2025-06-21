import { PrismaService } from 'src/prisma/prisma.service';
import { tool } from 'ai';
import { z } from 'zod';

// Define the response type structure for the Wiki details.
export type FetchWikiDetailsResponseType = {
  id: string;
  title: string;
  content: string;
  createdBy: string | null;
  createdAt: Date;
  isPublic: boolean;
  publicAccessLevel: string;
};

export type FetchWikiDetailsByIdSchemaType = {
  wikiId: string; // The ID of the wiki to fetch.
};

export const getFetchWikiDetailsByIdTool = (prisma: PrismaService) =>
  tool({
    description: 'Fetches detailed information for a wiki by its ID.',
    parameters: z.object({
      wikiId: z.string().describe('The ID of the wiki to fetch details for.'),
    }),
    execute: async ({ wikiId }: FetchWikiDetailsByIdSchemaType) => {
      try {
        const wiki = await prisma.project_wiki.findUnique({
          where: {
            id: wikiId,
          },
          select: {
            id: true,
            title: true,
            content: true,
            created_at: true,
            is_public: true,
            public_access_level: true,
            creator: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        });

        if (!wiki) {
          return { error: 'Wiki not found.' };
        }

        const formattedWiki: FetchWikiDetailsResponseType = {
          id: wiki.id,
          title: wiki.title,
          content: JSON.stringify(wiki.content),
          createdBy: wiki.creator
            ? `${wiki.creator.first_name} ${wiki.creator.last_name}`
            : null,
          createdAt: wiki.created_at,
          isPublic: wiki.is_public,
          publicAccessLevel: wiki.public_access_level,
        };

        return formattedWiki;
      } catch (error) {
        console.error('Error fetching wiki details:', error);
        return {
          error: 'Unable to fetch wiki details. Please try again.',
        };
      }
    },
  });
