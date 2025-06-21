'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function VSCodeCallback() {
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        if (!redirectUri || !state) {
          router.push('/dashboard');
          return;
        }

        if (status === 'loading') return;
        if (!session?.token) {
          router.push(`/auth?redirect_uri=${redirectUri}&state=${state}`);
          return;
        }

        // Construct the VSCode callback URL with token
        const vscodeRedirectUrl = new URL(redirectUri);
        vscodeRedirectUrl.searchParams.set('token', session.token as string);
        vscodeRedirectUrl.searchParams.set('state', state);

        // Redirect back to VSCode extension and close window
        window.location.href = vscodeRedirectUrl.toString();
      } catch {
        window.close();
      }
    };

    handleAuth();
  }, [redirectUri, state, session?.token, status, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <p className="text-lg">Authenticating...</p>
      <p className="text-muted-foreground text-sm">
        You can close this window after successful authentication
      </p>
      <button
        onClick={() => window.close()}
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-md px-4 py-2 text-sm"
      >
        Close Window
      </button>
    </div>
  );
}
