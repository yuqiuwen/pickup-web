"use client";

import { useCallback, useState } from "react";
import { createCollectApi, createLikeApi } from "@/lib/api/action";
import type { ResourceType } from "@/lib/constant";
import { Interaction, Stats } from "@/types/anniv";

export function useInteraction(params: {
  rtype: ResourceType;
  rid: string;
  initialLiked?: number;
  initialCollected?: number;
  initialLikeCnt: number;
  initialCollectCnt: number;
  // 可选：通知父组件/列表同步更新
  onChange?: (next: {
    interaction: Interaction
    stats: Stats
  }) => void;
}) {
  const { rtype, rid, onChange } = params;

  const [liked, setLiked] = useState<number>(params.initialLiked ?? 0);
  const [collected, setCollected] = useState<number>(
    params.initialCollected ?? 0
  );

  const [likeCnt, setLikeCnt] = useState<number>(
    Number(params.initialLikeCnt ?? 0)
  );
  const [collectCnt, setCollectCnt] = useState<number>(
    Number(params.initialCollectCnt ?? 0)
  );

  const [likePending, setLikePending] = useState(false);
  const [collectPending, setCollectPending] = useState(false);

  const setLikeState = useCallback(
    async (next: number) => {
      if (likePending) return;

      const prevLiked = liked;
      const prevCnt = likeCnt;

      const delta = next - prevLiked; // 0->1: +1, 1->0: -1
      const nextCnt = Math.max(0, prevCnt + delta);

      // 乐观更新
      setLiked(next);
      setLikeCnt(nextCnt);
      onChange?.({
        interaction: { is_like: next, is_collect: collected },
        stats: { like_cnt: nextCnt, collect_cnt: collectCnt },
      });

      setLikePending(true);
      try {
        const res = await createLikeApi({ rtype, rid, state: next });

        if (res.data !== 1) {
          // 回滚
          setLiked(prevLiked);
          setLikeCnt(prevCnt);
          onChange?.({
            interaction: { is_like: prevLiked, is_collect: collected },
            stats: { like_cnt: prevCnt, collect_cnt: collectCnt },
          });
        }
      } catch {
        setLiked(prevLiked);
        setLikeCnt(prevCnt);
        onChange?.({
            interaction: { is_like: prevLiked, is_collect: collected },
            stats: { like_cnt: prevCnt, collect_cnt: collectCnt },
          });
      } finally {
        setLikePending(false);
      }
    },
    [rtype, rid, liked, likeCnt, collected, collectCnt, likePending, onChange]
  );

  const setCollectState = useCallback(
    async (next: number) => {
      if (collectPending) return;

      const prevCollected = collected;
      const prevCnt = collectCnt;

      const delta = next - prevCollected; // 0->1: +1, 1->0: -1
      const nextCnt = Math.max(0, prevCnt + delta);

      // 乐观更新
      setCollected(next);
      setCollectCnt(nextCnt);
      onChange?.({
        interaction: { is_like: liked, is_collect: next },
        stats: { like_cnt: likeCnt, collect_cnt: nextCnt },
      });

      setCollectPending(true);
      try {
        const res = await createCollectApi({ rtype, rid, state: next });
        if (res.data !== 1) {
          // 回滚
          setCollected(prevCollected);
          setCollectCnt(prevCnt);
          onChange?.({
            interaction: { is_like: liked, is_collect: prevCollected },
            stats: { like_cnt: likeCnt, collect_cnt: prevCnt },
          });
        }
      } catch {
        setCollected(prevCollected);
        setCollectCnt(prevCnt);
        onChange?.({
            interaction: { is_like: liked, is_collect: prevCollected },
            stats: { like_cnt: likeCnt, collect_cnt: prevCnt },
          });
      } finally {
        setCollectPending(false);
      }
    },
    [
      rtype,
      rid,
      liked,
      likeCnt,
      collected,
      collectCnt,
      collectPending,
      onChange,
    ]
  );

  return {
    liked,
    collected,
    likeCnt: likeCnt,
    collectCnt: collectCnt,
    likePending,
    collectPending,
    toggleLike: () => setLikeState(1 - liked),
    toggleCollect: () => setCollectState(1 - collected),
    setLikeState,
    setCollectState,
  };
}
