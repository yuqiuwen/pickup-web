// lib/components/event/EventTimeline.tsx
"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Camera,
  FileText,
  MapPin,
  Smile,
  Ticket,
  Mic,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Pause,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

// 时间线条目类型
export type TimelineEntryType =
  | "photo"
  | "text"
  | "location"
  | "mood"
  | "ticket"
  | "voice";

export interface TimelineEntry {
  id: string;
  type: TimelineEntryType;
  date: Date;
  content: string;
  media_url?: string;
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  mood?: string;
  created_at: Date;
}

interface EventTimelineProps {
  eventId: string;
  entries: TimelineEntry[];
  onAddEntry?: (entry: Omit<TimelineEntry, "id" | "created_at">) => void;
  onEditEntry?: (id: string, entry: Partial<TimelineEntry>) => void;
  onDeleteEntry?: (id: string) => void;
}

// 时间线条目表单验证
const timelineEntrySchema = z.object({
  type: z.enum(["photo", "text", "location", "mood", "ticket", "voice"]),
  date: z.string().min(1, "请选择日期"),
  content: z.string().min(1, "请输入内容"),
  media_url: z.string().optional(),
  location_name: z.string().optional(),
  mood: z.string().optional(),
});

type TimelineEntryFormData = z.infer<typeof timelineEntrySchema>;

const entryTypeConfig: Record<
  TimelineEntryType,
  { icon: React.ElementType; label: string; color: string }
> = {
  photo: { icon: Camera, label: "照片", color: "bg-blue-500" },
  text: { icon: FileText, label: "文字", color: "bg-green-500" },
  location: { icon: MapPin, label: "地点", color: "bg-red-500" },
  mood: { icon: Smile, label: "心情", color: "bg-yellow-500" },
  ticket: { icon: Ticket, label: "票据", color: "bg-purple-500" },
  voice: { icon: Mic, label: "语音", color: "bg-pink-500" },
};

const moodOptions = [
  { value: "happy", label: "😊 开心" },
  { value: "love", label: "❤️ 幸福" },
  { value: "excited", label: "🎉 兴奋" },
  { value: "peaceful", label: "😌 平静" },
  { value: "grateful", label: "🙏 感恩" },
  { value: "nostalgic", label: "🥹 怀念" },
];

