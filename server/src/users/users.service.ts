import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ReduceCreditsDto } from './dto/reduce-credits.dto';
import {
  GlobalSearchDto,
  GlobalSearchResponseDto,
  SearchResult,
} from './dto/global-search.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.users.update({
      where: { id },
      data: {
        avatar_url: updateUserDto.avatar_url,
        first_name: updateUserDto.first_name,
        last_name: updateUserDto.last_name,
        linkedin_profile_url: updateUserDto.linkedin_profile_url,
        updated_at: new Date(),
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        avatar_url: true,
        credits_remaining: true,
        credits_used: true,
        linkedin_profile_url: true,
      },
    });
  }

  async reduceCredits(id: string, { amount }: ReduceCreditsDto) {
    // Use a single transaction to avoid multiple database roundtrips
    return this.prisma.$transaction(async (tx) => {
      // Use findUnique with direct selection to minimize data retrieval
      const user = await tx.users.findUnique({
        where: { id },
        select: {
          credits_remaining: true,
          credits_used: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Pre-calculate values to avoid redundant calculations
      const creditsToDeduct = Math.min(user.credits_remaining, amount);
      const newCreditsRemaining = user.credits_remaining - creditsToDeduct;
      const newCreditsUsed = (user.credits_used || 0) + creditsToDeduct;

      // Single update operation with minimal fields
      return tx.users.update({
        where: { id },
        data: {
          credits_remaining: newCreditsRemaining,
          credits_used: newCreditsUsed,
          updated_at: new Date(),
        },
        select: { id: true },
      });
    });
  }

  async applyCoupon(id: string, coupon: string) {
    if (!id) {
      throw new BadRequestException('User Not Found');
    }
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    if (user.applied_coupons.includes(coupon)) {
      throw new BadRequestException('Coupon already applied');
    }
    const couponCode = await this.prisma.coupon_codes.findUnique({
      where: { code: coupon },
    });
    if (!couponCode) {
      throw new BadRequestException('Invalid coupon');
    }
    if (couponCode.expires_at && couponCode.expires_at < new Date()) {
      throw new BadRequestException('Coupon expired');
    }
    if (couponCode.used_count >= couponCode.max_uses) {
      throw new BadRequestException('Max uses reached');
    }
    await this.prisma.users.update({
      where: { id },
      data: {
        applied_coupons: { push: coupon },
        credits_remaining: user.credits_remaining + couponCode.discount,
      },
    });
    await this.prisma.coupon_codes.update({
      where: { id: couponCode.id },
      data: {
        used_count: { increment: 1 },
      },
    });
    return true;
  }

  async getMe(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        avatar_url: true,
        is_verified: true,
        credits_remaining: true,
        credits_used: true,
        linkedin_profile_url: true,
        meeting_credits_remaining: true,
        meeting_credits_used: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
  async isCreditsAvailable(id: string) {
    const count = await this.prisma.users.count({
      where: {
        id,
        credits_remaining: { gt: 0 },
      },
    });
    if (count === 0) {
      return false;
    }
    return true;
  }

  async globalSearch(
    userId: string,
    searchDto: GlobalSearchDto,
  ): Promise<GlobalSearchResponseDto> {
    const { query, limit = 5 } = searchDto;
    const searchTerm = query.toLowerCase();

    // Get user's project IDs for filtering
    const userProjects = await this.prisma.project_members.findMany({
      where: { user_email: { in: await this.getUserEmail(userId) } },
      select: { project_id: true },
    });

    const projectIds = userProjects.map((p) => p.project_id);

    if (projectIds.length === 0) {
      return { results: [], total: 0, query };
    }

    const sprintIds = await this.prisma.sprints.findMany({
      where: {
        project_id: { in: projectIds },
        status: {
          not: 'Completed',
        },
      },
      select: { id: true },
    });
    const activeSprintIds = sprintIds.map((s) => s.id);

    // Run all searches in parallel
    const [projects, stories, meetings, bugs] = await Promise.all([
      // Search Projects
      this.prisma.projects.findMany({
        where: {
          AND: [
            { id: { in: projectIds } },
            {
              OR: [{ title: { contains: searchTerm, mode: 'insensitive' } }],
            },
          ],
        },
        select: {
          id: true,
          title: true,
          unique_name: true,
          created_at: true,
        },
        take: limit,
      }),

      // Search Stories
      this.prisma.story.findMany({
        where: {
          AND: [
            {
              OR: [
                { sprint_id: { in: activeSprintIds } },
                {
                  sprint_id: null,
                  project_id: { in: projectIds },
                },
                {
                  sprint_id: {
                    isSet: false,
                  },
                  project_id: { in: projectIds },
                },
              ],
            },
            {
              OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          sprint_id: true,
          created_at: true,
          projects: {
            select: {
              unique_name: true,
              title: true,
            },
          },
          sprint: {
            select: {
              name: true,
            },
          },
        },
        take: limit,
      }),

      // Search Meetings
      this.prisma.meeting_data.findMany({
        where: {
          AND: [
            { project_id: { in: projectIds } },
            {
              OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { summary: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          ],
        },
        select: {
          id: true,
          title: true,
          created_at: true,
          projects: {
            select: {
              unique_name: true,
              title: true,
            },
          },
        },
        take: limit,
      }),

      // Search Bugs
      this.prisma.project_bugs.findMany({
        where: {
          AND: [
            { projectId: { in: projectIds } },
            {
              OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { summary: { contains: searchTerm, mode: 'insensitive' } },
                { textFeedback: { contains: searchTerm, mode: 'insensitive' } },
                {
                  voiceFeedbackTranscription: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          ],
        },
        select: {
          id: true,
          title: true,
          summary: true,
          status: true,
          createdAt: true,
          project: {
            select: {
              unique_name: true,
              title: true,
            },
          },
        },
        take: limit,
      }),
    ]);

    // Transform results into consistent format
    const results: SearchResult[] = [
      // Project results
      ...projects.map(
        (project): SearchResult => ({
          id: project.id,
          title: project.title,
          type: 'project',
          path: `/dashboard/project/${project.unique_name}`,
          metadata: {
            createdAt: project.created_at,
          },
        }),
      ),

      // Story results
      ...stories.map(
        (story): SearchResult => ({
          id: story.id,
          title: story.title,
          description: story.description,
          type: 'story',
          path: story.sprint_id
            ? `/dashboard/project/${story.projects.unique_name}?storyId=${story.id}`
            : `/dashboard/project/${story.projects.unique_name}/backlog?storyId=${story.id}`,
          projectName: story.projects.title,
          metadata: {
            status: story.status,
            priority: story.priority,
            sprintName: story.sprint?.name,
            createdAt: story.created_at,
          },
        }),
      ),

      // Meeting results
      ...meetings.map(
        (meeting): SearchResult => ({
          id: meeting.id,
          title: meeting.title || 'Untitled Meeting',
          type: 'meeting',
          path: `/dashboard/project/${meeting.projects.unique_name}/meetings?meetingId=${meeting.id}`,
          projectName: meeting.projects.title,
          metadata: {
            createdAt: meeting.created_at,
          },
        }),
      ),

      // Bug results
      ...bugs.map(
        (bug): SearchResult => ({
          id: bug.id,
          title: bug.title || 'Untitled Bug',
          description: bug.summary,
          type: 'bug',
          path: `/dashboard/project/${bug.project.unique_name}/bugs?bugId=${bug.id}`,
          projectName: bug.project.title,
          metadata: {
            status: bug.status,
            createdAt: bug.createdAt,
          },
        }),
      ),
    ];

    // Sort results by relevance (exact title matches first, then by creation date)
    const sortedResults = results
      .sort((a, b) => {
        const aExactMatch = a.title.toLowerCase().includes(searchTerm);
        const bExactMatch = b.title.toLowerCase().includes(searchTerm);

        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;

        return (
          (b.metadata?.createdAt?.getTime() || 0) -
          (a.metadata?.createdAt?.getTime() || 0)
        );
      })
      .slice(0, limit);

    return {
      results: sortedResults,
      total: sortedResults.length,
      query,
    };
  }

  private async getUserEmail(userId: string): Promise<string[]> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    return user ? [user.email] : [];
  }
}
