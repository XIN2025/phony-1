import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Initialize the transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: Number(this.configService.get('SMTP_PORT')),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  /**
   * Send an email using the configured transporter
   */
  async sendMail(options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
  }): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: '"Heizen" <hello@theopengig.com>',
        ...options,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send a template-based email
   */
  async sendTemplateMail(options: {
    to: string | string[];
    subject: string;
    template: string;
    context: Record<string, any>;
  }): Promise<boolean> {
    // You can implement template rendering logic here
    // For example, using handlebars or ejs
    const html = this.renderTemplate(options.template, options.context);
    return this.sendMail({
      to: options.to,
      subject: options.subject,
      html,
    });
  }

  private renderTemplate(
    template: string,
    context: Record<string, any>,
  ): string {
    // Implement your template rendering logic here
    // This is a simple placeholder implementation
    let rendered = template;
    Object.entries(context).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    return rendered;
  }

  async sendMailWithAttachment(options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
    }>;
  }): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: '"Heizen" <hello@theopengig.com>',
        ...options,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email with attachment:', error);
      return false;
    }
  }
}
