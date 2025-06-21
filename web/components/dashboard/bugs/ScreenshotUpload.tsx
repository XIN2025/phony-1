'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ScreenshotUploadProps {
  form: UseFormReturn<Record<string, unknown>>;
  resetTrigger: number;
}
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ScreenshotUpload({ form, resetTrigger }: ScreenshotUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const processFile = useCallback(
    (file: File) => {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name || 'File'} is not a valid image file`);
        return false;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name || 'File'} exceeds the maximum size of 5MB`);
        return false;
      }

      // Get current files from form
      const currentFiles = form.getValues('screenshots') || [];

      // Add the new file
      const newFiles = [...(currentFiles as File[]), file];

      // Update form value
      form.setValue('screenshots', newFiles, { shouldValidate: true });

      // Create and store preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrls((prev) => [...prev, previewUrl]);

      return true;
    },
    [form],
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [resetTrigger, previewUrls]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;

      const items = e.clipboardData.items;
      let hasImageItem = false;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          hasImageItem = true;
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
          }
        }
      }

      if (hasImageItem) {
        e.preventDefault();
      }
    };

    // Add the event listener
    document.addEventListener('paste', handlePaste);

    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [processFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    files.forEach(processFile);

    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    // Get current files
    const currentFiles = [...(form.getValues('screenshots') as File[])];

    // Remove the file at the specified index
    currentFiles.splice(index, 1);

    // Update form value
    form.setValue('screenshots', currentFiles, { shouldValidate: true });

    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);

    // Update preview URLs
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set isDragging to false if we're leaving the dropzone
    // and not entering a child element
    if (e.currentTarget === dropzoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const files = Array.from(e.dataTransfer.files);
    files.forEach(processFile);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <FormField
      control={form.control}
      name="screenshots"
      render={() => (
        <FormItem>
          <FormLabel>Screenshots</FormLabel>
          <FormControl>
            <div className="space-y-4">
              {/* Preview area */}
              {previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {previewUrls.map((url, index) => (
                    <Card key={index} className="relative h-52 w-52 overflow-hidden">
                      <Image
                        unoptimized
                        fill
                        src={url}
                        alt={`Screenshot ${index + 1}`}
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-5 w-5"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              )}

              {/* Drop zone */}
              <div
                ref={dropzoneRef}
                className={cn(
                  'flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg',
                  'border-2 border-dashed p-6',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground hover:border-muted-foreground/50',
                  'transition-colors',
                )}
                onClick={openFileDialog}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <UploadCloud className="text-muted-foreground h-8 w-8" />
                <div className="flex flex-col items-center text-center">
                  <span className="text-muted-foreground text-sm">
                    Drag & drop images, paste from clipboard, or click to upload
                  </span>
                  <span className="text-muted-foreground mt-1 text-xs">
                    (Images only, max 5MB each)
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="screenshot-upload"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
