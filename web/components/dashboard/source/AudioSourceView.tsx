import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFileTypeInfo } from './utils';

interface AudioSourceViewProps {
  url: string;
}

const AudioSourceView = ({ url }: AudioSourceViewProps) => {
  const fileInfo = getFileTypeInfo(url);
  return (
    <Card className="p-3 sm:p-4">
      <div className="mb-2 flex items-center gap-2 sm:mb-3 sm:gap-3">
        <div className="bg-muted group-hover:bg-muted/80 rounded-lg p-1.5 transition-colors sm:p-2">
          {fileInfo.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={`text-xs ${fileInfo.color}`}>
              {fileInfo.label}
            </Badge>
          </div>
        </div>
      </div>
      <audio src={url} controls className="h-8 w-full sm:h-10" />
    </Card>
  );
};

export default AudioSourceView;
