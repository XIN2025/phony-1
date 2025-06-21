import { create } from 'zustand';
import { FeatureFlag } from '@/hooks/useFeatureFlags';
import { WaitlistService } from '@/services';

interface FeatureFlagState {
  activeFlags: string[];
  loadingFlags: boolean;
  isUserApproved: boolean;
  setLoadingFlags: (loading: boolean) => void;
  refreshUserApprovalStatus: () => void;
  setActiveFlags: (flags: string[]) => void;
  isEnabled: (flag: FeatureFlag | string) => boolean;
}

export const useFeatureFlagStore = create<FeatureFlagState>((set, get) => ({
  activeFlags: [],
  loadingFlags: true,
  isUserApproved: false,
  setLoadingFlags: (loading) => set({ loadingFlags: loading }),
  setActiveFlags: (flags) => set({ activeFlags: flags }),
  refreshUserApprovalStatus: async () => {
    try {
      const isUserApproved = await WaitlistService.isUserApproved();
      if (isUserApproved.data) {
        set({ isUserApproved: isUserApproved.data });
      } else {
        set({ isUserApproved: false });
      }
    } catch (error) {
      console.error('Failed to refresh user approval status:', error);
    }
  },
  isEnabled: (flag) => {
    const state = get();
    return state.activeFlags.includes(flag);
  },
}));
