import { RepeatType } from '@/lib/constant';
import dayjs from 'dayjs';
import { differenceInDays, format, addDays, addMonths, addYears, addWeeks } from 'date-fns';
import { zhCN } from 'date-fns/locale';


export function formatTimestamp(ts?: number, format: string = 'YYYY-MM-DD HH:mm:ss') {
    if (!ts) {
        return '-';
    }
    return dayjs.unix(ts).format(format);
}


export function formatDate(date: string | Date, formatStr = 'yyyy年MM月dd日'): string {
    return format(new Date(date), formatStr, { locale: zhCN });
  }
  
  export function getDaysUntil(targetDate: string | Date): number {
    const target = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return differenceInDays(target, today);
  }
  
  export function getDaysSince(startDate: string | Date): number {
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    return differenceInDays(today, start);
  }
  
  export function getNextOccurrence(
    eventDate: string,
    repeatType: RepeatType
  ): Date {
    const date = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    if (repeatType === RepeatType.NONE) {
      return date;
    }
  
    let nextDate = new Date(date);
    
    while (nextDate < today) {
      switch (repeatType) {
        case RepeatType.YEARLY:
          nextDate = addYears(nextDate, 1);
          break;
        case RepeatType.MONTHLY:
          nextDate = addMonths(nextDate, 1);
          break;
        case RepeatType.WEEKLY:
          nextDate = addWeeks(nextDate, 1);
          break;
        case RepeatType.QUARTERLY:
          nextDate = addMonths(nextDate, 3);
          break;
        case RepeatType.HALF_YEARLY:
          nextDate = addMonths(nextDate, 6);
          break;
      }
    }
  
    return nextDate;
  }
  
  export function formatCountdown(days: number): string {
    if (days === 0) return '就是今天';
    if (days > 0) return `还有 ${days} 天`;
    return `已过 ${Math.abs(days)} 天`;
  }
  
  export function getYearsDifference(startDate: string | Date): number {
    const start = new Date(startDate);
    const today = new Date();
    return today.getFullYear() - start.getFullYear();
  }