import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Post,
} from '@nestjs/common';
import { WikiService } from './wiki.service';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser, RequestUser } from 'src/auth/decorators/user.decorator';
import { WikiAccessLevel } from '@prisma/client';
import {
  WikiCreateCommentDto,
  WikiGenerateSprintDto,
} from './dto/create-comment.dto';
import { WikiUpdateCommentDto } from './dto/update-comment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WikiCommentResponse } from './dto/types/comment.types';

@Controller('wiki')
@UseGuards(JWTAuthGuard)
@ApiBearerAuth()
@ApiTags('Wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @Get('project/:unique_name')
  findByProjectId(@Param('unique_name') unique_name: string) {
    return this.wikiService.findByProjectName(unique_name);
  }

  @Post('project/:unique_name')
  async create(
    @Param('unique_name') unique_name: string,
    @Body('parentId') parentId: string,
    @GetUser() user: RequestUser,
  ) {
    return await this.wikiService.create({
      unique_name: unique_name,
      parentId: parentId,
      created_by: user.id,
    });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.wikiService.findById(id);
  }
  @Post(':id/generate-sprint')
  generateSprint(@Param('id') id: string, @Body() data: WikiGenerateSprintDto) {
    return this.wikiService.generateSprint(id, data);
  }

  @Put(':id/access')
  updateAccessById(
    @Param('id') id: string,
    @Body() data: { access_level: WikiAccessLevel; is_public: boolean },
    @GetUser() user: RequestUser,
  ) {
    return this.wikiService.updateAccessById(id, data, user.id);
  }
  @Put(':id')
  updateById(
    @Param('id') id: string,
    @Body() data: { title?: string; content?: string },
  ) {
    return this.wikiService.updateById(id, data);
  }

  @Delete(':id')
  deleteById(@Param('id') id: string) {
    return this.wikiService.deleteById(id);
  }

  @Get(':id/comments')
  async findCommentsByWikiId(
    @Param('id') id: string,
  ): Promise<WikiCommentResponse[]> {
    const comments = await this.wikiService.getComments(id);
    return comments;
  }

  @Post('comment')
  async addComment(
    @Body() comment: WikiCreateCommentDto,
    @GetUser() user: RequestUser,
  ): Promise<WikiCommentResponse> {
    const newComment = await this.wikiService.createComment(user.id, comment);
    return newComment;
  }

  @Delete('comment/:id')
  async deleteComment(
    @Param('id') id: string,
    @GetUser() user: RequestUser,
  ): Promise<boolean> {
    await this.wikiService.deleteComment(user.id, id);
    return true;
  }
  @Put('comment/:id')
  async updateComment(
    @Param('id') id: string,
    @Body() data: WikiUpdateCommentDto,
    @GetUser() user: RequestUser,
  ): Promise<WikiCommentResponse> {
    const comment = await this.wikiService.updateComment(user.id, id, data);
    return comment;
  }
}
