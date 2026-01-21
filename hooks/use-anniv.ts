import { useState, useCallback, useMemo } from "react";
import { EventFilter, EventSort, Event, AnnivStat, AnniversaryItemFeed, Anniversary, Stats, Interaction } from "@/types/anniv";
import { EventType } from "@/lib/constant";
import { getDaysUntil, getDaysSince } from "@/utils/time";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAnnivApi,
  getAnnivFeedApi,
  getAnnivStatApi,
} from "@/lib/api/anniv";
import { toast } from "sonner";
import {
  AnnivFormValues,
  annivQueryFormSchema,
  AnnivQueryFormValues,
} from "@/lib/schema/anniv";
import { useDebouncedValue } from "@/lib/utils";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dayjs } from "@/utils/dayjs";

type Patch = {
    stats?: Partial<Stats>;
    interaction?: Partial<Interaction>;
  };

export const annivStatsQuery = () => {
  return useQuery<AnnivStat>({
    queryKey: ["anniv-stat"],
    queryFn: async () => {
      const res = await getAnnivStatApi();
      return res.data;
    },
  });
};

export function useAnniv() {
  const createAnniv = async (data) => {
    const res = await createAnnivApi(data);
    toast.success("保存成功");
    return res.data;
  };

  const formatAnnivTriggerTime = (item: Anniversary, format="YYYY-MM-DD") => {
    return dayjs(item.next_trigger_at).tz(item.tz).format(format)
  }

  const getNextTriggerDays = (item: Anniversary) : number => {
    const now = dayjs().tz(item.tz)
    const next_trigger = dayjs(item.next_trigger_at).tz(item.tz)
    const days_diff = next_trigger.startOf('day').diff(now.startOf('day'), 'day');
    return days_diff
  }

  return {
    createAnniv,
    formatAnnivTriggerTime,
    getNextTriggerDays
  };
}

export function useAnnivFeedQuery() {
    const queryClient = useQueryClient();
  const queryForm = useForm<AnnivQueryFormValues>({
    resolver: zodResolver(annivQueryFormSchema),
    defaultValues: {
    name: '',
      type: "all",
      order_by: "default",

    },
    mode: "onChange",
  });

  // 只 watch 这三个字段
  const [type, order_by, event_year] = useWatch({
    control: queryForm.control,
    name: ["type", "order_by", "event_year"],
  });

  const eventYearDebounced = useDebouncedValue(event_year, 400);

  // 组装 params（useMemo 保证 queryKey 稳定）
  const params = useMemo(
    () => ({
      type,
      order_by,
      event_year: eventYearDebounced,
    }),
    [type, order_by, eventYearDebounced]
  );

  const queryKey = useMemo(() => ["anniv-feed", params] as const, [params]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await getAnnivFeedApi(params);
      return res.data;
    },
  });
  let feedData = data?.items ?? []

  const isEmpty = !isLoading && feedData.length === 0;
  const patchItem = useCallback(
    (id: string, patch: Patch) => {
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        // console.log({
        //     ...old,
        //     items: (old.items ?? []).map((it: any) => {
        //       if (it.id !== id) return it;
  
        //       return {
        //         ...it,
        //         stats: { ...(it.stats ?? {}), ...(patch.stats ?? {}) },
        //         interaction: { ...(it.interaction ?? {}), ...(patch.interaction ?? {}) },
        //       };
        //     }),
        //   });
        

        return {
          ...old,
          items: (old.items ?? []).map((it: any) => {
            if (it.id !== id) return it;

            return {
              ...it,
              stats: { ...(it.stats ?? {}), ...(patch.stats ?? {}) },
              interaction: { ...(it.interaction ?? {}), ...(patch.interaction ?? {}) },
            };
          }),
        };
      });
    },
    [queryClient, queryKey]
  );

  return {
    queryForm,
    data: feedData,
    isEmpty,
    queryKey,

    // 状态
    isLoading,
    isFetching,
    isError,

    patchItem, 
  };
}
