import { openai } from '@ai-sdk/openai';
import { Injectable } from '@nestjs/common';
import { embedMany } from 'ai';
import { Pinecone } from '@pinecone-database/pinecone';
import { meeting_data, project_wiki, story, task } from '@prisma/client';

export interface EmbeddingDocument {
  id: string;
  projectId: string;
  text: string;
  type: 'wiki' | 'story' | 'task' | 'meeting';
}

export interface SearchResult {
  id: string;
  text: string;
  type: string;
  score: number;
}

export interface SearchOptions {
  limit?: number;
  minScore?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: Record<string, any>;
  includeMetadata?: boolean;
}

@Injectable()
export class RagService {
  private readonly pinecone: Pinecone;
  private readonly embeddingModel = 'text-embedding-3-small';
  private readonly indexName: string;
  private readonly chunkSize = 1000;
  private readonly defaultMinScore = 0.5;
  private readonly defaultTopK = 2;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    this.indexName = process.env.PINECONE_INDEX;
  }

  /**
   * Smart text chunking that respects sentence boundaries and maintains context
   * Uses a sliding window approach for better context preservation
   */
  private splitTextIntoChunks(
    text: string,
    chunkSize = this.chunkSize,
    overlap = 100,
  ): string[] {
    const cleanText = text.replace(/\s+/g, ' ').trim();

    if (cleanText.length <= chunkSize) {
      return [cleanText];
    }

    const chunks: string[] = [];
    const sentences = cleanText.split(/(?<=[.!?])\s+/);
    let currentChunk = '';

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];

      if (currentChunk.length + sentence.length > chunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }

        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    if (overlap > 0 && chunks.length > 1) {
      const overlappedChunks: string[] = [];

      for (let i = 0; i < chunks.length; i++) {
        if (i < chunks.length - 1) {
          const currentChunk = chunks[i];
          const nextChunk = chunks[i + 1];

          const overlapText = nextChunk.substring(
            0,
            Math.min(overlap, nextChunk.length),
          );
          overlappedChunks.push(currentChunk + ' ' + overlapText);
        } else {
          overlappedChunks.push(chunks[i]);
        }
      }

      return overlappedChunks;
    }

    return chunks;
  }

  /**
   * Generate embeddings for text in batches to optimize API calls
   */
  private async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const BATCH_SIZE = 100; // OpenAI allows up to 2048 inputs per batch, but smaller batches are more efficient
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);

      try {
        const { embeddings } = await embedMany({
          model: openai.embedding(this.embeddingModel),
          values: batch,
        });

        allEmbeddings.push(...embeddings);
      } catch (error) {
        console.error('Error generating embeddings for batch:', {
          batchIndex: Math.floor(i / BATCH_SIZE),
          batchSize: batch.length,
          error: error.message,
          texts: batch.map((text) => text.substring(0, 100) + '...'), // Show first 100 chars of each text
        });
        continue;
      }
    }
    return allEmbeddings;
  }

  /**
   * Generic method to embed and store any document type
   */
  async embedAndStoreDocument(document: EmbeddingDocument): Promise<void> {
    if (!document.text || !document.projectId) {
      console.warn('Missing text or projectId for document:', document.id);
      return;
    }

    const chunks = this.splitTextIntoChunks(document.text);
    console.log(
      `Processing document ${document.id}: ${chunks.length} chunks, total text length: ${document.text.length}`,
    );

    const embeddings = await this.generateEmbeddings(chunks);

    if (!embeddings.length) {
      console.warn('No embeddings generated for document:', {
        documentId: document.id,
        textLength: document.text.length,
        chunksCount: chunks.length,
        textPreview: document.text.substring(0, 200) + '...',
      });
      return;
    }

    console.log(
      `Generated ${embeddings.length} embeddings for document ${document.id}`,
    );

    const vectors = embeddings.map((_, index) => ({
      id: `${document.id}-${index}`,
      values: embeddings[index],
      metadata: {
        type: document.type,
        id: document.id,
        projectId: document.projectId,
        text: chunks[index],
        chunkIndex: index,
        totalChunks: chunks.length,
      },
    }));

    const index = this.pinecone.index(this.indexName);

    const UPSERT_BATCH_SIZE = 100;

    for (let i = 0; i < vectors.length; i += UPSERT_BATCH_SIZE) {
      const batch = vectors.slice(i, i + UPSERT_BATCH_SIZE);

      try {
        await index.namespace(document.type).upsert(batch);
      } catch (error) {
        console.error(`Error upserting batch ${i}-${i + batch.length}:`, error);
        return;
      }
    }
  }

  /**
   * Convert Wiki to embeddable document - store only title and content
   */
  async embedAndStoreWiki(wiki: project_wiki): Promise<void> {
    if (!wiki.content || !wiki.title || !wiki.project_id) return;

    const fullText = `TITLE: ${wiki.title}\n\nCONTENT: ${
      typeof wiki.content === 'string'
        ? wiki.content
        : JSON.stringify(wiki.content)
    }`;

    await this.embedAndStoreDocument({
      id: wiki.id,
      projectId: wiki.project_id,
      text: fullText,
      type: 'wiki',
    });
  }

  /**
   * Convert Story to embeddable document - store only title and description
   */
  async embedAndStoreStory(story: story): Promise<void> {
    if (!story.title || !story.project_id) return;

    const fullText = `TITLE: ${story.title}\n\nDESCRIPTION: ${story.description || ''}`;

    await this.embedAndStoreDocument({
      id: story.id,
      projectId: story.project_id,
      text: fullText,
      type: 'story',
    });
  }

  /**
   * Convert Task to embeddable document - store only title and description
   */
  async embedAndStoreTask(task: task): Promise<void> {
    if (!task.title || !task.project_id) return;

    const fullText = `TITLE: ${task.title}\n\nDESCRIPTION: ${task.description || ''}`;

    await this.embedAndStoreDocument({
      id: task.id,
      projectId: task.project_id,
      text: fullText,
      type: 'task',
    });
  }

  /**
   * Convert Meeting to embeddable document - store only title and summary, not transcript
   */
  async embedAndStoreMeeting(meeting: meeting_data): Promise<void> {
    if (!meeting.title || !meeting.project_id) return;

    const fullText = `TITLE: ${meeting.title || 'Meeting'}\n\nSUMMARY: ${meeting.summary || ''}`;

    await this.embedAndStoreDocument({
      id: meeting.id,
      projectId: meeting.project_id,
      text: fullText,
      type: 'meeting',
    });
  }

  /**
   * Delete all vectors for a document
   */
  async deleteDocument(documentId: string, projectId: string): Promise<void> {
    const index = this.pinecone.index(this.indexName);

    try {
      await index.namespace(projectId).deleteMany({
        filter: {
          id: { $eq: documentId },
        },
      });
    } catch (error) {
      console.error(`Error deleting document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Perform semantic search with simplified options
   */
  async semanticSearch(
    query: string,
    projectId: string,
    options: SearchOptions = {},
  ) {
    const {
      limit = this.defaultTopK,
      minScore = this.defaultMinScore,
      filters = {},
      includeMetadata = true,
    } = options;

    const [queryEmbedding] = await this.generateEmbeddings([query.trim()]);

    const index = this.pinecone.index(this.indexName);

    try {
      //TODO: make it dynamic, right now wiki is hardcoded
      const results = await index.namespace('wiki').query({
        vector: queryEmbedding,
        topK: limit * 2,
        includeMetadata,
        filter: filters,
      });

      return results.matches
        .filter((match) => match.score > minScore)
        .slice(0, limit)
        .map((match) => ({
          id: match.metadata.id as string,
          text: match.metadata.text as string,
          type: match.metadata.type as string,
          score: match.score,
        }));
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw error;
    }
  }

  /**
   * Search with specific document type filters
   */
  async searchByType(
    query: string,
    types: ('wiki' | 'story' | 'task' | 'meeting')[],
    projectId?: string,
    options: SearchOptions = {},
  ) {
    const filters = {
      ...options.filters,
    };

    if (types.length > 0) {
      filters.type = { $in: types };
    }

    if (projectId) {
      filters.projectId = { $eq: projectId };
    }

    return this.semanticSearch(query, projectId, {
      ...options,
      filters,
    });
  }

  /**
   * Get search results that can be used to fetch full documents from MongoDB
   */
  async getSearchResults(
    query: string,
    projectId?: string,
    options: {
      types?: ('wiki' | 'story' | 'task' | 'meeting')[];
      limit?: number;
      minScore?: number;
    } = {},
  ): Promise<Array<{ id: string; type: string; score: number }>> {
    const {
      types = ['wiki', 'story', 'task', 'meeting'],
      limit = 10,
      minScore = 0.3,
    } = options;

    const results = await this.searchByType(query, types, projectId, {
      limit,
      minScore,
    });

    if (!results.length) {
      return [];
    }

    const seenIds = new Set<string>();
    const uniqueResults: Array<{ id: string; type: string; score: number }> =
      [];

    for (const result of results) {
      if (seenIds.has(result.id)) continue;

      seenIds.add(result.id);
      uniqueResults.push({
        id: result.id,
        type: result.type,
        score: result.score,
      });
    }

    return uniqueResults;
  }

  /**
   * Utility function to reindex all content for a project
   */
  async reindexProject(
    projectId: string,
    data: {
      wikis?: project_wiki[];
      stories?: story[];
      tasks?: task[];
      meetings?: meeting_data[];
    },
  ): Promise<void> {
    const { wikis = [], stories = [], tasks = [], meetings = [] } = data;

    const index = this.pinecone.index(this.indexName);
    await index.namespace(projectId).deleteAll();

    await Promise.all([
      ...wikis.map((wiki) => this.embedAndStoreWiki(wiki)),
      ...stories.map((story) => this.embedAndStoreStory(story)),
      ...tasks.map((task) => this.embedAndStoreTask(task)),
      ...meetings.map((meeting) => this.embedAndStoreMeeting(meeting)),
    ]);
  }
}
