import { ArrowRight, Github } from 'lucide-react';
import Link from 'next/link';

type Props = {
  repoUrl: string;
};

export const Header = ({ repoUrl }: Props) => {
  return (
    <div className="border-b p-6">
      <div className="space-y-4 sm:flex sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold">Project Generated Successfully! 🎉</h2>
          <p className="text-muted-foreground mt-1">Your development environment is ready</p>
        </div>
        <Link
          href={repoUrl}
          target="_blank"
          className="bg-card hover:bg-card/80 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors sm:w-auto"
        >
          <Github className="h-4 w-4" />
          View Repository
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
