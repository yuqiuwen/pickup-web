import { Anniversary } from "@/types/anniv";
import { dayjs } from "@/utils/dayjs";
import { useMemo } from "react";

export function useAnnivCalc(anniv: Anniversary) {
  const calcDiffDays = () => {
    const now = dayjs().tz(anniv.tz);
    const nextTrigger = dayjs(anniv.next_trigger_at).tz(anniv.tz);
    const eventDate = dayjs(anniv.event_date).tz(anniv.tz);
    const diffDays = nextTrigger.startOf("day").diff(now.startOf("day"), "day");
    const pastDays = now.startOf("day").diff(eventDate.startOf("day"), "day");
    return [diffDays, pastDays]
  };

  // 1. 剩余天数（缓存）
  const daysLeft = useMemo(() => {
    return calcDiffDays();
  }, [anniv.next_trigger_at]);

  // 2. 是否即将到来（缓存）,7天内为即将到来
  const isUpcoming = useMemo(() => {
    return (daysLeft[0] ?? Infinity) <= 7;
  }, [daysLeft]);

  // 3. 计算显示文本（缓存）
  const displayText = useMemo(() => {
    const [diffDays, pastDays] = daysLeft
    if (daysLeft === null || daysLeft === undefined) {
      return "空空如也";
    }
    if (diffDays === 0) return "就是今天";
    if (diffDays === 1) return "明天";
    if (pastDays < 0) return `已过去 ${Math.abs(pastDays)} 天`;
    return `${diffDays} 天后`;
  }, [daysLeft]);

  return {
    calcDiffDays,
    displayText,
    isUpcoming,
  };
}
