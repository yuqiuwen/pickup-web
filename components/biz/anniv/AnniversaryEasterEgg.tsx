"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Image as ImageIcon,
  Mic,
  ArrowLeftRight,
  Sparkles,
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Schedule } from "@/lib/types/schedule";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface AnniversaryEasterEggProps {
  schedule: Schedule;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MemoryPhoto {
  id: string;
  url: string;
  date: Date;
  caption?: string;
}

interface VoiceBlessing {
  id: string;
  url: string;
  from: string;
  duration: number;
  createdAt: Date;
}

interface YearComparison {
  thisYear: {
    photo?: string;
    note?: string;
  };
  lastYear: {
    photo?: string;
    note?: string;
  };
}

// 纸屑动画组件
const Confetti: React.FC = () => {
  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dfe6e9"];
  const confettiCount = 50;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: confettiCount }).map((_, i) => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = 3 + Math.random() * 2;
        const size = 8 + Math.random() * 8;

        return (
          <motion.div
            key={i}
            className="absolute top-0"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? "50%" : "0",
            }}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{
              y: "100vh",
              opacity: [1, 1, 0],
              rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            }}
            transition={{
              duration,
              delay,
              ease: "linear",
              repeat: Infinity,
            }}
          />
        );
      })}
    </div>
  );
};

// 回忆相册组件
const MemoryAlbum: React.FC<{ photos: MemoryPhoto[] }> = ({ photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay || photos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isAutoPlay, photos.length]);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mb-2" />
        <p>暂无回忆照片</p>
        <p className="text-sm">记录美好瞬间，让回忆更有温度</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 照片展示区 */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.img
            key={photos[currentIndex].id}
            src={photos[currentIndex].url}
            alt={photos[currentIndex].caption || "回忆照片"}
            className="w-full h-full object-contain"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>

        {/* 照片信息 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <p className="text-sm opacity-80">
            {format(photos[currentIndex].date, "yyyy年MM月dd日", { locale: zhCN })}
          </p>
          {photos[currentIndex].caption && (
            <p className="mt-1">{photos[currentIndex].caption}</p>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="bg-black/30 hover:bg-black/50 text-white"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
          >
            {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>

        {/* 左右切换 */}
        {photos.length > 1 && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
              onClick={() => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % photos.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* 缩略图列表 */}
      {photos.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                currentIndex === index
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// 语音祝福组件
const VoiceBlessings: React.FC<{ blessings: VoiceBlessing[] }> = ({ blessings }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const handlePlay = (blessing: VoiceBlessing) => {
    if (playingId === blessing.id) {
      setPlayingId(null);
    } else {
      setPlayingId(blessing.id);
      // 模拟播放进度
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 100 / (blessing.duration * 10);
        if (currentProgress >= 100) {
          clearInterval(interval);
          setPlayingId(null);
          setProgress((prev) => ({ ...prev, [blessing.id]: 0 }));
        } else {
          setProgress((prev) => ({ ...prev, [blessing.id]: currentProgress }));
        }
      }, 100);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (blessings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Mic className="h-12 w-12 mb-2" />
        <p>暂无语音祝福</p>
        <p className="text-sm">录一段语音，让祝福更有温度</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blessings.map((blessing) => (
        <motion.div
          key={blessing.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
        >
          <Button
            size="icon"
            variant={playingId === blessing.id ? "default" : "outline"}
            className="flex-shrink-0"
            onClick={() => handlePlay(blessing)}
          >
            {playingId === blessing.id ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium truncate">{blessing.from}</span>
              <span className="text-sm text-muted-foreground">
                {formatDuration(blessing.duration)}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                style={{ width: `${progress[blessing.id] || 0}%` }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// 去年今日对比组件
const YearComparisonView: React.FC<{ comparison: YearComparison }> = ({ comparison }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 去年 */}
      <div className="space-y-2">
        <h4 className="text-center font-medium text-muted-foreground">
          {currentYear - 1}年
        </h4>
        <div className="aspect-square rounded-xl overflow-hidden bg-muted">
          {comparison.lastYear.photo ? (
            <img
              src={comparison.lastYear.photo}
              alt="去年今日"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
            </div>
          )}
        </div>
        {comparison.lastYear.note && (
          <p className="text-sm text-center text-muted-foreground">
            {comparison.lastYear.note}
          </p>
        )}
      </div>

      {/* 分隔符 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="bg-background rounded-full p-2 shadow-lg">
          <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* 今年 */}
      <div className="space-y-2">
        <h4 className="text-center font-medium text-muted-foreground">
          {currentYear}年
        </h4>
        <div className="aspect-square rounded-xl overflow-hidden bg-muted">
          {comparison.thisYear.photo ? (
            <img
              src={comparison.thisYear.photo}
              alt="今年"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
            </div>
          )}
        </div>
        {comparison.thisYear.note && (
          <p className="text-sm text-center text-muted-foreground">
            {comparison.thisYear.note}
          </p>
        )}
      </div>
    </div>
  );
};

export const AnniversaryEasterEgg: React.FC<AnniversaryEasterEggProps> = ({
  schedule,
  open,
  onOpenChange,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);

  // 模拟数据 - 实际应从API获取
  const mockPhotos: MemoryPhoto[] = [
    {
      id: "1",
      url: "https://picsum.photos/800/600?random=1",
      date: new Date("2023-02-14"),
      caption: "第一次约会的咖啡馆",
    },
    {
      id: "2",
      url: "https://picsum.photos/800/600?random=2",
      date: new Date("2023-05-20"),
      caption: "一起看的第一场电影",
    },
    {
      id: "3",
      url: "https://picsum.photos/800/600?random=3",
      date: new Date("2023-08-15"),
      caption: "夏日海边",
    },
  ];

  const mockBlessings: VoiceBlessing[] = [
    {
      id: "1",
      url: "/audio/blessing1.mp3",
      from: "小明",
      duration: 15,
      createdAt: new Date(),
    },
    {
      id: "2",
      url: "/audio/blessing2.mp3",
      from: "小红",
      duration: 23,
      createdAt: new Date(),
    },
  ];

  const mockComparison: YearComparison = {
    lastYear: {
      photo: "https://picsum.photos/400/400?random=10",
      note: "去年的今天，我们在一起100天",
    },
    thisYear: {
      photo: "https://picsum.photos/400/400?random=11",
      note: "今年的今天，我们在一起465天",
    },
  };

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <>
      {open && showConfetti && <Confetti />}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
              >
                <Sparkles className="h-8 w-8 text-yellow-500" />
              </motion.div>
            </div>
            <DialogTitle className="text-center pt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-2xl">🎉</span>
                <span className="mx-2">今天是{schedule.name}!</span>
                <span className="text-2xl">🎉</span>
              </motion.div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            <Tabs defaultValue="album" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="album" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  回忆相册
                </TabsTrigger>
                <TabsTrigger value="voice" className="gap-2">
                  <Mic className="h-4 w-4" />
                  语音祝福
                </TabsTrigger>
                <TabsTrigger value="compare" className="gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  去年今日
                </TabsTrigger>
              </TabsList>

              <TabsContent value="album" className="mt-4">
                <MemoryAlbum photos={mockPhotos} />
              </TabsContent>

              <TabsContent value="voice" className="mt-4">
                <VoiceBlessings blessings={mockBlessings} />
              </TabsContent>

              <TabsContent value="compare" className="mt-4 relative">
                <YearComparisonView comparison={mockComparison} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-center gap-4 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              稍后再看
            </Button>
            <Button className="gap-2">
              <Heart className="h-4 w-4" />
              发送祝福
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnniversaryEasterEgg;