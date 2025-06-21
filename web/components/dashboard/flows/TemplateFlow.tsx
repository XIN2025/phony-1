'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ProjectData } from '../ProjectCreationFlow';
import ButtonWithLoading from '@/components/ButtonWithLoading';
import { toast } from 'sonner';
import ProjectNameStep from './steps/ProjectNameStep';
import type { GithubOwner } from '@/types/github';
import MdxEditorComponent from '@/components/MdxEditor';
import Image from 'next/image';
import { Dispatch } from 'react';
import { SetStateAction } from 'react';

const techStacks = [
  {
    id: 'nextjs',
    name: 'Next.js',
    description: 'React framework with SSR/SSG',
    icon: 'https://cdn.worldvectorlogo.com/logos/next-js.svg',
    disabled: false,
  },
  {
    id: 'remix',
    name: 'Remix',
    description: 'Full stack web framework',
    icon: 'https://remix.run/_brand/remix-light.png',
    disabled: false,
  },
  {
    id: 'next-fastapi',
    name: 'FastAPI + Next.js',
    description: 'Full stack web framework with FastAPI backend',
    icon: '/fastapi.png',
    disabled: false,
  },
  {
    id: 'next-nest',
    name: 'Next.js + Nest.js',
    description: 'Full-stack TypeScript with React & Node.js',
    icon: 'https://miro.medium.com/v2/resize:fit:984/1*ymfz_KKMuGJpIPyvdlGnHA.png',
    disabled: false,
  },
  {
    id: 'react-native',
    name: 'React Native App',
    description: 'Build native mobile applications using React and TypeScript',
    icon: 'https://cdn0.iconfinder.com/data/icons/logos-brands-in-colors/128/react_color-512.png',
    disabled: false,
  },
];

type TemplateFlowProps = {
  currentStep: number;
  projectData: ProjectData;
  setProjectData: Dispatch<SetStateAction<ProjectData>>;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  owners: GithubOwner[];
};

export default function TemplateFlow({
  currentStep,
  projectData,
  setProjectData,
  onNext,
  onBack,
  onSubmit,
  loading,
  owners,
}: TemplateFlowProps) {
  const localStep = currentStep - 1; // Adjust based on global step

  const renderStep = () => {
    switch (localStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="mb-4 text-xl font-semibold">⚡ Pick Your Tech Stack</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {techStacks.map((tech) => (
                <Card
                  key={tech.id}
                  className={`cursor-pointer transition-all ${
                    projectData.techStack === tech.id
                      ? 'border-primary bg-primary/5'
                      : tech.disabled
                        ? 'bg-accent/10'
                        : 'bg-accent/30'
                  }`}
                  onClick={() => {
                    if (tech.disabled) {
                      toast.info('This template is coming soon');
                      return;
                    }
                    setProjectData((prev) => ({ ...prev, techStack: tech.id }));
                    onNext();
                  }}
                >
                  <CardContent className="flex h-full flex-col items-center justify-center gap-2 p-6">
                    <Image
                      unoptimized
                      src={tech.icon}
                      alt={tech.name}
                      width={100}
                      height={100}
                      className="h-12 object-contain mix-blend-darken dark:mix-blend-lighten dark:invert"
                    />
                    <h3 className="text-center font-medium">{tech.name}</h3>
                    <p className="text-muted-foreground text-center text-sm">{tech.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex gap-4">
              <Button variant="outline" className="w-full flex-1" onClick={onBack}>
                Back
              </Button>
              <Button className="w-full flex-1" disabled={!projectData.techStack} onClick={onNext}>
                Continue
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <ProjectNameStep
            projectData={projectData}
            setProjectData={setProjectData}
            onBack={onBack}
            onNext={onNext}
            owners={owners}
          />
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="mb-4 text-xl font-semibold">📋 Tell Us Your Vision</h2>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements Description</Label>
                <MdxEditorComponent
                  markdown={projectData.requirements}
                  onChange={(e) => setProjectData({ ...projectData, requirements: e })}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <Button variant="outline" className="w-full flex-1" onClick={onBack}>
                Back
              </Button>
              <ButtonWithLoading className="w-full flex-1" onClick={onSubmit} loading={loading}>
                Create Project
              </ButtonWithLoading>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderStep();
}
