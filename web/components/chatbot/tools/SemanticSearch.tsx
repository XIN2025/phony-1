import React, { memo } from 'react';
import { ToolInvocation } from 'ai';
import { Check, Loader2 } from 'lucide-react';
import ShinyText from '@/components/ShinyText';

interface ToolProps {
  tool: ToolInvocation;
}

const PureSemanticSearchTool = ({ tool }: ToolProps) => {
  if (!tool.args) {
    return null;
  }
  const isLoading = tool.state === 'partial-call' || tool.state === 'call';
  if (!isLoading) {
    return (
      <div className="my-1 flex w-fit items-center gap-1 rounded-md text-sm">
        <Check className="size-3.5 text-green-500" />
        <ShinyText text={`Sematic Searched for '${tool.args.searchText}'`} />
      </div>
    );
  }
  return (
    <div className="my-1 flex w-fit items-center gap-1 rounded-md text-sm">
      <Loader2 size={16} className="animate-spin" />
      <ShinyText text={`Sematic Searching for '${tool.args.searchText}'...`} />
    </div>
  );
};

const SemanticSearchTool = memo(PureSemanticSearchTool, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps.tool.args) !== JSON.stringify(nextProps.tool.args)) {
    return false;
  }
  if (prevProps.tool.state !== nextProps.tool.state) {
    return false;
  }
  return true;
});
export default SemanticSearchTool;
