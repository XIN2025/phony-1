import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GenerateRequirementDto } from './dto/generate-requirement.dto';
import { GenerateStoriesDto } from './dto/generate-stories.dto';
import { GenerateAcceptanceCriteriaDto } from './dto/generate-acceptance-criteria.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { map } from 'rxjs';
import { switchMap } from 'rxjs';
import { startWith } from 'rxjs';
import { interval } from 'rxjs';
import {
  CreateStoryDto,
  UpdateStoryDto,
  UpdateStoryTaskDto,
} from './dto/user-stories.dto';
import {
  CreateTaskDto,
  MoveStoryToTaskDto,
  TaskDto,
  UpdateTaskDto,
  UserStoriesDto,
} from './dto/tasks.dto';
import { GetUser, RequestUser } from 'src/auth/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ReorderStoriesDto, ReorderTasksDto } from './dto/reorder-tasks.dto';

@Controller('tasks')
@ApiTags('tasks')
@UseGuards(JWTAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('')
  async generateTasks(@Body() dto: GenerateRequirementDto) {
    this.tasksService.generateTasks(dto);
    return true;
  }
  @Post('create')
  async createTask(@Body() dto: CreateTaskDto) {
    const task = await this.tasksService.createTask(dto);
    return task;
  }

  @Post('user-stories')
  async generateUserStories(@Body() dto: GenerateStoriesDto) {
    await this.tasksService.generateUserStories(dto);
    return true;
  }

  @Post('user-stories/acceptance-criterion')
  async generateAcceptanceCriterion(
    @Body() dto: GenerateAcceptanceCriteriaDto,
  ) {
    return this.tasksService.generateAcceptanceCriterion(dto);
  }
  @Post('user-stories/story')
  async createStory(@Body() dto: CreateStoryDto, @GetUser() user: RequestUser) {
    const story = await this.tasksService.createStory(dto, user);
    return story;
  }
  @Put('user-stories/story/:id')
  @UseGuards(JWTAuthGuard)
  async updateUserStories(
    @Param('id') id: string,
    @Body() body: UpdateStoryDto,
    @GetUser() user: RequestUser,
  ): Promise<UserStoriesDto> {
    const userStory = await this.tasksService.updateStory(id, body, user.id);
    return userStory;
  }

  @Put('user-stories/story/:id/task')
  @UseGuards(JWTAuthGuard)
  async updateUserStoriesTask(
    @Param('id') id: string,
    @Body() body: UpdateStoryTaskDto,
  ): Promise<UserStoriesDto> {
    const userStory = await this.tasksService.updateStoryTask(id, body.taskId);
    return userStory;
  }
  @Delete('user-stories/story/:id')
  @UseGuards(JWTAuthGuard)
  async deleteStory(
    @Param('id') id: string,
    @GetUser() user: RequestUser,
  ): Promise<boolean> {
    await this.tasksService.deleteStory(id, user);
    return true;
  }
  @Sse('task-status/:sprintId')
  async getTaskStatus(@Param('sprintId') sprintId: string) {
    return interval(3000).pipe(
      startWith(0),
      switchMap(async () => {
        try {
          return await this.tasksService.getTaskStatus(sprintId);
        } catch (error) {
          return { type: 'error', data: [] };
        }
      }),
      map((response) => ({ data: response })),
    );
  }

  @Sse('story-status/:taskId')
  async getStoryStatus(@Param('taskId') taskId: string) {
    return interval(3000).pipe(
      startWith(0),
      switchMap(async () => {
        try {
          return await this.tasksService.getStoryStatus(taskId);
        } catch (error) {
          return { type: 'error', data: [] };
        }
      }),
      map((response) => ({ data: response })),
    );
  }

  @Sse('acceptance-criterion-status/:storyId')
  async getAcceptanceCriterionStatus(@Param('storyId') storyId: string) {
    return interval(3000).pipe(
      startWith(0),
      switchMap(async () => {
        try {
          return await this.tasksService.getAcceptanceCriterionStatus(storyId);
        } catch (error) {
          return { type: 'error', data: [] };
        }
      }),
      map((response) => ({ data: response })),
    );
  }
  @Sse('prompts-status/:storyId')
  async getPromptsStatus(@Param('storyId') storyId: string) {
    return interval(3000).pipe(
      startWith(0),
      switchMap(async () => {
        try {
          return await this.tasksService.getPromptsStatus(storyId);
        } catch (error) {
          return { type: 'error', data: {} };
        }
      }),
      map((response) => ({ data: response })),
    );
  }

  @Put('reorder')
  @UseGuards(JWTAuthGuard)
  async reorderTasks(@Body() dto: ReorderTasksDto): Promise<boolean> {
    await this.tasksService.reorderTasks(dto.tasks);
    return true;
  }
  @Put('stories/reorder')
  @UseGuards(JWTAuthGuard)
  async reorderStories(@Body() dto: ReorderStoriesDto): Promise<boolean> {
    await this.tasksService.reorderStories(dto.stories);
    return true;
  }

  @Put(':id')
  @UseGuards(JWTAuthGuard)
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskDto> {
    const task = await this.tasksService.updateTask(id, updateTaskDto);
    return task;
  }

  @Delete(':id')
  @UseGuards(JWTAuthGuard)
  async deleteTask(@Param('id') id: string): Promise<boolean> {
    await this.tasksService.deleteTask(id);
    return true;
  }

  @Get('sprint/:sprintId')
  async getTasksBySprintId(@Param('sprintId') sprintId: string) {
    const tasks = await this.tasksService.getTasksBySprintId(sprintId);
    return tasks;
  }

  @Get('backlog/:projectId')
  @UseGuards(JWTAuthGuard)
  async getBacklogTasks(
    @Param('projectId') projectId: string,
  ): Promise<TaskDto[]> {
    const tasks = await this.tasksService.getBacklogTasks(projectId);
    return tasks;
  }

  @Put(':taskId/move-to-backlog')
  @UseGuards(JWTAuthGuard)
  async moveTaskToBacklog(@Param('taskId') taskId: string): Promise<TaskDto> {
    const task = await this.tasksService.moveTaskToBacklog(taskId);
    return task;
  }

  @Put(':taskId/move-to-sprint')
  @UseGuards(JWTAuthGuard)
  async moveTaskToSprint(@Param('taskId') taskId: string): Promise<TaskDto> {
    const task = await this.tasksService.moveTaskToSprint(taskId);
    return task;
  }

  @Put('user-stories/story/:storyId/task')
  @UseGuards(JWTAuthGuard)
  async updateStoryStatus(
    @Param('storyId') storyId: string,
    @Body() body: MoveStoryToTaskDto,
  ) {
    return this.tasksService.moveStoryToTask(storyId, body.taskId);
  }
}
