"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { getLunarDayText } from "@/utils/lunar";

// 不依赖 CalendarProps 是否导出，最稳
type LunarCalendarProps = React.ComponentProps<typeof Calendar> & {
  showLunar?: boolean;
};

export function LunarCalendar({
  showLunar = true,
  classNames,
  components,
  ...props
}: LunarCalendarProps) {
  return (
    <Calendar
      {...props}
      classNames={{
        ...classNames,

        // v9：用 weekday，不要用 head_cell（deprecated）
        weekday: cn("w-10", classNames?.weekday),

        // 关键：把每个按钮变高一点，容纳两行
        day_button: cn(
          "h-14 w-10 p-0 flex flex-col items-center justify-center gap-1",
          classNames?.day_button
        ),

        // 让 cell/列宽和按钮对齐（避免挤压错位）
        cell: cn("w-10 p-0", classNames?.cell),
      }}
      components={{
        ...components,

        // v9：自定义 DayButton（替代 v8 的 DayContent）
        DayButton: (p: any) => {
          const { day, modifiers, className, ...buttonProps } = p;

          // v9 day 通常是 { date: Date, ... }，这里做个兼容兜底
          const date: Date = day?.date ?? day;
          const lunar = showLunar ? getLunarDayText(date) : "";

          return (
            <button
              {...buttonProps}
              className={cn(className, "flex flex-col")}
            >
              {/* 公历 */}
              <span className="text-sm leading-none">{date.getDate()}</span>

              {/* 农历 */}
              {showLunar ? (
                <span
                  className={cn(
                    "text-[10px] leading-none text-muted-foreground",
                    modifiers?.outside && "opacity-60"
                  )}
                >
                  {lunar}
                </span>
              ) : null}
            </button>
          );
        },
      }}
    />
  );
}