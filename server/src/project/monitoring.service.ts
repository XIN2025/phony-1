import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkUrls() {
    this.logger.log('Starting URL monitoring check');

    // Get all projects with monitoring URLs
    const projects = await this.prisma.projects.findMany({
      where: {
        monitoring_urls: {
          isEmpty: false,
        },
      },
      include: {
        users: true, // Include owner details for email notification
      },
    });

    for (const project of projects) {
      for (const url of project.monitoring_urls) {
        try {
          this.logger.log(`Checking URL: ${url}`);
          await axios.get(url);
          this.logger.log('URL is up, no action needed');
          // URL is up, no action needed
        } catch (error) {
          this.logger.log('URL is down, checking if we should send an email');
          // URL is down, check if we should send an email
          const shouldSendEmail =
            !project.lastErrorMail ||
            Date.now() - project.lastErrorMail.getTime() > 30 * 60 * 1000; // 30 minutes

          if (shouldSendEmail) {
            await this.sendErrorNotification(project, url, error.message);
          }
        }
      }
    }
  }

  private async sendErrorNotification(
    project: any,
    url: string,
    errorMessage: string,
  ) {
    try {
      // Send email to project owner
      await this.mailService.sendMail({
        to: project.users.email,
        subject: `[Alert] ${project.title} - URL Monitoring Alert`,
        html: `
<div style="max-width: 600px; margin: 0 auto; padding: 30px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #dc2626; font-size: 28px; margin-bottom: 20px;">🚨 URL Monitoring Alert</h1>
    <p style="font-size: 18px; color: #374151;">Hi ${project.users?.name || project.users.email.split('@')[0]},</p>
  </div>

  <div style="background-color: #fef2f2; padding: 25px; border-radius: 8px; border-left: 4px solid #dc2626;">
    <p style="line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
      Our system detected an issue with your monitored URL in project <strong>"${project.title}"</strong>.
    </p>

    <div style="margin: 20px 0; padding: 16px; background-color: #fff; border-radius: 6px;">
      <p style="margin: 8px 0;"><strong>🔗 URL:</strong> <a href="${url}" style="color: #2563eb; text-decoration: none;">${url}</a></p>
      <p style="margin: 8px 0;"><strong>❌ Error:</strong> ${errorMessage}</p>
      <p style="margin: 8px 0;"><strong>⏰ Time:</strong> ${new Date().toLocaleString()}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${project.id}" style="background-color: #dc2626; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 500;">
        View Project
      </a>
    </div>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
    <p>This is an automated monitoring alert - no reply needed</p>
    <div style="margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      <p>Need help? Contact <a href="mailto:admin@heizen.work" style="color: #2563eb; text-decoration: none;">admin@heizen.work</a></p>
      <p style="margin-top: 10px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color: #2563eb; text-decoration: none;">Unsubscribe</a> 
        | 
        <a href="https://x.com/opengigofficial" style="color: #2563eb; text-decoration: none;">Twitter</a>
        | 
        <a href="https://linkedin.com/company/opengig" style="color: #2563eb; text-decoration: none;">LinkedIn</a>
      </p>
    </div>
  </div>
</div>
        `,
      });

      // Update lastErrorMail timestamp
      await this.prisma.projects.update({
        where: { id: project.id },
        data: { lastErrorMail: new Date() },
      });
    } catch (error) {
      this.logger.error('Failed to send error notification email', error);
    }
  }
}
