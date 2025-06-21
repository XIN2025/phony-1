'use client';
import ProgressTracker from '@/components/dashboard/ProgressTracker';
import Development from '@/components/dashboard/stages/Development';
import UserStories from '@/components/dashboard/stages/requirement/Requirement';
import LoadingScreen from '@/components/LoadingScreen';
import { Project, Sprint } from '@/types/project';
import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react';
import Testing from './stages/Testing';
import Deployment from './stages/Deployment';
import { FeatureFlagWrapper } from '@/components/FeatureFlagWrapper';
import { FeatureFlag, useFeatureFlag } from '@/hooks/useFeatureFlags';

const ProjectPage = ({ initialProject }: { initialProject: Project }) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sprints, setSprints] = useState<Sprint[]>(initialProject.sprints ?? []);
  const { data } = useSession();
  const isDeploymentEnabled = useFeatureFlag(FeatureFlag.DEPLOYMENT);
  const isTestingEnabled = useFeatureFlag(FeatureFlag.TESTING);
  const isDevelopmentEnabled = useFeatureFlag(FeatureFlag.DEVELOPMENT);
  const isRequirementEnabled = useFeatureFlag(FeatureFlag.REQUIREMENT);
  // Define steps based on feature flag
  const steps = useMemo(() => {
    return [
      ...(isRequirementEnabled ? [{ label: 'Requirements', statusText: 'user_stories' }] : []),
      ...(isDevelopmentEnabled ? [{ label: 'Development', statusText: 'development' }] : []),
      ...(isTestingEnabled ? [{ label: 'Testing', statusText: 'testing' }] : []),
      ...(isDeploymentEnabled ? [{ label: 'Deployment', statusText: 'deployment' }] : []),
    ];
  }, [isDeploymentEnabled, isTestingEnabled, isDevelopmentEnabled, isRequirementEnabled]);

  useEffect(() => {
    if (project.status) {
      const index = steps.findIndex((s) => s.statusText == project.status);
      setCurrentIndex(Math.min(index == -1 ? 0 : index, 0));
    }
  }, [project.status, steps]);

  if (!project || !data) {
    return <LoadingScreen type="logo" />;
  }
  const renderComponent = (index: number) => {
    // Get the current step status text
    const currentStep = steps[index]?.statusText || 'user_stories';

    // Render component based on the step status text instead of index
    const cardWrapper = (content: React.ReactNode) => (
      <div className="mx-auto w-full flex-1 overflow-y-auto rounded-xl border-none shadow-none">
        {content}
      </div>
    );

    switch (currentStep) {
      case 'user_stories':
        return cardWrapper(
          <FeatureFlagWrapper
            flag={FeatureFlag.REQUIREMENT}
            fallback={
              <div className="flex h-full w-full items-center justify-center p-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium">Requirements Coming Soon</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    The requirements feature is currently under development and will be available
                    soon.
                  </p>
                </div>
              </div>
            }
          >
            <UserStories
              session={data}
              project={project}
              sprints={sprints.sort((a, b) => b.sprintNumber - a.sprintNumber)}
              setSprints={setSprints}
            />
          </FeatureFlagWrapper>,
        );
      case 'development':
        return cardWrapper(
          <FeatureFlagWrapper
            flag={FeatureFlag.DEVELOPMENT}
            fallback={
              <div className="flex h-full w-full items-center justify-center p-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium">Development Coming Soon</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    The Development feature is currently under development and will be available
                    soon.
                  </p>
                </div>
              </div>
            }
          >
            <Development project={project} setProject={setProject} />
          </FeatureFlagWrapper>,
        );
      case 'testing':
        return cardWrapper(
          <FeatureFlagWrapper
            flag={FeatureFlag.TESTING}
            fallback={
              <div className="flex h-full w-full items-center justify-center p-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium">Testing Coming Soon</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    The testing feature is currently under development and will be available soon.
                  </p>
                </div>
              </div>
            }
          >
            <Testing project={project} setProject={setProject} session={data} />
          </FeatureFlagWrapper>,
        );
      case 'deployment':
        return cardWrapper(
          <FeatureFlagWrapper
            flag={FeatureFlag.DEPLOYMENT}
            fallback={
              <div className="flex h-full w-full items-center justify-center p-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium">Deployment Coming Soon</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    The deployment feature is currently under development and will be available
                    soon.
                  </p>
                </div>
              </div>
            }
          >
            <Deployment project={project} setProject={setProject} session={data} />
          </FeatureFlagWrapper>,
        );
      default:
        return cardWrapper(
          <UserStories
            session={data}
            project={project}
            sprints={sprints.sort((a, b) => b.sprintNumber - a.sprintNumber)}
            setSprints={setSprints}
          />,
        );
    }
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-1 flex-col gap-2 pb-2">
        {steps.length > 1 && (
          <ProgressTracker
            currentIndex={currentIndex}
            onClick={(index) => {
              setCurrentIndex(index);
            }}
            steps={steps}
          />
        )}
        {renderComponent(currentIndex)}
      </div>
    </div>
  );
};

export default ProjectPage;
