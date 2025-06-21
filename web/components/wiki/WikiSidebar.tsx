'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useWikiStore } from '@/stores/useWikiStore';
import { useSession } from 'next-auth/react';
import { WikiSidebarItem } from './WikiSidebarItem';

export function WikiSidebar() {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const params = useParams();
  const pathname = usePathname();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();
  const { wikis, isLoading, fetchWikis, createWiki, deleteWiki } = useWikiStore();
  const { data: session } = useSession();

  useEffect(() => {
    fetchWikis(params.name as string);
  }, [fetchWikis, params.name]);

  const handleCreateWiki = useCallback(async () => {
    const newWiki = await createWiki(params.name as string, null);
    if (newWiki) {
      router.push(`/dashboard/project/${params.name}/wiki/${newWiki.id}`);
    }
  }, [createWiki, params.name, router]);

  const handleCereateSubWiki = useCallback(
    async (parentId: string) => {
      const newWiki = await createWiki(params.name as string, parentId);
      if (newWiki) {
        router.push(`/dashboard/project/${params.name}/wiki/${newWiki.id}`);
      }
    },
    [createWiki, params.name, router],
  );

  const filteredWikis = wikis.filter(
    (wiki) =>
      wiki.title.toLowerCase().includes(search.toLowerCase()) ||
      wiki.children?.some((child) => child.title.toLowerCase().includes(search.toLowerCase())),
  );

  const handleDeleteWiki = useCallback(
    async (wikiId: string, parentId: string | null) => {
      setIsDeleting(wikiId);

      const wiki = wikis.find((w) => w.id === wikiId);
      await deleteWiki(wikiId, parentId);

      // Reset deletion state after all routing logic
      const redirectToWikiRoot = () => {
        router.push(`/dashboard/project/${params.name}/wiki`);
      };

      if (pathname?.includes(wikiId)) {
        redirectToWikiRoot();
        setIsDeleting(null);
        return;
      }
      if (!wiki) {
        setIsDeleting(null);
        return;
      }
      const children = wiki.children ?? [];
      const childToRedirect = children.find((child) => pathname?.includes(child.id));

      if (childToRedirect) {
        redirectToWikiRoot();
        setIsDeleting(null);
        return;
      }
    },
    [deleteWiki, wikis, params.name, pathname, router],
  );

  return (
    <div
      className={`relative flex h-full flex-col transition-all duration-300 ${isOpen ? 'w-[250px] border-r' : 'w-0'}`}
    >
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        variant="ghost"
        className="absolute top-5 -right-10 h-8 w-8"
      >
        {isOpen ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
      </Button>
      <div className={`flex items-center justify-between p-4 ${!isOpen && 'hidden'}`}>
        <h2 className="text-lg font-semibold">Wiki</h2>
        <Button
          onClick={handleCreateWiki}
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className={`relative px-4 pb-4 ${!isOpen && 'hidden'}`}>
        <Search className="text-muted-foreground absolute top-3 left-7 h-4 w-4" />
        <Input
          placeholder="Search wikis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      <ScrollArea className={`flex-1 ${!isOpen && 'hidden'}`}>
        <div className="space-y-1 p-2">
          {filteredWikis.map((wiki) => (
            <React.Fragment key={wiki.id}>
              <WikiSidebarItem
                wiki={{
                  ...wiki,
                  project_id: params.name as string,
                }}
                isChild={false}
                session={session}
                wikiId={pathname?.split('/').pop() as string}
                handleCereateSubWiki={handleCereateSubWiki}
                handleDeleteWiki={handleDeleteWiki}
                isDeleting={isDeleting}
              />
              {wiki.children?.map((child) => (
                <WikiSidebarItem
                  key={child.id}
                  wiki={{
                    ...child,
                    project_id: params.name as string,
                  }}
                  isChild={true}
                  session={session}
                  wikiId={pathname?.split('/').pop() as string}
                  handleCereateSubWiki={null}
                  handleDeleteWiki={handleDeleteWiki}
                  isDeleting={isDeleting}
                />
              ))}
            </React.Fragment>
          ))}
          {!isLoading && filteredWikis.length === 0 && (
            <p className="text-muted-foreground px-3 py-2 text-sm">No wikis found</p>
          )}
          {isLoading && (
            <div className="space-y-2 px-3 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted h-8 w-full animate-pulse rounded-lg" />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
