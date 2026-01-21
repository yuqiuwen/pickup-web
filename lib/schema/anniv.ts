// src/lib/schema/event.schema.ts
import { z } from 'zod';
import { CalendarType, EventType, MediaType, RepeatType, ShareMode } from '@/lib/constant';
import { lunarToSolar } from '@/utils/lunar';

export const locationSchema = z.object({
  name: z.string().min(1, '请输入地点名称'),
  address: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

export const mediaItemSchema = z.object({
  id: z.string(),
  type: z.enum(MediaType),
  url: z.url(),
  thumbnail_url: z.string().url().optional(),
  created_at: z.string(),
});

export const reminderSlotSchema = z.object({
  offset_days: z.number().min(0, '提前天数不能为负'),
  trigger_time: z.string(),
});

export const reminderRuleSchema = z.object({
  channels: z.array(z.number()).min(1, '请至少选择一种提醒方式'),
  slots: z.array(reminderSlotSchema).min(1, '请至少添加一个提醒时间'),
});

export const shareConfigSchema = z.object({
  invite_external_users: z.array(z.string().email('请输入有效的邮箱地址')),
  invite_app_users: z.array(z.string()),
  invite_groups: z.array(z.string()),
  message: z.string().max(200, '邀请消息不能超过200字'),
});



export const shareFormSchema = z.object({
    invite_external_users: z.array(
      z.email('请输入有效的邮箱地址')
    ).optional().default([]),
    invite_app_users: z.array(z.string()).optional().default([]),
    invite_groups: z.array(z.string()).optional().default([]),
    message: z.string()
      .min(1, '请输入邀请消息')
      .max(200, '邀请消息不能超过200字'),
  });
  
  export type ShareFormData = z.infer<typeof shareFormSchema>;




//   new
export const annivFormSchema = z.object({
    name: z.string().min(1, "请输入日程名称"),
    description: z.string().optional(),
    event_date: z.string().min(1, "请选择日期"),
    event_time: z.string().optional(),
    calendar_type: z.enum(CalendarType),
    type: z.string(),   // EventType
    share_mode: z.enum(ShareMode),
    location: z.string().optional(),
    is_reminder: z.boolean(),
    is_public: z.boolean(),
    email_remind: z.boolean(),
    repeat_type: z.enum(RepeatType),
    lunar_year: z.string().optional(),
    lunar_month: z.string().optional(),
    lunar_day: z.string().optional(),
    lunar_is_leap: z.boolean().default(false),
    event_lunar_date: z.any()
  }).transform((data) => {
    // 1. 计算农历年、月、日
    if (data.event_lunar_date) {
      let { year, month, day, isLeapMonth } = data.event_lunar_date;
      return {
        ...data,
        lunar_year: year,
        lunar_month: month,
        lunar_day: day,
        lunar_is_leap: isLeapMonth,
      };
    }
    // 2. 如果没有提供农历日期对象，则保留用户可能已单独输入的字段（或清空）
    return data;
  });
  
  export type AnnivFormValues = z.infer<typeof annivFormSchema>;
  

  export const annivQueryFormSchema = z.object({
    name: z.string().optional(),
    event_year: z.string().min(1, "请选择年份"),
    type: z.string().optional(),   // EventType
    share_mode: z.enum(ShareMode).optional(),
    order_by: z.enum(['default', 'next_trigger_at.asc', 'next_trigger_at.desc']).optional()
  });

  export type AnnivQueryFormValues = z.infer<typeof annivQueryFormSchema>;