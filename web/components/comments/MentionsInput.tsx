'use client';

import { useRef } from 'react';
import { MentionsInput as ReactMentionsInput, Mention } from 'react-mentions';
import { ProjectMember } from '@/types/project';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface MentionsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  projectMembers: ProjectMember[];
  className?: string;
}

const mentionStyle = {
  control: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: '1.5',
  },
  input: {
    margin: 0,
    padding: 0,
    outline: 'none',
  },
  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid rgba(0,0,0,0.1)',
      borderRadius: '0.25rem',
      fontSize: 15,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      maxHeight: '150px',
      overflow: 'auto',
    },
    item: {
      padding: '4px 8px',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      '&focused': {
        backgroundColor: '#f5f5f5',
      },
    },
  },
  highlighter: {
    overflow: 'hidden',
  },
};

export function MentionsInput({
  value,
  onChange,
  placeholder = 'Add a comment...',
  projectMembers,
  className,
}: MentionsInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data } = useSession();

  const handleContainerClick = () => {
    if (inputRef.current) {
      const inputElement = inputRef.current;
      if (inputElement) {
        inputElement.focus();
      }
    }
  };

  console.log(typeof value);

  return (
    <div
      className={cn(
        'border-input w-full cursor-text rounded-md border bg-transparent p-3 text-sm',
        className,
      )}
      onClick={handleContainerClick}
    >
      <ReactMentionsInput
        value={value ?? ''}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        style={mentionStyle}
        inputRef={inputRef}
      >
        <Mention
          trigger="@"
          style={{
            backgroundColor: 'rgba(0,0,0,0.05)',
            padding: '1px 2px',
            borderRadius: '3px',
          }}
          data={projectMembers
            .filter((m) => m.userId && m.userId !== data?.id)
            .map((member) => ({
              id: member.userId!,
              display: `@${member.firstName} ${member.lastName}`,
            }))}
          renderSuggestion={(suggestion) => {
            const member = projectMembers.find((m) => m.userId === suggestion.id);
            if (!member) return null;
            return (
              <div className="py-0.5 text-sm text-black">
                {member.firstName} {member.lastName}
              </div>
            );
          }}
          appendSpaceOnAdd
        />
      </ReactMentionsInput>
    </div>
  );
}
