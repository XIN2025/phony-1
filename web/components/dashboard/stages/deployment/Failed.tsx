import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type LogsType = {
  time?: Date;
  command?: string;
  result?: {
    stdout?: string;
    stderr?: string;
  };
};

const Failed = ({ deploy, lastLogs }: { deploy: () => void; lastLogs: LogsType }) => {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <Card className="border-destructive/50 bg-destructive/5 w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <div className="text-destructive text-lg font-medium">Deployment Failed ❌</div>

          <Button variant="destructive" size="lg" className="min-w-[140px]" onClick={deploy}>
            Retry Deployment
          </Button>
        </CardContent>
      </Card>
      <div className="w-full">
        <div className="p-4">
          <div className="mb-2 text-lg font-medium text-green-600">Deployment Logs</div>
          <div className="space-y-2 text-sm">
            <div className="text-green-600">Last Deployed: {lastLogs?.time?.toString()}</div>

            <div className="space-y-2">
              <div className="font-medium text-green-600">Command Output:</div>
              <div className="max-h-[150px] overflow-y-auto rounded-md bg-black/5 p-2">
                <pre className="break-words whitespace-pre-wrap">
                  {lastLogs?.result?.stdout || 'No output'}
                </pre>
              </div>
            </div>

            {lastLogs?.result?.stderr && (
              <div className="space-y-2">
                <div className="font-medium text-red-600">Errors:</div>
                <div className="max-h-[150px] overflow-y-auto rounded-md bg-black/5 p-2">
                  <pre className="break-words whitespace-pre-wrap text-red-600">
                    {lastLogs.result.stderr}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Failed;
