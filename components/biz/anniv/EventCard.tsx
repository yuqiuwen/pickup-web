
'use client';

import { useState } from 'react';
import { 
  HeartIcon, 
  CakeIcon, 
  TimerIcon,
  MapPinIcon,
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
  ShareIcon,
  BellIcon,
  MessageCircleIcon,
  BookmarkIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Event} from '@/types/anniv';
import {EventType, CalendarType } from '@/lib/constant'
import { getDaysUntil, getDaysSince, formatCountdown } from '@/utils/time';
import { formatLunarDate } from '@/utils/lunar';
import { EVENT_BG_COLORS, EVENT_LIGHT_BG_COLORS } from '@/utils/color';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onShare?: (event: Event) => void;
  onClick?: (event: Event) => void;
  showActions?: boolean;
}

const EVENT_ICONS = {
  [EventType.ANNIVERSARY]: HeartIcon,
  [EventType.BIRTHDAY]: CakeIcon,
  [EventType.COUNTDOWN]: TimerIcon,
};

const EVENT_LABELS = {
  [EventType.ANNIVERSARY]: '纪念日',
  [EventType.BIRTHDAY]: '生日',
  [EventType.COUNTDOWN]: '倒数日',
};

export function EventCard({
  event,
  onEdit,
  onDelete,
  onShare,
  onClick,
  showActions = true,
}: EventCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const Icon = EVENT_ICONS[event.type];
  const days = event.type === EventType.COUNTDOWN
    ? getDaysUntil(event.event_date)
    : getDaysSince(event.event_date);
  
  const isToday = days === 0 || (event.type !== EventType.COUNTDOWN && 
    new Date(event.event_date).getMonth() === new Date().getMonth() &&
    new Date(event.event_date).getDate() === new Date().getDate());

  return (
    <Card 
      className={cn(
        'group relative overflow-hidden transition-all hover:shadow-lg cursor-pointer',
        isToday && 'ring-2 ring-primary'
      )}
      onClick={() => onClick?.(event)}
    >
      {/* 顶部彩带 */}
      <div className={cn('h-1', EVENT_BG_COLORS[event.type])} />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'p-2 rounded-full',
              EVENT_LIGHT_BG_COLORS[event.type]
            )}>
              <Icon className={cn('h-5 w-5', {
                'text-rose-500': event.type === EventType.ANNIVERSARY,
                'text-violet-500': event.type === EventType.BIRTHDAY,
                'text-sky-500': event.type === EventType.COUNTDOWN,
              })} />
            </div>
            <Badge variant="secondary" className="text-xs">
              {EVENT_LABELS[event.type]}
            </Badge>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(event);
                }}>
                  <EditIcon className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onShare?.(event);
                }}>
                  <ShareIcon className="mr-2 h-4 w-4" />
                  分享
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(event);
                  }}
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <CardTitle className="text-lg mt-2">{event.name}</CardTitle>
        
        {event.description && (
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pb-2">
        {/* 倒计时/已过天数 */}
        <div className="text-center py-4">
          <div className={cn(
            'text-4xl font-bold',
            event.type === EventType.COUNTDOWN && days <= 0 
              ? 'text-green-500' 
              : 'text-primary'
          )}>
            {event.type === EventType.COUNTDOWN 
              ? (days <= 0 ? '已到达' : `${days} 天`)
              : `${Math.abs(days)} 天`
            }
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {event.type === EventType.COUNTDOWN 
              ? (days > 0 ? '距离目标' : '')
              : '已经走过'
            }
          </div>
        </div>

        {/* 日期信息 */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>
            {format(new Date(event.event_date), 'yyyy年MM月dd日', { locale: zhCN })}
          </span>
          {event.calendar_type === CalendarType.LUNAR && (
            <span className="text-xs">
              ({formatLunarDate(new Date(event.event_date))})
            </span>
          )}
        </div>

        {/* 地点 */}
        {event.location && (
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
            <MapPinIcon className="h-3 w-3" />
            <span>{event.location.name}</span>
          </div>
        )}

        {/* 标签 */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 justify-center">
            {event.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* 提醒标识 */}
        {event.is_reminder && (
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
            <BellIcon className="h-3 w-3" />
            <span>已设置提醒</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 border-t">
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLiked(!isLiked);
                    }}
                  >
                    <HeartIcon 
                      className={cn(
                        'h-4 w-4',
                        isLiked && 'fill-red-500 text-red-500'
                      )} 
                    />
                    <span className="ml-1 text-xs">12</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>点赞</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageCircleIcon className="h-4 w-4" />
                    <span className="ml-1 text-xs">3</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>评论</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBookmarked(!isBookmarked);
                  }}
                >
                  <BookmarkIcon 
                    className={cn(
                      'h-4 w-4',
                      isBookmarked && 'fill-primary text-primary'
                    )} 
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>收藏</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>

      {/* 今日标识 */}
      {isToday && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary animate-pulse">今天!</Badge>
        </div>
      )}
    </Card>
  );
}