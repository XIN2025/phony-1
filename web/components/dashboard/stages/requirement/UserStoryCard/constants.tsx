import {
  ClockIcon,
  ActivityIcon,
  FlaskConical,
  CheckCircleIcon,
  BanIcon,
  ClipboardCheck,
} from 'lucide-react';

export const STATUS_ICONS: Record<string, React.ReactNode> = {
  Todo: <ClockIcon size={12} className="max-sm:hidden" />,
  InProgress: <ActivityIcon size={12} className="max-sm:hidden" />,
  InReview: <ClipboardCheck size={12} className="max-sm:hidden" />,
  Testing: <FlaskConical size={12} className="max-sm:hidden" />,
  Blocked: <BanIcon size={12} className="max-sm:hidden" />,
  Done: <CheckCircleIcon size={12} className="max-sm:hidden" />,
};

export const STATUS_VARIANTS: Record<string, string> = {
  Todo: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  InProgress: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
  InReview: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  Testing: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
  Blocked: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  Done: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
};

export const PRIORITY_VARIANTS: Record<number, string> = {
  0: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  1: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
  2: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  3: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
  4: 'bg-violet-500/10 text-violet-500 hover:bg-violet-500/20',
  5: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20',
};
