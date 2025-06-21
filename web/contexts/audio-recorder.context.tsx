'use client';
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import { ProjectService } from '@/services';
import { getAudioDurationFromBlob } from '@/utils/audio';
import { useSocket } from './socket.context';
import { useSession } from 'next-auth/react';

// Recording modes
export type RecordingMode = 'combined' | 'microphone';

// Browser support detection
const isChromiumBased = () => {
  if (typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes('chrome') ||
    userAgent.includes('edge') ||
    userAgent.includes('brave') ||
    userAgent.includes('opera')
  );
};

const isSafari = () => {
  if (typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('android')
  );
};

// Get supported MIME type for recording
export const getSupportedMimeType = (): string => {
  if (typeof MediaRecorder === 'undefined') return '';

  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/ogg;codecs=opus',
    'audio/wav',
    'audio/aac',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  // If no supported type is found, return empty string
  // We'll handle this case separately
  return '';
};

interface AudioRecorderContextType {
  isRecording: boolean;
  isTranscribing: boolean;
  startRecording: (
    projectId: string | null,
    projectUniqueName: string | null,
    mode?: RecordingMode,
  ) => Promise<void>;
  stopRecording: () => void;
  uploadAudio: (audioBlob: Blob, projectId: string | null) => Promise<void>;
  recordingDuration: number;
  isChromium: boolean;
  isSafariBrowser: boolean;
  supportedMimeType: string;
}

const AudioRecorderContext = createContext<AudioRecorderContextType | undefined>(undefined);

export const useAudioRecorder = () => {
  const context = useContext(AudioRecorderContext);
  if (!context) {
    throw new Error('useAudioRecorder must be used within an AudioRecorderProvider');
  }
  return context;
};

