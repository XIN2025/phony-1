import { CircleDot, CheckCircle2, PauseCircle, Clock, LucideIcon } from 'lucide-react';

export const SPRINT_STATUS_ICONS: Record<string, LucideIcon> = {
  Active: CircleDot,
  Completed: CheckCircle2,
  Paused: PauseCircle,
  NotStarted: Clock,
};

export const SPRINT_STATUS_VARIANTS: Record<string, string> = {
  Active: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  Completed: 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20',
  Paused: 'text-red-500 bg-red-500/10 hover:bg-red-500/20',
  NotStarted: 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20',
};
