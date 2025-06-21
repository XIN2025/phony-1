import { authOptions } from '@/auth';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import React from 'react';

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth');
  }
  if (session.role !== 'admin') {
    notFound();
  }
  return <>{children}</>;
};

export default AdminLayout;
