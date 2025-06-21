import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CustomMarkdown = ({ content, className }: { content: string; className?: string }) => {
  return (
    <div
      className={
        'prose dark:prose-invert prose-headings:my-2 prose-p:my-1 prose-code:before:content-none prose-code:after:content-none max-w-full text-sm ' +
        className
      }
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

export default CustomMarkdown;