// 语音播放组件
const VoicePlayer: React.FC<{ url: string }> = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={togglePlay}
        className="rounded-full"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <div className="flex gap-0.5">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full transition-all",
              isPlaying ? "animate-pulse bg-primary" : "bg-muted"
            )}
            style={{
              height: `${Math.random() * 16 + 8}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// 时间线条目卡片
const TimelineEntryCard: React.FC<{
  entry: TimelineEntry;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ entry, onEdit, onDelete }) => {
  const config = entryTypeConfig[entry.type];
  const Icon = config.icon;

  const renderContent = () => {
    switch (entry.type) {
      case "photo":
      case "ticket":
        return (
          <div className="space-y-2">
            {entry.media_url && (
              <img
                src={entry.media_url}
                alt={entry.content}
                className="w-full max-w-md rounded-lg object-cover"
              />
            )}
            <p className="text-sm text-muted-foreground">{entry.content}</p>
          </div>
        );
      case "voice":
        return (
          <div className="space-y-2">
            {entry.media_url && <VoicePlayer url={entry.media_url} />}
            <p className="text-sm text-muted-foreground">{entry.content}</p>
          </div>
        );
      case "location":
        return (
          <div className="space-y-2">
            {entry.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>{entry.location.name}</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">{entry.content}</p>
          </div>
        );
      case "mood":
        return (
          <div className="space-y-2">
            {entry.mood && (
              <span className="text-2xl">
                {moodOptions.find((m) => m.value === entry.mood)?.label}
              </span>
            )}
            <p className="text-sm text-muted-foreground">{entry.content}</p>
          </div>
        );
      default:
        return <p className="text-sm">{entry.content}</p>;
    }
  };

  return (
    <div className="relative flex gap-4">
      {/* 时间线轴 */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-white",
            config.color
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="w-0.5 flex-1 bg-border" />
      </div>

      {/* 内容卡片 */}
      <Card className="mb-4 flex-1">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{config.label}</Badge>
              <span className="text-sm text-muted-foreground">
                {format(entry.date, "yyyy年MM月dd日", { locale: zhCN })}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
};

// 添加时间线条目对话框
const AddTimelineEntryDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TimelineEntryFormData) => void;
}> = ({ open, onOpenChange, onSubmit }) => {
  const form = useForm<TimelineEntryFormData>({
    resolver: zodResolver(timelineEntrySchema),
    defaultValues: {
      type: "text",
      date: format(new Date(), "yyyy-MM-dd"),
      content: "",
    },
  });

  const selectedType = form.watch("type");

  const handleSubmit = (data: TimelineEntryFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>添加时间线记录</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>类型</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(entryTypeConfig).map(([type, config]) => {
                      const Icon = config.icon;
                      return (
                        <Button
                          key={type}
                          type="button"
                          variant={field.value === type ? "default" : "outline"}
                          className="flex flex-col gap-1 h-auto py-3"
                          onClick={() => field.onChange(type)}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs">{config.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>日期</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === "mood" && (
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>心情</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择心情" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {moodOptions.map((mood) => (
                          <SelectItem key={mood.value} value={mood.value}>
                            {mood.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedType === "location" && (
              <FormField
                control={form.control}
                name="location_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>地点</FormLabel>
                    <FormControl>
                      <Input placeholder="输入地点名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(selectedType === "photo" ||
              selectedType === "ticket" ||
              selectedType === "voice") && (
              <FormField
                control={form.control}
                name="media_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedType === "voice" ? "语音文件" : "图片"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept={
                          selectedType === "voice"
                            ? "audio/*"
                            : "image/*"
                        }
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // 实际项目中这里应该上传文件并获取URL
                            field.onChange(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="记录这一刻的感受..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button type="submit">添加</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// 年度汇总组件
const YearSummary: React.FC<{ entries: TimelineEntry[]; year: number }> = ({
  entries,
  year,
}) => {
  const yearEntries = entries.filter(
    (entry) => entry.date.getFullYear() === year
  );

  const stats = {
    photos: yearEntries.filter((e) => e.type === "photo").length,
    texts: yearEntries.filter((e) => e.type === "text").length,
    locations: yearEntries.filter((e) => e.type === "location").length,
    moods: yearEntries.filter((e) => e.type === "mood").length,
    tickets: yearEntries.filter((e) => e.type === "ticket").length,
    voices: yearEntries.filter((e) => e.type === "voice").length,
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">{year}年发生了什么</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-500">
              {stats.photos}
            </div>
            <div className="text-sm text-muted-foreground">张照片</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">
              {stats.texts}
            </div>
            <div className="text-sm text-muted-foreground">条文字</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">
              {stats.locations}
            </div>
            <div className="text-sm text-muted-foreground">个地点</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-500">
              {stats.moods}
            </div>
            <div className="text-sm text-muted-foreground">次心情</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-500">
              {stats.tickets}
            </div>
            <div className="text-sm text-muted-foreground">张票据</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-500">
              {stats.voices}
            </div>
            <div className="text-sm text-muted-foreground">段语音</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 主时间线组件
export const EventTimeline: React.FC<EventTimelineProps> = ({
  eventId,
  entries,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showYearSummary, setShowYearSummary] = useState(true);

  // 按日期排序
  const sortedEntries = [...entries].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  // 按年份分组
  const entriesByYear = sortedEntries.reduce(
    (acc, entry) => {
      const year = entry.date.getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(entry);
      return acc;
    },
    {} as Record<number, TimelineEntry[]>
  );

  const years = Object.keys(entriesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const handleAddEntry = (data: TimelineEntryFormData) => {
    if (onAddEntry) {
      onAddEntry({
        type: data.type as TimelineEntryType,
        date: new Date(data.date),
        content: data.content,
        media_url: data.media_url,
        location: data.location_name
          ? { name: data.location_name, lat: 0, lng: 0 }
          : undefined,
        mood: data.mood,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">时间线</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowYearSummary(!showYearSummary)}
          >
            {showYearSummary ? "隐藏汇总" : "显示汇总"}
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            添加记录
          </Button>
        </div>
      </div>

      {/* 时间线内容 */}
      {years.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              还没有任何记录，点击上方按钮添加第一条吧！
            </p>
          </CardContent>
        </Card>
      ) : (
        years.map((year) => (
          <div key={year}>
            {/* 年份标题 */}
            <div className="mb-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-lg font-semibold">{year}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* 年度汇总 */}
            {showYearSummary && (
              <YearSummary entries={entries} year={year} />
            )}

            {/* 时间线条目 */}
            <div className="ml-4">
              {entriesByYear[year].map((entry) => (
                <TimelineEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={() => {
                    // TODO: 实现编辑功能
                  }}
                  onDelete={() => onDeleteEntry?.(entry.id)}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* 添加条目对话框 */}
      <AddTimelineEntryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddEntry}
      />
    </div>
  );
};

export default EventTimeline;