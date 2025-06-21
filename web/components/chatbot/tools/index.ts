import SemanticSearchTool from './SemanticSearch';
import MeetingDetailsByIdTool from './MeetingDetailsById';
import WikiListTool from './WikiList';
import MeetingListTool from './MeetingList';
import WikiDetailsByIdTool from './WikiDetailsById';
import SprintDetailsByIdTool from './SprintDetailsById';
import TaskDetailsByIdTool from './TaskDetailsById';
import GitHubTool from './GitHubTool';
import DocumentationTool from './DocumentationTool';
import GenericTool from './GenericTool';

const staticToolComponents = {
  semanticSearch: SemanticSearchTool,
  fetchMeetingDetailsById: MeetingDetailsByIdTool,
  findWikiList: WikiListTool,
  findMeetingList: MeetingListTool,
  fetchWikiDetailsById: WikiDetailsByIdTool,
  fetchSprintDetailsById: SprintDetailsByIdTool,
  fetchTaskDetailById: TaskDetailsByIdTool,
};

const getToolComponent = (toolName: string) => {
  if (toolName in staticToolComponents) {
    return staticToolComponents[toolName as keyof typeof staticToolComponents];
  }

  if (
    toolName.includes('search_repositories') ||
    toolName.includes('search_code') ||
    toolName.includes('get_file_contents')
  ) {
    return GitHubTool;
  }

  if (toolName.includes('resolve-library-id') || toolName.includes('get-library-docs')) {
    return DocumentationTool;
  }

  return GenericTool;
};

export const toolComponents = new Proxy(staticToolComponents, {
  get(target, prop: string) {
    return getToolComponent(prop);
  },
  has() {
    return true;
  },
});
