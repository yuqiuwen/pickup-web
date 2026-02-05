import { Anniversary } from "@/types/anniv";
import { dayjs } from "@/utils/dayjs";
import { useMemo } from "react";



export const calcDiffDays = (anniv: Anniversary) => {
  const now = dayjs().tz(anniv.tz);
  const nextTrigger = dayjs(anniv.next_trigger_at).tz(anniv.tz);
  const eventDate = dayjs(anniv.event_date).tz(anniv.tz);
  const diffDays = nextTrigger.startOf("day").diff(now.startOf("day"), "day");
  const pastDays = now.startOf("day").diff(eventDate.startOf("day"), "day");
  return [diffDays, pastDays]
};


