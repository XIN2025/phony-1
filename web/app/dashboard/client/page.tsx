import { authOptions } from '@/auth';
import ClientDashboardPage from '@/components/dashboard/client/ClientDashboardPage';
import { FeatureFlag } from '@/hooks/useFeatureFlags';
import { posthogClient } from '@/lib/posthog';
import { ProjectService, WaitlistService } from '@/services';
import { Project, ProjectMember } from '@/types/project';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import React from 'react';

const ClientDashboard = async () => {
  const session = await getServerSession(authOptions);
  const isEnabled = await posthogClient.isFeatureEnabled(
    FeatureFlag.CLIENT_DASHBOARD,
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
  try {
    const projects = await ProjectService.getProjects();
    const isClientOrAdmin = projects?.data?.some((project: Project) =>
      project?.projectMembers?.some(
        (member: ProjectMember) =>
          (member.role === 'Client' || member.role === 'Admin') &&
          member.email === session?.user?.email,
      ),
    );
    if (!isClientOrAdmin) {
      return notFound();
    }
  } catch (error) {
    console.log('error fetching projects', error);
    return notFound();
  }

  return <ClientDashboardPage />;
};

export default ClientDashboard;
