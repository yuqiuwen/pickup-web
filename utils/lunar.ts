import { SolarDay, LunarDay, LunarMonth } from "tyme4ts";

/**
 * 获取农历日期显示文本
 * 优先显示节气，其次显示农历日期
 */
export function getLunarDayText(date: Date): string {
  try {
    const solar = SolarDay.fromYmd(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    const lunar = solar.getLunarDay();
    
    // 检查是否是节气
    const term = solar.getTerm();
    if (term && term.getName() !== "") {
      // 如果是节气当天，显示节气名称
      const termDay = term.getJulianDay().getSolarDay();
      if (
        termDay.getYear() === solar.getYear() &&
        termDay.getMonth() === solar.getMonth() &&
        termDay.getDay() === solar.getDay()
      ) {
        return term.getName();
      }
    }
    
    // 如果是初一，显示月份
    const lunarMonth = lunar.getLunarMonth();
    if (lunar.getDay() === 1) {
      return lunarMonth.getName() + "月";
    }
    
    // 其他日期显示农历日
    return lunar.getName();
  } catch (error) {
    console.error("Lunar conversion error:", error);
    return "";
  }
}

/**
 * 获取完整农历日期信息
 */
export function getLunarDateInfo(date: Date): {
  year: string;
  month: string;
  day: string;
  fullText: string;
  term?: string;
  isFirstDay: boolean;
} {
  try {
    const solar = SolarDay.fromYmd(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    const lunar = solar.getLunarDay();
    const lunarMonth = lunar.getLunarMonth();
    const lunarYear = lunarMonth.getLunarYear();
    
    // 获取节气
    let termName: string | undefined;
    const term = solar.getTerm();
    if (term && term.getName() !== "") {
      const termDay = term.getJulianDay().getSolarDay();
      if (
        termDay.getYear() === solar.getYear() &&
        termDay.getMonth() === solar.getMonth() &&
        termDay.getDay() === solar.getDay()
      ) {
        termName = term.getName();
      }
    }
    
    return {
      year: lunarYear.getName(),
      month: lunarMonth.getName() + "月",
      day: lunar.getName(),
      fullText: `${lunarYear.getName()}年${lunarMonth.getName()}月${lunar.getName()}`,
      term: termName,
      isFirstDay: lunar.getDay() === 1,
    };
  } catch (error) {
    console.error("Lunar conversion error:", error);
    return {
      year: "",
      month: "",
      day: "",
      fullText: "",
      isFirstDay: false,
    };
  }
}

/**
 * 根据农历日期获取公历日期
 * @param year 农历年份
 * @param month 农历月份 (1-12, 负数表示闰月)
 * @param day 农历日 (1-30)
 */
export function lunarToSolar(
  year: number,
  month: number,
  day: number,
  isLeap: false
): Date | null {
  try {
    const lunarDay = LunarDay.fromYmd(year, month, day);
    const solar = lunarDay.getSolarDay();
    console.log(isLeap);
    
    const _mon_exp = !isLeap ? solar.getMonth() - 1 : solar.getMonth()
    
    return new Date(solar.getYear(), _mon_exp, solar.getDay());
  } catch (error) {
    console.error("Lunar to solar conversion error:", error);
    return null;
  }
}


