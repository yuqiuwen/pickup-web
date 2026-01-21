'use client';

import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { toPng } from 'html-to-image';
import {
  DownloadIcon,
  ShareIcon,
  PaletteIcon,
  ImageIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Event } from '@/types/anniv';
import {EventType } from '@/lib/constant'
import { getDaysUntil, getDaysSince } from '@/utils/time';
import { cn } from '@/lib/utils';

interface EventSharePosterProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const THEMES = [
  { id: 'rose', name: '玫瑰', gradient: 'from-rose-400 to-pink-500' },
  { id: 'violet', name: '紫罗兰', gradient: 'from-violet-400 to-purple-500' },
  { id: 'sky', name: '天空', gradient: 'from-sky-400 to-blue-500' },
  { id: 'sunset', name: '日落', gradient: 'from-orange-400 to-rose-500' },
  { id: 'forest', name: '森林', gradient: 'from-green-400 to-emerald-500' },
  { id: 'dark', name: '暗夜', gradient: 'from-gray-700 to-gray-900' },
];

const CARD_STYLES = {
  poster: { width: 375, height: 667, name: '海报' },
  card: { width: 375, height: 375, name: '卡片' },
  story: { width: 375, height: 812, name: '故事' },
};

export function EventSharePoster({ event, open, onOpenChange }: EventSharePosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState(THEMES[0]);
  const [cardStyle, setCardStyle] = useState<keyof typeof CARD_STYLES>('poster');
  const [customText, setCustomText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const days = event.type === EventType.COUNTDOWN
    ? getDaysUntil(event.event_date)
    : getDaysSince(event.event_date);

  const handleDownload = async () => {
    if (!posterRef.current) return;

    setIsGenerating(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `${event.name}-${format(new Date(), 'yyyyMMdd')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('生成图片失败', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!posterRef.current) return;

    setIsGenerating(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        quality: 1,
        pixelRatio: 2,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'poster.png', { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          title: event.name,
          text: customText || event.description,
          files: [file],
        });
      }
    } catch (error) {
      console.error('分享失败', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>生成分享卡片</DialogTitle>
          <DialogDescription>
            自定义样式，一键生成精美海报
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* 预览区域 */}
          <div className="flex items-center justify-center bg-muted rounded-lg p-4">
            <div
              ref={posterRef}
              className={cn(
                'bg-gradient-to-br text-white rounded-xl overflow-hidden shadow-xl',
                theme.gradient
              )}
              style={{
                width: CARD_STYLES[cardStyle].width,
                height: CARD_STYLES[cardStyle].height,
              }}
            >
              <div className="h-full flex flex-col p-8">
                {/* 封面图 */}
                {event.media?.[0] && (
                  <div className="flex-1 mb-6 rounded-lg overflow-hidden">
                    <img
                      src={event.media[0].url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 标题 */}
                <h2 className="text-3xl font-bold mb-2">{event.name}</h2>

                {/* 天数 */}
                <div className="text-6xl font-bold my-4">
                  {Math.abs(days)}
                  <span className="text-2xl ml-2">天</span>
                </div>

                {/* 描述文字 */}
                <p className="text-lg opacity-90">
                  {event.type === EventType.COUNTDOWN
                    ? days > 0
                      ? '距离目标'
                      : '已经到达'
                    : '我们一起走过'}
                </p>

                {/* 日期 */}
                <p className="text-sm opacity-75 mt-2">
                  {format(new Date(event.event_date), 'yyyy年MM月dd日', { locale: zhCN })}
                </p>

                {/* 自定义文字 */}
                {customText && (
                  <p className="text-sm mt-4 italic">"{customText}"</p>
                )}

                {/* 底部 logo */}
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-sm opacity-75">拾念 Pickup</span>
                  <span className="text-xs opacity-50">
                    {format(new Date(), 'yyyy.MM.dd')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 设置区域 */}
          <div className="space-y-6">
            {/* 卡片样式 */}
            <div className="space-y-2">
              <Label>卡片样式</Label>
              <Tabs value={cardStyle} onValueChange={(v) => setCardStyle(v as any)}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="poster">海报</TabsTrigger>
                  <TabsTrigger value="card">卡片</TabsTrigger>
                  <TabsTrigger value="story">故事</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* 主题颜色 */}
            <div className="space-y-2">
              <Label>主题颜色</Label>
              <div className="grid grid-cols-6 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t)}
                    className={cn(
                      'w-10 h-10 rounded-full bg-gradient-to-br transition-all',
                      t.gradient,
                      theme.id === t.id && 'ring-2 ring-offset-2 ring-primary'
                    )}
                    title={t.name}
                  />
                ))}
              </div>
            </div>

            {/* 自定义文字 */}
            <div className="space-y-2">
              <Label>添加一句话</Label>
              <Input
                placeholder="写下你想说的..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                onClick={handleDownload}
                disabled={isGenerating}
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                保存图片
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleShare}
                disabled={isGenerating}
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                分享
              </Button>