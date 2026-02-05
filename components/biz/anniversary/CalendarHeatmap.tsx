import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLunarDayText } from "@/utils/lunar";
import type { Anniversary } from "@/types/anniv";
import { EventType, eventTypeColorMap } from "@/lib/constant";
import { dayjs } from "@/utils/dayjs";

interface CalendarHeatmapProps {
  anniversaries: Anniversary[];
  view: "year" | "month" | "week";
  onDateFilter?: (date: Date | null) => void;
  onMonthFilter?: (year: number, month: number | null) => void;
  selectedDate?: Date | null;
  selectedMonth?: { year: number; month: number } | null;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

export function CalendarHeatmap({
  anniversaries,
  view,
  onDateFilter,
  onMonthFilter,
  selectedDate,
  selectedMonth,
}: CalendarHeatmapProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return anniversaries.filter((a) => {
      const dateStr = date.toISOString();
      return dayjs(a.next_trigger_at).tz(a.tz).toISOString() === dateStr;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    // Clear any filters when going to today
    onDateFilter?.(null);
    onMonthFilter?.(today.getFullYear(), null);
  };

  const handleDayClick = (date: Date) => {
    if (selectedDate && selectedDate.toDateString() === date.toDateString()) {
      // Deselect if clicking same date
      onDateFilter?.(null);
    } else {
      onDateFilter?.(date);
    }
  };

  const handleMonthClick = (monthIndex: number) => {
    if (
      selectedMonth &&
      selectedMonth.year === currentYear &&
      selectedMonth.month === monthIndex
    ) {
      // Deselect if clicking same month
      onMonthFilter?.(currentYear, null);
    } else {
      onMonthFilter?.(currentYear, monthIndex);
    }
  };

  // Get color based on event types
  const getDateColor = (events: Anniversary[]) => {
    if (events.length === 0) return "";
    const types = [...new Set(events.map((e) => e.type))];
    if (types.length === 1) {
      return `bg-${eventTypeColorMap[types[0]]}`;
    }
    return "bg-gradient-to-br from-anniversary via-birthday to-countdown";
  };

  // Generate month view
  const generateMonthDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }

    return days;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + direction, 1));
  };

  if (view === "month") {
    const days = generateMonthDays();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h3 className="text-lg font-semibold">
            {currentYear}年 {currentMonth + 1}月
          </h3>
          {!isCurrentMonth && (
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-7 px-2 text-xs"
            >
              <CalendarDays className="h-3 w-3 mr-1" />
              今天
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const events = getEventsForDate(date);
            const isToday = date.getTime() === today.getTime();
            const colorClass = getDateColor(events);
            const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();

            const lunarText = getLunarDayText(date);
            const isTermOrFirstDay =
              lunarText.includes("月") ||
              [
                "立春",
                "雨水",
                "惊蛰",
                "春分",
                "清明",
                "谷雨",
                "立夏",
                "小满",
                "芒种",
                "夏至",
                "小暑",
                "大暑",
                "立秋",
                "处暑",
                "白露",
                "秋分",
                "寒露",
                "霜降",
                "立冬",
                "小雪",
                "大雪",
                "冬至",
                "小寒",
                "大寒",
              ].includes(lunarText);

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDayClick(date)}
                className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-105 min-h-[32px]",
                  isToday && "ring-1 ring-primary ring-offset-1",
                  isSelected && "ring-1 ring-primary ring-offset-1 scale-105",
                  colorClass ? `${colorClass} text-white` : "bg-muted/50 hover:bg-muted"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium leading-none",
                    !colorClass && "text-foreground"
                  )}
                >
                  {date.getDate()}
                </span>
                <span
                  className={cn(
                    "text-[10px] leading-none",
                    colorClass ? "opacity-80" : "text-muted-foreground",
                    isTermOrFirstDay &&
                      !colorClass &&
                      "text-primary font-medium"
                  )}
                >
                  {lunarText}
                </span>
                {events.length > 0 && (
                  <span className="text-[9px] opacity-70 leading-none">
                    {events.length}个
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-anniversary" />
            <span className="text-xs text-muted-foreground">纪念日</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-birthday" />
            <span className="text-xs text-muted-foreground">生日</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-countdown" />
            <span className="text-xs text-muted-foreground">倒数日</span>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date();
  const isCurrentYear = today.getFullYear() === currentYear;
  
  // Year view - compact heatmap style
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDate(new Date(currentYear - 1, 0, 1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-lg font-semibold">{currentYear}年</h3>

        {!isCurrentYear && (
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-7 px-2 text-xs"
            >
              <CalendarDays className="h-3 w-3 mr-1" />
              今天
            </Button>
          )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDate(new Date(currentYear + 1, 0, 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-6 gap-y-6 gap-x-2">
        {MONTHS.map((month, monthIndex) => {
          const monthEvents = anniversaries.filter((a) => {
            const trigger = dayjs(a.next_trigger_at).tz(a.tz);
            return (
                trigger.year() === currentYear &&
                trigger.month() === monthIndex
            );
          });

          const isSelected =
            selectedMonth &&
            selectedMonth.year === currentYear &&
            selectedMonth.month === monthIndex;

          return (
            <button
              key={month}
              className={cn(
                "text-center transition-all hover:scale-105",
                isSelected && "ring-1 ring-primary ring-offset-1 rounded-lg"
              )}
              onClick={() => handleMonthClick(monthIndex)}
            >
              <div className="text-xs text-muted-foreground mb-1">{month}</div>
              <div
                className={cn(
                  "h-8 rounded-md flex items-center justify-center text-xs font-medium cursor-pointer",
                  monthEvents.length > 0
                    ? "bg-primary/20 text-primary hover:bg-primary/30"
                    : "bg-muted/30 hover:bg-muted/50"
                )}
              >
                {monthEvents.length > 0 && monthEvents.length}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
