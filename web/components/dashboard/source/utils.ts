import { Link2 } from 'lucide-react';

import { FileAudioIcon } from 'lucide-react';

import { FileImageIcon, FileSpreadsheetIcon } from 'lucide-react';

import { FileTextIcon } from 'lucide-react';

import { FilesIcon } from 'lucide-react';
import React, { type JSX } from 'react';

interface FileTypeInfo {
  label: string;
  color: string;
  icon: JSX.Element;
}

export const getFileTypeInfo = (url: string): FileTypeInfo => {
  const extension = url.split('.').pop()?.toLowerCase() || 'unknown';
  const typeMap: Record<string, FileTypeInfo> = {
    pdf: {
      label: 'PDF Document',
      color: 'text-red-500',
      icon: React.createElement(FilesIcon, { className: 'h-4 w-4' }),
    },
    doc: {
      label: 'Word Document',
      color: 'text-blue-500',
      icon: React.createElement(FileTextIcon, { className: 'h-4 w-4' }),
    },
    docx: {
      label: 'Word Document',
      color: 'text-blue-500',
      icon: React.createElement(FileTextIcon, { className: 'h-4 w-4' }),
    },
    xls: {
      label: 'Excel Spreadsheet',
      color: 'text-green-500',
      icon: React.createElement(FileSpreadsheetIcon, { className: 'h-4 w-4' }),
    },
    xlsx: {
      label: 'Excel Spreadsheet',
      color: 'text-green-500',
      icon: React.createElement(FileSpreadsheetIcon, { className: 'h-4 w-4' }),
    },
    txt: {
      label: 'Text File',
      color: 'text-gray-500',
      icon: React.createElement(FileTextIcon, { className: 'h-4 w-4' }),
    },
    jpg: {
      label: 'Image',
      color: 'text-purple-500',
      icon: React.createElement(FileImageIcon, { className: 'h-4 w-4' }),
    },
    jpeg: {
      label: 'Image',
      color: 'text-purple-500',
      icon: React.createElement(FileImageIcon, { className: 'h-4 w-4' }),
    },
    png: {
      label: 'Image',
      color: 'text-purple-500',
      icon: React.createElement(FileImageIcon, { className: 'h-4 w-4' }),
    },
    mp3: {
      label: 'Audio',
      color: 'text-yellow-500',
      icon: React.createElement(FileAudioIcon, { className: 'h-4 w-4' }),
    },
    wav: {
      label: 'Audio',
      color: 'text-yellow-500',
      icon: React.createElement(FileAudioIcon, { className: 'h-4 w-4' }),
    },
    webm: {
      label: 'Audio',
      color: 'text-yellow-500',
      icon: React.createElement(FileAudioIcon, { className: 'h-4 w-4' }),
    },
    mp4: {
      label: 'Audio',
      color: 'text-yellow-500',
      icon: React.createElement(FileAudioIcon, { className: 'h-4 w-4' }),
    },
    // mp4: {
    // 	label: 'Video',
    // 	color: 'text-pink-500',
    // 	icon: React.createElement(FileVideoIcon, { className: 'h-4 w-4' }),
    // },
  };

  return (
    typeMap[extension] || {
      label: 'URL',
      color: 'text-gray-500',
      icon: React.createElement(Link2, { className: 'h-4 w-4' }),
    }
  );
};
