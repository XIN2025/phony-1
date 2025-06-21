/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useMemo, useState } from 'react';

import RcTiptapEditor from 'reactjs-tiptap-editor';
import 'katex/dist/katex.min.css';
import 'reactjs-tiptap-editor/style.css';
import 'react-image-crop/dist/ReactCrop.css';
import 'prism-code-editor-lightweight/layout.css';
import 'prism-code-editor-lightweight/themes/github-dark.css';
import { editorExtensions } from '@/constants/editor';
import { useTheme } from 'next-themes';

function debounce(func: any, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export type EditorProps = {
  content: string;
  disabled?: boolean;
  onChangeContent: (content: string) => void;
};

function Editor({ content, onChangeContent, disabled }: EditorProps) {
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  const onValueChange = useMemo(
    () =>
      debounce((value: any) => {
        onChangeContent(value);
      }, 500),
    [onChangeContent],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const mainDiv = document.querySelector('#richtext-editor .reactjs-tiptap-editor');
      const editorDiv = mainDiv?.querySelector('.richtext-outline-1');
      const parentDiv = mainDiv?.querySelector(
        '.richtext-flex.richtext-max-h-full.richtext-w-full.richtext-flex-col',
      );

      if (!parentDiv) {
        console.log('parentDiv not found');
        return;
      }
      parentDiv.id = 'tiptap-parent';
      if (editorDiv) {
        editorDiv.id = 'tiptap-editor';
      }
      const children = Array.from(parentDiv.children).filter((el) => el.tagName === 'DIV');

      if (children.length >= 3) {
        children[0].id = 'tiptap-toolbar';
        children[1].id = 'tiptap-content';
        children[2].id = 'tiptap-character-count';
        clearInterval(interval);
        setIsMounted(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="richtext-editor" className={!isMounted ? 'hidden' : ''}>
      <RcTiptapEditor
        output="json"
        content={content}
        onChangeContent={onValueChange}
        extensions={editorExtensions}
        dark={resolvedTheme === 'dark'}
        disabled={disabled}
      />
    </div>
  );
}

export default Editor;
