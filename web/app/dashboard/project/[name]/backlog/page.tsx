import { ProjectService } from '@/services';
import { notFound } from 'next/navigation';
import BacklogPage from '@/components/dashboard/BacklogPage';

const Page = async (props: { params: Promise<{ name: string }> }) => {
  const params = await props.params;
  const { name } = params;
  const project = await ProjectService.getProjectByName(name);
  if (project && project.data) {
    return <BacklogPage initialProject={project.data} />;
  } else {
    return notFound();
  }
};
export default Page;
