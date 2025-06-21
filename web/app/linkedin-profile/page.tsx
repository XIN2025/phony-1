'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthService } from '@/services/auth-api';
import { toast } from 'sonner';

export default function LinkedInProfilePage() {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!linkedinUrl) {
        toast.error('Please enter a LinkedIn profile URL');
        return;
      }
      await AuthService.updateLinkedInProfile(linkedinUrl);
      router.push(redirectTo);
    } catch (error) {
      console.error('Error updating LinkedIn profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push(redirectTo);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Add Your LinkedIn Profile</h1>
          <p className="mt-2 text-gray-600">
            Please provide your LinkedIn profile URL to help us better understand your professional
            background
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="url"
            placeholder="https://www.linkedin.com/in/your-profile"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="w-full"
          />

          <div className="flex flex-col space-y-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
            <Button type="button" variant="outline" onClick={handleSkip} disabled={isLoading}>
              Skip for now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
