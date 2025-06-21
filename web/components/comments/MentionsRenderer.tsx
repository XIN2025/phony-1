'use client';
import { ProjectMember } from '@/types/project';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { JSX } from 'react';

interface MentionsRendererProps {
  content: string;
  projectMembers: ProjectMember[];
}

interface MentionMatch {
  fullMatch: string;
  name: string;
  id: string;
  startIndex: number;
  endIndex: number;
}

function findMentions(text: string): MentionMatch[] {
  const mentionRegex = /@\[(.*?)\]\((.*?)\)/g;
  const matches: MentionMatch[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    matches.push({
      fullMatch: match[0],
      name: match[1]?.replace('@', '') ?? '', // Remove @ from the name
      id: match[2],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return matches;
}

export function MentionsRenderer({ content, projectMembers }: MentionsRendererProps) {
  const mentions = findMentions(content);
  if (mentions.length === 0)
    return (
      <div
        className={
          'prose dark:prose-invert prose-headings:my-2 prose-p:my-1 prose-code:before:content-none prose-code:after:content-none max-w-full text-sm'
        }
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    );

  const renderedContent: JSX.Element[] = [];
  let lastIndex = 0;

  mentions.forEach((mention, index) => {
    // Add text before the mention
    if (mention.startIndex > lastIndex) {
      renderedContent.push(
        <div
          className={
            'prose dark:prose-invert prose-headings:my-2 prose-p:my-1 prose-code:before:content-none prose-code:after:content-none max-w-full text-sm'
          }
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} key={`text-${index}`}>
            {content.slice(lastIndex, mention.startIndex)}
          </ReactMarkdown>
        </div>,
      );
    }

    // Find the member details
    const member = projectMembers.find((m) => m.userId === mention.id);

    // Add the mention with tooltip
    renderedContent.push(
      <TooltipProvider key={`mention-${index}`} delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="bg-primary/5 text-primary inline-block cursor-pointer rounded-sm px-1 py-0.5 text-sm">
              @{mention.name}
            </span>
          </TooltipTrigger>
          {member && (
            <TooltipContent side="top" align="start" className="p-2">
              <div className="flex items-center gap-1.5">
                <Avatar className="h-6 w-6">
                  {member.avatarUrl ? (
                    <AvatarImage
                      src={member.avatarUrl}
                      alt={`${member.firstName} ${member.lastName}`}
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-xs">
                      {member.firstName ? member.firstName[0] : 'OG'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col">
                  <div className="text-xs font-medium">
                    {member.firstName} {member.lastName}
                    {member.role && (
                      <span className="text-muted-foreground ml-1 text-xs">({member.role})</span>
                    )}
                  </div>
                  {member.email && (
                    <div className="text-muted-foreground text-xs">{member.email}</div>
                  )}
                </div>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>,
    );

    lastIndex = mention.endIndex;
  });

  // Add any remaining text after the last mention
  if (lastIndex < content.length) {
    renderedContent.push(
      <div
        className={
          'prose dark:prose-invert prose-headings:my-2 prose-p:my-1 prose-code:before:content-none prose-code:after:content-none max-w-full text-sm'
        }
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} key="text-end">
          {content.slice(lastIndex)}
        </ReactMarkdown>
      </div>,
    );
  }

  return <div>{renderedContent}</div>;
}
