'use client';

import { EditorProps } from '@/components/Editor';
import dynamic from 'next/dynamic';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => (
    <div className="w-full space-y-4 p-4">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  ),
});

const EditorClient = ({ ...props }: EditorProps) => {
  return (
    <>
      <Editor {...props} />
    </>
  );
};

export default EditorClient;
