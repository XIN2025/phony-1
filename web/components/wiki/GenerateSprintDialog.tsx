import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GenerateSprintDialogProps {
  onSuccess: (type: 'current_sprint' | 'backlog') => Promise<void>;
}

const GenerateSprintDialog = ({ onSuccess }: GenerateSprintDialogProps) => {
  const [selectedType, setSelectedType] = useState<'current_sprint' | 'backlog'>('current_sprint');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async () => {
    setIsOpen(false);
    onSuccess(selectedType);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">Generate Tasks</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">What do you want to generate?</h4>
          <div className="flex gap-2">
            <Button
              variant={'outline'}
              onClick={() => setSelectedType('current_sprint')}
              className={cn(
                'flex-1 border',
                selectedType === 'current_sprint' && 'bg-primary! text-primary-foreground!',
              )}
            >
              Current Sprint
            </Button>
            <Button
              variant={'outline'}
              onClick={() => setSelectedType('backlog')}
              className={cn(
                'flex-1',
                selectedType === 'backlog' && 'bg-primary! text-primary-foreground!',
              )}
            >
              Backlog
            </Button>
          </div>
          <Button onClick={handleSubmit} className="text-primary-foreground! w-full border">
            Generate
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default GenerateSprintDialog;
