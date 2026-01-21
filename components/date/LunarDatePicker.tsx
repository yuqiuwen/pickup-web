"use client";

import React, { useState, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, ChevronLeft, ChevronRight, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface LunarDatePickerProps {
  value?: Date;
  onChange: (date: Date, isLunar: boolean, lunarInfo?: LunarDateInfo) => void;
  isLunar?: boolean;
  onLunarChange?: (isLunar: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface LunarDateInfo {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
  monthName: string;
  dayName: string;
  yearName: string;
}

// 农历月份名称
const LUNAR_MONTHS = [
  "正月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "冬月", "腊月"
];

// 农历日期名称
const LUNAR_DAYS = [
  "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
];

// 天干
const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

// 地支
const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 生肖
const ZODIAC_ANIMALS = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

// 农历数据（1900-2100年），这里简化处理
// 实际项目建议使用 lunar-javascript 或 chinese-lunar 库
const getLunarInfo = (solarDate: Date): LunarDateInfo => {
  // 简化的农历计算，实际需要完整的农历算法
  const year = solarDate.getFullYear();
  const month = solarDate.getMonth();
  const day = solarDate.getDate();

  // 计算天干地支年份
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  const yearName = `${HEAVENLY_STEMS[stemIndex]}${EARTHLY_BRANCHES[branchIndex]}年（${ZODIAC_ANIMALS[branchIndex]}年）`;

  return {
    year,
    month: month + 1,
    day,
    isLeap: false,
    monthName: LUNAR_MONTHS[month] || "正月",
    dayName: LUNAR_DAYS[day - 1] || "初一",
    yearName,
  };
};

// 农历转公历（简化版本）
const lunarToSolar = (lunarYear: number, lunarMonth: number, lunarDay: number, isLeap: boolean): Date => {
  // 简化处理，实际需要完整算法
  return new Date(lunarYear, lunarMonth - 1, lunarDay);
};

// 获取某月的天数
const getDaysInMonth = (year: number, month: number, isLunar: boolean): number => {
  if (isLunar) {
    // 农历月份天数（简化处理，实际需要查表）
    return month % 2 === 0 ? 29 : 30;
  }
  return new Date(year, month, 0).getDate();
};

export const LunarDatePicker: React.FC<LunarDatePickerProps> = ({
  value,
  onChange,
  isLunar = false,
  onLunarChange,
  placeholder = "选择日期",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "year" | "month">("calendar");
  const [viewYear, setViewYear] = useState(value?.getFullYear() || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(value?.getMonth() || new Date().getMonth());
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [localIsLunar, setLocalIsLunar] = useState(isLunar);

  // 生成年份选项（1900-2100）
  const years = useMemo(() => {
    const result = [];
    for (let y = 1900; y <= 2100; y++) {
      result.push(y);
    }
    return result;
  }, []);

  // 生成月份选项
  const months = useMemo(() => {
    if (localIsLunar) {
      return LUNAR_MONTHS.map((name, index) => ({
        value: index,
        label: name,
      }));
    }
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: `${i + 1}月`,
    }));
  }, [localIsLunar]);

  // 生成日期选项
  const days = useMemo(() => {
    const count = getDaysInMonth(viewYear, viewMonth + 1, localIsLunar);
    if (localIsLunar) {
      return Array.from({ length: count }, (_, i) => ({
        value: i + 1,
        label: LUNAR_DAYS[i],
      }));
    }
    return Array.from({ length: count }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}`,
    }));
  }, [viewYear, viewMonth, localIsLunar]);

  // 生成日历网格
  const calendarDays = useMemo(() => {
    if (localIsLunar) {
      // 农历日历简化显示
      const daysCount = getDaysInMonth(viewYear, viewMonth + 1, true);
      const result = [];
      for (let i = 1; i <= daysCount; i++) {
        result.push({
          day: i,
          label: LUNAR_DAYS[i - 1],
          isCurrentMonth: true,
          date: lunarToSolar(viewYear, viewMonth + 1, i, isLeapMonth),
        });
      }
      return result;
    }

    // 公历日历
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const result = [];

    // 上月填充
    const prevMonth = new Date(viewYear, viewMonth, 0);
    for (let i = startPadding - 1; i >= 0; i--) {
      result.push({
        day: prevMonth.getDate() - i,
        label: `${prevMonth.getDate() - i}`,
        isCurrentMonth: false,
        date: new Date(viewYear, viewMonth - 1, prevMonth.getDate() - i),
      });
    }

    // 当月
    for (let i = 1; i <= daysInMonth; i++) {
      result.push({
        day: i,
        label: `${i}`,
        isCurrentMonth: true,
        date: new Date(viewYear, viewMonth, i),
      });
    }

    // 下月填充
    const remaining = 42 - result.length;
    for (let i = 1; i <= remaining; i++) {
      result.push({
        day: i,
        label: `${i}`,
        isCurrentMonth: false,
        date: new Date(viewYear, viewMonth + 1, i),
      });
    }

    return result;
  }, [viewYear, viewMonth, localIsLunar, isLeapMonth]);

  const handleDateSelect = (date: Date) => {
    const lunarInfo = localIsLunar ? getLunarInfo(date) : undefined;
    onChange(date, localIsLunar, lunarInfo);
    setOpen(false);
  };

  const handleLunarToggle = (checked: boolean) => {
    setLocalIsLunar(checked);
    onLunarChange?.(checked);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const formatDisplayDate = () => {
    if (!value) return "";
    if (localIsLunar) {
      const lunarInfo = getLunarInfo(value);
      return `${lunarInfo.yearName.slice(0, 2)}年 ${lunarInfo.monthName}${lunarInfo.dayName}`;
    }
    return format(value, "yyyy年MM月dd日", { locale: zhCN });
  };

  const isSelected = (date: Date) => {
    if (!value) return false;
    return (
      date.getFullYear() === value.getFullYear() &&
      date.getMonth() === value.getMonth() &&
      date.getDate() === value.getDate()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {localIsLunar ? (
            <Moon className="mr-2 h-4 w-4" />
          ) : (
            <Calendar className="mr-2 h-4 w-4" />
          )}
          {value ? formatDisplayDate() : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          {/* 农历/公历切换 */}
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="lunar-mode" className="text-sm">
                农历模式
              </Label>
            </div>
            <Switch
              id="lunar-mode"
              checked={localIsLunar}
              onCheckedChange={handleLunarToggle}
            />
          </div>

          {/* 年月选择 */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Select
                value={viewYear.toString()}
                onValueChange={(v) => setViewYear(parseInt(v))}
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}年
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={viewMonth.toString()}
                onValueChange={(v) => setViewMonth(parseInt(v))}
              >
                <SelectTrigger className="w-[90px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* 农历闰月选项 */}
          {localIsLunar && (
            <div className="flex items-center gap-2">
              <Switch
                id="leap-month"
                checked={isLeapMonth}
                onCheckedChange={setIsLeapMonth}
              />
              <Label htmlFor="leap-month" className="text-sm">
                闰月
              </Label>
            </div>
          )}

          {/* 日历网格 */}
          {localIsLunar ? (
            // 农历简化日历
            <div className="grid grid-cols-5 gap-1">
              {calendarDays.map((day, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-10 w-full text-xs",
                    isSelected(day.date) && "bg-primary text-primary-foreground hover:bg-primary",
                    isToday(day.date) && !isSelected(day.date) && "border border-primary"
                  )}
                  onClick={() => handleDateSelect(day.date)}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          ) : (
            // 公历日历
            <>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
                  <div
                    key={day}
                    className="h-8 flex items-center justify-center text-xs text-muted-foreground font-medium"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-9 w-9 p-0",
                      !day.isCurrentMonth && "text-muted-foreground opacity-50",
                      isSelected(day.date) && "bg-primary text-primary-foreground hover:bg-primary",
                      isToday(day.date) && !isSelected(day.date) && "border border-primary"
                    )}
                    onClick={() => handleDateSelect(day.date)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </>
          )}

          {/* 快捷选择 */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleDateSelect(new Date())}
            >
              今天
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setViewYear(new Date().getFullYear());
                setViewMonth(new Date().getMonth());
              }}
            >
              回到本月
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LunarDatePicker;