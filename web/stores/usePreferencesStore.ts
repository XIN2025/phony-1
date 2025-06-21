import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SortOption = 'name' | 'updatedAt';

interface PreferencesStore {
  // View preferences
  isListView: boolean;
  setIsListView: (isListView: boolean) => void;

  // Sort preferences
  sortBy: SortOption;
  setSortBy: (sortBy: SortOption) => void;

  // Active filter preferences
  showActiveOnly: boolean;
  setShowActiveOnly: (showActiveOnly: boolean) => void;

  // Sidebar preferences
  sidebarOpen: boolean;
  setSidebarOpen: (sidebarOpen: boolean) => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      // Default values
      isListView: false,
      sortBy: 'name',
      showActiveOnly: true,
      sidebarOpen: true,
      // Actions
      setIsListView: (isListView) => set({ isListView }),
      setSortBy: (sortBy) => set({ sortBy }),
      setShowActiveOnly: (showActiveOnly) => set({ showActiveOnly }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: 'user-preferences',
    },
  ),
);

export type { SortOption };
