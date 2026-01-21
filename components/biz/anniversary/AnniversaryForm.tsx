"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  Bell,
  Users,
  Image,
  Globe,
  Lock,
  Plus,
  X,
  Mail,
  ChevronDown,
  Sparkles,
  CalendarIcon,
} from "lucide-react";
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
import { Calendar as CalendarX } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { annivFormSchema, AnnivFormValues } from "@/lib/schema/anniv";
import {
  CalendarType,
  EventType,
  EventTypeOptions,
  FormMode,
  RepeatType,
  RepeatTypeOptions,
  ShareMode,
} from "@/lib/constant";
import { Label } from "@/components/ui/label";
import { useTag } from "@/hooks/use-tag";
import { Spinner } from "@/components/ui/spinner";
import { TagSelector } from "@/components/custom/tag-select";
import { type Tag as TagItem } from "@/types/common";
import { useAnniv } from "@/hooks/use-anniv";
import { LunarCalendar } from "@/components/custom/lunar-calendar";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { PopoverContent } from "@/components/ui/popover";
import { DatePicker } from "@/components/custom/date-picker-field";
import LunarDatePicker from "@/components/custom/LunarPicker/LunarDatePicker";
import { lunarToSolar } from "@/utils/lunar";
import dayjs from "dayjs";

