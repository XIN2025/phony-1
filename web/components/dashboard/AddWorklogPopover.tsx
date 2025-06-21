import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useWorklog } from '@/contexts/worklog.context';

type Props = {
  onAddLog: (timeSpent: number, description: string) => void;
};

const AddWorklogPopover = ({ onAddLog }: Props) => {
  const [timeSpent, setTimeSpent] = useState<number>();
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const isWorklogUser = useWorklog().isWorklogUser;
  if (!isWorklogUser) {
    return null;
  }
  const handleAddLog = () => {
    if (timeSpent) {
      onAddLog(timeSpent, description);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8">
          <Plus size={15} />
          <span className="text-xs">Add Log</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddLog();
          }}
        >
          <Input
            placeholder="Enter the time spent"
            className="mb-2"
            required
            type="number"
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            placeholder="Enter the description"
            className="mb-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit">Add Log</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default AddWorklogPopover;
