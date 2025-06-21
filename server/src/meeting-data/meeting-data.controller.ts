import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Post,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MeetingDataService } from './meeting-data.service';
import {
  CreateMeetingDataDto,
  mapToMeetingDataDto,
  MeetingDataDto,
  UpdateMeetingDataDto,
} from './dtos/meeting-data.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { GenerateUserStoriesDto } from './dtos/user-stories.dto';
import { GetUser, RequestUser } from 'src/auth/decorators/user.decorator';

@ApiTags('meeting-data')
@Controller('meeting-data')
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class MeetingDataController {
  constructor(private readonly meetingDataService: MeetingDataService) {}

  @Post()
  async createMeeting(
    @Body() body: CreateMeetingDataDto,
  ): Promise<MeetingDataDto> {
    const meetingData = await this.meetingDataService.create(body);
    return mapToMeetingDataDto(meetingData);
  }

  @Get('project/:projectId')
  async findByProjectId(
    @Param('projectId') projectId: string,
  ): Promise<MeetingDataDto[]> {
    const meetingData =
      await this.meetingDataService.findByProjectId(projectId);
    return meetingData.map((data) => mapToMeetingDataDto(data));
  }

  @Get('global')
  async findGlobalMeetings(
    @GetUser() user: RequestUser,
  ): Promise<MeetingDataDto[]> {
    const meetingData = await this.meetingDataService.findGlobalMeetings(
      user.id,
    );
    return meetingData.map((data) => mapToMeetingDataDto(data));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateMeetingDataDto,
  ): Promise<MeetingDataDto> {
    const meetingData = await this.meetingDataService.update(id, data);
    return mapToMeetingDataDto(meetingData);
  }

  @Patch(':id/moveToProject/:projectId')
  async moveToProject(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
  ): Promise<MeetingDataDto> {
    const meetingData = await this.meetingDataService.moveToProject(
      id,
      projectId,
    );
    return mapToMeetingDataDto(meetingData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<boolean> {
    await this.meetingDataService.remove(id);
    return true;
  }

  @Post('generate-stories')
  @UseInterceptors(FileInterceptor('file'))
  async generateUserStories(
    @Body() body: GenerateUserStoriesDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<true> {
    await this.meetingDataService.generateUserStories(body, file);
    return true;
  }
}
