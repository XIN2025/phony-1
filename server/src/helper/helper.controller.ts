import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { MarkdownToDocxDto } from './dtos/markdown-to-docx.dto';
import { ProjectSummaryService } from './project-summary.service';

@Controller('helper')
export class HelperController {
  constructor(private readonly projectSummaryService: ProjectSummaryService) {}

  @Post('markdown-to-docx')
  async convertMarkdownToDocx(
    @Body() dto: MarkdownToDocxDto,
    @Res() res: Response,
  ) {
    try {
      const docxBuffer = await this.projectSummaryService.convertMarkdownToDocx(
        dto.markdown,
      );

      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${dto.filename}.docx"`,
      );

      // Send the buffer
      res.send(docxBuffer);
    } catch (error) {
      console.error('Error converting markdown to docx:', error);
      throw error;
    }
  }
}
