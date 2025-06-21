import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  files: File[];
  maxFiles?: number;
  acceptedFileTypes?: Record<string, string[]>;
  fileSupportedTypes?: string[];
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  files,
  maxFiles = 3,
  acceptedFileTypes,
  fileSupportedTypes = ['pdf', 'doc', 'docx', 'txt'],
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      onFilesSelected(newFiles);
    },
    [files, maxFiles, onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: maxFiles - files.length,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesSelected(newFiles);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop files here, or click to select files'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Supported files: {fileSupportedTypes.join(', ').toUpperCase()} (Max {maxFiles} files)
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
            >
              <span className="max-w-[80%] truncate text-sm">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
