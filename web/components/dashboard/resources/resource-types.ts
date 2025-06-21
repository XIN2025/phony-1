import { FileText, Figma, Youtube, Book, Github, File, Video } from 'lucide-react';

export const resourceTypes = [
  { id: 'document', label: 'Documentation', icon: FileText },
  { id: 'figma', label: 'Figma', icon: Figma },
  { id: 'meeting', label: 'Meeting', icon: Video },
  { id: 'video', label: 'Video', icon: Youtube },
  { id: 'reference', label: 'Reference', icon: Book },
  { id: 'repository', label: 'Repository', icon: Github },
  { id: 'other', label: 'Other', icon: File },
] as const;

export type ResourceTypeId = (typeof resourceTypes)[number]['id'];
