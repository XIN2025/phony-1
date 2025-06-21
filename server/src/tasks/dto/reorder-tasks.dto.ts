import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TaskOrderDto {
  @IsString()
  taskId: string;

  @IsNumber()
  order: number;
}

export class StoryOrderDto {
  @IsString()
  storyId: string;

  @IsNumber()
  order: number;
}

export class ReorderTasksDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TaskOrderDto)
  tasks: TaskOrderDto[];
}

export class ReorderStoriesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StoryOrderDto)
  stories: StoryOrderDto[];
}
