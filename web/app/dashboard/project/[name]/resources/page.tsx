import { authOptions } from '@/auth';
import ProjectResourcePage from '@/components/dashboard/ProjectResourcePage';
import { FeatureFlag } from '@/hooks/useFeatureFlags';
import { posthogClient } from '@/lib/posthog';
import { ProjectService, WaitlistService } from '@/services';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import React from 'react';

const page = async (props: { params: Promise<{ name: string }> }) => {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  const isEnabled = await posthogClient.isFeatureEnabled(
    FeatureFlag.RESOURCES,
    session?.user?.email ?? 'anonymous',
  );
  try {
    const isUserApproved = await WaitlistService.isUserApproved();
    if (!isEnabled && !isUserApproved.data) {
      return notFound();
    }
  } catch {
    notFound();
  }
  const project = await ProjectService.getProjectByName(params.name);
  if (project && project.data) {
    return <ProjectResourcePage project={project.data} />;
  } else {
    return notFound();
  }
};

export default page;
