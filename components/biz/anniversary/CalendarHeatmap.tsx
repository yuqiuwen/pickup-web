import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLunarDayText } from "@/utils/lunar";
import type { Anniversary } from "@/types/anniv";

interface CalendarHeatmapProps {
  anniversaries: Anniversary[];
  view: "year" | "month" | "week";
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export function CalendarHeatmap({ anniversaries, view }: CalendarHeatmapProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return anniversaries.filter((a) => a.event_date === dateStr);
  };

  // Get color based on event types
  const getDateColor = (events: Anniversary[]) => {
    if (events.length === 0) return "";
    const types = [...new Set(events.map((e) => e.type))];
    if (types.length === 1) {
      switch (types[0]) {
        case 1: return "bg-anniversary";
        case 2: return "bg-birthday";
        case 3: return "bg-countdown";
      }
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

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h3 className="text-lg font-semibold">
            {currentYear}年 {currentMonth + 1}月
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth(1)}
          >
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

            const lunarText = getLunarDayText(date);
            const isTermOrFirstDay = lunarText.includes("月") || 
              ["立春", "雨水", "惊蛰", "春分", "清明", "谷雨", 
               "立夏", "小满", "芒种", "夏至", "小暑", "大暑",
               "立秋", "处暑", "白露", "秋分", "寒露", "霜降",
               "立冬", "小雪", "大雪", "冬至", "小寒", "大寒"].includes(lunarText);

            return (
              <button
                key={date.toISOString()}
                className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-105 min-h-[56px]",
                  isToday && "ring-2 ring-primary ring-offset-2",
                  colorClass ? `${colorClass} text-white` : "bg-muted/50 hover:bg-muted"
                )}
              >
                <span className={cn(
                  "text-sm font-medium leading-none",
                  !colorClass && "text-foreground"
                )}>
                  {date.getDate()}
                </span>
                <span className={cn(
                  "text-[10px] leading-none",
                  colorClass ? "opacity-80" : "text-muted-foreground",
                  isTermOrFirstDay && !colorClass && "text-primary font-medium"
                )}>
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDate(new Date(currentYear + 1, 0, 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-2">
        {MONTHS.map((month, monthIndex) => {
          const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
          const monthEvents = anniversaries.filter((a) => {
            const date = new Date(a.event_date);
            return date.getFullYear() === currentYear && date.getMonth() === monthIndex;
          });

          return (
            <div key={month} className="text-center">
              <div className="text-xs text-muted-foreground mb-1">{month}</div>
              <div
                className={cn(
                  "h-8 rounded-md flex items-center justify-center text-xs font-medium",
                  monthEvents.length > 0
                    ? "bg-primary/20 text-primary"
                    : "bg-muted/30"
                )}
              >
                {monthEvents.length > 0 && monthEvents.length}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
