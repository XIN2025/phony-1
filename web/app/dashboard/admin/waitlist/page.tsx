import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { WaitlistClient } from './waitlist-client';
import { WaitlistService } from '@/services';

export default async function WaitlistPage() {
  const session = await getServerSession(authOptions);
  if (session?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-6xl py-10">
        <div className="py-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  try {
    const initialEntries = await WaitlistService.getAll();
    if (initialEntries.data) {
      return <WaitlistClient initialEntries={initialEntries.data} />;
    } else {
      throw new Error(initialEntries.error.message);
    }
  } catch (error) {
    console.error('Failed to fetch waitlist entries:', error);
    return (
      <div className="mx-auto max-w-6xl py-10">
        <div className="py-10 text-center">
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="text-muted-foreground mt-2">
            Failed to load waitlist entries. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
