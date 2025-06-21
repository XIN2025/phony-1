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
import { WorklogService } from './worklog.service';
import {
  CreateWorklogDto,
  UpdateWorklogDto,
  WorklogParams,
} from './dtos/worklog.dto';
import { GetUser, RequestUser } from 'src/auth/decorators/user.decorator';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('worklogs')
@UseGuards(JWTAuthGuard)
@ApiBearerAuth()
@ApiTags('Worklogs')
export class WorklogController {
  constructor(private readonly worklogService: WorklogService) {}

  @Post()
  async createWorklog(
    @Body() createWorklogDto: CreateWorklogDto,
    @GetUser() user: RequestUser,
  ) {
    return this.worklogService.createWorklog(createWorklogDto, user);
  }
  @Put(':id')
  async updateWorklog(
    @Param('id') id: string,
    @Body() updateWorklogDto: UpdateWorklogDto,
    @GetUser() user: RequestUser,
  ) {
    return this.worklogService.updateWorklog(id, updateWorklogDto, user);
  }
  @Delete(':id')
  async deleteWorklog(@Param('id') id: string) {
    return this.worklogService.deleteWorklog(id);
  }

  @Get('me')
  async getMyWorklogs(
    @GetUser() user: RequestUser,
    @Query() params: WorklogParams,
  ) {
    return this.worklogService.getWorklogsByUserId(user.id, params);
  }
}
