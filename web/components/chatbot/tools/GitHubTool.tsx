import React, { memo } from 'react';
import { ToolInvocation } from 'ai';
import { Check, Loader2, Github, AlertCircle } from 'lucide-react';
import ShinyText from '@/components/ShinyText';

interface ToolProps {
  tool: ToolInvocation;
}

const PureGitHubTool = ({ tool }: ToolProps) => {
  if (!tool.args) {
    return null;
  }

  const isLoading = tool.state === 'partial-call' || tool.state === 'call';
  const toolName = tool.toolName;

  const getActionText = (toolName: string, args: Record<string, unknown>) => {
    if (toolName.includes('create_issue')) {
      return `Creating GitHub issue: "${args.title || 'Untitled'}"`;
    }
    if (toolName.includes('list_issues')) {
      return `Fetching GitHub issues${args.repo ? ` from ${args.repo}` : ''}`;
    }
    if (toolName.includes('get_issue')) {
      return `Getting GitHub issue #${args.issue_number || args.number || ''}`;
    }
    if (toolName.includes('create_pull_request')) {
      return `Creating pull request: "${args.title || 'Untitled'}"`;
    }
    if (toolName.includes('list_pull_requests')) {
      return `Fetching pull requests${args.repo ? ` from ${args.repo}` : ''}`;
    }
    if (toolName.includes('get_pull_request')) {
      return `Getting pull request #${args.pull_number || args.number || ''}`;
    }
    if (toolName.includes('create_repository')) {
      return `Creating repository: "${args.name || 'Untitled'}"`;
    }
    if (toolName.includes('list_repositories')) {
      return `Fetching repositories${args.owner ? ` for ${args.owner}` : ''}`;
    }
    if (toolName.includes('get_repository')) {
      return `Getting repository: ${args.owner}/${args.repo}`;
    }
    if (toolName.includes('search_repositories')) {
      return `Searching repositories: "${args.query || args.q || 'No query'}"`;
    }
    if (toolName.includes('search_code')) {
      return `Searching code: "${args.query || args.q || 'No query'}"`;
    }
    if (toolName.includes('create_branch')) {
      return `Creating branch: "${args.branch || args.ref || 'Untitled'}"`;
    }
    if (toolName.includes('list_branches')) {
      return `Fetching branches${args.repo ? ` from ${args.repo}` : ''}`;
    }
    if (
      toolName.includes('get_file') ||
      toolName.includes('read_file') ||
      toolName.includes('get_file_contents')
    ) {
      return `Reading file: ${args.path || args.file_path || 'Unknown file'}`;
    }
    if (toolName.includes('create_file') || toolName.includes('write_file')) {
      return `Creating file: ${args.path || args.file_path || 'Unknown file'}`;
    }
    if (toolName.includes('update_file')) {
      return `Updating file: ${args.path || args.file_path || 'Unknown file'}`;
    }
    if (toolName.includes('delete_file')) {
      return `Deleting file: ${args.path || args.file_path || 'Unknown file'}`;
    }
    if (toolName.includes('commit')) {
      return `Creating commit: "${args.message || 'No message'}"`;
    }
    if (toolName.includes('search')) {
      return `Searching GitHub: "${args.query || args.q || 'No query'}"`;
    }

    return `Using GitHub tool: ${toolName.replace(/_/g, ' ')}`;
  };

  if (!isLoading) {
    const result = tool.result;
    const hasError = result && (result.error || result.success === false);

    return (
      <div className="my-1 flex w-fit items-center gap-1 rounded-md text-sm">
        {hasError ? (
          <AlertCircle className="size-3.5 text-red-500" />
        ) : (
          <Check className="size-3.5 text-green-500" />
        )}
        <Github className="size-3.5 text-gray-600" />
        <ShinyText
          text={
            hasError
              ? `GitHub action failed: ${result?.error || 'Unknown error'}`
              : `Completed: ${getActionText(toolName, tool.args)}`
          }
        />
      </div>
    );
  }

  return (
    <div className="my-1 flex w-fit items-center gap-1 rounded-md text-sm">
      <Loader2 size={16} className="animate-spin" />
      <Github className="size-3.5 text-gray-600" />
      <ShinyText text={`${getActionText(toolName, tool.args)}...`} />
    </div>
  );
};

const GitHubTool = memo(PureGitHubTool, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps.tool.args) !== JSON.stringify(nextProps.tool.args)) {
    return false;
  }
  if (prevProps.tool.state !== nextProps.tool.state) {
    return false;
  }
  if (prevProps.tool.toolName !== nextProps.tool.toolName) {
    return false;
  }
  return true;
});

export default GitHubTool;
