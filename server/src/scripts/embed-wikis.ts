import { PrismaClient } from '@prisma/client';
import { RagService } from '../rag/rag.service';

/**
 * Script to embed all wiki documents into Pinecone vector database
 * This script is designed to be run as a standalone process for data pipeline
 */

class WikiEmbeddingScript {
  private prisma: PrismaClient;
  private ragService: RagService;
  private dryRun: boolean;

  constructor(dryRun = false) {
    const mongoUri = process.env.DATABASE_URL;

    if (!mongoUri) {
      throw new Error(
        'MongoDB connection string not found. Please set EMBED_MONGODB_URI or DATABASE_URL',
      );
    }

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: mongoUri,
        },
      },
    });
    this.ragService = new RagService();
    this.dryRun = dryRun;
  }

  async embedAllWikis(): Promise<void> {
    console.log(
      `Starting wiki embedding process${this.dryRun ? ' (DRY RUN)' : ''}...`,
    );

    try {
      const allWikis = await this.prisma.project_wiki.findMany({
        where: {
          AND: [{ title: { not: '' } }, { content: { not: null } }],
        },
        include: {
          projects: {
            select: {
              id: true,
              unique_name: true,
              title: true,
            },
          },
          creator: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
        orderBy: {
          updated_at: 'desc',
        },
      });

      console.log(`Found ${allWikis.length} total wikis`);

      const wikis = allWikis.filter((wiki) => {
        // Process if never embedded or updated since last embedding
        return (
          !wiki.last_embedded_at || wiki.updated_at > wiki.last_embedded_at
        );
      });

      if (wikis.length === 0) {
        console.log('All wikis are already embedded and up-to-date!');
        return;
      }

      const wikisByProject = wikis.reduce(
        (acc, wiki) => {
          const projectId = wiki.project_id;
          if (!acc[projectId]) {
            acc[projectId] = [];
          }
          acc[projectId].push(wiki);
          return acc;
        },
        {} as Record<string, typeof wikis>,
      );

      let totalProcessed = 0;
      let totalErrors = 0;

      for (const [, projectWikis] of Object.entries(wikisByProject)) {
        const project = projectWikis[0].projects;
        console.log(
          `Processing project: ${project.title} (${project.unique_name})`,
        );
        console.log(`   └── ${projectWikis.length} wikis to embed`);

        const batchSize = 5;
        for (let i = 0; i < projectWikis.length; i += batchSize) {
          const batch = projectWikis.slice(i, i + batchSize);

          console.log(
            `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(projectWikis.length / batchSize)} (${batch.length} wikis)`,
          );

          const batchPromises = batch.map(async (wiki) => {
            try {
              if (this.dryRun) {
                this.validateWiki(wiki);
                console.log(`Would embed: "${wiki.title}" (${wiki.id})`);
              } else {
                await this.embedSingleWiki(wiki);
                console.log(`Embedded: "${wiki.title}" (${wiki.id})`);
              }
              return { success: true, wiki };
            } catch (error) {
              console.error(
                `${this.dryRun ? 'Would fail to embed' : 'Failed to embed'}: "${wiki.title}" (${wiki.id})`,
                error.message,
              );
              return { success: false, wiki, error };
            }
          });

          const batchResults = await Promise.all(batchPromises);

          const batchSuccesses = batchResults.filter((r) => r.success).length;
          const batchErrors = batchResults.filter((r) => !r.success).length;

          totalProcessed += batchSuccesses;
          totalErrors += batchErrors;

          if (i + batchSize < projectWikis.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      console.log(`\n${this.dryRun ? 'Dry Run' : 'Embedding'} Summary:`);
      console.log(
        `${this.dryRun ? 'Would embed' : 'Successfully embedded'}: ${totalProcessed} wikis`,
      );
      console.log(
        `${this.dryRun ? 'Would fail to embed' : 'Failed to embed'}: ${totalErrors} wikis`,
      );
      console.log(
        `Success rate: ${((totalProcessed / (totalProcessed + totalErrors)) * 100).toFixed(1)}%`,
      );

      if (totalErrors > 0) {
        console.log(
          `Some wikis ${this.dryRun ? 'would fail to embed' : 'failed to embed'}. Check the logs above for details.`,
        );
      } else {
        console.log(
          `All wikis ${this.dryRun ? 'would be successfully embedded' : 'successfully embedded'}!`,
        );
      }
    } catch (error) {
      console.error('Fatal error during wiki embedding:', error);
      throw error;
    }
  }

  /**
   * Extract content text from wiki content
   */
  private extractContentText(wiki: any): string {
    let contentText = '';
    if (typeof wiki.content === 'string') {
      contentText = wiki.content;
    } else if (typeof wiki.content === 'object') {
      if (wiki.content.content) {
        contentText = this.extractTextFromRichContent(wiki.content);
      } else {
        contentText = JSON.stringify(wiki.content);
      }
    }
    return contentText;
  }

  /**
   * Validate wiki data and return extracted content text
   */
  private validateWiki(wiki: any): string {
    if (!wiki.title || !wiki.content || !wiki.project_id) {
      throw new Error(
        `Invalid wiki data: missing title, content, or project_id`,
      );
    }

    const contentText = this.extractContentText(wiki);

    if (!contentText.trim()) {
      throw new Error('No meaningful content found');
    }

    return contentText;
  }

  /**
   * Embed a single wiki document
   */
  private async embedSingleWiki(wiki: any): Promise<void> {
    const contentText = this.validateWiki(wiki);

    const wikiForEmbedding = {
      ...wiki,
      content: contentText,
    };

    await this.ragService.embedAndStoreWiki(wikiForEmbedding);

    await this.prisma.project_wiki.update({
      where: { id: wiki.id },
      data: { last_embedded_at: new Date() },
    });
  }

  private extractTextFromRichContent(content: any): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((item) => this.extractTextFromRichContent(item))
        .join(' ');
    }

    if (typeof content === 'object' && content !== null) {
      if (content.type === 'text' && content.text) {
        return content.text;
      }

      if (content.content && Array.isArray(content.content)) {
        return content.content
          .map((item) => this.extractTextFromRichContent(item))
          .join(' ');
      }

      if (content.text) {
        return content.text;
      }

      const textParts: string[] = [];
      for (const value of Object.values(content)) {
        if (typeof value === 'string') {
          textParts.push(value);
        } else if (typeof value === 'object') {
          const nestedText = this.extractTextFromRichContent(value);
          if (nestedText) {
            textParts.push(nestedText);
          }
        }
      }
      return textParts.join(' ');
    }

    return '';
  }

  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const script = new WikiEmbeddingScript(isDryRun);

  try {
    await script.embedAllWikis();
    console.log(
      `\n Wiki embedding process completed successfully${isDryRun ? ' (DRY RUN)' : ''}!`,
    );
  } catch (error) {
    console.error('Wiki embedding process failed:', error);
    process.exit(1);
  } finally {
    await script.cleanup();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { WikiEmbeddingScript };
