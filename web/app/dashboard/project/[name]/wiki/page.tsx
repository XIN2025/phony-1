'use client';

import { WikiEmptyState } from '@/components/wiki/WikiEmptyState';
import { useParams, useRouter } from 'next/navigation';
import { useWikiStore } from '@/stores/useWikiStore';

const WikiPage = () => {
  const params = useParams();
  const router = useRouter();
  const { createWiki } = useWikiStore();

  const handleCreateWiki = async () => {
    const newWiki = await createWiki(params.name as string, null);
    if (newWiki) {
      router.push(`/dashboard/project/${params.name}/wiki/${newWiki.id}`);
    }
  };

  return <WikiEmptyState onCreateWiki={handleCreateWiki} />;
};

export default WikiPage;
