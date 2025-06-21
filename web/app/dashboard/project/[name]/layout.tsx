import { authOptions } from '@/auth';
import ProjectSidebar from '@/components/dashboard/ProjectSidebar';
import { ProjectSocketProvider } from '@/contexts/project-socket.context';
import { ProjectService } from '@/services';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';

export default async function ProjectLayout(props: {
  children: React.ReactNode;
  params: Promise<{ name: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return notFound();
  }

  const project = await ProjectService.getProjectByName(params.name);
  if (!project?.data) {
    return notFound();
  }

  return (
    <ProjectSocketProvider projectId={project.data.id}>
      <ProjectSidebar projectName={params.name}>{children}</ProjectSidebar>
    </ProjectSocketProvider>
  );
}
