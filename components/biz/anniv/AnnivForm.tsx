"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  Cake,
  Clock,
  Calendar,
  MapPin,
  Tag,
  Bell,
  Users,
  Image as ImageIcon,
  Plus,
  X,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scheduleFormSchema, ScheduleFormValues } from "@/lib/schema/schedule";
import { ScheduleFormData } from "@/lib/types/schedule";
import { LunarDatePicker } from "./LunarDatePicker";
import { LocationPicker, Location } from "@/components/location";
import { TagSelector } from "@/components/biz/common/TagSelector";
import { ShareInviteDialog, ShareConfig } from "./ShareInviteDialog";
import { format } from "date-fns";

interface ScheduleFormProps {
  defaultValues?: Partial<ScheduleFormData>;
  onSubmit: (data: ScheduleFormData) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

// 日程类型配置
const scheduleTypes = [
  {
    value: 1,
    label: "纪念日",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-50 border-pink-200",
    description: "记录重要的纪念时刻",
  },
  {
    value: 2,
    label: "生日",
    icon: Cake,
    color: "text-purple-500",
    bgColor: "bg-purple-50 border-purple-200",
    description: "不错过每一个生日祝福",
  },
  {
    value: 3,
    label: "倒数日",
    icon: Clock,
    color: "text-blue-500",
    bgColor: "bg-blue-50 border-blue-200",
    description: "期待重要日子的到来",
  },
];

// 重复类型配置
const repeatTypes = [
  { value: "none", label: "不重复" },
  { value: "weekly", label: "每周" },
  { value: "monthly", label: "每月" },
  { value: "quarterly", label: "每3个月" },
  { value: "half-yearly", label: "每半年" },
  { value: "yearly", label: "每年" },
];

// 提醒渠道配置
const reminderChannels = [
  { value: 1, label: "站内通知", icon: Bell },
  { value: 2, label: "邮件提醒", icon: () => <span>📧</span> },
];

// 提醒时间预设
const reminderPresets = [
  { offset_days: 0, trigger_time: "09:00:00", label: "当天 9:00" },
  { offset_days: 1, trigger_time: "09:00:00", label: "提前1天 9:00" },
  { offset_days: 3, trigger_time: "09:00:00", label: "提前3天 9:00" },
  { offset_days: 7, trigger_time: "09:00:00", label: "提前7天 9:00" },
  { offset_days: 30, trigger_time: "09:00:00", label: "提前30天 9:00" },
];

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>(
    defaultValues?.media?.map((m) => m.url) || []
  );

