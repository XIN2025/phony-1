import { authOptions } from '@/auth';
import ProjectMeetingsPage from '@/components/dashboard/meeting-data/ProjectMeetingsPage';
import { FeatureFlag } from '@/hooks/useFeatureFlags';
import { posthogClient } from '@/lib/posthog';
import { ProjectService, WaitlistService } from '@/services';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';

const Page = async (props: { params: Promise<{ name: string }> }) => {
  const params = await props.params;
  const { name } = params;
  const session = await getServerSession(authOptions);
  const isEnabled = await posthogClient.isFeatureEnabled(
    FeatureFlag.MEETING,
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
  const project = await ProjectService.getProjectByName(name);
  if (project && project.data) {
    return <ProjectMeetingsPage project={project.data} />;
  } else {
    return notFound();
  }
};

export default Page;
