import { Sprint } from '@/types/project';
import { format } from 'date-fns';

export const formatSprintToMarkdown = (sprint: Sprint): string => {
  const formatDate = (date: string) => format(new Date(date), 'MMMM dd, yyyy');

  let markdown = `# ${sprint.name}\n\n`;

  // Sprint Metadata
  markdown += `**Sprint Number:** ${sprint.sprintNumber}\n`;
  markdown += `**Status:** ${sprint.status}\n`;
  markdown += `**Duration:** ${formatDate(new Date(sprint.startDate).toISOString())} - ${formatDate(new Date(sprint.endDate).toISOString())}\n\n`;

  // Tasks
  sprint.tasks?.forEach((task) => {
    markdown += `## Task: ${task.title}\n\n`;
    markdown += `**Type:** ${task.type}\n`;
    markdown += `**Description:** ${task.description}\n\n`;

    // Stories
    task.stories?.forEach((story) => {
      markdown += `### Story: ${story.title}\n\n`;
      markdown += `**Assignee:** ${story.assignee ? `${story.assignee.firstName} ${story.assignee.lastName}` : 'Unassigned'}\n`;
      markdown += `**Status:** ${story.status || 'Todo'}\n\n`;

      markdown += `#### Acceptance Criteria:\n\n`;
      story.acceptanceCriteria?.forEach((ac) => {
        markdown += `- [${ac.isCompleted ? 'x' : ' '}] ${ac.isCompleted ? `~~${ac.criteria}~~` : ac.criteria}\n`;
      });
      markdown += '\n';
    });
  });

  return markdown;
};
