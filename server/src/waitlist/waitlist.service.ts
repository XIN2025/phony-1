import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateWaitlistDto,
  UpdateWaitlistDto,
  WaitlistResponseDto,
  WaitlistStatus,
} from './dtos/waitlist.dto';
import { waitlist as WaitlistModel } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { emailTemplateWrapper } from 'src/mail/templates/wrapper';
import {
  WAITLIST_APPROVED_TEMPLATE,
  WAITLIST_WELCOME_TEMPLATE,
} from 'src/mail/templates/waitlist';

@Injectable()
export class WaitlistService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async joinWaitlist(
    createWaitlistDto: CreateWaitlistDto,
  ): Promise<WaitlistResponseDto> {
    // validate email
    if (!this.isValidEmail(createWaitlistDto.email)) {
      throw new BadRequestException('Invalid email');
    }
    const existingEntry = await this.prisma.waitlist.findUnique({
      where: { email: createWaitlistDto.email },
    });
    if (existingEntry) {
      return this.mapToDto(existingEntry);
    }
    const entry = await this.prisma.waitlist.create({
      data: {
        email: createWaitlistDto.email,
        name: createWaitlistDto.name,
        from: createWaitlistDto.from,
        status: WaitlistStatus.PENDING,
      },
    });

    this.mailService.sendTemplateMail({
      to: entry.email,
      subject: 'Welcome to Heizen Waitlist!',
      template: emailTemplateWrapper(WAITLIST_WELCOME_TEMPLATE),
      context: {
        name: entry.name || entry.email.split('@')[0],
      },
    });

    return this.mapToDto(entry);
  }

  async create(
    createWaitlistDto: CreateWaitlistDto,
  ): Promise<WaitlistResponseDto> {
    const existingEntry = await this.prisma.waitlist.findUnique({
      where: { email: createWaitlistDto.email },
    });
    if (existingEntry) {
      return this.mapToDto(existingEntry);
    }
    const entry = await this.prisma.waitlist.create({
      data: {
        email: createWaitlistDto.email,
        name: createWaitlistDto.name,
        from: createWaitlistDto.from,
        status: WaitlistStatus.PENDING,
      },
    });
    this.mailService.sendTemplateMail({
      to: entry.email,
      subject: 'Welcome to Heizen Waitlist!',
      template: emailTemplateWrapper(WAITLIST_WELCOME_TEMPLATE),
      context: {
        name: entry.name || entry.email.split('@')[0],
      },
    });

    return this.mapToDto(entry);
  }

  async findAll(): Promise<WaitlistResponseDto[]> {
    const entries = await this.prisma.waitlist.findMany({
      orderBy: { created_at: 'desc' },
    });
    return entries.map((entry) => this.mapToDto(entry));
  }

  async findOne(id: string): Promise<WaitlistResponseDto> {
    const entry = await this.prisma.waitlist.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException(`Waitlist entry with ID ${id} not found`);
    }

    return this.mapToDto(entry);
  }

  async updateStatus(
    id: string,
    updateWaitlistDto: UpdateWaitlistDto,
  ): Promise<WaitlistResponseDto> {
    try {
      const updated = await this.prisma.waitlist.update({
        where: { id },
        data: {
          status: updateWaitlistDto.status,
          updated_at: new Date(),
        },
      });
      if (
        process.env.NODE_ENV !== 'development' &&
        updateWaitlistDto.status === WaitlistStatus.APPROVED
      ) {
        this.mailService.sendTemplateMail({
          to: updated.email,
          subject: "You're In! Welcome to Heizen",
          template: emailTemplateWrapper(WAITLIST_APPROVED_TEMPLATE),
          context: {
            name: updated.name || updated.email.split('@')[0],
          },
        });
      }
      return this.mapToDto(updated);
    } catch (error) {
      throw new NotFoundException(`Waitlist entry with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<WaitlistResponseDto> {
    try {
      const deleted = await this.prisma.waitlist.delete({
        where: { id },
      });
      return this.mapToDto(deleted);
    } catch (error) {
      throw new NotFoundException(`Waitlist entry with ID ${id} not found`);
    }
  }

  async isUserInWaitlistAndApproved(email: string): Promise<boolean> {
    if (!this.isValidEmail(email)) {
      return false;
    }
    const entry = await this.prisma.waitlist.findFirst({
      where: {
        email: email,
      },
    });
    return entry?.status === WaitlistStatus.APPROVED;
  }

  private mapToDto(model: WaitlistModel): WaitlistResponseDto {
    return {
      id: model.id,
      email: model.email,
      name: model.name,
      from: model.from,
      status: model.status as WaitlistStatus,
      created_at: model.created_at,
      updated_at: model.updated_at,
    };
  }
}
