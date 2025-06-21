import React, { memo } from 'react';
import { ToolInvocation } from 'ai';
import { Check, Loader2, Wrench, AlertCircle } from 'lucide-react';
import ShinyText from '@/components/ShinyText';

interface ToolProps {
  tool: ToolInvocation;
}

const PureGenericTool = ({ tool }: ToolProps) => {
  if (!tool.args) {
    return null;
  }

  const isLoading = tool.state === 'partial-call' || tool.state === 'call';
  const toolName = tool.toolName;

  const getReadableToolName = (toolName: string) => {
    return toolName
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
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
        <Wrench className="size-3.5 text-gray-600" />
        <ShinyText
          text={
            hasError
              ? `Tool failed: ${getReadableToolName(toolName)}`
              : `Completed: ${getReadableToolName(toolName)}`
          }
        />
      </div>
    );
  }

  return (
    <div className="my-1 flex w-fit items-center gap-1 rounded-md text-sm">
      <Loader2 size={16} className="animate-spin" />
      <Wrench className="size-3.5 text-gray-600" />
      <ShinyText text={`Using ${getReadableToolName(toolName)}...`} />
    </div>
  );
};

const GenericTool = memo(PureGenericTool, (prevProps, nextProps) => {
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

export default GenericTool;
