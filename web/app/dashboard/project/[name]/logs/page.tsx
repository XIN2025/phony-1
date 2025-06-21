import { HelperService } from '@/services/helper.api';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';
import { authOptions } from '@/auth';
import WorklogPage from '@/components/logs/WorklogPage';
import { IntegrationService } from '@/services/integration.api';
import { ProjectService } from '@/services';
import { WikiService } from '@/services/wiki.api';

const Page = async (props: { params: Promise<{ name: string }> }) => {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return notFound();
  }
  const { name } = params;
  const worklogUsers = await HelperService.getWorklogUsers();
  const worklogEmails = worklogUsers.map((user) => user.email);
  if (!worklogEmails.includes(session.user.email)) {
    return notFound();
  }

  const [stories, bugs, meetings, wikis, project] = await Promise.all([
    IntegrationService.getUserStoriesByProjectName(name),
    IntegrationService.getBugsByProjectName(name),
    IntegrationService.getMeetingDataByProjectName(name),
    WikiService.findByProjectId(name),
    ProjectService.getProjectByName(name),
  ]);
  if (!project.data) {
    return notFound();
  }
  return (
    <WorklogPage
      stories={stories.data ?? []}
      bugs={bugs.data ?? []}
      meetings={meetings.data ?? []}
      wikis={wikis.data ?? []}
      project={project.data}
    />
  );
};

export default Page;
