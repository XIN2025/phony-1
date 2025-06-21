'use client';
import LoadingScreen from '@/components/LoadingScreen';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="h-dvh w-full">
      <LoadingScreen type="logo" />
    </div>
  );
}
