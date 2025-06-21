import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ModelType } from 'src/common/enums/ModelType.enum';
import { format } from 'date-fns';
import { SPRINT_NOTIFICATION_TEMPLATE } from '../mail/templates/sprint-notification';
import { marked } from 'marked';
import HTMLtoDOCX from 'html-to-docx';
import { emailTemplateWrapper } from 'src/mail/templates/wrapper';
import { generateText } from 'ai';
import { getLLM } from 'src/common/utils/llm.util';
import { prompts } from 'src/common/prompts';
@Injectable()
export class ProjectSummaryService {
  logger = new Logger(ProjectSummaryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async sendProjectSummary(sprintId: string, projectId: string) {
    this.logger.log(`Sending project summary for sprint ${sprintId}`);
    const project = await this.prisma.projects.findUnique({
      where: { id: projectId },
      select: {
        title: true,
        project_members: {
          include: {
            users: {
              select: {
                email: true,
              },
            },
          },
        },
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
    const sprint = await this.prisma.sprints.findUnique({
      where: { id: sprintId },
      include: {
        tasks: {
          include: {
            stories: {
              include: {
                assignee: true,
              },
            },
          },
        },
      },
    });
    if (sprint.tasks.length === 0) {
      this.logger.log(`No tasks found for sprint ${sprintId}`);
      return;
    }
    const sprintMarkdown = this.formatSprintToMarkdown(sprint);
    const adminName = project.users.first_name
      ? `${project.users.first_name} ${project.users.last_name}`
      : project.users.email.split('@')[0];
    const response = await this.generateSummary(`
      Admin : ${adminName}
      ${sprintMarkdown}`);
    const jsonResponse = JSON.parse(
      response.replace('```json', '').replace('```', ''),
    );
    const summary = emailTemplateWrapper(`
      <div style="margin-bottom: 15px; white-space: pre-wrap;font-size: 15px;">
${jsonResponse.summary}
      </div>
      ${jsonResponse?.sections
        ?.map((section) => {
          return `
        <div style="margin-bottom: 30px;">
          <div style="margin-bottom: 15px;font-size: 20px;">
            ${section.title}
          </div>
          ${section.paragraphs
            .map((paragraph) => {
              return `
            <div style="margin-bottom: 10px; font-size: 15px;">
              ${paragraph}
            </div>
            `;
            })
            .join('')}
        </div>`;
        })
        .join('')}
    </div>
    `);

    // Send email to each project member
    const emails = project.project_members
      .filter((m) => m.users)
      .map((pm) => pm.users.email);
    // Convert markdown HTML to DOCX with detailed formatting options
    const buffer = await this.convertMarkdownToDocx(sprintMarkdown);

    const docxFileName = `${project.title.toLowerCase().replace(/\s+/g, '-')}-${sprint.name.toLowerCase().replace(/\s+/g, '-')}-summary.docx`;

    await this.mailService.sendMailWithAttachment({
      to: emails,
      subject: `Sprint Updates - ${project.title}`,
      text: 'Please find the sprint summary attached.',
      html: summary,
      attachments: [
        {
          filename: docxFileName,
          content: buffer,
        },
      ],
    });
  }

  async sendSprintRoadmap(sprintId: string) {
    const sprint = await this.prisma.sprints.findUnique({
      where: { id: sprintId },
      include: {
        projects: {
          include: {
            project_members: {
              include: {
                users: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
        tasks: {
          select: {
            title: true,
            description: true,
            type: true,
            stories: {
              select: {
                acceptance_criteria: true,
                description: true,
                estimation: true,
                priority: true,
                title: true,
              },
            },
          },
        },
      },
    });
    if (!sprint || !sprint.tasks?.length) {
      this.logger.warn(`No tasks found for sprint ${sprintId}`);
      return null;
    }

    this.logger.log(`Sending sprint roadmap for sprint ${sprintId}`);

    const sprintMarkdown = this.formatSprintToMarkdown(sprint);
    const response = await this.generateRoadmap(sprintMarkdown);
    const markdownOutput = response
      .replace('```markdown', '')
      .replace('```', '')
      .trim();
    // Convert markdown to HTML
    const buffer = await this.convertMarkdownToDocx(markdownOutput);

    const docxFileName = `${sprint.projects.title.toLowerCase().replace(/\s+/g, '-')}-${sprint.name.toLowerCase().replace(/\s+/g, '-')}-roadmap.docx`;

    // Prepare email content using template
    const emailBody = SPRINT_NOTIFICATION_TEMPLATE.replace(
      '{{sprintName}}',
      sprint.name,
    )
      .replace(
        '{{startDate}}',
        format(new Date(sprint.start_date), 'MMMM dd, yyyy'),
      )
      .replace(
        '{{endDate}}',
        format(new Date(sprint.end_date), 'MMMM dd, yyyy'),
      )
      .replace('{{taskCount}}', sprint.tasks.length.toString());

    // Send email to each project member
    const emails = sprint.projects.project_members
      .filter((m) => m.users)
      .map((pm) => pm.users.email);

    await this.mailService.sendMailWithAttachment({
      to: emails,
      subject: `[${sprint.projects.title}] New Sprint Started - ${sprint.name}`,
      text: 'New sprint has started. Please find the sprint roadmap attached.',
      html: emailTemplateWrapper(emailBody),
      attachments: [
        {
          filename: docxFileName,
          content: buffer,
        },
      ],
    });

    return markdownOutput;
  }

  private formatSprintToMarkdown(sprint: any): string {
    const formatDate = (date: string) =>
      format(new Date(date), 'MMMM dd, yyyy');

    let markdown = `# ${sprint.name}\n\n`;
    markdown += `**Sprint Number:** ${sprint.sprint_number}\n`;
    markdown += `**Duration:** ${formatDate(sprint.start_date)} - ${formatDate(sprint.end_date)}\n\n`;

    sprint.tasks?.forEach((task) => {
      markdown += `## Task: ${task.title}\n\n`;
      markdown += `**Type:** ${task.type}\n`;
      markdown += `**Description:** ${task.description}\n\n`;

      task.stories?.forEach((story) => {
        markdown += `### Story: ${story.title}\n\n`;
        markdown += `**Estimation:** ${story.estimation}\n`;
        markdown += `**Priority:** ${story.priority}\n`;
        markdown += `**Status:** ${story.status || 'Todo'}\n\n`;

        markdown += `#### Acceptance Criteria:\n\n`;
        story.acceptance_criteria?.forEach((ac) => {
          markdown += `- [${ac.isCompleted ? 'x' : ' '}] ${ac.isCompleted ? `~~${ac.criteria}~~` : ac.criteria}\n`;
        });
        markdown += '\n';
      });
    });

    return markdown;
  }

  async convertMarkdownToDocx(markdown: string): Promise<Buffer> {
    try {
      // Convert markdown to HTML
      const html = marked(markdown);

      // Convert HTML to DOCX with detailed formatting options
      const buffer = await HTMLtoDOCX(html, null, {
        table: { row: { cantSplit: true } },
        footer: false,
        pageNumber: false,
        font: 'Arial',
        margins: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
        styles: {
          paragraphSpacing: 100,
          characterSpacing: 0,
          lineHeight: 1.15,
        },
      });

      return buffer;
    } catch (error) {
      this.logger.error(
        `Error converting markdown to docx: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async generateSummary(taskDetails: string) {
    const res = await generateText({
      model: getLLM(ModelType.GEMINI_2_0_FLASH),
      system: prompts.getProjectSummaryPrompt(),
      prompt: `Generate a sprint summary for project for below details:\n\n${taskDetails}`,
    });
    return res.text;
  }
  private async generateRoadmap(taskDetails: string) {
    const res = await generateText({
      model: getLLM(ModelType.GEMINI_2_0_FLASH),
      system: prompts.getRoadmapPrompt(),
      prompt: `Generate a sprint roadmap from the following sprint details:\n\n${taskDetails}`,
    });
    return res.text;
  }
}
