import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type Props = {
  codeSpaceUrl: string;
};

export const ReadyEnvironment = ({ codeSpaceUrl }: Props) => {
  return (
    <div className="flex flex-1 flex-wrap items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Development Environment</h3>
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            Ready
          </div>
        </div>
        <p className="text-muted-foreground text-sm">Your workspace is ready to use</p>
      </div>

      <Link
        href={codeSpaceUrl}
        target="_blank"
        className="group flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Open CodeSpace
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
};
