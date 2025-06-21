import { create } from 'zustand';
import { UserDto } from '@/types/user';
import { UserService } from '@/services/user.api';
import { isAxiosError } from 'axios';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';

interface UserStore {
  user: UserDto | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetchUser: (isRefreshing?: boolean) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  fetchUser: async (refresh = false) => {
    try {
      if (refresh) {
        set({ isRefreshing: true });
      } else {
        set({ isLoading: true });
      }
      set({ error: null });
      const user = await UserService.getMe();
      if (user.data) {
        set({
          user: {
            ...user.data,
            credits_remaining: user.data.credits_remaining * 100,
            credits_used: user.data.credits_used * 100,
          },
          isLoading: false,
        });
      } else {
        set({ error: user.error.message, isLoading: false });
      }
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          signOut({
            callbackUrl: '/auth',
          });
        }
      }
      set({ error: 'Failed to fetch user data', isLoading: false });
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },
}));
