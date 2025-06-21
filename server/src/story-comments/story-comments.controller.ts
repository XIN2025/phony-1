import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { StoryCommentsService } from './story-comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from 'src/auth/decorators/user.decorator';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { CommentResponse } from './types/comment.types';

@Controller('story-comments')
@UseGuards(JWTAuthGuard)
export class StoryCommentsController {
  constructor(private readonly storyCommentsService: StoryCommentsService) {}

  @Post()
  async createComment(
    @GetUser() user: RequestUser,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    const comment = await this.storyCommentsService.createComment(user.id, dto);
    return comment;
  }

  @Get(':storyId')
  async getComments(
    @Param('storyId') storyId: string,
  ): Promise<CommentResponse[]> {
    const comments = await this.storyCommentsService.getComments(storyId);
    return comments;
  }

  @Put(':id')
  async updateComment(
    @GetUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentResponse> {
    const comment = await this.storyCommentsService.updateComment(
      user.id,
      id,
      dto,
    );
    return comment;
  }

  @Delete(':id')
  async deleteComment(
    @GetUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<boolean> {
    await this.storyCommentsService.deleteComment(user.id, id);
    return true;
  }
}
