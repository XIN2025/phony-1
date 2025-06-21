'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityIcon } from 'lucide-react';
import { Project } from '@/types/project';
import { CoverageRun, TestRun } from '@/types/testing';
import { TestRunResults } from './testing/TestRunResults';
import { CoverageResults } from './testing/CoverageResults';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { JEST_WORKFLOW } from '@/constants/workflow';
import { CYPRESS_WORKFLOW } from '@/constants/workflow';
import { Session } from 'next-auth';

type Props = {
  project: Project;
  session: Session;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
};

const Testing = ({ project, session }: Props) => {
  const [activeTab, setActiveTab] = useState('unit');
  const [jestRuns, setJestRuns] = useState<TestRun[]>([]);
  const [cypressRuns, setCypressRuns] = useState<TestRun[]>([]);
  const [coverageRuns, setCoverageRuns] = useState<CoverageRun[]>([]);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestData = async (type: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/integrations/testing-data/${project.id}/${type}`,
        );
        const data = await response.json();
        if (type === 'jest') {
          setJestRuns(data);
          if (data.length > 0) setExpandedRunId(data[0].id);
        } else if (type === 'cypress') {
          setCypressRuns(data);
        } else if (type === 'coverage') {
          setCoverageRuns(data);
        }
      } catch (error) {
        console.error(`Error fetching ${type} test data:`, error);
      }
    };

    fetchTestData('jest');
    fetchTestData('cypress');
    fetchTestData('coverage');
  }, [project.id, session.token]);

  // Reset expanded run when changing tabs
  useEffect(() => {
    const currentData =
      activeTab === 'unit' ? jestRuns : activeTab === 'e2e' ? cypressRuns : coverageRuns;
    setExpandedRunId(currentData.length > 0 ? currentData[0].id : null);
  }, [activeTab, coverageRuns, cypressRuns, jestRuns]);

  const renderTestRuns = (runs: TestRun[]) => (
    <div className="space-y-4">
      {runs.map((run) => (
        <TestRunResults
          key={run.id}
          testRun={run}
          isExpanded={expandedRunId === run.id}
          onOpenChange={setExpandedRunId}
        />
      ))}
    </div>
  );

  const renderCoverageRuns = (runs: CoverageRun[]) => (
    <div className="space-y-4">
      {runs.map((run) => (
        <CoverageResults
          key={run.id}
          coverageRun={run}
          isExpanded={expandedRunId === run.id}
          onOpenChange={setExpandedRunId}
        />
      ))}
    </div>
  );

  const EmptyTestState = ({ type }: { type: 'unit' | 'e2e' | 'coverage' }) => (
    <div className="border-muted flex min-h-[200px] flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed p-8 text-center">
      <div className="bg-muted/50 rounded-full p-4">
        <ActivityIcon className="text-muted-foreground h-8 w-8" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight">
        No {type === 'unit' ? 'Jest' : type === 'e2e' ? 'Cypress' : 'Coverage'} Tests Found
      </h3>
      <p className="text-muted-foreground max-w-sm text-sm">
        {type === 'unit'
          ? 'Start writing unit tests with Jest to see your test results here.'
          : type === 'e2e'
            ? 'Begin creating end-to-end tests with Cypress to track your application behavior.'
            : 'No coverage data found. Please run tests to generate coverage information.'}
      </p>
    </div>
  );

  const WorkflowGuide = ({ type }: { type: 'jest' | 'cypress' }) => {
    const [copied, setCopied] = useState(false);

    const workflowContent = type === 'jest' ? JEST_WORKFLOW : CYPRESS_WORKFLOW;

    const handleCopy = async () => {
      await navigator.clipboard.writeText(workflowContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="bg-muted/50 mt-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            Place this file in:{' '}
            <code className="bg-muted rounded px-2 py-1">.github/workflows/{type}.yml</code>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <pre className="bg-muted mt-2 overflow-x-auto rounded-lg p-4">
          <code>{workflowContent}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 grid w-full max-w-md grid-cols-3">
          <TabsTrigger
            value="unit"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Unit Tests
          </TabsTrigger>
          <TabsTrigger
            value="e2e"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            E2E Tests
          </TabsTrigger>
          <TabsTrigger
            value="coverage"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Coverage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unit">
          <Card className="border-none bg-transparent shadow-none">
            <h3 className="mb-4 text-2xl font-bold tracking-tight">Jest Unit Tests</h3>
            <ScrollArea className="h-[600px] pr-4">
              {jestRuns.length > 0 ? (
                renderTestRuns(jestRuns)
              ) : (
                <>
                  <EmptyTestState type="unit" />
                  <WorkflowGuide type="jest" />
                </>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="e2e">
          <Card className="border-none bg-transparent shadow-none">
            <h3 className="mb-4 text-2xl font-bold tracking-tight">Cypress E2E Tests</h3>
            <ScrollArea className="h-[600px] pr-4">
              {cypressRuns.length > 0 ? (
                renderTestRuns(cypressRuns)
              ) : (
                <>
                  <EmptyTestState type="e2e" />
                  <WorkflowGuide type="cypress" />
                </>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="coverage">
          <Card className="border-none bg-transparent shadow-none">
            <h3 className="mb-4 text-2xl font-bold tracking-tight">Code Coverage</h3>
            <ScrollArea className="h-[600px] pr-4">
              {coverageRuns.length > 0 ? (
                renderCoverageRuns(coverageRuns)
              ) : (
                <EmptyTestState type="coverage" />
              )}
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Testing;