export function AnniversaryForm({
  mode,
  onClose,
}: {
  mode: FormMode;
  onClose: () => void;
}) {
  const [reminderSlots, setReminderSlots] = useState<
    Array<{ offset_days: number; trigger_time: string }>
  >([{ offset_days: 0, trigger_time: "09:00" }]);
  const [reminderChannels, setReminderChannels] = useState<number[]>([1]);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [tags, setTags] = useState<TagItem[]>([]);

  const { createAnniv } = useAnniv();

  const form = useForm<AnnivFormValues>({
    resolver: zodResolver(annivFormSchema),
    defaultValues: {
      name: "",
      description: "",
      event_date: "",
      event_time: "",
      calendar_type: CalendarType.SOLAR,
      type: EventType.ANNIVERSARY,
      share_mode: ShareMode.PRIVATE,
      location: "",
      is_reminder: true,
      email_remind: true,
      is_public: false,
      repeat_type: RepeatType.YEARLY,
      event_lunar_date: null,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const annivType = useWatch({ control: form.control, name: "type" });

  function isValidDate(date: Date | undefined) {
    if (!date) {
      return false;
    }
    return !isNaN(date.getTime());
  }

  useEffect(() => {
    const type = form.getValues("type");
    if (typeof type === "number") {
      form.setValue("type", String(type));
    }
  }, [mode]);

  useEffect(() => {
    if (annivType === EventType.BIRTHDAY.toString()) {
      form.setValue("repeat_type", RepeatType.YEARLY);
    }
  }, [annivType, form]);

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (email && !inviteEmails.includes(email) && email.includes("@")) {
      setInviteEmails([...inviteEmails, email]);
      setEmailInput("");
    }
  };

  const handleAddReminderSlot = () => {
    setReminderSlots([
      ...reminderSlots,
      { offset_days: 1, trigger_time: "09:00" },
    ]);
  };

  const handleRemoveReminderSlot = (index: number) => {
    setReminderSlots(reminderSlots.filter((_, i) => i !== index));
  };

  const onRestForm = () => {
    form.reset();
    setTags([]);
    setReminderSlots([{ offset_days: 0, trigger_time: "09:00" }]);
  };

  const onSubmit = async (data: AnnivFormValues) => {
    const fullData = {
      ...data,
      tags,
      event_time: data.event_time || undefined,
      remind_rule: data.is_reminder
        ? { channels: reminderChannels, slots: reminderSlots }
        : undefined,
      share:
        data.share_mode === ShareMode.PUBLIC
          ? {
              invite_external_users: inviteEmails,
              invite_app_users: [],
              invite_groups: [],
              message: "",
            }
          : undefined,
    };

    console.log("Form submitted:", fullData);

    await createAnniv(fullData);
  };

  const shareMode = form.watch("share_mode");
  const isReminder = form.watch("is_reminder");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Event Type Selection */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="">选择一个类型：</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-3 gap-3"
                >
                  {EventTypeOptions.map((item) => (
                    <Label
                      key={item.str_value}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-1 p-2 cursor-pointer transition-all",
                        field.value === item.str_value
                          ? `border-${item.color} bg-${item.color} text-gray-100`
                          : `border-border hover:border-muted-foreground/30 text-${item.color}`
                      )}
                    >
                      <RadioGroupItem
                        value={item.str_value}
                        className="sr-only"
                      />

                      <span className="text-2xl">
                        {<item.icon className={cn("h-5 w-5")} />}
                      </span>
                      <span className={cn("text-sm font-medium")}>
                        {item.label}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Basic Info */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  日程名称
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="例如：第一次相遇、妈妈的生日..."
                    className="h-11"
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
                <FormLabel>日程描述</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="记录下这个特别日子的故事..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                地点
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="添加地点，当天可触发地点回忆..."
                  className="h-11"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Tags */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            标签
          </Label>

          <div className="flex flex-wrap gap-2">
            <TagSelector limit={5} value={tags} onChange={setTags} />
          </div>
        </div>

        {/* Date & Time */}
        <Card className="p-4">
          <FormField
            control={form.control}
            name="calendar_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>日历类型</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value?.toString()} // number -> string
                    onValueChange={(v) =>
                      field.onChange(Number(v) as CalendarType)
                    }
                    className="flex gap-4"
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value={String(CalendarType.SOLAR)} />
                      <span className="text-sm">公历</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value={String(CalendarType.LUNAR)} />
                      <span className="text-sm">农历</span>
                    </label>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          {form.getValues("calendar_type") === CalendarType.LUNAR && (
            <Controller
              name="event_lunar_date"
              control={form.control}
              render={({ field: { onChange, value, ref } }) => (
                <LunarDatePicker
                  ref={ref}
                  value={value}
                  onChange={(v) => {
                    onChange(v) &&
  
                      form.setValue(
                        "event_date",
                        dayjs(
                          lunarToSolar(v.year, v.month, v.day, v.isLeapMonth)?.toString()
                        ).format("YYYY-MM-DD")
                      );
                  }}
                  placeholder="请选择农历生日"
                  minYear={1950}
                  maxYear={2050}
                />
              )}
            />
          )}

          <FormField
            control={form.control}
            name="event_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  日期
                </FormLabel>
                <FormControl>
                  <Controller
                    control={form.control}
                    name="event_date"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={
                          form.getValues("calendar_type") == CalendarType.LUNAR
                        }
                      />
                    )}
                  />
                  {/* <Input type="date" className="h-11" {...field} /> */}
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  时间
                </FormLabel>
                <FormControl>
                  <Input type="time" className="h-11" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {annivType !== EventType.BIRTHDAY.toString() && (
            <FormField
              control={form.control}
              name="repeat_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>重复周期</FormLabel>
                  <Select
                    value={field.value?.toString()} // number -> string
                    onValueChange={(v) =>
                      field.onChange(Number(v) as RepeatType)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="选择重复周期" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RepeatTypeOptions.map((item) => (
                        <SelectItem value={item.str_value} key={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          )}
        </Card>

        {/* Media Upload */}
        {/* <div className="space-y-2">
          <FormLabel className="flex items-center gap-2">
            <Image className="h-4 w-4 text-muted-foreground" />
            媒体资源
          </FormLabel>
          <div className="grid grid-cols-4 gap-3">
            <button
              type="button"
              className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">添加图片</span>
            </button>
          </div>
        </div> */}

        {/* Reminder */}
        <Card className="p-4 space-y-4">
          <FormField
            control={form.control}
            name="is_reminder"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    开启提醒
                  </FormLabel>
                  <FormDescription>即将到来时收到提醒通知</FormDescription>
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

          {isReminder && (
            <>
              <FormField
                control={form.control}
                name="email_remind"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>同时开启邮件提醒</FormLabel>
                    <FormDescription></FormDescription>

                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-3 pt-2 border-t">
                <div className="space-y-2">
                  <div className="text-sm font-medium">提醒时间</div>
                  <div className="space-y-2">
                    {reminderSlots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          提前
                        </span>
                        <Select
                          value={String(slot.offset_days)}
                          onValueChange={(value) => {
                            const newSlots = [...reminderSlots];
                            newSlots[index].offset_days = Number(value);
                            setReminderSlots(newSlots);
                          }}
                        >
                          <SelectTrigger className="w-20 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 3, 7, 14, 30].map((days) => (
                              <SelectItem key={days} value={String(days)}>
                                {days}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">
                          天
                        </span>
                        <Input
                          type="time"
                          value={slot.trigger_time}
                          onChange={(e) => {
                            const newSlots = [...reminderSlots];
                            newSlots[index].trigger_time = e.target.value;
                            setReminderSlots(newSlots);
                          }}
                          className="w-28 h-9"
                        />
                        {reminderSlots.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveReminderSlot(index)}
                            className="h-9 w-9 p-0 text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddReminderSlot}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    添加提醒时间
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Share & Privacy */}
        <Card className="p-4 space-y-4">
          <FormField
            control={form.control}
            name="share_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  共享设置
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value?.toString()} // number -> string
                    onValueChange={(v) => field.onChange(Number(v))}
                    className="grid grid-cols-2 gap-3"
                  >
                    <label
                      className={cn(
                        "flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all",
                        field.value === ShareMode.PRIVATE
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <RadioGroupItem value="0" className="sr-only" />
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium">独享</span>
                        <p className="text-xs text-muted-foreground">
                          仅自己可见
                        </p>
                      </div>
                    </label>
                    <label
                      className={cn(
                        "flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all",
                        field.value === ShareMode.PUBLIC
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <RadioGroupItem value="1" className="sr-only" />
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium">共享</span>
                        <p className="text-xs text-muted-foreground">
                          邀请他人共同纪念
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          {shareMode === ShareMode.PUBLIC && (
            <div className="space-y-3 pt-2 border-t">
              <div className="space-y-2">
                <span className="text-sm font-medium">邀请成员</span>
                <div className="flex flex-wrap gap-2">
                  {inviteEmails.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="gap-1 pr-1.5"
                    >
                      <Mail className="h-3 w-3" />
                      {email}
                      <button
                        type="button"
                        onClick={() =>
                          setInviteEmails(
                            inviteEmails.filter((e) => e !== email)
                          )
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <div className="flex items-center gap-1">
                    <Input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddEmail())
                      }
                      placeholder="输入邮箱地址"
                      className="h-7 w-40 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAddEmail}
                      className="h-7 w-7 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* <FormField
            control={form.control}
            name="is_public"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    公开到广场
                  </FormLabel>
                  <FormDescription>所有人都可以看到这个纪念日</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          /> */}
        </Card>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onRestForm}
          >
            重置
          </Button>
          <Button
            type="submit"
            className="flex-1 warm-gradient text-white shadow-warm"
          >
            {isSubmitting ? <Spinner className="h-4 w-4" /> : "保存"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
