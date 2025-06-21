import { IsEnum } from 'class-validator';

export enum StoryStatus {
  Todo = 'Todo',
  InProgress = 'InProgress',
  Testing = 'Testing',
  Done = 'Done',
}

export class UpdateStoryStatusDto {
  @IsEnum(StoryStatus)
  status: StoryStatus;
}
