'use client';

import { Suspense } from 'react';
import { ForwardRefEditor } from './ForwardRefEditor';

interface MdxEditorProps {
  markdown: string;
  onChange?: (markdown: string) => void;
  readOnly?: boolean;
  className?: string;
}

export default function MdxEditorComponent({
  markdown,
  onChange,
  readOnly = false,
  className = '',
}: MdxEditorProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className={`${className} border-border rounded-md border`}>
        <ForwardRefEditor
          markdown={markdown}
          onChange={onChange}
          readOnly={readOnly}
          className={`mdxeditor`}
          contentEditableClassName="prose max-w-full dark:prose-invert"
        />
      </div>
    </Suspense>
  );
}
