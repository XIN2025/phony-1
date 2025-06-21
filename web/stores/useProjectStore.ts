import { create } from 'zustand';
import { Project } from '@/types/project';
import { ProjectService } from '@/services';

interface ProjectStore {
  projects: Project[];
  loading: boolean;
  fetchProjects: (active?: boolean) => Promise<void>;
  archivedProjects: Project[];
  fetchArchivedProjects: () => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  archivedProjects: [],
  loading: false,

  fetchProjects: async (active?: boolean) => {
    try {
      set({ loading: true });
      const res = await ProjectService.getProjects(active);
      if (res && res.data) {
        set({ projects: res.data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.log('error fetching projects', error);
    } finally {
      set({ loading: false });
    }
  },
  fetchArchivedProjects: async () => {
    try {
      set({ loading: true });
      const res = await ProjectService.getArchivedProjects();
      if (res && res.data) {
        set({ archivedProjects: res.data ?? [], loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.log('error fetching archived projects', error);
    } finally {
      set({ loading: false });
    }
  },
}));
