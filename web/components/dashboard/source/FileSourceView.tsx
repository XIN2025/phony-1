import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getFileTypeInfo } from './utils';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FileSourceViewProps {
  url: string;
  filename: string;
  isImage: boolean;
}

const FileSourceView = ({ url, filename, isImage }: FileSourceViewProps) => {
  const fileInfo = getFileTypeInfo(url);
  const [open, setOpen] = useState(false);
  return (
    <Card className="flex flex-col items-center justify-center p-2 sm:p-3">
      <div className="relative flex aspect-square h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
        {isImage ? (
          <Image
            onClick={() => setOpen(true)}
            src={url}
            alt={filename}
            width={1000}
            height={1000}
            unoptimized
            className="h-full w-full cursor-pointer rounded-md object-contain transition-all duration-300 hover:scale-105"
          />
        ) : (
          <Link
            href={url}
            target="_blank"
            className="flex items-center justify-center rounded-full bg-gray-100 p-3 sm:p-4"
          >
            <FileText size={32} className="h-full w-full sm:h-10 sm:w-10" />
          </Link>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 sm:mt-3 sm:gap-3">
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto p-4 sm:max-w-fit sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Image Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <Image
              src={url}
              alt={filename}
              width={1000}
              height={1000}
              unoptimized
              className="h-auto max-h-[70vh] w-auto rounded-md object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FileSourceView;
