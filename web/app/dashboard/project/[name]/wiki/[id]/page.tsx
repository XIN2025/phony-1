import WikiPage from '@/components/wiki/WikiPage';
import { ProjectService } from '@/services';
import { WikiAccessLevel } from '@/types/wiki';
import { notFound } from 'next/navigation';

const Page = async (props: { params: Promise<{ name: string; id: string }> }) => {
  const params = await props.params;
  const project = await ProjectService.getProjectByName(params.name);
  if (!project || !project.data) {
    return notFound();
  }
  const membersData = await ProjectService.getProjectMembers(project.data.id);
  const members = membersData.data ?? [];
  return <WikiPage id={params.id} projectMembers={members} access={WikiAccessLevel.Edit} />;
};

export default Page;
