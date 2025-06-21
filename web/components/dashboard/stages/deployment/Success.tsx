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

const Success = ({
  deployment_url,
  deploy,
  lastLogs,
}: {
  deployment_url: string;
  deploy: () => void;
  lastLogs: LogsType;
}) => {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <Card className="border-green-500/50 bg-green-500/5">
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <div className="text-lg font-medium text-green-600">Deployment Successful! 🎉</div>
          <a
            href={`https://${deployment_url}`}
            target="_blank"
            className="text-primary underline-offset-4 hover:underline"
          >
            View Deployment
          </a>
          <Button variant="outline" size="lg" className="min-w-[140px]" onClick={deploy}>
            Redeploy
          </Button>
        </CardContent>
      </Card>

      <Card className="border-green-500/50 bg-green-500/5">
        <CardContent className="p-4">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;
