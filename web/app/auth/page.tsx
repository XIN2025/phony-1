'use client';
import SignInWithGoogle from '@/components/SignInWithGoogle';
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const Page = () => {
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri');
  const redirectTo = searchParams.get('redirectTo');
  const state = searchParams.get('state');
  let mode = searchParams.get('mode') || 'login';
  if (mode !== 'login' && mode !== 'register') {
    mode = 'login';
  }

  const callbackUrl =
    redirectUri && state
      ? `/auth/vscode-callback?redirect_uri=${redirectUri}&state=${state}`
      : redirectTo || '/dashboard';

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === 'register' ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'register' ? (
              <>
                Already have an account?{' '}
                <Link
                  href={`/auth?mode=login${redirectUri ? `&redirectUri=${redirectUri}` : ''}${
                    state ? `&state=${state}` : ''
                  }`}
                  className="hover:text-primary underline underline-offset-4"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to Heizen?{' '}
                <Link
                  href={`/auth?mode=register${redirectUri ? `&redirectUri=${redirectUri}` : ''}${
                    state ? `&state=${state}` : ''
                  }`}
                  className="hover:text-primary underline underline-offset-4"
                >
                  Create an account
                </Link>
              </>
            )}
          </p>
        </div>

        <EmailPasswordForm mode={mode as 'login' | 'register'} callbackUrl={callbackUrl} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">or continue with</span>
          </div>
        </div>

        <SignInWithGoogle callbackUrl={callbackUrl} />

        <p className="text-muted-foreground px-8 text-center text-sm">
          By clicking continue, you agree to our{' '}
          <Link
            href="https://heizen.work/terms-and-conditions"
            className="hover:text-primary underline underline-offset-4"
          >
            Terms and Conditions
          </Link>{' '}
          and{' '}
          <Link
            href="https://heizen.work/privacy-policy"
            className="hover:text-primary underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </AuthLayout>
  );
};

export default Page;
