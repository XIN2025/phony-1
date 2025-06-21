import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import Link from 'next/link';

const Setup = ({ uniqueName }: { uniqueName: string }) => {
  return (
    <Card className="border-primary/20 bg-primary/5 w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-4 p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="text-primary h-5 w-5 animate-pulse" />
            <span className="text-lg font-medium">Initializing VM</span>
          </div>
        </div>
        <div className="text-muted-foreground mt-2 text-sm">
          See logs{' '}
          <Link
            className="text-primary underline-offset-4 hover:underline"
            target="_blank"
            href={`https://github.com/opengig-mvps/${uniqueName}/actions`}
          >
            here
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default Setup;
