'use client';

import { Project } from '@/types/project';
import { ProjectService } from '@/services';
import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { models } from '@/constants/models';

interface ModelTypeSelectorProps {
  project: Project;
  onUpdate?: (modelType: string) => void;
}

const ModelTypeSelector = ({ project, onUpdate }: ModelTypeSelectorProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedModel, setSelectedModel] = useState(project.modelType || 'gpt-4o');

  const handleModelChange = async (value: string) => {
    setIsUpdating(true);
    try {
      const response = await ProjectService.updateModelType(project.id, value);
      if (response?.data) {
        setSelectedModel(value);
        toast.success('Model type updated successfully');
        onUpdate?.(value);
      } else {
        toast.error('Failed to update model type');
      }
    } catch (error) {
      console.error('Error updating model type:', error);
      toast.error('Failed to update model type');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Select Your AI Model</h2>
        <p className="text-muted-foreground text-sm">
          Select the perfect AI model to generate brilliant summaries and detailed requirements for
          your project
        </p>
      </div>

      <div className="bg-card rounded-lg">
        {isUpdating && (
          <div className="text-muted-foreground mt-4 flex items-center gap-2 p-4 text-sm">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Updating model...</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <button
              key={model.value}
              onClick={() => !isUpdating && handleModelChange(model.value)}
              className={cn(
                'bg-card hover:border-primary/50 flex flex-col rounded-lg border p-4 transition-all hover:shadow-xs',
                'bg-muted/40 cursor-pointer text-left',
                selectedModel === model.value && 'border-primary ring-primary/20 ring-1',
                isUpdating && 'cursor-not-allowed opacity-50',
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{model.icon}</span>
                <div className="flex-1">
                  <h4 className="flex items-center gap-2 font-medium">
                    {model.label}
                    {selectedModel === model.value && <Check className="text-primary h-4 w-4" />}
                  </h4>
                </div>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">{model.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelTypeSelector;
