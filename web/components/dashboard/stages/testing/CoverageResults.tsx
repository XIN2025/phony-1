import { CoverageRun, CoverageStats } from '@/types/testing';
import { format } from 'date-fns';
import { Clock, FileCode, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface CoverageResultsProps {
  coverageRun: CoverageRun;
  isExpanded: boolean;
  onOpenChange: (id: string | null) => void;
}

const CoverageBar = ({ percentage }: { percentage: number }) => (
  <div className="h-2 w-full rounded-full bg-gray-200">
    <div
      className="h-full rounded-full transition-all"
      style={{
        width: `${percentage}%`,
        backgroundColor: percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#eab308' : '#ef4444',
      }}
    />
  </div>
);

const CoverageMetric = ({ title, stats }: { title: string; stats: CoverageStats }) => {
  if (!stats.percentage) {
    stats.percentage = 0;
  }
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{title}</span>
        <span className="font-medium">{stats.percentage?.toFixed(2)}%</span>
      </div>
      <CoverageBar percentage={stats.percentage} />
      <div className="text-muted-foreground text-xs">
        {stats.covered}/{stats.total} covered
      </div>
    </div>
  );
};

export const CoverageResults = ({
  coverageRun,
  isExpanded,
  onOpenChange,
}: CoverageResultsProps) => {
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const totalStats = coverageRun.testResults.reduce(
    (acc, file) => ({
      statements: acc.statements + file.statements.percentage,
      branches: acc.branches + file.branches.percentage,
      functions: acc.functions + file.functions.percentage,
      lines: acc.lines + file.lines.percentage,
    }),
    { statements: 0, branches: 0, functions: 0, lines: 0 },
  );

  const averages = {
    statements: totalStats.statements / coverageRun.testResults.length,
    branches: totalStats.branches / coverageRun.testResults.length,
    functions: totalStats.functions / coverageRun.testResults.length,
    lines: totalStats.lines / coverageRun.testResults.length,
  };

  return (
    <Collapsible
      key={coverageRun.id}
      open={isExpanded}
      onOpenChange={(open) => {
        if (open) {
          onOpenChange(coverageRun.id);
        } else {
          onOpenChange(null);
        }
      }}
    >
      <CollapsibleTrigger className="w-full">
        <div className="bg-muted/40 flex w-full items-center justify-between rounded-md p-4">
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-5 w-5" />
            <span className="text-muted-foreground text-sm">
              {format(new Date(coverageRun.created_at), 'MMM dd, yyyy hh:mm a')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">
              {averages.lines.toFixed(2)}% coverage
            </span>
            <ChevronRight className={`h-4 w-4 transition-all ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="bg-muted/30 p-4">
          <div className="bg-background mb-8 grid grid-cols-2 gap-6 rounded-lg border p-4 md:grid-cols-4">
            <CoverageMetric
              title="Statements"
              stats={{ covered: 0, total: 0, percentage: averages.statements }}
            />
            <CoverageMetric
              title="Branches"
              stats={{ covered: 0, total: 0, percentage: averages.branches }}
            />
            <CoverageMetric
              title="Functions"
              stats={{ covered: 0, total: 0, percentage: averages.functions }}
            />
            <CoverageMetric
              title="Lines"
              stats={{ covered: 0, total: 0, percentage: averages.lines }}
            />
          </div>

          <div className="space-y-2">
            {coverageRun.testResults.map((file) => (
              <Collapsible
                key={file.path}
                open={expandedFile === file.path}
                onOpenChange={() => setExpandedFile(expandedFile === file.path ? null : file.path)}
              >
                <CollapsibleTrigger className="bg-background hover:bg-background/60 flex w-full items-center justify-between rounded-lg border p-3 transition-all">
                  <div className="flex items-center gap-3">
                    <FileCode className="text-muted-foreground h-5 w-5" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {file.lines.percentage.toFixed(2)}% coverage
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 transition-all ${expandedFile === file.path ? 'rotate-90' : ''}`}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="animate-slideDown bg-muted/30 space-y-4 rounded-b-lg p-4">
                  <CoverageMetric title="Statements" stats={file.statements} />
                  <CoverageMetric title="Branches" stats={file.branches} />
                  <CoverageMetric title="Functions" stats={file.functions} />
                  <CoverageMetric title="Lines" stats={file.lines} />
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
