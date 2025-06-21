import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Header,
} from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import {
  CreateWaitlistDto,
  UpdateWaitlistDto,
  WaitlistResponseDto,
} from './dtos/waitlist.dto';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser, RequestUser } from 'src/auth/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller('waitlist')
@ApiTags('Waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post('join')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Methods', 'POST')
  @Header('Access-Control-Allow-Headers', 'Content-Type, Accept')
  async joinWaitlist(
    @Body() createWaitlistDto: CreateWaitlistDto,
  ): Promise<WaitlistResponseDto> {
    return this.waitlistService.joinWaitlist(createWaitlistDto);
  }

  @Post()
  async create(
    @Body() createWaitlistDto: CreateWaitlistDto,
  ): Promise<WaitlistResponseDto> {
    return this.waitlistService.create(createWaitlistDto);
  }

  @UseGuards(JWTAuthGuard)
  @Get()
  async findAll(): Promise<WaitlistResponseDto[]> {
    return this.waitlistService.findAll();
  }
  @UseGuards(JWTAuthGuard)
  @Get('isUserApproved')
  async isUserApproved(@GetUser() user: RequestUser): Promise<boolean> {
    return this.waitlistService.isUserInWaitlistAndApproved(user.email);
  }

  @UseGuards(JWTAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<WaitlistResponseDto> {
    return this.waitlistService.findOne(id);
  }

  @UseGuards(JWTAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWaitlistDto: UpdateWaitlistDto,
  ): Promise<WaitlistResponseDto> {
    return this.waitlistService.updateStatus(id, updateWaitlistDto);
  }

  @UseGuards(JWTAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<WaitlistResponseDto> {
    return this.waitlistService.remove(id);
  }
}
