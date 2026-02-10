import { useState, useCallback } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./NotificationItem";
import type { RemindNotifyItem } from "@/types/notification";

interface RemindDetailPanelProps {
  title: string;
  items: RemindNotifyItem[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  onBack: () => void;
  onItemClick?: (item: RemindNotifyItem) => void;
}

export function RemindDetailPanel({
  title,
  items,
  hasMore,
  loading,
  onLoadMore,
  onBack,
  onItemClick,
}: RemindDetailPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header with back */}
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      </div>

      <ScrollArea className="flex-1 h-[360px]">
        {items.length > 0 ? (
          <div className="p-2 space-y-0.5">
            {items.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onRead={onItemClick}
              />
            ))}
            {hasMore && (
              <div className="flex justify-center py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  disabled={loading}
                  onClick={onLoadMore}
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : null}
                  {loading ? "加载中..." : "加载更多"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <p className="text-sm">暂无通知</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
