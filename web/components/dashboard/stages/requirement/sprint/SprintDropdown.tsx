import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sprint } from '@/types/project';
import React from 'react';

type Props = {
  sprints: Sprint[];
  currentSprint: Sprint | null;
  onSelect: (sprint: string) => void;
};

const SprintDropdown: React.FC<Props> = ({ sprints, currentSprint, onSelect }) => {
  return (
    <Select
      value={currentSprint?.id}
      onValueChange={(val) => {
        const sprint = sprints.find((sprint) => sprint.id === val);
        if (sprint) {
          onSelect(sprint.id);
        }
      }}
    >
      <SelectTrigger className="bg-background! h-8 gap-2 border-none pl-0 text-xl font-semibold focus:ring-0 focus:ring-offset-0">
        <SelectValue placeholder="Select a sprint" />
      </SelectTrigger>
      <SelectContent>
        {sprints.map((sprint) => (
          <SelectItem value={sprint.id} key={sprint.id} onClick={() => onSelect(sprint.id)}>
            {sprint.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SprintDropdown;
