import { Injectable, BadRequestException } from '@nestjs/common';
import * as mammoth from 'mammoth';
import * as pdf from 'pdf-parse';

@Injectable()
export class TextExtractorService {
  /**
   * Extract text from a DOCX buffer
   */
  async extractFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new BadRequestException('Failed to extract text from DOCX file');
    }
  }

  /**
   * Extract text from a text file buffer
   */
  async extractFromTextFile(buffer: Buffer): Promise<string> {
    try {
      return buffer.toString('utf-8');
    } catch (error) {
      throw new BadRequestException('Failed to extract text from text file');
    }
  }

  /**
   * Extract text from a PDF buffer
   */
  async extractFromPdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdf.default(buffer, {
        pagerender: undefined,
        max: 0,
      });
      return data.text;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to extract text from PDF file');
    }
  }

  /**
   * Extract text based on file type
   */
  async extractText(
    buffer: Buffer,
    fileType: 'docx' | 'txt' | 'pdf',
  ): Promise<string> {
    switch (fileType) {
      case 'docx':
        return this.extractFromDocx(buffer);
      case 'txt':
        return this.extractFromTextFile(buffer);
      case 'pdf':
        return this.extractFromPdf(buffer);
      default:
        throw new BadRequestException('Unsupported file type');
    }
  }
}
