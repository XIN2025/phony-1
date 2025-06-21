import { WikiSidebar } from '@/components/wiki/WikiSidebar';
import { ProjectService } from '@/services';
import { notFound } from 'next/navigation';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    name: string;
  }>;
}

const Layout = async (props: LayoutProps) => {
  const params = await props.params;

  const { children } = props;

  const { name } = params;
  const project = await ProjectService.getProjectByName(name);
  if (project && project.data) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <div className="flex flex-1 overflow-hidden">
          <WikiSidebar />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    );
  } else {
    return notFound();
  }
};

export default Layout;
