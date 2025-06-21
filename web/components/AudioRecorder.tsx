import { Button } from '@/components/ui/button';
import { Mic, Chrome, Volume2, AlertCircle, Upload } from 'lucide-react';
import { useAudioRecorder, RecordingMode } from '@/contexts/audio-recorder.context';
import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

interface AudioRecorderProps {
  projectId?: string;
  projectUniqueName?: string;
  hideText?: boolean;
}

const SUPPORTED_AUDIO_FORMATS = [
  'audio/mp3',
  'audio/mp4',
  'audio/mpeg',
  'audio/aac',
  'audio/wav',
  'audio/flac',
  'audio/pcm',
  'audio/m4a',
  'audio/ogg',
  'audio/opus',
  'audio/webm',
  'video/webm',
];

interface RecordingModeOptionProps {
  mode: RecordingMode;
  currentMode: RecordingMode;
  icon: LucideIcon;
  title: string;
  description: string;
  isRecommended?: boolean;
  advantages: string[];
  limitations: string[];
  onSelect: (mode: RecordingMode) => void;
}

const RecordingModeOption = ({
  mode,
  currentMode,
  icon: Icon,
  title,
  description,
  isRecommended,
  advantages,
  limitations,
  onSelect,
}: RecordingModeOptionProps) => {
  const isSelected = currentMode === mode;
  const iconColor = mode === 'combined' ? 'text-blue-500' : 'text-purple-500';

  return (
    <div
      className={cn(
        'border-border hover:bg-primary/5 relative cursor-pointer rounded-lg border-2 p-4 transition-all',
        isSelected && 'border-primary bg-primary/5 border-2',
      )}
      onClick={() => onSelect(mode)}
    >
      <div className="absolute top-4 right-4">
        <RadioGroupItem value={mode} id={mode} />
      </div>
      <div className="mb-2 flex items-center gap-3">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <Label htmlFor={mode} className="text-base font-medium">
          {title}
        </Label>
        {isRecommended && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
            Recommended
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-sm">{description}</p>

      {isSelected && (
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="font-medium text-green-600">Advantages</p>
            <ul className="text-muted-foreground mt-1 list-disc pl-4">
              {advantages.map((advantage, index) => (
                <li key={index}>{advantage}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-red-600">Limitations</p>
            <ul className="text-muted-foreground mt-1 list-disc pl-4">
              {limitations.map((limitation, index) => (
                <li key={index}>{limitation}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const AudioRecorder = ({ projectId, projectUniqueName, hideText }: AudioRecorderProps) => {
  const { isRecording, isTranscribing, startRecording, isChromium, uploadAudio } =
    useAudioRecorder();
  const [showGuideDialog, setShowGuideDialog] = useState(false);
  const [recordingMode, setRecordingMode] = useState<RecordingMode>(
    isChromium ? 'combined' : 'microphone',
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartRecording = async () => {
    setShowGuideDialog(true);
  };

  const handleConfirmRecording = async () => {
    setShowGuideDialog(false);
    await startRecording(projectId ?? null, projectUniqueName ?? null, recordingMode);
  };

  const handleUploadAudio = async (audioBlob: Blob) => {
    setShowGuideDialog(false);
    await uploadAudio(audioBlob, projectId ?? null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
      toast.error(`Unsupported file format ${file.type}. Please upload a supported audio file.`);
      return;
    }

    try {
      await handleUploadAudio(file);
    } catch {
      toast.error('Failed to upload audio file. Please try again.');
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button
            onClick={handleStartRecording}
            variant="default"
            className="flex h-8 items-center gap-2"
            size="sm"
            disabled={isRecording || isTranscribing}
          >
            <Mic className="h-4 w-4" />
            {!hideText && 'Record Audio'}
          </Button>
          <Button
            onClick={triggerFileUpload}
            variant="outline"
            className="flex h-8 items-center gap-2"
            size="sm"
            disabled={isRecording || isTranscribing}
          >
            <Upload className="h-4 w-4" />
            {!hideText && 'Upload Audio'}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={SUPPORTED_AUDIO_FORMATS.join(',')}
            onChange={handleFileUpload}
          />
        </div>
        {isTranscribing && !hideText && (
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
            Transcribing...
          </span>
        )}
      </div>

      <Dialog open={showGuideDialog} onOpenChange={setShowGuideDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Audio Recording</DialogTitle>
            <DialogDescription className="text-center">
              Choose your preferred recording method
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {/* Recording Mode Selection */}
            <RadioGroup
              value={recordingMode}
              onValueChange={(value) => setRecordingMode(value as RecordingMode)}
              className="space-y-3"
            >
              {isChromium && (
                <RecordingModeOption
                  mode="combined"
                  currentMode={recordingMode}
                  icon={Chrome}
                  title="Combined Audio"
                  description="Records both your microphone and browser tab audio. Ideal for online meetings."
                  isRecommended={true}
                  advantages={['Works with headphones', 'Captures audio when muted']}
                  limitations={['No nested screen sharing']}
                  onSelect={setRecordingMode}
                />
              )}

              <RecordingModeOption
                mode="microphone"
                currentMode={recordingMode}
                icon={Volume2}
                title="Microphone Only"
                description="Records only from your microphone. Works on all browsers."
                advantages={['Works on all browsers', 'Allows screen sharing']}
                limitations={['No audio with headphones', 'Requires unmuted device']}
                onSelect={setRecordingMode}
              />
            </RadioGroup>

            {/* Recording Tips */}
            <div className="bg-muted/30 rounded-lg border p-4">
              <h3 className="mb-2 flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Important Tips
              </h3>

              <ul className="text-muted-foreground list-disc space-y-2 pl-4 text-sm">
                {recordingMode === 'combined' && isChromium && (
                  <>
                    <li>Select your meeting tab when prompted and check &quot;Share audio&quot;</li>
                    <li>Avoid sharing screens within the meeting platform</li>
                  </>
                )}
                {recordingMode === 'microphone' && (
                  <li>Position yourself close to the audio source for best quality</li>
                )}
                <li>Keep this tab open during recording</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setShowGuideDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirmRecording} className="flex-1">
              Start Recording
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AudioRecorder;
