'use client';
import { signOut } from 'next-auth/react';
import { verifyToken } from '@/utils/auth';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { useUserStore } from '@/stores/useUserStore';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data } = useSession();
  const fetchUser = useUserStore().fetchUser;
  useEffect(() => {
    if (data?.token) {
      verifyToken(data.token).then((payload) => {
        if (!payload) {
          signOut({
            callbackUrl: '/auth',
          });
        }
      });
      fetchUser();
    }
  }, [data?.token, fetchUser]);
  return <>{children}</>;
};

export default AuthWrapper;
