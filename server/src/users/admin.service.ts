import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetUserCreditsQueryDto } from './dto/get-user-credits.dto';
import { GetUsersByDateRangeDto } from './dto/get-users-by-date-range.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { GetTransactionsQueryDto } from './dto/get-transaction.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getTransactions(query: GetTransactionsQueryDto) {
    try {
      const {
        status,
        type,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = '1',
        limit = '10',
      } = query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {
        ...(status && { status }),
        ...(type && { type }),
      };

      const [transactions, total] = await Promise.all([
        this.prisma.creditTransactions.findMany({
          where,
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip,
          take: parseInt(limit),
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        }),
        this.prisma.creditTransactions.count({ where }),
      ]);

      return {
        transactions,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      };
    } catch (error) {
      console.error('Error in getTransactions:', error);
      throw new HttpException('Error in getTransactions', 500);
    }
  }

  async getUsersByDateRange(dateRange: GetUsersByDateRangeDto) {
    try {
      const users = await this.prisma.users.findMany({
        where: {
          created_at: {
            gte: new Date(dateRange.startDate),
            lte: new Date(dateRange.endDate),
          },
        },
        include: {
          waitlist: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return users.map((user) => ({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        project_count: user.project_count || 0,
        created_at: user.created_at.toISOString(),
        status: user.waitlist
          ? user.waitlist.status === 'APPROVED'
            ? 'FULL_ACCESS'
            : 'BETA_ACCESS'
          : 'BETA_ACCESS',
      }));
    } catch (error) {
      console.error('Error in getUsersByDateRange:', error);
      throw error;
    }
  }

  async getDashboardStats() {
    try {
      // Get all required data in parallel
      const [users, waitlist, creditsStats] = await Promise.all([
        // Get total users count
        this.prisma.users.count(),

        // Get waitlist counts by status
        this.prisma.waitlist.groupBy({
          by: ['status'],
          _count: true,
        }),

        // Get total credits stats
        this.prisma.users.aggregate({
          _sum: {
            credits_used: true,
            credits_remaining: true,
          },
        }),
      ]);

      // Process waitlist counts
      const waitlistCounts = this.processWaitlistCounts(waitlist);

      return {
        overview: {
          totalUsers: users,
          totalCredits: creditsStats._sum.credits_remaining || 0,
          totalCreditsUsed: creditsStats._sum.credits_used || 0,
          waitlistCounts,
        },
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      throw error;
    }
  }

  async getUserCredits(query: GetUserCreditsQueryDto) {
    const { search, sortBy = 'name', sortOrder = 'asc' } = query;

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { first_name: { contains: search, mode: 'insensitive' as const } },
            { last_name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Build orderBy based on sortBy field
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (sortBy === 'credits_used') {
      orderBy['credits_used'] = sortOrder;
    } else if (sortBy === 'credits_remaining') {
      orderBy['credits_remaining'] = sortOrder;
    } else if (sortBy === 'meeting_credits_used') {
      orderBy['meeting_credits_used'] = sortOrder;
    } else if (sortBy === 'meeting_credits_remaining') {
      orderBy['meeting_credits_remaining'] = sortOrder;
    } else if (sortBy === 'updated_at') {
      orderBy['updated_at'] = sortOrder;
    } else if (sortBy === 'created_at') {
      orderBy['created_at'] = sortOrder;
    }

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          credits_remaining: true,
          credits_used: true,
          meeting_credits_remaining: true,
          meeting_credits_used: true,
          project_count: true,
          max_projects: true,
          linkedin_profile_url: true,
          is_verified: true,
          password: true,
          created_at: true,
          updated_at: true,
          waitlist: true,
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.users.count({ where }),
    ]);

    return {
      users: users.map((user) => ({
        ...user,
        password: !!user.password,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addCreditsToUser(userId: string, credits: number) {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      const updatedUser = await this.prisma.users.update({
        where: {
          id: userId,
        },
        data: {
          credits_remaining: user.credits_remaining
            ? {
                increment: credits,
              }
            : credits,
        },
      });

      return updatedUser;
    } catch (error) {
      console.error('Error in addCreditsToUser:', error.message);
      throw error;
    }
  }

  async deductCreditsFromUser(userId: string, credits: number) {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      if (!user.credits_remaining || user.credits_remaining < credits) {
        return await this.prisma.users.update({
          where: {
            id: userId,
          },
          data: {
            credits_remaining: 0,
          },
        });
      }

      const updatedUser = await this.prisma.users.update({
        where: {
          id: userId,
        },
        data: {
          credits_remaining: {
            decrement: credits,
          },
        },
      });

      return updatedUser;
    } catch (error) {
      console.error('Error in deductCreditsFromUser:', error.message);
      throw error;
    }
  }

  private processWaitlistCounts(waitlist: any[]) {
    // Initialize counts object with default values
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    // Update counts based on waitlist data
    waitlist.forEach((item) => {
      const status = item.status.toLowerCase();
      counts[status] = item._count;
    });

    return counts;
  }

  async updateMaxProjects(userId: string, maxProjects: number) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      const updatedUser = await this.prisma.users.update({
        where: { id: userId },
        data: { max_projects: maxProjects },
      });

      return updatedUser;
    } catch (error) {
      console.error('Error in updateMaxProjects:', error.message);
      throw error;
    }
  }

  async updateMeetingCredits(userId: string, credits: number) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      const updatedUser = await this.prisma.users.update({
        where: { id: userId },
        data: {
          meeting_credits_remaining: user.meeting_credits_remaining
            ? { increment: credits }
            : credits,
        },
      });

      return updatedUser;
    } catch (error) {
      console.error('Error in updateMeetingCredits:', error.message);
      throw error;
    }
  }

  async deductMeetingCredits(userId: string, credits: number) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      if (
        !user.meeting_credits_remaining ||
        user.meeting_credits_remaining < credits
      ) {
        return await this.prisma.users.update({
          where: { id: userId },
          data: { meeting_credits_remaining: 0 },
        });
      }

      const updatedUser = await this.prisma.users.update({
        where: { id: userId },
        data: {
          meeting_credits_remaining: { decrement: credits },
        },
      });

      return updatedUser;
    } catch (error) {
      console.error('Error in deductMeetingCredits:', error.message);
      throw error;
    }
  }

  async getCoupons() {
    try {
      const coupons = this.prisma.coupon_codes.findMany({
        orderBy: {
          created_at: 'desc',
        },
      });

      return coupons;
    } catch (error) {
      console.error('Error in getCoupons:', error.message);
      throw error;
    }
  }

  async createCoupon(createCouponDto: CreateCouponDto) {
    try {
      // Check if coupon with same code already exists
      const existingCoupon = await this.prisma.coupon_codes.findUnique({
        where: { code: createCouponDto.code },
      });

      if (existingCoupon) {
        throw new HttpException('Coupon code already exists', 400);
      }

      const coupon = await this.prisma.coupon_codes.create({
        data: {
          ...createCouponDto,
          expires_at: createCouponDto.expires_at
            ? new Date(createCouponDto.expires_at)
            : null,
          used_count: 0,
        },
      });

      return coupon;
    } catch (error) {
      console.error('Error in createCoupon:', error.message);
      throw error;
    }
  }

  async updateCoupon(id: string, updateCouponDto: UpdateCouponDto) {
    try {
      const existingCoupon = await this.prisma.coupon_codes.findUnique({
        where: { id },
      });

      if (!existingCoupon) {
        throw new HttpException('Coupon not found', 404);
      }

      const coupon = await this.prisma.coupon_codes.update({
        where: { id },
        data: {
          ...updateCouponDto,
          expires_at: updateCouponDto.expires_at
            ? new Date(updateCouponDto.expires_at)
            : undefined,
        },
      });

      return coupon;
    } catch (error) {
      console.error('Error in updateCoupon:', error.message);
      throw error;
    }
  }

  async deleteCoupon(id: string) {
    try {
      const existingCoupon = await this.prisma.coupon_codes.findUnique({
        where: { id },
      });

      if (!existingCoupon) {
        throw new HttpException('Coupon not found', 404);
      }

      await this.prisma.coupon_codes.delete({
        where: { id },
      });

      return { message: 'Coupon deleted successfully' };
    } catch (error) {
      console.error('Error in deleteCoupon:', error.message);
      throw error;
    }
  }
}
