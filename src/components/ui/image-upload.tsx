import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from './card';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  placeholder = 'Upload image',
  className
}) => {
  const [_url, setUrl] = useState<string>('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      // Here you would typically upload the file to a storage service
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file);
      onChange(url);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed p-4 cursor-pointer hover:border-primary transition-colors',
        isDragActive && 'border-primary bg-primary/5',
        className
      )}
    >
      <input {...getInputProps()} />
      {value ? (
        <div className="relative aspect-square">
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center aspect-square text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-2"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <p className="text-sm">{placeholder}</p>
        </div>
      )}
    </Card>
  );
}; 