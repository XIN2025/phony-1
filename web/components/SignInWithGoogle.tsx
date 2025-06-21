'use client';
import { signIn } from 'next-auth/react';
import { Button } from './ui/button';
import GoogleIcon from '@/assets/icons/GoogleIcon';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import posthog from 'posthog-js';

const SignInWithGoogle = ({ callbackUrl = '/dashboard' }: { callbackUrl?: string }) => {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      if (error === 'google_signin') {
        toast.error('Failed to sign in with Google');
      } else {
        toast.error(decodeURIComponent(error));
      }
      router.replace('/auth');
    }
  }, [router, searchParams]);

  return (
    <Button
      onClick={async () => {
        try {
          setLoading(true);
          posthog.capture('sign_in_with_google');
          await signIn('google', {
            callbackUrl,
            redirect: true,
          });
        } catch {
          toast.error('An unexpected error occurred');
        } finally {
          setLoading(false);
        }
      }}
      variant="outline"
      disabled={loading}
      className="border-border bg-muted/80 text-muted-foreground hover:bg-muted/80 flex w-full items-center justify-center gap-2 rounded-xl border-2 py-6 transition-all duration-200"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
      ) : (
        <GoogleIcon className="h-5 w-5" />
      )}
      <span className="text-base font-medium">Continue with Google</span>
    </Button>
  );
};

export default SignInWithGoogle;
