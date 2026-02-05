import { useState, useCallback, useMemo } from "react";
import {

  AnnivStat,
  AnniversaryItemFeed,
  Anniversary,
  Stats,
  Interaction,
} from "@/types/anniv";
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

  const formatAnnivTriggerTime = (item: Anniversary, format = "YYYY-MM-DD") => {
    return dayjs(item.next_trigger_at).tz(item.tz).format(format);
  };

  const getNextTriggerDays = (item: Anniversary): number => {
    const now = dayjs().tz(item.tz);
    const next_trigger = dayjs(item.next_trigger_at).tz(item.tz);
    const days_diff = next_trigger
      .startOf("day")
      .diff(now.startOf("day"), "day");
    return days_diff;
  };

  return {
    createAnniv,
    formatAnnivTriggerTime,
    getNextTriggerDays,
  };
}

export function useAnnivFeedQuery() {
  const queryClient = useQueryClient();
  const defaultValues: AnnivQueryFormValues = {
    name: "",
    type: "all",
    order_by: "default",
    event_year: undefined,
  };
  const queryForm = useForm<AnnivQueryFormValues>({
    resolver: zodResolver(annivQueryFormSchema),
    defaultValues,
    mode: "onChange",
  });



  const queryKey = ["anniv-feed"];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await getAnnivFeedApi(queryForm.getValues());
      return res.data;
    },
  });

  const runQuery = queryForm.handleSubmit(() => query.refetch());
  const onSearch = runQuery;
  const refresh = runQuery;

  const resetAndRefresh = () => {
    queryForm.reset(defaultValues);
    refresh();
  };

  const patchItem = useCallback(
    (id: string, patch: Patch) => {
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: (old.items ?? []).map((it: any) =>
            it.id !== id
              ? it
              : {
                  ...it,
                  stats: { ...(it.stats ?? {}), ...(patch.stats ?? {}) },
                  interaction: {
                    ...(it.interaction ?? {}),
                    ...(patch.interaction ?? {}),
                  },
                }
          ),
        };
      });
    },
    [queryClient, queryKey]
  );

  const feedData = query.data?.items ?? [];
  const isEmpty = !query.isLoading && feedData.length === 0;
  const showSkeleton = query.isFetching && !query.data
    const showMaskLoading = query.isFetching && !!query.data

  return {
    queryForm,
    data: feedData,
    isEmpty,
    queryKey,

    // 状态
    showSkeleton,
    showMaskLoading,
    isError: query.isError,

    onSearch, // 点击“查询”
    refresh,
    patchItem,
    resetAndRefresh,
  };
}
