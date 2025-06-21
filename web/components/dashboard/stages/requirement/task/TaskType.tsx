import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TaskDto, TaskType } from '@/types/user-stories';
import {
  AlertCircle,
  Book,
  Check,
  CheckSquare,
  Lightbulb,
  Loader2Icon,
  Search,
  Wrench,
} from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TaskService } from '@/services';
import { Tooltip, TooltipContent } from '@/components/ui/tooltip';
import { TooltipTrigger } from '@/components/ui/tooltip';

const getTaskTypeColor = (type: TaskType) => {
  switch (type) {
    case 'Feature':
      return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    case 'Bug':
      return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
    case 'Research':
      return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20';
    case 'TechnicalDebt':
      return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
    case 'Documentation':
      return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
    case 'Investigation':
      return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
    case 'Refactor':
      return 'bg-sky-500/10 text-sky-500 hover:bg-sky-500/20';
    case 'FutureEnhancement':
      return 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
  }
};

type TaskTypeProps = {
  task: TaskDto;
  onTaskChange: (task: TaskDto) => void;
};

const TASK_TYPES: { [key in TaskType]: string } = {
  Feature: 'Feature',
  Bug: 'Bug',
  Research: 'Research',
  TechnicalDebt: 'Technical Debt',
  Documentation: 'Documentation',
  Investigation: 'Investigation',
  Refactor: 'Refactor',
  FutureEnhancement: 'Future Enhancement',
};

const TASK_TYPE_ICONS = {
  Feature: <CheckSquare size={14} />,
  Bug: <AlertCircle size={14} />,
  Research: <Lightbulb size={14} />,
  TechnicalDebt: <Wrench size={14} />,
  Documentation: <Book size={14} />,
  Investigation: <Search size={14} />,
  Refactor: <Wrench size={14} />,
  FutureEnhancement: <Lightbulb size={14} />,
};

const TaskTypeComponent = ({ task, onTaskChange }: TaskTypeProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTypeChange = async (type: TaskType) => {
    try {
      setShowModal(false);
      setIsLoading(true);

      const response = await TaskService.updateTask(task.id, {
        ...task,
        type,
      });

      if (response.data) {
        onTaskChange(response.data);
      } else {
        toast.error(response.error.message || 'Failed to update task type');
      }
    } catch {
      toast.error('Failed to update task type');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopoverClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="flex items-center justify-center" onClick={handlePopoverClick}>
      <Popover open={showModal} onOpenChange={setShowModal}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <div className="flex cursor-pointer items-center">
                {isLoading ? (
                  <div className="flex h-6 w-6 items-center justify-center">
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <div
                    className={`inline-flex items-center justify-center rounded-md p-1.5 ${getTaskTypeColor(
                      task.type,
                    )}`}
                  >
                    {TASK_TYPE_ICONS[task.type]}
                  </div>
                )}
              </div>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{TASK_TYPES[task.type as TaskType]}</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-[200px] cursor-pointer p-0" align="end">
          {Object.keys(TASK_TYPES).map((type) => (
            <div
              key={type}
              onClick={() => handleTypeChange(type as TaskType)}
              className="hover:bg-accent flex items-center justify-between space-x-2 p-2"
            >
              <span
                className={`flex items-center space-x-2 rounded-2xl p-1 px-3 text-xs ${getTaskTypeColor(
                  type as TaskType,
                )}`}
              >
                {TASK_TYPE_ICONS[type as TaskType]}
                <span>{TASK_TYPES[type as TaskType]}</span>
              </span>
              <Check
                className={cn(
                  'ml-auto h-4 w-4 transition-opacity',
                  task.type === type ? 'opacity-100' : 'opacity-0',
                )}
              />
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TaskTypeComponent;
