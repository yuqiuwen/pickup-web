// src/lib/components/media/MediaGallery.tsx

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { MediaItem } from '@/types/anniv';
import { MediaType } from '@/lib/constant';

interface MediaGalleryProps {
  media: MediaItem[];
  className?: string;
}

export function MediaGallery({ media, className }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (media.length === 0) return null;

  const openPreview = (index: number) => {
    setSelectedIndex(index);
  };

  const closePreview = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + media.length) % media.length);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % media.length);
    }
  };

  const getGridClass = () => {
    if (media.length === 1) return 'grid-cols-1';
    if (media.length === 2) return 'grid-cols-2';
    if (media.length <= 4) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  return (
    <>
      <div className={`grid ${getGridClass()} gap-2 ${className}`}>
        {media.slice(0, 9).map((item, index) => (
          <div
            key={item.id}
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
            onClick={() => openPreview(index)}
          >
            {item.type === MediaType.IMAGE ? (
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            ) : item.type === MediaType.VIDEO ? (
              <div className="relative w-full h-full bg-muted">
                <video src={item.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            )}
            {index === 8 && media.length > 9 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-white text-lg font-medium">
                  +{media.length - 9}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={closePreview}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
              onClick={closePreview}
            >
              <X className="h-6 w-6" />
            </Button>

            {media.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {selectedIndex !== null && (
              <div className="flex items-center justify-center min-h-[60vh]">
                {media[selectedIndex].type === MediaType.IMAGE ? (
                  <img
                    src={media[selectedIndex].url}
                    alt={media[selectedIndex].name}
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                ) : media[selectedIndex].type === MediaType.VIDEO? (
                  <video
                    src={media[selectedIndex].url}
                    controls
                    autoPlay
                    className="max-w-full max-h-[80vh]"
                  />
                ) : media[selectedIndex].type === MediaType.AUDIO ? (
                  <audio src={media[selectedIndex].url} controls autoPlay />
                ) : null}
              </div>
            )}

            {selectedIndex !== null && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                {selectedIndex + 1} / {media.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}