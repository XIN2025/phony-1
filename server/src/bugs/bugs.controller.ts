import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Get,
  Delete,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { BugsService } from './bugs.service';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetUser, RequestUser } from 'src/auth/decorators/user.decorator';
import {
  CreateBugDto,
  CreateBugFilesDto,
  GetBugsByProjectQueryDto,
  UpdateBugAssigneeDto,
  UpdateBugDto,
  UpdateBugStatusDto,
} from './dtos/bug.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  BugCommentResponse,
  BugCreateCommentDto,
  BugUpdateCommentDto,
} from './dtos/bug-comment.dto';

@Controller('bugs')
@ApiTags('Bugs')
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class BugsController {
  constructor(private readonly bugsService: BugsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'screenshots' }, { name: 'voiceFeedback' }]),
  )
  async createBug(
    @UploadedFiles()
    files: CreateBugFilesDto,
    @GetUser() user: RequestUser,
    @Body() createBugDto: CreateBugDto,
  ) {
    return this.bugsService.createBug(
      user.id,
      files,
      createBugDto.projectId,
      createBugDto.textFeedback,
    );
  }

  @Get('byProject/:projectId')
  async getBugsByProject(
    @Param('projectId') projectId: string,
    @Query() query: GetBugsByProjectQueryDto,
  ) {
    return this.bugsService.getBugsByProject(projectId, query);
  }

  @Put(':id/status')
  async updateBugStatus(
    @Param('id') id: string,
    @Body() updateBugStatusDto: UpdateBugStatusDto,
  ) {
    return this.bugsService.updateBugStatus(id, updateBugStatusDto.status);
  }

  @Put(':id/assignee')
  async updateBugAssignee(
    @Param('id') id: string,
    @Body() updateBugAssigneeDto: UpdateBugAssigneeDto,
  ) {
    return this.bugsService.updateBugAssignee(
      id,
      updateBugAssigneeDto.assigneeId,
    );
  }

  @Put(':id')
  async updateBug(@Param('id') id: string, @Body() updateBugDto: UpdateBugDto) {
    return this.bugsService.updateBug(id, updateBugDto);
  }

  @Post(':id/convert-to-task')
  async convertBugToTask(@Param('id') id: string) {
    return this.bugsService.convertBugToTask(id);
  }

  @Delete(':id')
  async deleteBug(@Param('id') id: string) {
    return this.bugsService.deleteBug(id);
  }

  @Get(':id/comments')
  async findCommentsByWikiId(
    @Param('id') id: string,
  ): Promise<BugCommentResponse[]> {
    const comments = await this.bugsService.getComments(id);
    return comments;
  }

  @Post('comment')
  async addComment(
    @Body() comment: BugCreateCommentDto,
    @GetUser() user: RequestUser,
  ): Promise<BugCommentResponse> {
    const newComment = await this.bugsService.createComment(user.id, comment);
    return newComment;
  }

  @Delete('comment/:id')
  async deleteComment(
    @Param('id') id: string,
    @GetUser() user: RequestUser,
  ): Promise<boolean> {
    await this.bugsService.deleteComment(user.id, id);
    return true;
  }
  @Put('comment/:id')
  async updateComment(
    @Param('id') id: string,
    @Body() data: BugUpdateCommentDto,
    @GetUser() user: RequestUser,
  ): Promise<BugCommentResponse> {
    const comment = await this.bugsService.updateComment(user.id, id, data);
    return comment;
  }
}
