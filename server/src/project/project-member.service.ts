import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberRole } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import {
  EXISTING_USER_INVITATION_TEMPLATE,
  NEW_USER_INVITATION_TEMPLATE,
} from 'src/mail/templates/project-invite';
import { ConfigService } from '@nestjs/config';
import { emailTemplateWrapper } from 'src/mail/templates/wrapper';

@Injectable()
export class ProjectMemberService {
  logger = new Logger(ProjectMemberService.name);

  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  // Member related methods will be moved here
  async addProjectMember(
    projectId: string,
    email: string,
    role: string,
    requestUserId: string,
  ) {
    try {
      const project = await this.prismaService.projects.findUnique({
        where: { id: projectId },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      if (!project) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
      }

      const requestMember = await this.prismaService.project_members.findFirst({
        where: {
          project_id: projectId,
          users: {
            id: requestUserId,
          },
          role: 'Admin',
        },
      });

      if (!requestMember) {
        throw new HttpException(
          'Only project owner can remove members',
          HttpStatus.FORBIDDEN,
        );
      }

      // Check if user is already a member
      const existingMember = await this.prismaService.project_members.findFirst(
        {
          where: {
            project_id: projectId,
            user_email: email,
          },
        },
      );

      if (existingMember) {
        throw new HttpException(
          'User is already a member',
          HttpStatus.CONFLICT,
        );
      }

      // Find user by email
      const userToAdd = await this.prismaService.users.findUnique({
        where: { email },
      });

      const senderName = `${project.users.first_name} ${project.users.last_name}`;
      const recipientName = userToAdd
        ? `${userToAdd?.first_name} ${userToAdd?.last_name}`
        : '';
      const projectName = project.title;
      const signupLink = `${this.configService.get('NEXT_PUBLIC_APP_URL')}`;
      const projectLink = `${this.configService.get('NEXT_PUBLIC_APP_URL')}/dashboard/project/${project.unique_name}`;

      this.mailService.sendTemplateMail({
        to: email,
        subject: `Join ${project.title} on Heizen`,
        template: userToAdd
          ? emailTemplateWrapper(EXISTING_USER_INVITATION_TEMPLATE)
          : emailTemplateWrapper(NEW_USER_INVITATION_TEMPLATE),
        context: {
          senderName,
          recipientName,
          projectName,
          signupLink,
          role,
          projectLink,
        },
      });

      // Add user as member
      const projectMember = await this.prismaService.project_members.create({
        data: {
          project_id: projectId,
          user_email: email,
          role: role as MemberRole,
        },
      });

      return projectMember;
    } catch (error) {
      this.logger.error(`Failed to add project member: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to add project member`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeProjectMember(
    projectId: string,
    memberId: string,
    requestUserId: string,
  ) {
    try {
      // Check if project exists and requester is owner
      const project = await this.prismaService.projects.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
      }

      // Check if requester is owner
      const isOwner = project.owner_id === requestUserId;

      const requestMember = await this.prismaService.project_members.findFirst({
        where: {
          project_id: projectId,
          users: {
            id: requestUserId,
          },
          role: 'Admin',
        },
      });

      if (!isOwner && !requestMember) {
        throw new HttpException(
          'Only project owner or admin can remove members',
          HttpStatus.FORBIDDEN,
        );
      }

      const member = await this.prismaService.project_members.findUnique({
        where: { id: memberId },
        include: {
          users: true,
        },
      });

      if (!member) {
        throw new HttpException('Member not found', HttpStatus.NOT_FOUND);
      }

      // Only owner can remove admins
      if (member.role === 'Admin' && !isOwner) {
        throw new HttpException(
          'Only project owner can remove admin members',
          HttpStatus.FORBIDDEN,
        );
      }

      // Prevent owner from being removed
      if (member.users?.id === project.owner_id) {
        throw new HttpException(
          'Cannot remove project owner',
          HttpStatus.FORBIDDEN,
        );
      }

      // Remove member
      await this.prismaService.project_members.delete({
        where: {
          id: memberId,
          project_id: projectId,
        },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to remove project member: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to remove project member`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getProjectMembers(projectId: string) {
    try {
      // Get project with owner details
      const project = await this.prismaService.projects.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
      }

      // Get all project members
      const members = await this.prismaService.project_members.findMany({
        where: { project_id: projectId },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              avatar_url: true,
            },
          },
        },
      });

      return members;
    } catch (error) {
      this.logger.error(`Failed to fetch project members: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to fetch project members`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async updateProjectMemberRole(
    projectId: string,
    memberId: string,
    role: MemberRole,
    requestUserId: string,
  ) {
    try {
      const requestMember = await this.prismaService.project_members.findFirst({
        where: {
          project_id: projectId,
          users: {
            id: requestUserId,
          },
          role: 'Admin',
        },
      });

      if (!requestMember) {
        throw new HttpException(
          'Only project Admin can update member role',
          HttpStatus.FORBIDDEN,
        );
      }
      const projectMember = await this.prismaService.project_members.update({
        where: { id: memberId },
        data: { role },
        include: {
          users: true,
        },
      });
      return projectMember;
    } catch (error) {
      this.logger.error(
        `Failed to update project member role: ${error.message}`,
      );
      throw new HttpException(
        `Failed to update project member role`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
