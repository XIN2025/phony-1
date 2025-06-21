import { ProjectService } from '@/services';
import { AudioRecorderProvider } from '@/contexts/audio-recorder.context';
import { RecordingStatus } from '@/components/RecordingStatus';
import { SocketProvider } from '@/contexts/socket.context';
import { GlobalSearchProvider } from '@/contexts/global-search.context';
import GlobalHeader from '@/components/dashboard/GlobalHeader';
import { HelperService } from '@/services/helper.api';
import { WorklogProvider } from '@/contexts/worklog.context';
import { authOptions } from '@/auth';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';

export default async function DashBoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return notFound();
  }
  const res = await ProjectService.getProjects();
  const worklogUsers = await HelperService.getWorklogUsers();
  const worklogEmails = worklogUsers.map((user) => user.email);
  return (
    <WorklogProvider isWorklogUser={worklogEmails.includes(session?.user?.email ?? '')}>
      <SocketProvider>
        <AudioRecorderProvider>
          <GlobalSearchProvider>
            <div className="flex h-dvh flex-col">
              <GlobalHeader projects={res.data || []} />
              <div className="relative flex-1 overflow-y-auto">{children}</div>
              <RecordingStatus />
            </div>
          </GlobalSearchProvider>
        </AudioRecorderProvider>
      </SocketProvider>
    </WorklogProvider>
  );
}
