
'use client';

import { useState, useMemo } from 'react';
import {
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths,
  addYears,
  subYears,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Event } from '@/types/anniv';
import {EventType} from '@/lib/constant'
import { EVENT_COLORS, blendColors } from '@/utils/color';
import { cn } from '@/lib/utils';

interface EventCalendarHeatmapProps {
  events: Event[];
  onDateClick?: (date: Date, events: Event[]) => void;
}

type ViewType = 'year' | 'month' | 'week';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function EventCalendarHeatmap({
  events,
  onDateClick,
}: EventCalendarHeatmapProps) {
  const [viewType, setViewType] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // 获取日期范围
  const dateRange = useMemo(() => {
    switch (viewType) {
      case 'year':
        return {
          start: startOfYear(currentDate),
          end: endOfYear(currentDate),
        };
      case 'month':
        return {
          start: startOfWeek(startOfMonth(currentDate), { locale: zhCN }),
          end: endOfWeek(endOfMonth(currentDate), { locale: zhCN }),
        };
      case 'week':
        return {
          start: startOfWeek(currentDate, { locale: zhCN }),
          end: endOfWeek(currentDate, { locale: zhCN }),
        };
    }
  }, [viewType, currentDate]);

  // 生成日期数组
  const days = useMemo(
    () => eachDayOfInterval(dateRange),
    [dateRange]
  );

  // 创建日期到事件的映射
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    
    events.forEach((event) => {
      const dateKey = format(new Date(event.event_date), 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, event]);
    });

    return map;
  }, [events]);

  // 获取日期的颜色
  const getDateColor = (date: Date): string => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayEvents = eventsByDate.get(dateKey) || [];
    
    if (dayEvents.length === 0) return '';
    
    const colors = dayEvents.map((e) => EVENT_COLORS[e.type]);
    return blendColors([...new Set(colors)]);
  };

  // 导航
  const navigate = (direction: 'prev' | 'next') => {
    const offset = direction === 'prev' ? -1 : 1;
    
    switch (viewType) {
      case 'year':
        setCurrentDate(direction === 'prev' 
          ? subYears(currentDate, 1) 
          : addYears(currentDate, 1)
        );
        break;
      case 'month':
        setCurrentDate(direction === 'prev' 
          ? subMonths(currentDate, 1) 
          : addMonths(currentDate, 1)
        );
        break;
      case 'week':
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + offset * 7)));
        break;
    }
  };

  const getTitle = () => {
    switch (viewType) {
      case 'year':
        return format(currentDate, 'yyyy年', { locale: zhCN });
      case 'month':
        return format(currentDate, 'yyyy年MM月', { locale: zhCN });
      case 'week':
        return `${format(dateRange.start, 'MM月dd日')} - ${format(dateRange.end, 'MM月dd日')}`;
    }
  };

  return (
    <div className="space-y-4">
      {/* 控制栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold min-w-[140px] text-center">{getTitle()}</h3>
          <Button variant="outline" size="icon" onClick={() => navigate('next')}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            今天
          </Button>
        </div>

        <Tabs value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
          <TabsList>
            <TabsTrigger value="week">周</TabsTrigger>
            <TabsTrigger value="month">月</TabsTrigger>
            <TabsTrigger value="year">年</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">图例：</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-rose-500" />
          <span>纪念日</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-violet-500" />
          <span>生日</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-sky-500" />
          <span>倒数日</span>
        </div>
      </div>

      {/* 日历网格 */}
      {viewType === 'year' ? (
        <YearView 
          days={days} 
          eventsByDate={eventsByDate}
          currentDate={currentDate}
          onDateClick={onDateClick}
        />
      ) : (
        <MonthWeekView
          days={days}
          eventsByDate={eventsByDate}
          currentDate={currentDate}
          onDateClick={onDateClick}
          viewType={viewType}
        />
      )}
    </div>
  );
}

// 年视图（热力图）
function YearView({
  days,
  eventsByDate,
  currentDate,
  onDateClick,
}: {
  days: Date[];
  eventsByDate: Map<string, Event[]>;
  currentDate: Date;
  onDateClick?: (date: Date, events: Event[]) => void;
}) {
  // 按月分组
  const months = useMemo(() => {
    const result: { month: string; days: Date[] }[] = [];
    
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(currentDate.getFullYear(), i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), i + 1, 0);
      const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      result.push({
        month: format(monthStart, 'M月', { locale: zhCN }),
        days: monthDays,
      });
    }
    
    return result;
  }, [currentDate]);

  return (
    <div className="grid grid-cols-4 gap-4">
      {months.map(({ month, days: monthDays }) => (
        <div key={month} className="space-y-1">
          <div className="text-sm font-medium text-center">{month}</div>
          <div className="grid grid-cols-7 gap-0.5">
            {monthDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate.get(dateKey) || [];
              const colors = dayEvents.map((e) => EVENT_COLORS[e.type]);
              const color = dayEvents.length > 0 ? blendColors([...new Set(colors)]) : undefined;

              return (
                <TooltipProvider key={dateKey}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          'w-3 h-3 rounded-sm transition-all',
                          dayEvents.length === 0 && 'bg-muted',
                          isSameDay(day, new Date()) && 'ring-1 ring-primary'
                        )}
                        style={color ? { backgroundColor: color } : undefined}
                        onClick={() => onDateClick?.(day, dayEvents)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <div>{format(day, 'yyyy年MM月dd日')}</div>
                        {dayEvents.length > 0 && (
                          <div className="mt-1">
                            {dayEvents.map((e) => (
                              <div key={e.id}>{e.name}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// 月/周视图
function MonthWeekView({
  days,
  eventsByDate,
  currentDate,
  onDateClick,
  viewType,
}: {
  days: Date[];
  eventsByDate: Map<string, Event[]>;
  currentDate: Date;
  onDateClick?: (date: Date, events: Event[]) => void;
  viewType: 'month' | 'week';
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 星期标题 */}
      <div className="grid grid-cols-7 bg-muted">
        {WEEKDAYS.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate.get(dateKey) || [];
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={dateKey}
              className={cn(
                'min-h-[100px] p-2 border-t border-r cursor-pointer hover:bg-muted/50 transition-colors',
                !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
                isToday && 'bg-primary/5'
              )}
              onClick={() => onDateClick?.(day, dayEvents)}
            >
              <div className={cn(
                'text-sm mb-1',
                isToday && 'font-bold text-primary'
              )}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      'text-xs px-1 py-0.5 rounded truncate text-white',
                      event.type === EventType.ANNIVERSARY && 'bg-rose-500',
                      event.type === EventType.BIRTHDAY && 'bg-violet-500',
                      event.type === EventType.COUNTDOWN && 'bg-sky-500'
                    )}
                  >
                    {event.name}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} 更多
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}