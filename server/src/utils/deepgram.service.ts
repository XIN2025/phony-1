import { Injectable, Logger } from '@nestjs/common';
import { createClient, DeepgramClient, PrerecordedSchema } from '@deepgram/sdk';

@Injectable()
export class DeepgramService {
  private readonly deepgram: DeepgramClient;
  private readonly logger = new Logger(DeepgramService.name);
  constructor() {
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');
  }
  /**
   * Attempts to transcribe audio using Deepgram with retry mechanism
   * @param buffer Audio buffer to transcribe
   * @param options Deepgram transcription options
   * @param maxRetries Maximum number of retry attempts
   * @returns Transcription or throws error after all retries fail
   */
  async transcribeWithRetry(
    buffer: Buffer,
    options: PrerecordedSchema,
    maxRetries = 3,
  ) {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`Transcription attempt ${attempt}/${maxRetries}`);
        const { result, error } =
          await this.deepgram.listen.prerecorded.transcribeFile(
            buffer,
            options,
          );

        if (error) {
          this.logger.warn(
            `Deepgram error on attempt ${attempt}/${maxRetries}: ${error}`,
          );
          lastError = error;

          // If this is the last attempt, we'll throw outside the loop
          if (attempt < maxRetries) {
            // Wait before retrying (exponential backoff)
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        } else {
          // Success - return the result
          if (attempt > 1) {
            this.logger.log(
              `Transcription succeeded after ${attempt} attempts`,
            );
          }
          return result.results?.channels[0]?.alternatives[0]?.paragraphs
            ?.transcript;
        }
      } catch (error) {
        this.logger.warn(
          `Exception on transcription attempt ${attempt}/${maxRetries}: ${error.message}`,
        );
        lastError = error;

        // If this is the last attempt, we'll throw outside the loop
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    // If we got here, all retries failed
    this.logger.error(`Transcription failed after ${maxRetries} attempts`);
    throw (
      lastError ||
      new Error('Failed to generate transcript after multiple attempts')
    );
  }
}