  // 初始化表单
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      event_date: defaultValues?.event_date
        ? new Date(defaultValues.event_date)
        : new Date(),
      event_time: defaultValues?.event_time || "",
      calendar_type: defaultValues?.calendar_type || 1,
      type: defaultValues?.type || 1,
      share_mode: defaultValues?.share_mode || 0,
      tags: defaultValues?.tags || [],
      is_reminder: defaultValues?.is_reminder ?? true,
      remind_rule: defaultValues?.remind_rule || {
        channels: [1],
        slots: [{ offset_days: 0, trigger_time: "09:00:00" }],
      },
      repeat_type: defaultValues?.repeat_type || "yearly",
      location: defaultValues?.location,
      share: defaultValues?.share,
    },
  });

  const watchType = form.watch("type");
  const watchIsReminder = form.watch("is_reminder");
  const watchRemindRule = form.watch("remind_rule");
  const watchShareMode = form.watch("share_mode");

  // 处理提交
  const handleSubmit = async (values: ScheduleFormValues) => {
    setIsSubmitting(true);
    try {
      const formData: ScheduleFormData = {
        ...values,
        event_date: format(values.event_date, "yyyy-MM-dd"),
        media: mediaPreview.map((url, index) => ({
          type: "image",
          url,
          thumbnail_url: url,
          order: index,
        })),
      };
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理媒体文件上传
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setMediaFiles((prev) => [...prev, ...newFiles]);

    // 生成预览
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setMediaPreview((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 移除媒体文件
  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreview((prev) => prev.filter((_, i) => i !== index));
  };

  // 添加提醒时间槽
  const addReminderSlot = () => {
    const currentSlots = watchRemindRule?.slots || [];
    form.setValue("remind_rule", {
      ...watchRemindRule,
      channels: watchRemindRule?.channels || [1],
      slots: [
        ...currentSlots,
        { offset_days: 1, trigger_time: "09:00:00" },
      ],
    });
  };

  // 移除提醒时间槽
  const removeReminderSlot = (index: number) => {
    const currentSlots = watchRemindRule?.slots || [];
    if (currentSlots.length <= 1) return;
    form.setValue("remind_rule", {
      ...watchRemindRule,
      channels: watchRemindRule?.channels || [1],
      slots: currentSlots.filter((_, i) => i !== index),
    });
  };

  // 切换提醒渠道
  const toggleChannel = (channelValue: number) => {
    const currentChannels = watchRemindRule?.channels || [];
    const newChannels = currentChannels.includes(channelValue)
      ? currentChannels.filter((c) => c !== channelValue)
      : [...currentChannels, channelValue];

    if (newChannels.length === 0) return; // 至少保留一个渠道

    form.setValue("remind_rule", {
      ...watchRemindRule,
      channels: newChannels,
      slots: watchRemindRule?.slots || [],
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 日程类型选择 */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>日程类型</FormLabel>
              <FormControl>
                <div className="grid grid-cols-3 gap-3">
                  {scheduleTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = field.value === type.value;
                    return (
                      <Card
                        key={type.value}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          isSelected
                            ? `${type.bgColor} border-2 shadow-md`
                            : "border hover:border-muted-foreground/30"
                        )}
                        onClick={() => field.onChange(type.value)}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon
                            className={cn(
                              "h-8 w-8 mx-auto mb-2",
                              isSelected ? type.color : "text-muted-foreground"
                            )}
                          />
                          <p
                            className={cn(
                              "font-medium",
                              isSelected ? type.color : ""
                            )}
                          >
                            {type.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {type.description}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 基本信息 */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>日程名称 *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      watchType === 1
                        ? "如：结婚纪念日"
                        : watchType === 2
                        ? "如：妈妈的生日"
                        : "如：高考倒计时"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>描述</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="添加一些描述..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 日期时间设置 */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="calendar_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>日历类型</FormLabel>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(v) => field.onChange(parseInt(v))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择日历类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">公历</SelectItem>
                    <SelectItem value="2">农历</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>日期 *</FormLabel>
                <FormControl>
                  <LunarDatePicker
                    value={field.value}
                    onChange={(date, isLunar) => {
                      field.onChange(date);
                      if (isLunar) {
                        form.setValue("calendar_type", 2);
                      }
                    }}
                    isLunar={form.watch("calendar_type") === 2}
                    onLunarChange={(isLunar) => {
                      form.setValue("calendar_type", isLunar ? 2 : 1);
                    }}
                    placeholder="选择日期"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>时间（可选）</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormDescription>精确到具体时间</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repeat_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>重复</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择重复类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {repeatTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 地点选择 */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                地点
              </FormLabel>
              <FormControl>
                <LocationPicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="添加地点"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 标签选择 */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                标签
              </FormLabel>
              <FormControl>
                <TagSelector
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="添加标签"
                  maxTags={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 媒体上传 */}
        <div className="space-y-3">
          <FormLabel className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            媒体资源
          </FormLabel>
          
          <div className="flex flex-wrap gap-3">
            {mediaPreview.map((preview, index) => (
              <div
                key={index}
                className="relative w-24 h-24 rounded-lg overflow-hidden border group"
              >
                <img
                  src={preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            <label className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">上传</span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleMediaUpload}
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            支持图片和视频，最多上传 9 个文件
          </p>
        </div>

        <Separator />

        {/* 提醒设置 */}
        <Accordion type="single" collapsible defaultValue="reminder">
          <AccordionItem value="reminder" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>提醒设置</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <FormField
                control={form.control}
                name="is_reminder"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">开启提醒</FormLabel>
                      <FormDescription>
                        在指定时间收到提醒通知
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {watchIsReminder && (
                <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                  {/* 提醒渠道 */}
                  <div className="space-y-2">
                    <FormLabel>提醒渠道</FormLabel>
                    <div className="flex gap-2">
                      {reminderChannels.map((channel) => {
                        const isSelected =
                          watchRemindRule?.channels?.includes(channel.value) ||
                          false;
                        return (
                          <Badge
                            key={channel.value}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleChannel(channel.value)}
                          >
                            <channel.icon className="h-3 w-3 mr-1" />
                            {channel.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* 提醒时间 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FormLabel>提醒时间</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addReminderSlot}
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        添加
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {watchRemindRule?.slots?.map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                        >
                          <Select
                            value={slot.offset_days.toString()}
                            onValueChange={(v) => {
                              const slots = [...(watchRemindRule?.slots || [])];
                              slots[index] = {
                                ...slots[index],
                                offset_days: parseInt(v),
                              };
                              form.setValue("remind_rule", {
                                ...watchRemindRule,
                                channels: watchRemindRule?.channels || [1],
                                slots,
                              });
                            }}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">当天</SelectItem>
                              <SelectItem value="1">提前1天</SelectItem>
                              <SelectItem value="3">提前3天</SelectItem>
                              <SelectItem value="7">提前7天</SelectItem>
                              <SelectItem value="14">提前14天</SelectItem>
                              <SelectItem value="30">提前30天</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            type="time"
                            value={slot.trigger_time?.slice(0, 5) || "09:00"}
                            onChange={(e) => {
                              const slots = [...(watchRemindRule?.slots || [])];
                              slots[index] = {
                                ...slots[index],
                                trigger_time: e.target.value + ":00",
                              };
                              form.setValue("remind_rule", {
                                ...watchRemindRule,
                                channels: watchRemindRule?.channels || [1],
                                slots,
                              });
                            }}
                            className="w-[100px]"
                          />

                          {(watchRemindRule?.slots?.length || 0) > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeReminderSlot(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* 快捷预设 */}
                    <div className="flex flex-wrap gap-1">
                      {reminderPresets.map((preset) => (
                        <Badge
                          key={preset.label}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => {
                            const slots = watchRemindRule?.slots || [];
                            const exists = slots.some(
                              (s) =>
                                s.offset_days === preset.offset_days &&
                                s.trigger_time === preset.trigger_time
                            );
                            if (!exists) {
                              form.setValue("remind_rule", {
                                ...watchRemindRule,
                                channels: watchRemindRule?.channels || [1],
                                slots: [
                                  ...slots,
                                  {
                                    offset_days: preset.offset_days,
                                    trigger_time: preset.trigger_time,
                                  },
                                ],
                              });
                            }
                          }}
                        >
                          + {preset.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* 共享设置 */}
        <Accordion type="single" collapsible>
          <AccordionItem value="share" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>共享设置</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <FormField
                control={form.control}
                name="share_mode"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">共享日程</FormLabel>
                      <FormDescription>
                        允许邀请其他人共同关注这个日程
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 1}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 1 : 0)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {watchShareMode === 1 && (
                <FormField
                  control={form.control}
                  name="share"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ShareInviteDialog
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      {field.value && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          已邀请{" "}
                          {(field.value.invite_app_users?.length || 0) +
                            (field.value.invite_external_users?.length || 0) +
                            (field.value.invite_groups?.length || 0)}{" "}
                          人/组
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* 提交按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? "保存修改" : "创建日程"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ScheduleForm;