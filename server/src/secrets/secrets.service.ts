import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../utils/encrypt.service';
import {
  CreateEnvironmentDto,
  UpdateSecretsDto,
} from './dto/create-environment.dto';

@Injectable()
export class SecretsService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  async getEnvironmentsByProject(projectId: string) {
    const environments = await this.prisma.environment.findMany({
      where: { projectId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return environments;
  }

  async createEnvironment(dto: CreateEnvironmentDto, userId: string) {
    // Check if user is admin
    const member = await this.prisma.project_members.findFirst({
      where: {
        project_id: dto.projectId,
        user_email: userId,
        role: 'Admin',
      },
      include: {
        users: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!member || !member.users.id) {
      throw new ForbiddenException('Only admin can create environments');
    }

    const environment = await this.prisma.environment.create({
      data: {
        name: dto.name,
        projectId: dto.projectId,
      },
    });
    await this.prisma.environmentVersion.create({
      data: {
        environmentId: environment.id,
        versionNumber: 1,
        createdBy: member.users.id,
        secrets: '',
      },
    });
    return environment;
  }

  async deleteEnvironment(environmentId: string, userId: string) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
      include: {
        project: {
          select: {
            owner_id: true,
          },
        },
      },
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    if (environment.project.owner_id !== userId) {
      throw new ForbiddenException(
        'Only project owner can delete environments',
      );
    }

    return this.prisma.environment.delete({
      where: { id: environmentId },
    });
  }

  async updateSecrets(
    environmentId: string,
    dto: UpdateSecretsDto,
    userId: string,
  ) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
      include: {
        versions: {
          orderBy: {
            versionNumber: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    // Encrypt the secrets
    const encryptedSecrets = this.encryptionService.encrypt(dto.secrets);

    // Calculate next version number
    const nextVersion =
      environment.versions.length > 0
        ? environment.versions[0].versionNumber + 1
        : 1;

    const version = await this.prisma.environmentVersion.create({
      data: {
        environmentId,
        secrets: encryptedSecrets,
        versionNumber: nextVersion,
        createdBy: userId,
      },
    });
    return {
      ...version,
      secrets: this.encryptionService.decrypt(version.secrets),
    };
  }

  async getVersions(environmentId: string) {
    const versions = await this.prisma.environmentVersion.findMany({
      where: { environmentId },
      select: {
        id: true,
        versionNumber: true,
        createdAt: true,
        createdBy: true,
        createdByUser: {
          select: {
            id: true,
            email: true,
            avatar_url: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        versionNumber: 'desc',
      },
    });
    return versions;
  }

  async getLatestVersion(environmentId: string) {
    const version = await this.prisma.environmentVersion.findFirst({
      where: { environmentId },
      orderBy: {
        versionNumber: 'desc',
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            email: true,
            avatar_url: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!version) {
      throw new NotFoundException('No versions found for this environment');
    }

    return {
      ...version,
      secrets: this.encryptionService.decrypt(version.secrets),
    };
  }

  async getSpecificVersion(environmentId: string, versionNumber: number) {
    const version = await this.prisma.environmentVersion.findFirst({
      where: {
        environmentId,
        versionNumber,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            email: true,
            avatar_url: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    return {
      ...version,
      secrets: this.encryptionService.decrypt(version.secrets),
    };
  }
}
