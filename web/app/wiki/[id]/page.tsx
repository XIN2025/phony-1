import { authOptions } from '@/auth';
import WikiPage from '@/components/wiki/WikiPage';
import { WorklogProvider } from '@/contexts/worklog.context';
import { ProjectService } from '@/services';
import { HelperService } from '@/services/helper.api';
import { WikiService } from '@/services/wiki.api';
import { ProjectMember } from '@/types/project';
import { WikiAccessLevel } from '@/types/wiki';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';

const Page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const { id } = params;
  const { data: wiki } = await WikiService.findById(id);
  if (!wiki) {
    return notFound();
  }
  const res = await ProjectService.getProjectMembers(wiki.project_id);
  const members: ProjectMember[] = res.data ?? [];
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return notFound();
  }
  const isMember = members.some((member) => member.userId === session?.id);
  if (!isMember && !wiki.is_public) {
    return notFound();
  }
  const access = isMember ? WikiAccessLevel.Edit : wiki.public_access_level;
  const worklogUsers = await HelperService.getWorklogUsers();
  const worklogEmails = worklogUsers.map((user) => user.email);
  return (
    <WorklogProvider isWorklogUser={worklogEmails.includes(session.user.email)}>
      <WikiPage id={id} projectMembers={members} access={access} />
    </WorklogProvider>
  );
};

export default Page;