export const AudioRecorderProvider = ({ children }: { children: ReactNode }) => {
  const isRecordingRef = useRef(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isChromium, setIsChromium] = useState(false);
  const [isSafariBrowser, setIsSafariBrowser] = useState(false);
  const [supportedMimeType, setSupportedMimeType] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<Date | null>(null);
  const projectIdRef = useRef<string | null>(null);
  const projectUniqueNameRef = useRef<string | null>(null);
  const pathname = usePathname();
  const pathnameRef = useRef<string>(pathname);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { socketRef } = useSocket();
  const { data: session } = useSession();
  // Check browser type and supported MIME types on mount
  useEffect(() => {
    setIsChromium(isChromiumBased());
    setIsSafariBrowser(isSafari());
    setSupportedMimeType(getSupportedMimeType());
  }, []);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const updateDuration = () => {
    if (startTimeRef.current) {
      const duration = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
      setRecordingDuration(duration);
    }
  };

  const getTranscript = useCallback(
    async (audioBlob: Blob, startTime: string, endTime: string) => {
      try {
        setIsTranscribing(true);
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('startDate', startTime);
        formData.append('endDate', endTime);
        const audioDuration = (await getAudioDurationFromBlob(audioBlob)) as number;
        if (!audioDuration || typeof audioDuration !== 'number') {
          console.log('Audio duration not found');
          toast.error('Failed to get audio duration');
          return;
        }
        formData.append('audioDuration', String(Math.ceil(audioDuration)));

        const response = await ProjectService.transcribeAudio(
          projectIdRef.current ?? null,
          formData,
        );

        if (!response.data) {
          toast.error(response.error?.message || 'Transcription failed. Please try again.');
        } else {
          setIsTranscribing(false);
          if (pathnameRef.current.includes('meetings')) {
            router.refresh();
          } else if (projectUniqueNameRef.current) {
            router.push(`/dashboard/project/${projectUniqueNameRef.current}/meetings`);
          } else {
            router.push('/dashboard/meetings');
          }
        }
      } catch (error) {
        console.error('Transcription error:', error);
        throw error;
      } finally {
        setIsTranscribing(false);
      }
    },
    [router, setIsTranscribing],
  );

  const startRecording = async (
    projectId: string | null,
    projectUniqueName: string | null,
    mode: RecordingMode = 'combined',
  ) => {
    // Check if MediaRecorder is supported
    if (typeof MediaRecorder === 'undefined') {
      toast.error('Your browser does not support audio recording. Please try a different browser.');
      return;
    }

    // Check if we have at least one supported MIME type
    if (!supportedMimeType && !MediaRecorder.isTypeSupported('audio/mp4')) {
      toast.error(
        'Your browser does not support any compatible audio format. Please try a different browser.',
      );
      return;
    }

    projectIdRef.current = projectId;
    projectUniqueNameRef.current = projectUniqueName;
    let userStream: MediaStream | null = null;
    let systemStream: MediaStream | null = null;
    let isScreenShared = mode === 'combined';
    try {
      // Only try to get system audio if in combined mode and using a supported browser
      // Safari doesn't support getDisplayMedia for audio in the same way
      if (
        mode === 'combined' &&
        (isChromium || (isSafariBrowser && 'getDisplayMedia' in navigator.mediaDevices))
      ) {
        try {
          systemStream = await navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: {
              displaySurface: 'browser',
            },
          });
        } catch (error) {
          isScreenShared = false;
          toast.warning("Only recording microphone audio as system audio sharing wasn't enabled.");
        }
      }
      startTimeRef.current = new Date();
      // Get microphone audio in all cases
      userStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // For microphone-only mode, try to capture system audio playback if possible
          // This is an experimental feature and may not work in all browsers
          echoCancellation: isScreenShared,
          noiseSuppression: isScreenShared,
          autoGainControl: isScreenShared,
        },
      });

      // Create audio context with Safari compatibility
      // Safari requires a different approach for AudioContext
      let audioContext: AudioContext;
      try {
        // @ts-ignore - Safari might use webkitAudioContext
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();
      } catch (error) {
        console.error('Failed to create AudioContext:', error);
        toast.error(
          'Your browser has limited support for audio processing. Basic recording will be used.',
        );

        // Fallback to basic recording if AudioContext fails
        if (userStream) {
          try {
            const fallbackOptions: MediaRecorderOptions = {};
            if (supportedMimeType && MediaRecorder.isTypeSupported(supportedMimeType)) {
              fallbackOptions.mimeType = supportedMimeType;
            }

            mediaRecorderRef.current = new MediaRecorder(userStream, fallbackOptions);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
              if (event.data.size > 0) {
                chunksRef.current.push(event.data);
              }
            };

            mediaRecorderRef.current.onstop = async () => {
              setIsTranscribing(true);
              userStream?.getTracks().forEach((track) => track.stop());
              const endTime = new Date();

              const blobOptions: BlobPropertyBag = {};
              if (supportedMimeType) {
                blobOptions.type = supportedMimeType;
              }

              const audioBlob = new Blob(chunksRef.current, blobOptions);

              try {
                await getTranscript(
                  audioBlob,
                  startTimeRef.current?.toISOString() ?? '',
                  endTime.toISOString(),
                );
              } catch (error) {
                toast.error('Failed to process recording');
                console.error('Recording error:', error);
              } finally {
                startTimeRef.current = null;
                setRecordingDuration(0);
                if (durationIntervalRef.current) {
                  clearInterval(durationIntervalRef.current);
                }
              }
            };

            mediaRecorderRef.current.start(1000);
            isRecordingRef.current = true;
            durationIntervalRef.current = setInterval(updateDuration, 1000);
            toast.success('Recording started with basic mode due to browser limitations');
            return;
          } catch (fallbackError) {
            console.error('Fallback recording failed:', fallbackError);
            toast.error('Recording is not supported in your browser');
            return;
          }
        }
        return;
      }

      const merger = audioContext.createChannelMerger(1);
      const dest = audioContext.createMediaStreamDestination();

      const userSource = audioContext.createMediaStreamSource(userStream);
      const userGain = audioContext.createGain();
      userGain.gain.value = 0.7;
      userSource.connect(userGain);
      userGain.connect(merger, 0, 0);

      if (systemStream?.getAudioTracks().length) {
        const systemSource = audioContext.createMediaStreamSource(systemStream);
        const systemGain = audioContext.createGain();
        systemGain.gain.value = 0.5;
        systemSource.connect(systemGain);
        systemGain.connect(merger, 0, 0);
      }
      if (systemStream) {
        systemStream.getVideoTracks().forEach((track) => {
          track.addEventListener('ended', () => {
            console.log('ended');
            stopRecording();
          });
        });
      }

      merger.connect(dest);

      // Check if we have a supported MIME type
      const mimeType = supportedMimeType || 'audio/mp4'; // Fallback to audio/mp4 if no supported type found

      let mediaRecorderOptions: MediaRecorderOptions = {
        audioBitsPerSecond: 128000,
      };

      // Only add mimeType to options if it's supported
      if (MediaRecorder.isTypeSupported(mimeType)) {
        mediaRecorderOptions.mimeType = mimeType;
      } else if (isSafariBrowser && MediaRecorder.isTypeSupported('audio/mp4')) {
        // Safari specific fallback
        mediaRecorderOptions.mimeType = 'audio/mp4';
      }

      // Create the MediaRecorder with appropriate options
      const mediaRecorder = new MediaRecorder(dest.stream, mediaRecorderOptions);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsTranscribing(true);
        userStream?.getTracks().forEach((track) => track.stop());
        systemStream?.getTracks().forEach((track) => track.stop());
        const endTime = new Date();
        // Use the same MIME type for the blob that was used for recording
        // If no specific type was supported, let the browser determine the type
        const blobOptions: BlobPropertyBag = {};
        if (supportedMimeType) {
          blobOptions.type = supportedMimeType;
        }

        const audioBlob = new Blob(chunksRef.current, blobOptions);

        try {
          await getTranscript(
            audioBlob,
            startTimeRef.current?.toISOString() ?? '',
            endTime.toISOString(),
          );
        } catch (error) {
          toast.error('Failed to process recording');
          console.error('Recording error:', error);
        } finally {
          startTimeRef.current = null;
          setRecordingDuration(0);
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
          }
        }
      };

      mediaRecorder.start(500);
      if (projectIdRef.current) {
        startRecordingEvent(projectIdRef.current);
      }
      isRecordingRef.current = true;
      durationIntervalRef.current = setInterval(updateDuration, 1000);
    } catch (error) {
      console.error('Error accessing audio:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
          toast.info(
            'Please ensure you have granted permission to access your microphone and share your screen/tab audio.',
          );
        } else if (error.name === 'NotFoundError') {
          toast.info('No audio input devices were found.');
        } else if (error.name === 'NotSupportedError') {
          if (isSafariBrowser) {
            toast.error(
              'Safari has limited support for some audio features. Try using microphone-only mode.',
            );
          } else {
            toast.error('Your browser does not support the requested audio configuration.');
          }
        } else {
          toast.error(`Failed to start recording: ${error.message}`);
        }
      }

      // Clean up any streams that might have been created
      if (userStream) {
        userStream.getTracks().forEach((track) => track.stop());
      }
      if (systemStream) {
        systemStream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const uploadAudio = async (audioBlob: Blob, projectId: string | null) => {
    try {
      setIsTranscribing(true);
      const formData = new FormData();
      formData.append('audio', audioBlob);
      const startTime = new Date().toISOString();
      const audioDuration = (await getAudioDurationFromBlob(audioBlob)) as number;
      if (!audioDuration || typeof audioDuration !== 'number') {
        console.log('Audio duration not found');
        toast.error('Failed to get audio duration');
        return;
      }
      const endTime = new Date(new Date().getTime() + audioDuration * 1000).toISOString();
      formData.append('startDate', startTime);
      formData.append('endDate', endTime);
      formData.append('audioDuration', String(Math.ceil(audioDuration)));
      const response = await ProjectService.transcribeAudio(projectId, formData);

      if (!response.data) {
        toast.error(response.error?.message || 'Transcription failed. Please try again.');
      } else {
        setIsTranscribing(false);
        if (pathnameRef.current.includes('meetings')) {
          router.refresh();
        } else if (projectUniqueNameRef.current) {
          router.push(`/dashboard/project/${projectUniqueNameRef.current}/meetings`);
        } else {
          router.push('/dashboard/meetings');
        }
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error('Failed to upload audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      mediaRecorderRef.current.stop();
      isRecordingRef.current = false;
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (projectIdRef.current) {
        stopRecordingEvent(projectIdRef.current);
      }
    }
  };

  const startRecordingEvent = (projectId: string) => {
    if (!socketRef.current || !session?.user) return;

    socketRef.current?.emit('startRecording', {
      projectId,
      user: {
        userId: session.id,
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.image,
      },
    });
  };

  const stopRecordingEvent = (projectId: string) => {
    if (!socketRef.current || !session?.user) return;

    socketRef.current?.emit('stopRecording', {
      projectId,
      user: {
        userId: session.id,
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.image,
      },
    });
  };

  return (
    <AudioRecorderContext.Provider
      value={{
        isRecording: isRecordingRef.current,
        isTranscribing,
        startRecording,
        uploadAudio,
        stopRecording,
        recordingDuration,
        isChromium,
        isSafariBrowser,
        supportedMimeType,
      }}
    >
      {children}
    </AudioRecorderContext.Provider>
  );
};
