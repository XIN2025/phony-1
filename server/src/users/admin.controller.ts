import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { GetUserCreditsQueryDto } from './dto/get-user-credits.dto';
import { GetUsersByDateRangeDto } from './dto/get-users-by-date-range.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddDeductCreditsDto, UpdateMaxProjectsDto } from './dto/admin.dto';
import { GetTransactionsQueryDto } from './dto/get-transaction.dto';

@Controller('admin')
@UseGuards(JWTAuthGuard, AdminGuard)
@ApiBearerAuth()
@ApiTags('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get('transactions')
  getTransactions(@Query() query: GetTransactionsQueryDto) {
    return this.adminService.getTransactions(query);
  }
  @Get('users/by-date')
  getUsersByDateRange(@Query() dateRange: GetUsersByDateRangeDto) {
    return this.adminService.getUsersByDateRange(dateRange);
  }

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('credits')
  getUserCredits(@Query() query: GetUserCreditsQueryDto) {
    return this.adminService.getUserCredits(query);
  }

  @Post('credits/add/:userId')
  async addCreditsToUser(
    @Param('userId') userId: string,
    @Body() body: AddDeductCreditsDto,
  ) {
    await this.adminService.addCreditsToUser(userId, body.credits);
    return true;
  }

  @Post('credits/deduct/:userId')
  async deductCreditsFromUser(
    @Param('userId') userId: string,
    @Body() body: AddDeductCreditsDto,
  ) {
    await this.adminService.deductCreditsFromUser(userId, body.credits);
    return true;
  }

  @Put('max-projects/:userId')
  async updateMaxProjects(
    @Param('userId') userId: string,
    @Body() body: UpdateMaxProjectsDto,
  ) {
    await this.adminService.updateMaxProjects(userId, body.maxProjects);
    return true;
  }

  @Put('meeting-credits/add/:userId')
  async updateMeetingCredits(
    @Param('userId') userId: string,
    @Body() body: AddDeductCreditsDto,
  ) {
    await this.adminService.updateMeetingCredits(userId, body.credits);
    return true;
  }

  @Post('meeting-credits/deduct/:userId')
  async deductMeetingCredits(
    @Param('userId') userId: string,
    @Body() body: AddDeductCreditsDto,
  ) {
    await this.adminService.deductMeetingCredits(userId, body.credits);
    return true;
  }

  @Get('coupons')
  getCoupons() {
    return this.adminService.getCoupons();
  }

  @Post('coupons')
  createCoupon(@Body() createCouponDto: CreateCouponDto) {
    return this.adminService.createCoupon(createCouponDto);
  }

  @Put('coupons/:id')
  updateCoupon(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.adminService.updateCoupon(id, updateCouponDto);
  }

  @Delete('coupons/:id')
  async deleteCoupon(@Param('id') id: string) {
    await this.adminService.deleteCoupon(id);
    return true;
  }
}
