'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { GitFork, Sparkles, ClipboardList } from 'lucide-react';
import TemplateFlow from './flows/TemplateFlow';
import ImportFlow from './flows/ImportFlow';
import { CreateTemplateProjectDto } from '@/types/project';
import { GithubService, ProjectService } from '@/services';
import type { GithubOwner } from '@/types/github';
import { RepositoryVisibility } from './flows/steps/ProjectNameStep';
import CreateFlow from './flows/CreateFlow';
import { FeatureFlag, useFeatureFlag } from '@/hooks/useFeatureFlags';

const projectTypes = [
  {
    id: 'template',
    name: 'Start with Template',
    icon: Sparkles,
    description: 'Choose from pre-built templates and start building',
  },
  {
    id: 'import',
    name: 'Import Existing',
    icon: GitFork,
    description: 'Import from GitHub',
  },
  {
    id: 'requirements',
    name: 'Requirements Only',
    icon: ClipboardList,
    description: 'Create project for managing requirements without code',
  },
];

export type ProjectData = {
  type?: 'template' | 'create' | 'import' | 'requirements';
  name: string;
  category: string;
  techStack: string;
  githubUrl: string;
  prismaSchemaPath: string;
  integrations: string[];
  modelType: string;
  auth: string[];
  database: string;
  requirements: string;
  aiAssistantIntegration: boolean;
  githubOwner: string;
  githubRepo: {
    name: string;
    owner: string;
  };
  githubBranch?: string;
  visibility?: RepositoryVisibility;
};
const initialProjectData: ProjectData = {
  type: undefined,
  name: '',
  category: 'Web App',
  techStack: '',
  githubUrl: '',
  prismaSchemaPath: 'prisma/schema.prisma',
  integrations: [],
  auth: ['email_pwd'],
  database: 'mongodb',
  modelType: 'gemini-2.0-flash',
  requirements: '',
  aiAssistantIntegration: true,
  githubOwner: '',
  githubRepo: {
    name: '',
    owner: '',
  },
  githubBranch: '',
  visibility: 'public',
};

export default function ProjectCreationFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState<GithubOwner[]>([]);
  const isDevelopmentEnabled = useFeatureFlag(FeatureFlag.DEVELOPMENT);

  const [projectData, setProjectData] = useState<ProjectData>({
    ...initialProjectData,
    type: !isDevelopmentEnabled ? 'requirements' : undefined,
  });

  useEffect(() => {
    const fetchOwners = async () => {
      const res = await GithubService.getGithubOwners();
      if (res.data) {
        setOwners(res.data);
      } else {
        toast.error(res.error.message);
      }
    };
    fetchOwners();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (projectData.type === 'import') {
        const res = await ProjectService.importProject({
          title: projectData.name,
          githubUrl: `https://github.com/${projectData.githubRepo.owner}/${projectData.githubRepo.name}`,
          githubBranch: projectData.githubBranch || 'master',
          requirements: projectData.requirements,
          modelType: projectData.modelType,
          thirdPartyIntegrations: projectData.integrations ?? [],
        });
        if (res?.data) {
          toast.success('Project imported successfully');
          router.push(`/dashboard/project/${res.data.uniqueName}`);
        } else {
          toast.error(res.error.message);
        }
      } else if (projectData.type === 'template') {
        const body: CreateTemplateProjectDto = {
          title: projectData.name,
          template: projectData.techStack,
          clientRequirements: projectData.requirements,
          thirdPartyIntegrations: projectData.integrations,
          modelType: projectData.modelType,
          githubUrl: `https://github.com/${projectData.githubRepo.owner}/${projectData.githubRepo.name}`,
          ownerType:
            owners.find((owner) => owner.login === projectData.githubOwner)?.type ?? 'User',
          visibility: projectData.visibility,
        };
        const res = await ProjectService.createTemplateProject(body);
        if (res?.data) {
          toast.success('Project created successfully');
          router.push(`/dashboard/project/${res.data.uniqueName}`);
        } else {
          toast.error(res.error.message);
        }
      } else if (projectData.type === 'requirements') {
        const res = await ProjectService.createProjectWithoutRepo({
          title: projectData.name,
          clientRequirements: projectData.requirements,
          modelType: projectData.modelType,
        });
        if (res?.data) {
          toast.success('Project created successfully');
          router.push(`/dashboard/project/${res.data.uniqueName}`);
        } else {
          toast.error(res.error.message);
        }
      } else {
        toast.error('Please select a project type');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderFlow = () => {
    switch (projectData.type) {
      case 'template':
        return (
          <TemplateFlow
            projectData={projectData}
            setProjectData={setProjectData}
            currentStep={step}
            onNext={() => setStep(step + 1)}
            onBack={() => setStep(step - 1)}
            onSubmit={handleSubmit}
            loading={loading}
            owners={owners}
          />
        );
      case 'import':
        return (
          <ImportFlow
            projectData={projectData}
            setProjectData={setProjectData}
            currentStep={step}
            onNext={() => setStep(step + 1)}
            onBack={() => setStep(step - 1)}
            onSubmit={handleSubmit}
            loading={loading}
            owners={owners}
          />
        );
      case 'requirements':
        return (
          <CreateFlow
            projectData={projectData}
            setProjectData={setProjectData}
            onSubmit={handleSubmit}
            onBack={() => setStep(1)}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  const renderStep = () => {
    // If development is disabled, show CreateFlow directly
    if (!isDevelopmentEnabled) {
      return (
        <CreateFlow
          projectData={projectData}
          setProjectData={setProjectData}
          onSubmit={handleSubmit}
          onBack={() => {}}
          loading={loading}
        />
      );
    }

    // Otherwise, show the normal flow
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="mb-4 text-xl font-semibold">Choose Project Type</h2>
            <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
              {projectTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all ${
                    projectData.type === type.id ? 'border-primary bg-primary/5' : 'bg-accent/30'
                  }`}
                  onClick={() => {
                    if (type.id !== projectData.type) {
                      setProjectData({
                        ...initialProjectData,
                        type: type.id as 'template' | 'create' | 'import' | 'requirements',
                      });
                    } else {
                      setProjectData({
                        ...projectData,
                        type: type.id as 'template' | 'create' | 'import' | 'requirements',
                      });
                    }
                    setStep(2);
                  }}
                >
                  <CardContent className="flex h-full flex-col items-center justify-center gap-2 p-6">
                    <type.icon className="text-primary h-8 w-8" />
                    <h3 className="text-center font-medium">{type.name}</h3>
                    <p className="text-muted-foreground text-center text-sm">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6">
              <Button
                className="w-full"
                disabled={!projectData.type}
                onClick={() => projectData.type && setStep(2)}
              >
                Continue
              </Button>
            </div>
          </div>
        );
      default:
        return renderFlow();
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-3 py-6">
      {isDevelopmentEnabled && (
        <div className="mb-8">
          <div className="mb-2 flex justify-between">
            {projectData.type !== 'requirements' &&
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`mx-1 h-2 flex-1 rounded ${
                    i + 1 <= step ? 'bg-primary' : 'bg-muted'
                  } transition-all`}
                />
              ))}
          </div>
        </div>
      )}
      {renderStep()}
    </div>
  );
}
