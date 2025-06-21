import {
  Controller,
  Body,
  Patch,
  UseGuards,
  Post,
  Get,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ReduceCreditsDto } from './dto/reduce-credits.dto';
import {
  GlobalSearchDto,
  GlobalSearchResponseDto,
} from './dto/global-search.dto';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('users')
@UseGuards(JWTAuthGuard)
@ApiBearerAuth()
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Patch('me')
  update(
    @GetUser() user: { id: string },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(user.id, updateUserDto);
  }

  @Get('me')
  getMe(@GetUser() user: { id: string }) {
    return this.usersService.getMe(user.id);
  }
  @Get('me/credits-available')
  isCreditsAvailable(@GetUser() user: { id: string }) {
    return this.usersService.isCreditsAvailable(user.id);
  }

  @Post('me/reduce-credits')
  reduceCredits(
    @GetUser() user: { id: string },
    @Body() reduceCreditsDto: ReduceCreditsDto,
  ) {
    return this.usersService.reduceCredits(user.id, reduceCreditsDto);
  }

  @Post('me/apply-coupon')
  async applyCoupon(
    @GetUser() user: { id: string },
    @Body() body: { coupon: string },
  ) {
    await this.usersService.applyCoupon(user.id, body.coupon);
    return true;
  }

  @Get('me/search')
  async globalSearch(
    @GetUser() user: { id: string },
    @Query() searchDto: GlobalSearchDto,
  ): Promise<GlobalSearchResponseDto> {
    return this.usersService.globalSearch(user.id, searchDto);
  }
}
