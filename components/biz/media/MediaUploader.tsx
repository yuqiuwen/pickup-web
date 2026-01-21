// src/lib/components/media/MediaUploader.tsx

import React, { useCallback, useState } from 'react';
import { Upload, X, Image, Video, FileAudio, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MediaItem } from '@/types/anniv';
import {MediaType} from '@/lib/constant'

interface MediaUploaderProps {
  value: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  maxFiles?: number;
  accept?: string;
}

export function MediaUploader({
  value,
  onChange,
  maxFiles = 9,
  accept = 'image/*,video/*,audio/*',
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const remainingSlots = maxFiles - value.length;
      const filesToUpload = files.slice(0, remainingSlots);

      setUploading(true);
      setProgress(0);

      const newMedia: MediaItem[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        
        // 模拟上传
        await new Promise((resolve) => setTimeout(resolve, 500));
        setProgress(((i + 1) / filesToUpload.length) * 100);

        const mediaItem: MediaItem = {
          id: Date.now().toString() + i,
          type: file.type.startsWith('image/')
            ? 'image'
            : file.type.startsWith('video/')
            ? 'video'
            : file.type.startsWith('audio/')
            ? 'audio'
            : 'document',
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          created_at: new Date().toISOString(),
        };

        newMedia.push(mediaItem);
      }

      onChange([...value, ...newMedia]);
      setUploading(false);
      setProgress(0);
      e.target.value = '';
    },
    [value, onChange, maxFiles]
  );

  const removeMedia = (id: string) => {
    onChange(value.filter((m) => m.id !== id));
  };

  const getIcon = (type: MediaItem['type']) => {
    switch (type) {
      case MediaType.IMAGE:
        return <Image className="h-6 w-6" />;
      case MediaType.VIDEO:
        return <Video className="h-6 w-6" />;
      case MediaType.AUDIO:
        return <FileAudio className="h-6 w-6" />;
      default:
        return <File className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {value.map((media) => (
          <div key={media.id} className="relative group aspect-square">
            {media.type === 'image' ? (
              <img
                src={media.url}
                alt={media.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                {getIcon(media.type)}
              </div>
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeMedia(media.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {value.length < maxFiles && (
          <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground mt-1">上传</span>
            <input
              type="file"
              multiple
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center">
            上传中... {Math.round(progress)}%
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        最多上传 {maxFiles} 个文件，已上传 {value.length} 个
      </p>
    </div>
  );
}