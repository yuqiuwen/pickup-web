// src/lib/schema/timeline.schema.ts
import { z } from 'zod';
import { locationSchema, mediaItemSchema } from '@/lib/schema/anniv';

export const timelineEntrySchema = z.object({
  date: z.string().min(1, '请选择日期'),
  content: z.string().max(1000, '内容不能超过1000字'),
  media: z.array(mediaItemSchema).optional().default([]),
  location: locationSchema.optional(),
  mood: z.string().optional(),
  type: z.enum(['photo', 'text', 'location', 'mood', 'ticket', 'voice']),
});

export type TimelineEntryFormData = z.infer<typeof timelineEntrySchema>;