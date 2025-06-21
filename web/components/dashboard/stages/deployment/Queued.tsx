import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import React from 'react';

const Queued = ({ uniqueName }: { uniqueName: string }) => {
  return (
    <Card className="border-primary/20 bg-primary/5 w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-4 p-8">
        <div className="animate-pulse text-lg font-medium">Deployment in Queue ⏳</div>
        <div className="text-muted-foreground text-sm">
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

export default Queued;
