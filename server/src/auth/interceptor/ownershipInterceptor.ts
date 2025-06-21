import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnershipInterceptor implements NestInterceptor {
  constructor(private readonly prismaService: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    let projectId: string;

    if (method === 'POST') {
      projectId = request.body.projectId;
    } else {
      projectId = request.params.projectId;
    }

    if (!projectId) {
      return next.handle();
    }
    // Check if user is owner or member
    const project = await this.prismaService.projects.findFirst({
      where: {
        id: projectId,
        OR: [
          { owner_id: user.id },
          {
            project_members: {
              some: {
                user_email: user.email,
              },
            },
          },
        ],
      },
    });
    if (!project) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return next.handle();
  }
}
