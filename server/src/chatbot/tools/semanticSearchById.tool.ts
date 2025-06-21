import { PrismaService } from 'src/prisma/prisma.service';
import { RagService } from 'src/rag/rag.service';
import { tool } from 'ai';
import { z } from 'zod';

export type SemanticSearchSchemaType = {
  projectId?: string;
  searchText: string;
};

export const getSemanticSearchTool = (
  prisma: PrismaService,
  ragService: RagService,
) =>
  tool({
    description:
      'Performs semantic vector search on documentations, meetings, wikis, tasks, and stories in our internal knowledge base.',
    parameters: z.object({
      projectId: z
        .string()
        .describe('The ID of the project to search within.')
        .optional(),
      searchText: z.string().describe('The semantic search query.'),
    }),
    execute: async ({ projectId, searchText }) => {
      if (!searchText.trim()) {
        return [];
      }

      try {
        const results = await ragService.getSearchResults(
          searchText,
          projectId,
        );

        const data = await Promise.all(
          results.map(async (result: { id: string; type: string }) => {
            let record = null;

            switch (result.type) {
              case 'meeting':
                record = await prisma.meeting_data.findUnique({
                  where: { id: result.id },
                  select: {
                    id: true,
                    title: true,
                    summary: true,
                    created_at: true,
                    project_id: true,
                    task: {
                      select: {
                        id: true,
                        title: true,
                        description: true,
                        sprint_id: true,
                        project_id: true,
                        story_status: true,
                      },
                    },
                    creator: {
                      select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                      },
                    },
                  },
                });
                break;

              case 'wiki':
                record = await prisma.project_wiki.findUnique({
                  where: { id: result.id },
                  select: {
                    id: true,
                    title: true,
                    content: true,
                    created_at: true,
                    project_id: true,
                    creator: {
                      select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                      },
                    },
                  },
                });
                break;

              case 'task':
                record = await prisma.task.findUnique({
                  where: { id: result.id },
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    created_at: true,
                    project_id: true,
                    sprint_id: true,
                    story_status: true,
                    type: true,
                    stories: {
                      select: {
                        id: true,
                        title: true,
                        description: true,
                        sprint_id: true,
                        project_id: true,
                      },
                    },
                  },
                });
                break;

              case 'story':
                record = await prisma.story.findUnique({
                  where: { id: result.id },
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    created_at: true,
                    project_id: true,
                    sprint_id: true,
                    assignee: {
                      select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                      },
                    },
                    priority: true,
                    status: true,
                    estimation: true,
                    task: {
                      select: {
                        id: true,
                        title: true,
                        description: true,
                        sprint_id: true,
                        project_id: true,
                      },
                    },
                  },
                });
                break;
            }

            return record ? { ...record, type: result.type } : null;
          }),
        );

        return data.filter(Boolean);
      } catch (error) {
        console.error('Error in semanticSearchTool:', error);
        return {
          error: 'Failed to perform semantic search. Please try again.',
        };
      }
    },
  });
