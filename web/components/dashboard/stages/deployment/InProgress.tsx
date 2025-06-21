import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const InProgress = () => {
  return (
    <Card className="border-primary/20 bg-primary/5 w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-4 p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="text-primary h-5 w-5 animate-spin" />
          <span className="text-lg font-medium">Deployment in Progress</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default InProgress;
