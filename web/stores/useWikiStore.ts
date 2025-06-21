import { create } from 'zustand';
import { Wiki } from '@/types/wiki';
import { WikiService } from '@/services/wiki.api';
import { toast } from 'sonner';

interface WikiStore {
  wikis: Wiki[];
  isLoading: boolean;
  fetchWikis: (projectId: string) => Promise<void>;
  createWiki: (projectId: string, parentId: string | null) => Promise<Wiki | undefined>;
  updateWikiTitle: (wikiId: string, title: string, parentId: string | null) => void;
  deleteWiki: (wikiId: string, parentId: string | null) => Promise<boolean>;
}

export const useWikiStore = create<WikiStore>((set, get) => ({
  wikis: [],
  isLoading: true,
  fetchWikis: async (projectId: string) => {
    set({ isLoading: true });
    try {
      const result = await WikiService.findByProjectId(projectId);
      if (result.data) {
        set({ wikis: result.data });
      } else {
        toast.error(result?.error?.message);
      }
    } catch (error) {
      toast.error('Failed to fetch wikis');
    } finally {
      set({ isLoading: false });
    }
  },
  createWiki: async (projectId: string, parentId: string | null = null) => {
    try {
      const result = await WikiService.createWiki(projectId, parentId);
      if (result.data) {
        result.data.children = [];
        if (parentId) {
          const parentWiki = get().wikis.find((wiki) => wiki.id === parentId);
          if (parentWiki) {
            if (!parentWiki.children) {
              parentWiki.children = [];
            }
            parentWiki.children.push(result.data);
            set((state) => ({
              wikis: state.wikis.map((wiki) => (wiki.id === parentId ? { ...parentWiki } : wiki)),
            }));
            toast.success('Sub-wiki created successfully');
            return result.data;
          }
        }
        set((state) => ({ wikis: [...state.wikis, result.data] }));
        toast.success('Wiki created successfully');
        return result.data;
      } else {
        toast.error(result?.error?.message);
      }
    } catch (error) {
      toast.error('Failed to create wiki');
    }
    return undefined;
  },
  updateWikiTitle: (wikiId: string, title: string, parentId: string | null) => {
    const { wikis } = get();
    if (parentId) {
      const parentWiki = wikis.find((wiki) => wiki.id === parentId);
      if (parentWiki) {
        const childWikis = parentWiki.children?.map((wiki) =>
          wiki.id === wikiId ? { ...wiki, title } : wiki,
        );
        set((state) => ({
          wikis: state.wikis.map((wiki) =>
            wiki.id === parentId ? { ...parentWiki, children: childWikis } : wiki,
          ),
        }));
      }
    } else {
      set((state) => ({
        wikis: state.wikis.map((wiki) => (wiki.id === wikiId ? { ...wiki, title } : wiki)),
      }));
    }
  },
  deleteWiki: async (wikiId: string, parentId: string | null) => {
    try {
      const res = await WikiService.deleteById(wikiId);
      if (res.data) {
        if (parentId) {
          const parentWiki = get().wikis.find((wiki) => wiki.id === parentId);
          if (parentWiki) {
            const updatedChildren = parentWiki.children?.filter((child) => child.id !== wikiId);
            set((state) => ({
              wikis: state.wikis.map((wiki) =>
                wiki.id === parentId ? { ...parentWiki, children: updatedChildren } : wiki,
              ),
            }));
            toast.success('Sub Wiki deleted successfully');
          }
        } else {
          set((state) => ({
            wikis: state.wikis.filter((wiki) => wiki.id !== wikiId),
          }));
          toast.success('Wiki deleted successfully');
        }
        return true;
      } else {
        toast.error(res?.error?.message);
        return false;
      }
    } catch (error) {
      toast.error('Failed to delete wiki');
      return false;
    }
  },
}));
