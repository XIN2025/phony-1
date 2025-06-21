import { TestRun } from '@/types/testing';
import { format } from 'date-fns';
import { Clock, ChevronRight, CheckCircle2, XCircle, SkipForward } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface TestRunResultsProps {
  testRun: TestRun;
  isExpanded: boolean;
  onOpenChange: (id: string | null) => void;
}

const getStatusIcon = (result: string) => {
  switch (result.toLowerCase()) {
    case 'passed':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'skipped':
      return <SkipForward className="h-5 w-5 text-yellow-500" />;
    default:
      return <XCircle className="h-5 w-5 text-gray-500" />;
  }
};

export const TestRunResults = ({ testRun, isExpanded, onOpenChange }: TestRunResultsProps) => {
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  const totalPassing = testRun.testResults.reduce((acc, curr) => acc + curr.passing, 0);
  const totalFailing = testRun.testResults.reduce((acc, curr) => acc + curr.failing, 0);
  const totalSkipped = testRun.testResults.reduce((acc, curr) => acc + curr.skipped, 0);

  return (
    <div
      className="mb-4 overflow-hidden border-l-4 transition-all"
      style={{
        borderLeftColor:
          totalFailing > 0
            ? 'rgb(239 68 68)'
            : totalSkipped > 0
              ? 'rgb(234 179 8)'
              : 'rgb(34 197 94)',
      }}
    >
      <Collapsible
        key={testRun.id}
        open={isExpanded}
        onOpenChange={(open) => {
          if (open) {
            onOpenChange(testRun.id);
          } else {
            onOpenChange(null);
          }
        }}
      >
        <CollapsibleTrigger className="w-full">
          <div className="bg-muted/30 flex w-full items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground h-5 w-5" />
              <span className="text-muted-foreground text-sm">
                {format(new Date(testRun.created_at), 'MMM dd, yyyy hh:mm a')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-green-600">{totalPassing} passing</span>
              <span className="text-sm text-red-600">{totalFailing} failing</span>
              <span className="text-sm text-yellow-600">{totalSkipped} skipped</span>
              <ChevronRight className={`h-4 w-4 transition-all ${isExpanded ? 'rotate-90' : ''}`} />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="bg-muted/30 space-y-2 p-4">
            {testRun.testResults.map((result, index) => (
              <Collapsible
                key={`${testRun.id}-${index}`}
                open={expandedTest === `${testRun.id}-${result.name}`}
                onOpenChange={() =>
                  setExpandedTest(
                    expandedTest === `${testRun.id}-${result.name}`
                      ? null
                      : `${testRun.id}-${result.name}`,
                  )
                }
              >
                <CollapsibleTrigger className="bg-background hover:bg-background/60 flex w-full items-center justify-between rounded-lg border p-3 transition-all">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.failing === 0 ? 'passed' : 'failed')}
                    <span>{result.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {result.passing}/{result.tests} passing
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 transition-all ${expandedTest === `${testRun.id}-${result.name}` ? 'rotate-90' : ''}`}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="animate-slideDown bg-muted/30 space-y-2 rounded-b-lg p-4">
                  <div className="mb-4 grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-green-500/10 p-2 text-center">
                      <div className="font-semibold text-green-600">{result.passing}</div>
                      <div className="text-muted-foreground text-sm">Passing</div>
                    </div>
                    <div className="rounded-lg bg-red-500/10 p-2 text-center">
                      <div className="font-semibold text-red-600">{result.failing}</div>
                      <div className="text-muted-foreground text-sm">Failing</div>
                    </div>
                    <div className="rounded-lg bg-yellow-500/10 p-2 text-center">
                      <div className="font-semibold text-yellow-600">{result.skipped}</div>
                      <div className="text-muted-foreground text-sm">Skipped</div>
                    </div>
                  </div>
                  {result.testcases?.map((testCase, idx) => (
                    <div
                      key={idx}
                      className="hover:bg-muted flex items-center gap-2 rounded-md p-2"
                    >
                      {getStatusIcon(testCase.result)}
                      <span className="text-sm">{testCase.name || 'Unnamed test'}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
