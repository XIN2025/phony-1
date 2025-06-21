'use client';
import React from 'react';
import { Button } from './ui/button';
import {
  BugIcon,
  ShieldAlert,
  PlusCircle,
  TrendingUp,
  Star,
  Layout,
  Activity,
  AlertTriangle,
  Upload,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import axios from 'axios';
import { toast } from 'sonner';
import ButtonWithLoading from './ButtonWithLoading';
import { Dialog, DialogContent } from './ui/dialog';
import { MultiSelect } from './ui/multi-select';
import Image from 'next/image';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5 MB

const ReportDialog = ({
  setShowReportDialog,
  showReportDialog,
}: {
  setShowReportDialog: (show: boolean) => void;
  showReportDialog: boolean;
}) => {
  const [issueData, setIssueData] = React.useState({
    name: '',
    email: '',
    title: '',
    description: '',
    labels: ['bug'],
  });
  const [screenshots, setScreenshots] = React.useState<{ file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const labelOptions = [
    { value: 'bug', label: 'Bug', icon: BugIcon },
    { value: 'feature request', label: 'Feature Request', icon: PlusCircle },
    { value: 'improvement', label: 'Improvement', icon: TrendingUp },
    { value: 'enhancement', label: 'Enhancement', icon: Star },
    { value: 'ui', label: 'UI/UX', icon: Layout },
    { value: 'performance', label: 'Performance', icon: Activity },
    { value: 'p0', label: 'Needs Priority', icon: AlertTriangle },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIssueData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(
      (file) => file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE,
    );
    if (files.length !== imageFiles.length) {
      toast.error('Some files were skipped. Please ensure all files are images under 5MB.');
    }
    const newScreenshots = await Promise.all(
      imageFiles.map(async (file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    );
    setScreenshots((prev) => [...prev, ...newScreenshots]);
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => {
      const newScreenshots = [...prev];
      URL.revokeObjectURL(newScreenshots[index].preview);
      newScreenshots.splice(index, 1);
      return newScreenshots;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!issueData.title || !issueData.description || issueData.labels.length === 0) {
        return toast.error('Please fill all required fields');
      }

      const screenshotsBase64 = await Promise.all(
        screenshots.map(async ({ file }) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }),
      );

      const body = {
        ...issueData,
        labels: issueData.labels,
        screenshots: screenshotsBase64,
      };
      console.log(body);
      const { data } = await axios.post('/api/report-issue', body);
      if (data.success) {
        setShowReportDialog(false);
        return toast.success('Issue reported successfully');
      } else {
        return toast.error('Failed to report issue');
      }
    } catch (e) {
      console.error(e);
      return toast.error('Failed to report issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    return () => {
      screenshots.forEach(({ preview }) => URL.revokeObjectURL(preview));
    };
  }, [screenshots]);

  return (
    <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
      <DialogContent className="h-[95vh] max-w-3xl overflow-y-auto px-0 py-0">
        <Card className="w-full border-none">
          <CardHeader>
            <CardTitle className="text-xl">Report Issue</CardTitle>
            <CardDescription>
              Please report any issues you encounter while using the web app. We will try to resolve
              them as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex w-full gap-2">
              <div className="flex w-full flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={issueData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>
              <div className="flex w-full flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={issueData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="labels">Issue Label*</Label>
              <MultiSelect
                options={labelOptions}
                onValueChange={(value) => {
                  setIssueData((prev) => ({
                    ...prev,
                    labels: value,
                  }));
                }}
                defaultValue={issueData.labels}
                placeholder="Select frameworks"
                variant="inverted"
                animation={0}
                maxCount={4}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Issue Title*</Label>
              <Input
                id="title"
                name="title"
                value={issueData.title}
                onChange={handleInputChange}
                placeholder="Brief summary of the issue"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description*</Label>
              <Textarea
                id="description"
                name="description"
                value={issueData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Please provide detailed information about the issue"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Screenshots (Max 5MB per image)</Label>
              <div className="flex flex-wrap gap-2">
                {screenshots.map(({ preview }, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={preview}
                      alt={`Screenshot ${index + 1}`}
                      unoptimized
                      className="h-20 w-20 rounded object-cover"
                    />
                    <button
                      onClick={() => removeScreenshot(index)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded border-2 border-dashed hover:border-blue-500">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="h-6 w-6 text-gray-400" />
                </label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-5">
            <Button onClick={() => setShowReportDialog(false)} variant="outline">
              Cancel
            </Button>
            <ButtonWithLoading
              loading={isSubmitting}
              onClick={handleSubmit}
              disabled={
                !issueData.title ||
                !issueData.description ||
                issueData.labels.length === 0 ||
                isSubmitting
              }
            >
              Submit
            </ButtonWithLoading>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

const ReportIssue = () => {
  const [showReportDialog, setShowReportDialog] = React.useState(false);
  return (
    <>
      <Button
        onClick={() => {
          console.log('clicked');
          setShowReportDialog(!showReportDialog);
        }}
        size={'sm'}
        className="group bg-accent/60 fixed right-5 bottom-3 z-50 flex justify-center gap-1 rounded-full px-5 text-red-500 shadow-md hover:bg-red-500 hover:text-white"
      >
        <span className="hidden group-hover:block">Report Issue</span>
        <ShieldAlert />
      </Button>
      <ReportDialog showReportDialog={showReportDialog} setShowReportDialog={setShowReportDialog} />
    </>
  );
};

export default ReportIssue;
