'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { Mic, Square, Play, Pause } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getSupportedMimeType } from '@/contexts/audio-recorder.context';

interface VoiceUploadProps {
  form: UseFormReturn<Record<string, unknown>>;
  resetTrigger: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function VoiceUpload({ form, resetTrigger }: VoiceUploadProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingSizeRef = useRef<number>(0);
  const fieldRef = useRef<FieldValues | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioUrlRef = useRef<string | null>(audioUrl);
  audioUrlRef.current = audioUrl;

  const cleanupResources = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();

      // For Safari/iOS, we need to use a specific configuration
      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingSizeRef.current = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingSizeRef.current += event.data.size;
          if (recordingSizeRef.current > MAX_FILE_SIZE) {
            stopRecording();
            toast.error('Recording stopped: Maximum size of 5MB reached');
            return;
          }
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (recordingSizeRef.current <= MAX_FILE_SIZE) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/wav' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          fieldRef.current?.onChange(audioBlob);
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch {
      toast.error('Error starting recording', {
        description: 'Please try again',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        toast.error('Error stopping media recorder', {
          description: 'Please try again',
        });
      }
    }

    setIsRecording(false);
  };
  const togglePlayback = () => {
    if (!audioRef.current || !audioUrlRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);
  useEffect(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      setAudioUrl(null);
      setIsPlaying(false);
    }
  }, [resetTrigger]);

  return (
    <FormField
      control={form.control}
      name="voiceFeedback"
      render={({ field }) => {
        fieldRef.current = field;
        return (
          <FormItem>
            <FormLabel>Voice Feedback</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {audioUrl ? (
                  <Card className="flex items-center justify-between p-4">
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={togglePlayback}>
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        cleanupResources();
                        setAudioUrl(null);
                        fieldRef.current?.onChange(null);
                      }}
                    >
                      Delete Recording
                    </Button>
                  </Card>
                ) : (
                  <Card
                    className={cn('flex items-center justify-center p-8', 'border-2 border-dashed')}
                  >
                    <Button
                      type="button"
                      variant={isRecording ? 'destructive' : 'outline'}
                      onClick={isRecording ? stopRecording : startRecording}
                      className="flex items-center gap-2"
                    >
                      {isRecording ? (
                        <>
                          <Square className="h-4 w-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </Card>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
