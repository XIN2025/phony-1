import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageCircle, Pencil, Download } from 'lucide-react';
import { MeetingData } from '@/types/meeting-data';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import MdxEditorComponent from '@/components/MdxEditor';
import { useSearchParams } from 'next/navigation';

type SummarySheetProps = {
  meeting: MeetingData;
  onEdit: (summary: string) => Promise<void>;
};

const SummarySheet = ({ meeting, onEdit }: SummarySheetProps) => {
  const meetingTime = format(new Date(meeting.metadata?.startDate || meeting.createdAt), 'h:mm a');
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState(meeting.summary || '');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const searchParams = useSearchParams();
  useEffect(() => {
    const meetingId = searchParams.get('meetingId');
    if (meetingId === meeting.id) {
      setIsOpen(true);
    }
  }, [searchParams, meeting.id]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setSummary(meeting.summary || '');
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    await onEdit(summary);
    setIsEditing(false);
    setSubmitting(false);
  };
  const handleDownload = () => {
    const content = meeting.summary || 'No summary available';
    const fileName = `meeting-summary-${format(new Date(meeting.metadata?.startDate || meeting.createdAt), 'yyyy-MM-dd-HH-mm')}.md`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, fileName);
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          window.history.replaceState(
            {},
            '',
            `${window.location.pathname}?meetingId=${meeting.id}`,
          );
        } else {
          window.history.replaceState({}, '', `${window.location.pathname}`);
        }
      }}
    >
      <SheetTrigger asChild>
        <Button size="sm" variant={'outline'} className="h-8 flex-1">
          <MessageCircle className="mr-2 h-3.5 w-3.5" />
          Summary
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className={`flex flex-col md:min-w-[700px]`}>
        <SheetHeader>
          <div className="flex items-center justify-between gap-3 pr-3">
            <div className="flex items-center gap-3">
              <SheetTitle>Meeting Summary - {meetingTime}</SheetTitle>
              <Button size="icon" variant={'ghost'} className="size-9" onClick={handleEditToggle}>
                <Pencil size={16} />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button size="icon" variant={'outline'} onClick={handleDownload}>
                <Download size={16} />
              </Button>
            </div>
          </div>
        </SheetHeader>
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Button
            variant={activeTab === 'summary' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </Button>
          <Button
            variant={activeTab === 'transcript' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('transcript')}
          >
            Transcript
          </Button>
        </div>
        {activeTab === 'transcript' && (
          <ScrollArea className="flex-1 overflow-y-auto px-3">
            <div className={'prose prose-sm dark:prose-invert px-1'}>
              <ReactMarkdown>{meeting.transcript || 'No Transcript available'}</ReactMarkdown>
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
        {activeTab === 'summary' && (
          <ScrollArea className={`flex-1 overflow-y-auto px-3`}>
            {isEditing ? (
              <div className={`flex w-full flex-col gap-4`}>
                <MdxEditorComponent
                  markdown={summary ?? ''}
                  onChange={(e) => {
                    setSummary(e);
                  }}
                />
                <div className="flex justify-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleEditToggle}>
                    Cancel
                  </Button>
                  <Button disabled={submitting} size="sm" onClick={handleSave}>
                    {submitting ? 'Saving' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className={'prose prose-sm dark:prose-invert px-1'}>
                <ReactMarkdown>{meeting.summary || 'No summary available'}</ReactMarkdown>
              </div>
            )}
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default SummarySheet;
