'use client';
import React, { useState, MouseEvent, useEffect } from 'react';
import { useAudioRecorder } from '@/contexts/audio-recorder.context';
import { Button } from '@/components/ui/button';
import { Loader2, Square } from 'lucide-react';

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(hours.toString().padStart(2, '0'));
  parts.push(minutes.toString().padStart(2, '0'));
  parts.push(remainingSeconds.toString().padStart(2, '0'));

  return parts.join(':');
};

export const RecordingStatus = () => {
  const { isRecording, stopRecording, isTranscribing, recordingDuration } = useAudioRecorder();
  const [position, setPosition] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 - 150 : 16,
    y: 16,
  });
  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    setPosition({ x: window.innerWidth / 2 - 150, y: 16 });
  }, []);

  // Add beforeunload event listener to show alert when user tries to close tab while recording
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRecording) {
        // Standard way to show a confirmation dialog
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = 'Recording is in progress. Are you sure you want to leave?';
        // Return a string to show confirmation dialog
        return 'Recording is in progress. Are you sure you want to leave?';
      }
    };

    if (isRecording) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRecording]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - 150, // Offset to center the div under cursor
        y: e.clientY - 20, // Offset to center the div under cursor
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isRecording && !isTranscribing) return null;

  return (
    <div
      style={{
        zIndex: 1000,
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="bg-background/95 supports-backdrop-filter:bg-background/60 flex items-center gap-4 rounded-lg border px-4 py-2 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="text-sm font-medium">Recording</span>
      </div>
      <div className="font-mono text-sm">{formatDuration(recordingDuration)}</div>
      {isTranscribing ? (
        <div className="flex items-center gap-2 text-yellow-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Transcribing...
        </div>
      ) : (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            stopRecording();
          }}
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <Square className="h-4 w-4" />
          Stop
        </Button>
      )}
    </div>
  );
};
