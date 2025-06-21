import ProjectBugsPage from '@/components/dashboard/bugs/ProjectBugsPage';
import { ProjectService } from '@/services/project.api';
import { notFound } from 'next/navigation';
import React from 'react';

const Page = async (props: { params: Promise<{ name: string }> }) => {
  const params = await props.params;
  const { name } = params;
  const project = await ProjectService.getProjectByName(name);
  if (project && project.data) {
    return <ProjectBugsPage project={project.data} />;
  } else {
    return notFound();
  }
};

export default Page;
