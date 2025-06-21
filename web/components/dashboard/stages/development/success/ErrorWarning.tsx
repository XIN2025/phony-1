import { Code2 } from 'lucide-react';

export const ErrorWarning = () => {
  return (
    <div className="dark:bg-sidebar border-b bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 p-2 max-sm:hidden dark:bg-amber-500/10">
          <Code2 className="h-5 w-5 text-amber-700" />
        </div>
        <div>
          <h3 className="dark:text-foreground font-medium text-amber-900">Quick Review Needed</h3>
          <p className="dark:text-muted-foreground mt-1 text-sm text-amber-700">
            Your project has been successfully generated, but it contains some compile-time errors
            that need to be resolved before deployment. These issues may include:
          </p>
          <ul className="dark:text-muted-foreground mt-2 list-inside list-disc space-y-1 text-sm text-amber-700">
            <li>TypeScript compilation errors</li>
            <li>Missing or uninstalled npm packages</li>
            <li>Database schema mismatches</li>
            <li>Environment configuration discrepancies</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
