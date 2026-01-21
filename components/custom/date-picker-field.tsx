"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function ymdToDate(ymd: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return undefined;
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  // 防止 2025-02-30 自动进位
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return undefined;
  }
  return dt;
}

function dateToYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;

  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;

  /** 年份范围（react-day-picker v9 推荐用 startMonth/endMonth 控制范围） */
  fromYear?: number;
  toYear?: number;

  /** 最小/最大可选日期（YYYY-MM-DD） */
  min?: string;
  max?: string;

  className?: string;
  inputClassName?: string;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  disabled,
  clearable = true,
  fromYear,
  toYear,
  min,
  max,
  className,
  inputClassName,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value ?? "");
  const [month, setMonth] = React.useState<Date>(new Date());

  const selected = value ? ymdToDate(value) : undefined;

  const minDate = React.useMemo(
    () => (min ? ymdToDate(min) : undefined),
    [min]
  );
  const maxDate = React.useMemo(
    () => (max ? ymdToDate(max) : undefined),
    [max]
  );

  const startMonth = React.useMemo(
    () => (fromYear ? new Date(fromYear, 0, 1) : undefined),
    [fromYear]
  );
  const endMonth = React.useMemo(
    () => (toYear ? new Date(toYear, 11, 1) : undefined),
    [toYear]
  );

  const disabledCalendar = React.useMemo(() => {
    if (!minDate && !maxDate) return undefined;
    return {
      ...(minDate ? { before: minDate } : null),
      ...(maxDate ? { after: maxDate } : null),
    };
  }, [minDate, maxDate]);

  // 外部 value 变化时同步到 input/month
  React.useEffect(() => {
    setInputValue(value ?? "");
    const dt = value ? ymdToDate(value) : undefined;
    if (dt) setMonth(dt);
  }, [value]);

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <Input
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("bg-background pr-16", inputClassName)}
        onChange={(e) => {
          const v = e.target.value;
          setInputValue(v);

          // 清空：立刻写入表单
          if (!v.trim()) {
            onChange("");
            return;
          }

          // 只有严格合法才提交给外部
          const dt = ymdToDate(v);
          if (!dt) return;

          if (minDate && dt < minDate) return;
          if (maxDate && dt > maxDate) return;

          onChange(v);
          setMonth(dt);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />

      {clearable && !disabled && inputValue ? (
        <Button
          type="button"
          variant="ghost"
          className="absolute right-9 top-1/2 size-7 -translate-y-1/2"
          onClick={() => {
            setInputValue("");
            onChange("");
          }}
          aria-label="Clear date"
        >
          <X className="size-4" />
        </Button>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className="absolute right-2 top-1/2 size-7 -translate-y-1/2"
            aria-label="Open calendar"
          >
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            className="w-60"
            selected={selected}
            month={month}
            onMonthChange={setMonth}
            captionLayout="dropdown"
            startMonth={startMonth}
            endMonth={endMonth}
            disabled={disabledCalendar}
            // 如果你这里也遇到 autoFocus 警告，直接删掉即可
            autoFocus
            onSelect={(d) => {
              if (!d) {
                setInputValue("");
                onChange("");
                setOpen(false);
                return;
              }
              const ymd = dateToYmd(d);
              setInputValue(ymd);
              onChange(ymd);
              setMonth(d);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
