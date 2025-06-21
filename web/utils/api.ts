import { NEXT_PUBLIC_API_URL } from '@/constants/api';
import axios from 'axios';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export const getApiInstance = async () => {
  const isServer = typeof window === 'undefined';
  const session = isServer ? await getServerSession(authOptions) : await getSession();

  const api = axios.create({
    baseURL: NEXT_PUBLIC_API_URL,
    headers: {
      Authorization: `Bearer ${session?.token}`,
    },
  });

  return api;
};
