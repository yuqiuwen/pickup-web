
import React, { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  eachWeekOfInterval,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Event } from '@/types/anniv';
import {EventType } from '@/lib/constant'
import { EVENT_TYPE_COLORS, blendColors } from '@/utils/color';

interface EventCalendarProps {
  events: Event[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (id: string) => void;
}

type ViewMode = 'month' | 'week' | 'year';

export function EventCalendar({
  events,
  onDateClick,
  onEventClick,
}: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const eventsMap = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach((event) => {
      const dateKey = format(new Date(event.event_date), 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, event]);
    });
    return map;
  }, [events]);

  const getDateColor = (date: Date): string => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayEvents = eventsMap.get(dateKey) || [];
    if (dayEvents.length === 0) return 'transparent';

    const colors = dayEvents.map((e) => EVENT_TYPE_COLORS[e.type]);
    return blendColors(colors);
  };

  const getDateEvents = (date: Date): Event[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsMap.get(dateKey) || [];
  };

  const navigatePrevious = () => {
    if (viewMode === 'month' || viewMode === 'week') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 12));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'month' || viewMode === 'week') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 12));
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { locale: zhCN });
    const calendarEnd = endOfWeek(monthEnd, { locale: zhCN });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayEvents = getDateEvents(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const bgColor = getDateColor(day);

            return (
              <div
                key={day.toISOString()}
                className={`
                  aspect-square p-1 rounded-md cursor-pointer transition-colors
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isToday ? 'ring-2 ring-primary' : ''}
                  hover:bg-muted
                `}
                style={{
                  backgroundColor: bgColor !== 'transparent' ? `${bgColor}20` : undefined,
                }}
                onClick={() => onDateClick?.(day)}
              >
                <div className="text-center">
                  <span className="text-sm">{format(day, 'd')}</span>
                </div>
                {dayEvents.length > 0 && (
                  <div className="flex justify-center gap-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: EVENT_TYPE_COLORS[event.type] }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {months.map((month) => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

          return (
            <div key={month.toISOString()} className="p-2 border rounded-lg">
              <h4 className="text-sm font-medium mb-2 text-center">
                {format(month, 'M月')}
              </h4>
              <div className="grid grid-cols-7 gap-0.5">
                {days.map((day) => {
                  const bgColor = getDateColor(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className="aspect-square rounded-sm"
                      style={{
                        backgroundColor:
                          bgColor !== 'transparent' ? bgColor : '#E5E7EB',
                      }}
                      title={format(day, 'yyyy-MM-dd')}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold min-w-[120px] text-center">
            {viewMode === 'year'
              ? format(currentDate, 'yyyy年')
              : format(currentDate, 'yyyy年MM月')}
          </h3>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="month">月</TabsTrigger>
            <TabsTrigger value="year">年</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: EVENT_TYPE_COLORS[EventType.ANNIVERSARY] }}
          />
          <span>纪念日</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: EVENT_TYPE_COLORS[EventType.BIRTHDAY] }}
          />
          <span>生日</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: EVENT_TYPE_COLORS[EventType.COUNTDOWN] }}
          />
          <span>倒数日</span>
        </div>
      </div>

      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'year' && renderYearView()}
    </div>
  );
}