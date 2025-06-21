'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectData } from '../ProjectCreationFlow';
import ButtonWithLoading from '@/components/ButtonWithLoading';
import { Button } from '@/components/ui/button';
import MdxEditorComponent from '@/components/MdxEditor';
import { FeatureFlag, useFeatureFlag } from '@/hooks/useFeatureFlags';

type CreateFlowProps = {
  projectData: ProjectData;
  setProjectData: (data: ProjectData) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
};

export default function CreateFlow({
  projectData,
  setProjectData,
  onSubmit,
  loading,
  onBack,
}: CreateFlowProps) {
  const isDevelopmentEnabled = useFeatureFlag(FeatureFlag.DEVELOPMENT);
  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create Your Project</h1>
        <p className="text-muted-foreground mt-1">
          Start recording and organizing your meetings effectively
        </p>
      </div>

      <div className="grid gap-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="font-medium">
            Project Name
          </Label>
          <Input
            id="name"
            value={projectData.name}
            onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
            placeholder="Enter a catchy name for your awesome project"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientRequirements" className="font-medium">
            Client Requirements (Optional)
          </Label>
          <p className="text-muted-foreground text-xs">
            Document what your needs If you want to generate requirements directly
          </p>
          <MdxEditorComponent
            markdown={projectData.requirements}
            onChange={(e) => setProjectData({ ...projectData, requirements: e })}
          />
        </div>
      </div>
      <div className="mt-8 flex gap-4">
        {isDevelopmentEnabled && (
          <Button variant="outline" className="w-full flex-1" onClick={onBack}>
            Back
          </Button>
        )}
        <ButtonWithLoading
          className={`w-full flex-1`}
          disabled={!projectData.name}
          onClick={onSubmit}
          loading={loading}
        >
          Launch Project
        </ButtonWithLoading>
      </div>
    </div>
  );
}
