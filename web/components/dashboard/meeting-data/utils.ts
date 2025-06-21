import { MeetingData } from '@/types/meeting-data';
import { differenceInMinutes, differenceInSeconds, format, isToday, isYesterday } from 'date-fns';

export const groupMeetingsByDate = (meetings: MeetingData[]) => {
  const grouped = meetings.reduce(
    (acc, meeting) => {
      const date = new Date(meeting.metadata?.startDate || meeting.createdAt);
      const dateKey = format(date, 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(meeting);
      return acc;
    },
    {} as Record<string, MeetingData[]>,
  );

  // Sort meetings within each group
  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((a, b) => {
      const dateA = new Date(a.metadata?.startDate || a.createdAt);
      const dateB = new Date(b.metadata?.startDate || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  });

  return grouped;
};

export const getDateHeading = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
};

export const getDuration = (meeting: MeetingData) => {
  if (meeting.metadata?.durationInSeconds) {
    const inMinutes = Math.floor(meeting.metadata.durationInSeconds / 60);
    if (inMinutes > 60) {
      return `${Math.floor(inMinutes / 60)} hr ${inMinutes % 60} min`;
    }
    if (inMinutes === 0) {
      return `${meeting.metadata.durationInSeconds} seconds`;
    }
    return `${inMinutes} min`;
  }
  if (meeting.metadata?.startDate && meeting.metadata?.endDate) {
    const start = new Date(meeting.metadata.startDate);
    const end = new Date(meeting.metadata.endDate);
    const diff = differenceInMinutes(end, start);
    if (diff > 60) {
      return `${Math.floor(diff / 60)} hr ${diff % 60} min`;
    }
    if (diff === 0) {
      return `${differenceInSeconds(end, start)} seconds`;
    }
    return `${differenceInMinutes(end, start)} min`;
  }
  return '-- min';
};
