import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import React from 'react';

const NotStarted = ({ deploy, loading }: { deploy: () => void; loading: boolean }) => {
  return (
    <Card className="border-primary/20 bg-primary/5 w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-4 p-8">
        <div className="text-lg font-medium">Ready to Deploy! 🚀</div>
        <Button
          variant="default"
          size="lg"
          className="min-w-[140px]"
          onClick={deploy}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Deploying...
            </div>
          ) : (
            'Deploy Now'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotStarted;
