import { ApiProperty } from '@nestjs/swagger';

export class ProjectAnalyticsDto {
  @ApiProperty({ description: 'Total number of sprints in the project' })
  totalSprints: number;

  @ApiProperty({ description: 'Number of active sprints in the project' })
  activeSprints: number;

  @ApiProperty({ description: 'Number of completed sprints in the project' })
  completedSprints: number;

  @ApiProperty({ description: 'Total number of meetings in the project' })
  totalMeetings: number;

  @ApiProperty({ description: 'Total number of tasks in the project' })
  totalTasks: number;

  @ApiProperty({ description: 'Total number of stories in the project' })
  totalStories: number;

  @ApiProperty({ description: 'Number of completed stories in the project' })
  completedStories: number;

  @ApiProperty({ description: 'Number of in-progress stories in the project' })
  inProgressStories: number;

  @ApiProperty({ description: 'Number of testing stories in the project' })
  testingStories: number;

  @ApiProperty({ description: 'Number of todo stories in the project' })
  todoStories: number;

  @ApiProperty({ description: 'Project creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last project update date' })
  updatedAt: Date;
}
