import { CalendarType, EventType, MediaType, ReminderChannel, RepeatType, ShareMode } from "@/lib/constant";
import {MediaItem, TagItem} from '@/types/common'
import { User } from "./auth";

export interface ReminderSlot {
    offset_days: number;
    trigger_time: string;
  }
  
  export interface ReminderRule {
    channels: ReminderChannel[];
    slots: ReminderSlot[];
  }
  
  export interface ShareConfig {
    invite_external_users: string[];
    invite_app_users: string[];
    invite_groups: string[];
    message: string;
  }
  
  export interface Location {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }
  

  export interface TimelineEntry {
    id: string;
    event_id: string;
    date: string;
    content: string;
    media: MediaItem[];
    location?: Location;
    mood?: string;
    type: 'photo' | 'text' | 'location' | 'mood' | 'ticket' | 'voice';
    created_at: string;
  }
  
  export interface Anniversary {
    id: string;
    name: string;
    description?: string;
    event_date: string;
    event_time?: string;
    calendar_type: CalendarType;
    type: EventType;
    share_mode: ShareMode;
    location?: string;
    is_reminder: boolean;
    remind_rule?: ReminderRule;
    repeat_type: RepeatType;
    next_trigger_at?: string;
    is_public: boolean;
    tz: string
    share?: ShareConfig;
    lunar_year: number
    lunar_month: number
    lunar_day: number
    lunar_is_leap: boolean
    created_at: string;
    updated_at: string;

    tags: TagItem[];
    medias: MediaItem[];
    owner: User
    user: User
  } 
  
  export interface Milestone {
    id: string;
    event_id: string;
    name: string;
    days: number;
    target_date: string;
    reached: boolean;
  }
  
  export interface Comment {
    id: string;
    event_id: string;
    user_id: string;
    user_name: string;
    user_avatar: string;
    content: string;
    created_at: string;
  }


  export interface EventSort {
    field: 'event_date' | 'created_at' | 'name';
    order: 'asc' | 'desc';
  }

  export interface EventFilter {
    type?: EventType;
    calendar_type?: CalendarType;
    share_mode?: ShareMode;
    tags?: string[];
    date_range?: {
      start: string;
      end: string;
    };
  }


  export interface AnnivStat {
    year_total: number;
    share_total: number
    next_anniv?: Anniversary[]
  }

  export interface Stats {
    like_cnt: number
    collect_cnt: number
    comment_cnt: number
  }

  export interface Interaction {
    is_like: number
    is_collect: number
  }


  export interface AnniversaryItemFeed extends Anniversary {
    stats: Stats
    interaction: Interaction
  }