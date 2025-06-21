import { ArrowRight, Code2, Github } from 'lucide-react';

type Props = {
  repoUrl: string;
  creatingCodespace?: boolean;
  onGenerateCodespace?: () => void;
};

export const ActionButtons = ({ repoUrl, creatingCodespace, onGenerateCodespace }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <button
        onClick={() => window.open(`vscode:extension/opengig.og-helix`)}
        className="group dark:bg-card dark:hover:bg-card/70 flex items-center gap-4 rounded-lg border bg-white p-4 transition-all hover:bg-blue-50/40"
      >
        <div className="rounded-full bg-green-500/20 p-3">
          <Code2 className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-medium">Install Helix</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Get VS Code extension</p>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-0.5" />
      </button>

      <button
        onClick={() => window.open(`vscode://vscode.git/clone?url=${repoUrl}`)}
        className="group dark:bg-card dark:hover:bg-card/70 flex items-center gap-4 rounded-lg border bg-white p-4 transition-all hover:bg-blue-50/40"
      >
        <div className="rounded-full bg-blue-500/20 p-3">
          <Code2 className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-medium">Open in VS Code</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Clone and open locally</p>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-0.5" />
      </button>

      {onGenerateCodespace && (
        <>
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="border-muted w-full border-t"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-sidebar text-muted-foreground px-2 text-sm">OR</span>
            </div>
          </div>

          <button
            disabled={creatingCodespace}
            onClick={onGenerateCodespace}
            className="group dark:bg-card dark:hover:bg-card/70 flex items-center gap-4 rounded-lg border bg-white p-4 transition-all hover:bg-blue-50/40"
          >
            <div className="rounded-full bg-purple-500/20 p-3">
              <Github className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Create CodeSpace</h3>
              <p className="text-muted-foreground text-sm">Cloud development environment</p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-0.5" />
          </button>
        </>
      )}
    </div>
  );
};
