// src/hooks/useLunarCalendar.ts
import { useMemo, useCallback } from 'react';
import { LunarYear, LunarMonth } from 'tyme4ts';
import type { LunarMonthOption } from '../components/LunarDatePicker/types';

// 农历月份中文名
const LUNAR_MONTH_NAMES = [
  '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '腊月'
];

// 农历日中文名
const LUNAR_DAY_NAMES = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

export function useLunarCalendar(minYear: number, maxYear: number) {
  // 生成年份选项
  const yearOptions = useMemo(() => {
    const options: { value: number; label: string }[] = [];
    for (let year = minYear; year <= maxYear; year++) {
      const lunarYear = LunarYear.fromYear(year);
      // 年份选项同时显示干支和数字年份，方便选择
      options.push({
        value: year,
        label: `${year}年`
      });
    }
    return options;
  }, [minYear, maxYear]);

  // 获取指定年份的月份选项（包含闰月）
  const getMonthOptions = useCallback((year: number): LunarMonthOption[] => {
    const lunarYear = LunarYear.fromYear(year);
    const months = lunarYear.getMonths();
    const options: LunarMonthOption[] = [];

    months.forEach((month: LunarMonth) => {
      const monthNum = month.getMonthWithLeap();
      const isLeap = month.isLeap();
      
      const monthIndex = Math.abs(monthNum) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        options.push({
          value: Math.abs(monthNum),
          label: isLeap ? `闰${LUNAR_MONTH_NAMES[monthIndex]}` : LUNAR_MONTH_NAMES[monthIndex],
          isLeap,
          key: `${monthNum}-${isLeap ? 'leap' : 'normal'}`
        });
      }
    });

    return options;
  }, []);

  // 获取指定年月的天数选项
  const getDayOptions = useCallback((year: number, month: number, isLeapMonth: boolean) => {
    try {
      const lunarMonth = LunarMonth.fromYm(year, isLeapMonth ? -month : month);
      const dayCount = lunarMonth.getDayCount();
      
      const options: { value: number; label: string }[] = [];
      for (let day = 1; day <= dayCount; day++) {
        options.push({
          value: day,
          label: LUNAR_DAY_NAMES[day - 1]
        });
      }
      return options;
    } catch {
      return LUNAR_DAY_NAMES.map((label, index) => ({
        value: index + 1,
        label
      }));
    }
  }, []);

  // ✅ 修改：直接显示数字年份
  const formatDisplayValue = useCallback((
    year: number,
    month: number,
    isLeapMonth: boolean,
    day: number
  ) => {
    const monthIndex = month - 1;
    const monthName = isLeapMonth 
      ? `闰${LUNAR_MONTH_NAMES[monthIndex]}` 
      : LUNAR_MONTH_NAMES[monthIndex];
    const dayName = LUNAR_DAY_NAMES[day - 1];
    
    // 直接使用数字年份
    return `${year}年 ${monthName} ${dayName}`;
  }, []);

  return {
    yearOptions,
    getMonthOptions,
    getDayOptions,
    formatDisplayValue,
    LUNAR_MONTH_NAMES,
    LUNAR_DAY_NAMES
  };
}
