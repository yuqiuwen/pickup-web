import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNtfyCursorApi } from "@/lib/api/notification";


type NotifyKind = "remind" | "sys" | "announce";

type ListParams = {
  last?: number | null;
  limit?: number;
  actions: number[]; 
};

type ListResp<T> = {
    last: number; 
    has_more: boolean;
    items: T[];
    max_id_map: Record<string, number>; // 例如 { "1": 5 }
  }


const toActionsParam = (actions: number[]) => actions.join(",");

export function useNotifySectionInfinite<TItem>(args: {
    enabled: boolean;
    queryKey: any[]; // 例如 ["notification","remind",{actions,limit}]
    fetcher: (params: { last: number; limit: number; actions: string }) => Promise<any>;
    actions: number[];
    limit?: number;
  }) {
    const { enabled, queryKey, fetcher, actions, limit = 20 } = args;
    const qc = useQueryClient();
  
    const updateCursor = useMutation({
      mutationFn: (maxIdMap: Record<string, number>) =>
        updateNtfyCursorApi({ max_id_map: maxIdMap }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["notification", "unread"] });
      },
    });
  
    // 记录“已上报过的最大游标”，避免 fetchNextPage / 重复 onSuccess 频繁打 cursor 接口
    const sentRef = useRef<Record<string, number>>({});
  
    // 该板块被关闭/切走时，可选择重置（我这里：enabled=false 就重置，避免下次进来不更新）
    useEffect(() => {
      if (!enabled) sentRef.current = {};
    }, [enabled]);
  
    const query = useInfiniteQuery({
      queryKey,
      enabled,
      initialPageParam: 0,
      queryFn: async ({ pageParam }) => {
        const res = await fetcher({
          last: pageParam ?? 0,
          limit,
          actions: toActionsParam(actions),
        });
        return res.data as ListResp<TItem>;
      },
      getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.last : undefined),
      onSuccess: (data) => {
        // 只用第一页的 max_id_map 来更新 cursor（更符合“读取最新一页就更新已读游标”）
        const maxIdMap = data.pages?.[0]?.max_id_map;
        if (!maxIdMap || Object.keys(maxIdMap).length === 0) return;
  
        // 仅当 max_id_map 相比已上报的更大时才调用更新
        let shouldSend = false;
        for (const [k, v] of Object.entries(maxIdMap)) {
          const prev = sentRef.current[k] ?? 0;
          if (v > prev) shouldSend = true;
        }
        if (!shouldSend) return;
  
        sentRef.current = { ...sentRef.current, ...maxIdMap };
        updateCursor.mutate(maxIdMap);
      },
    });
  
    const items = useMemo(
      () => query.data?.pages.flatMap((p) => p.items) ?? [],
      [query.data]
    );

  
    return {
      ...query,
      items,
      hasMore: query.data?.pages?.at(-1)?.has_more ?? false,
      loadMore: query.fetchNextPage,
      updatingCursor: updateCursor.isPending,
    };
  }