import React, { memo } from 'react';
import { ToolInvocation } from 'ai';
import { Check, Loader2, FileText, AlertCircle } from 'lucide-react';
import ShinyText from '@/components/ShinyText';

interface ToolProps {
  tool: ToolInvocation;
}

const PureDocumentationTool = ({ tool }: ToolProps) => {
  if (!tool.args) {
    return null;
  }

  const isLoading = tool.state === 'partial-call' || tool.state === 'call';
  const toolName = tool.toolName;

  const getActionText = (toolName: string, args: Record<string, unknown>) => {
    if (toolName.includes('resolve-library-id')) {
      return `Resolving library ID for: "${args.library || args.name || 'Unknown library'}"`;
    }
    if (toolName.includes('get-library-docs')) {
      return `Fetching documentation for: "${args.library_id || args.libraryId || args.id || 'Unknown library'}"`;
    }

    return `Using documentation tool: ${toolName.replace(/_/g, ' ').replace(/-/g, ' ')}`;
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
        <FileText className="size-3.5 text-blue-600" />
        <ShinyText
          text={
            hasError
              ? `Documentation action failed: ${result?.error || 'Unknown error'}`
              : `Completed: ${getActionText(toolName, tool.args)}`
          }
        />
      </div>
    );
  }

  return (
    <div className="my-1 flex w-fit items-center gap-1 rounded-md text-sm">
      <Loader2 size={16} className="animate-spin" />
      <FileText className="size-3.5 text-blue-600" />
      <ShinyText text={`${getActionText(toolName, tool.args)}...`} />
    </div>
  );
};

const DocumentationTool = memo(PureDocumentationTool, (prevProps, nextProps) => {
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

export default DocumentationTool;
