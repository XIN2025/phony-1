import ProjectPage from '@/components/dashboard/ProjectPage';
import { ProjectService } from '@/services';
import { notFound } from 'next/navigation';

const Page = async (props: { params: Promise<{ name: string }> }) => {
  const params = await props.params;
  const { name } = params;
  const project = await ProjectService.getProjectByName(name);
  if (project && project.data) {
    return <ProjectPage initialProject={project.data} />;
  } else {
    return notFound();
  }
};

export default Page;
