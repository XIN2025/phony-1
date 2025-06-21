'use client';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/services/auth-api';
import { isAxiosError } from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const VerifyEmailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const verifyEmailToken = async () => {
    if (!token) {
      toast.error('Verification token is missing');
      return;
    }

    try {
      setIsVerifying(true);
      await AuthService.verifyEmail(token);
      toast.success('Your email has been verified successfully.');
      router.push('/auth');
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to verify email');
      } else {
        toast.error('Failed to verify email');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Email is required to resend verification');
      return;
    }

    try {
      setIsResending(true);
      await AuthService.resendVerification(email);
      toast.success('Verification email has been resent. Please check your inbox.');
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to resend verification email');
      } else {
        toast.error('Failed to resend verification email');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
          <p className="text-muted-foreground text-sm">
            Click the button below to verify your email address
          </p>
        </div>

        {token && (
          <Button onClick={verifyEmailToken} disabled={isVerifying} className="w-full max-w-xs">
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </Button>
        )}

        {!token && email && (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-muted-foreground text-sm">
              Didn&apos;t receive the email? Check your spam folder or click below to resend.
            </p>
            <Button onClick={handleResendVerification} disabled={isResending} variant="outline">
              {isResending ? 'Resending...' : 'Resend verification email'}
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
