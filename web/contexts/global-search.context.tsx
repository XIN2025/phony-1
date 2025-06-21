'use client';

import {
  CommandDialog,
  CommandItem,
  CommandGroup,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { UserService } from '@/services/user.api';
import { GlobalSearchResult } from '@/types/search';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  MessageSquare,
  Bug,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { CommandDialogMobile } from '@/components/ui/command-dialog-mobile';

type GlobalSearchContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined);

export const GlobalSearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await UserService.globalSearch({
        query: searchTerm,
      });
      if (res.data) {
        console.log(res.data.results);
        setSearchResults(res.data.results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search with 500ms delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        handleSearch(query);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]);

  // Keyboard shortcut: Cmd+K (Mac) or Ctrl+K (Windows/Linux)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectResult = (result: GlobalSearchResult) => {
    router.push(result.path);
    setOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderOpen className="h-4 w-4" />;
      case 'story':
        return <FileText className="h-4 w-4" />;
      case 'meeting':
        return <MessageSquare className="h-4 w-4" />;
      case 'bug':
        return <Bug className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'done':
      case 'completed':
      case 'fixed':
      case 'closed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'inprogress':
      case 'in_progress':
      case 'active':
        return <Clock className="h-3 w-3 text-blue-500" />;
      case 'blocked':
      case 'open':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const groupedResults = useMemo(() => {
    return searchResults.reduce(
      (acc, result) => {
        if (!acc[result.type]) {
          acc[result.type] = [];
        }
        acc[result.type].push(result);
        return acc;
      },
      {} as Record<string, GlobalSearchResult[]>,
    );
  }, [searchResults]);

  const typeOrder = ['project', 'meeting', 'bug', 'story'];

  const getGroupTitle = (type: string) => {
    switch (type) {
      case 'project':
        return 'Projects';
      case 'story':
        return 'Stories';
      case 'meeting':
        return 'Meetings';
      case 'bug':
        return 'Bugs';
      default:
        return type;
    }
  };

  return (
    <GlobalSearchContext.Provider value={{ open, setOpen }}>
      <CommandDialogMobile open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search projects, stories, meetings, bugs..."
          value={query}
          onValueChange={setQuery}
        />

        <CommandList className="no-scrollbar max-h-[400px] overflow-y-auto">
          {!loading && query.trim() && searchResults && searchResults.length === 0 && (
            <CommandItem className="flex items-center justify-center">
              No results found.
            </CommandItem>
          )}
          {loading && (
            <CommandItem className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </CommandItem>
          )}
          <>
            {typeOrder.map((type) => {
              const results = groupedResults[type];
              if (!results || results.length === 0) return null;

              return (
                <CommandGroup key={type} heading={getGroupTitle(type)}>
                  {results.map((result) => (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      value={`${result.type}-${result.id}-${result.title}`}
                      onSelect={() => handleSelectResult(result)}
                      className="flex cursor-pointer items-start gap-3 p-3"
                    >
                      <div className="mt-0.5 shrink-0">{getIcon(result.type)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{result.title}</span>
                          {result.metadata?.status && getStatusIcon(result.metadata.status)}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          {result.projectName && (
                            <>
                              <span>{result.projectName}</span>
                              {result.type === 'story' &&
                                (result.metadata?.sprintName ? (
                                  <>
                                    <span>•</span>
                                    <span>{result.metadata.sprintName}</span>
                                  </>
                                ) : (
                                  <>
                                    <span>•</span>
                                    <span>Backlog</span>
                                  </>
                                ))}
                            </>
                          )}
                          {result.metadata?.priority !== undefined &&
                          result.metadata?.priority !== null ? (
                            <>
                              <span>•</span>
                              <span>Priority P{result.metadata?.priority}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </>
        </CommandList>
      </CommandDialogMobile>
      {children}
    </GlobalSearchContext.Provider>
  );
};

export const useGlobalSearch = () => {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error('useGlobalSearch must be used within a GlobalSearchProvider');
  }
  return context;
};
