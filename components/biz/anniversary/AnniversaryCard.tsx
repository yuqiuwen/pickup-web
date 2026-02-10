import { Clock, Heart, MapPin, Share, Star, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventBadge } from "@/components/custom/event-badge";
import { CountdownDisplay } from "@/components/custom/countdown-display";
import type { Anniversary, AnniversaryItemFeed } from "@/types/anniv";
import { cn } from "@/lib/utils";
import { useAnniv } from "@/hooks/use-anniv";
import { calcDiffDays } from "@/hooks/use-anniv-calc";
import { dayjs } from "@/utils/dayjs";
import {
  EventType,
  eventTypeColorMap,
  FormMode,
  RepeatType,
  ResourceType,
} from "@/lib/constant";
import { startTransition, useState } from "react";
import { useInteraction } from "@/hooks/use-interaction";
import { Badge } from "@/components/ui/badge";
import { AnniversaryDetailDialog } from "./AnniversaryDetail";
import { SharePosterDialog } from "./ShareDialog";
import Link from "next/link";

interface AnniversaryCardProps {
  anniversary: AnniversaryItemFeed;
  className?: string;
  patchItem: any;
}

export function AnniversaryCard({
  anniversary,
  className,
  patchItem,
}: AnniversaryCardProps) {

  const {
    liked,
    collected,
    toggleLike,
    toggleCollect,
    likePending,
    collectPending,
  } = useInteraction({
    rtype: ResourceType.ANNIV,
    rid: anniversary.id,
    initialLiked: anniversary.interaction.is_like,
    initialCollected: anniversary.interaction.is_collect,
    initialLikeCnt: anniversary.stats.like_cnt,
    initialCollectCnt: anniversary.stats.collect_cnt,
    onChange: (next) => patchItem(anniversary.id, next),
  });

  const { formatAnnivTriggerTime } = useAnniv();
  const [diffDays, pastDays] = calcDiffDays(anniversary);

  const [shareOpen, setShareOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const showPast = anniversary.repeat_type !== RepeatType.NONE && pastDays > 0;
  

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden border-0 shadow-card hover:shadow-medium transition-all duration-300",
          className
        )}
      >
        {/* Gradient accent bar */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-1 transition-all duration-300 group-hover:w-1.5",
            `bg-${eventTypeColorMap[anniversary.type]}`
          )}
        />

        <div className="flex items-stretch pl-6">
          {/* Left: Countdown */}
          <div className="flex flex-col items-center justify-center pr-6 border-r border-border/50 w-[80px]">
            {/* Days since/until event */}

            <CountdownDisplay days={diffDays} isPast={diffDays < 0} size="md" />

            {/* Next occurrence for repeating events */}
            {showPast && (
              <div className="mt-3 pt-3 border-border/50 w-full text-center">
                <div className="flex items-center justify-center gap-1 text-primary">
                  <span className="text-lg font-bold ">{pastDays}</span>
                  <span className="text-xs">天</span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  已过去
                </span>
              </div>
            )}
          </div>

          {/* Middle: Content */}
          <div className="flex-1 pl-6 min-w-0">
            
          <Link
          key={anniversary.id}
          href={`/anniversary/${anniversary.id}`}
          scroll={false}
          className="cursor-pointer block"
        >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <EventBadge type={anniversary.type} size="sm" />
                    {anniversary.share_mode === 1 && (
                      <span className="text-xs text-muted-foreground">
                        · 共享
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {anniversary.name}
                  </h3>
                </div>

                {/* Media preview */}
                {/* {anniversary.medias.length > 0 && (
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                <img
                  src={anniversary.media[0].url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )} */}
              </div>

              {/* Meta info */}
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatAnnivTriggerTime(anniversary)}
                </span>
                {anniversary.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {anniversary.location}
                  </span>
                )}
              </div>

              {/* tags */}
              {/* {anniversary.tags.length > 0 &&
            anniversary.tags.map((tag) => (
              <a className="text-xs">#{tag.name} </a>
            ))} */}
            </Link>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-1 -ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="hover:cursor-pointer text-muted-foreground"
                onClick={toggleLike}
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    liked ? "fill-current text-rose-600" : "fill-none"
                  )}
                />
                <span className="text-xs tabular-nums">
                  {anniversary.stats.like_cnt}
                </span>
              </Button>
              {/* <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">3</span>
            </Button> */}
              <Button
                variant="ghost"
                size="sm"
                className="hover:cursor-pointer text-muted-foreground"
                onClick={toggleCollect}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    collected ? "fill-current text-rose-600" : "fill-none"
                  )}
                />
                <span className="text-xs">收藏</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-primary"
                onClick={() => setShareOpen(true)}
              >
                <Share className="h-4 w-4" />
                <span className="text-xs">分享</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* <AnniversaryDetailDialog
        anniversary={anniversary}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      /> */}

      <SharePosterDialog
        anniversary={anniversary}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </>
  );
}
