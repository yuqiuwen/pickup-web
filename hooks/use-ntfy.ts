import {
    getRemindNtfyApi,
    getSysNtfyApi,
    getAnnounceNtfyApi,
    getUnreadCountApi,
  } from "@/lib/api/notification";
  import { useNotifySectionInfinite } from "./use-ntfy-query";
import { NotifySection, TAction } from "@/types/notification";
import { useQuery } from "@tanstack/react-query";
  
  export function useLikeCollectSection(open: boolean, activeKey: NotifySection | null) {
    return useNotifySectionInfinite({
      enabled: open && activeKey === "like_collect",
      queryKey: ["notification", "section", "like_collect"],
      fetcher: (p) => getRemindNtfyApi(p),
      actions: [TAction.LIKE, TAction.COLLECT],
      limit: 20,
    });
  }
  
  export function useCommentMentionSection(open: boolean, activeKey: NotifySection | null) {
    return useNotifySectionInfinite({
      enabled: open && activeKey === "comment_mention",
      queryKey: ["notification", "section", "comment_mention"],
      fetcher: (p) => getRemindNtfyApi(p),
      actions: [TAction.COMMENT, TAction.MENTION, TAction.REPLY],
      limit: 20,
    });
  }
  
  export function useFanSection(open: boolean, activeKey: NotifySection | null) {
    return useNotifySectionInfinite({
      enabled: open && activeKey === "fan",
      queryKey: ["notification", "section", "fan"],
      fetcher: (p) => getRemindNtfyApi(p),
      actions: [TAction.FAN],
      limit: 20,
    });
  }
  
  export function useSysSection(open: boolean, activeKey: NotifySection | null) {
    return useNotifySectionInfinite({
      enabled: open && activeKey === "sys",
      queryKey: ["notification", "section", "sys"],
      fetcher: (p) => getSysNtfyApi(p),
      actions: [TAction.SYS],      // 如果 sys 接口不需要 actions，你的 fetcher 里忽略即可
      limit: 20,
    });
  }
  
  export function useAnnounceSection(open: boolean, activeKey: NotifySection | null) {
    return useNotifySectionInfinite({
      enabled: open && activeKey === "announce",
      queryKey: ["notification", "section", "announce"],
      fetcher: (p) => getAnnounceNtfyApi(p),
      actions: [TAction.ANNOUNCE],
      limit: 20,
    });
  }

  export function useUnreadCount(open?: boolean) {
    return useQuery({
      queryKey: ["notification", "unread"],
      enabled: open ?? true,
      queryFn: async () => {
        const res = await getUnreadCountApi();
        return res.data;
      },
      staleTime: 5000,
    });
  }