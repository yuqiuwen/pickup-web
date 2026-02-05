"use client"

import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  Star,
  MapPin,
  Calendar,
  RefreshCw,
  Send,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventBadge } from "@/components/custom/event-badge";
import { CountdownDisplay } from "@/components/custom/countdown-display";
import { SharePosterDialog } from "./ShareDialog";
import type { AnniversaryItemFeed } from "@/types/anniv";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { RepeatType } from "@/lib/constant";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { calcDiffDays } from "@/hooks/use-anniv-calc";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/biz/common/UserAvatar";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
}

interface AnniversaryDetailDialogProps {
  anniversary?: AnniversaryItemFeed | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock comments data
const mockComments: Comment[] = [
  {
    id: "1",
    author: { name: "小明", avatar: "" },
    content: "好浪漫啊！祝福你们！",
    createdAt: "2小时前",
    likes: 12,
    replies: [
      {
        id: "1-1",
        author: { name: "作者" },
        content: "谢谢祝福！",
        createdAt: "1小时前",
        likes: 3,
      },
      {
        id: "1-2",
        author: { name: "小红" },
        content: "真的很甜蜜呢~",
        createdAt: "30分钟前",
        likes: 1,
      },
      {
        id: "1-3",
        author: { name: "阿华" },
        content: "羡慕了！",
        createdAt: "20分钟前",
        likes: 0,
      },
    ],
  },
  {
    id: "2",
    author: { name: "小红", avatar: "" },
    content: "时间过得好快，转眼就这么久了",
    createdAt: "5小时前",
    likes: 8,
    replies: [],
  },
  {
    id: "3",
    author: { name: "阿华" },
    content: "这个地点我也去过，很有纪念意义！",
    createdAt: "1天前",
    likes: 5,
    replies: [
      {
        id: "3-1",
        author: { name: "作者" },
        content: "是的，那里风景很美",
        createdAt: "20小时前",
        likes: 2,
      },
    ],
  },
];

function CommentItem({ comment }: { comment: Comment }) {
  const [showAllReplies, setShowAllReplies] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const visibleReplies = showAllReplies
    ? comment.replies
    : comment.replies?.slice(0, 1);

  return (
    <div className="py-3">
      <div className="group rounded-lg px-2 py-2 -mx-2 hover:bg-muted/40 transition-colors">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={comment.author.avatar} />
            <AvatarFallback className="text-xs bg-[#e9638f] text-white">
              {comment.author.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {comment.createdAt}
                  </span>
                </div>
              </div>

              {/* more actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>复制链接</DropdownMenuItem>
                  <DropdownMenuItem>举报</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* content */}
            <p className="text-sm text-foreground mt-1 leading-relaxed break-words">
              {comment.content}
            </p>

            {/* actions */}
            <div className="flex items-center gap-1 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
              >
                <Heart className="h-3.5 w-3.5 mr-1" />
                {comment.likes}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
              >
                回复
              </Button>
            </div>

            {/* replies thread */}
            {hasReplies && (
              <Collapsible
                open={showAllReplies}
                onOpenChange={setShowAllReplies}
              >
                <div className="mt-3 ml-2 pl-3 border-l border-border/60">
                  <div className="space-y-3">
                    {visibleReplies?.map((reply) => (
                      <div
                        key={reply.id}
                        className="flex gap-2 rounded-md px-1.5 py-1 -mx-1.5 hover:bg-muted/30 transition-colors"
                      >
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage src={reply.author.avatar} />
                          <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">
                            {reply.author.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium truncate">
                              {reply.author.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {reply.createdAt}
                            </span>
                          </div>
                          <p className="text-xs text-foreground mt-0.5 leading-relaxed break-words">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {comment.replies && comment.replies.length > 1 && (
                    <>
                      <Separator className="my-2 bg-border/60" />
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-xs text-primary hover:no-underline"
                        >
                          {showAllReplies ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5 mr-1" />
                              收起回复
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5 mr-1" />
                              查看更多 {comment.replies.length - 1} 条回复
                            </>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent />
                    </>
                  )}
                </div>
              </Collapsible>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnniversaryDetailContent({ anniversary }: { anniversary: AnniversaryItemFeed }) {

  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);



  const [diffDays, pastDays] = calcDiffDays(anniversary);
  const showPast =
    anniversary.repeat_type !== RepeatType.NONE && pastDays > 0;




  // Mock stats
  const stats = {
    likes: 128,
    comments: mockComments.length,
    shares: 24,
    views: 1520,
  };


  return (
    <>
      <div className="flex flex-col sm:flex-row h-full min-h-0">
        {/* Left: Content (60% on desktop) */}
        <div className="sm:w-[60%] h-[45%] sm:h-full overflow-y-auto no-scrollbar  border-b sm:border-b-0 sm:border-r border-border">
          {/* Media */}
          {anniversary.medias.length > 0 ? (
            <div className="aspect-video sm:aspect-auto sm:h-[300px] bg-muted">
              <img
                src={anniversary.medias[0].path}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video sm:aspect-auto sm:h-[200px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Calendar className="h-16 w-16 text-primary/30" />
            </div>
          )}

          {/* Content details */}
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <EventBadge type={anniversary.type} size="sm" />
              {anniversary.repeat_type !== RepeatType.NONE && (
                <span className="inline-flex items-center text-xs text-muted-foreground">
                  {anniversary.repeat_type === RepeatType.YEARLY && "每年"}
                  {anniversary.repeat_type === RepeatType.MONTHLY && "每月"}
                  {anniversary.repeat_type === RepeatType.WEEKLY && "每周"}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              {anniversary.name}
            </h2>

            {anniversary.description && (
              <p className="text-muted-foreground mb-4">
                {anniversary.description}
              </p>
            )}

            {/* Date & Location */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {anniversary.event_date}
              </span>
              {anniversary.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {anniversary.location}
                </span>
              )}
            </div>

            {/* Tags */}
            {anniversary.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {anniversary.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Days display */}
            <div className="mt-6 flex items-center gap-6">
              <div className="text-center">
                <CountdownDisplay
                  days={diffDays}
                  isPast={diffDays < 0}
                  size="lg"
                />
              </div>
              {showPast && (
                <div className="text-center pl-6 border-l border-border">
                  <div className="flex items-center justify-center gap-1 text-primary">
                    <span className="text-5xl font-bold">{pastDays}</span>
                    <span className="text-sm">天</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    已过去
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Author, Comments, Actions (40% on desktop) */}
        <div className="sm:w-[40%] sm:h-full flex flex-col">
          <div className="flex items-center justify-around gap-2 py-4">

          </div>


          {/* Top: Author & Stats */}
          <div className="p-4 border-b border-border flex-none">
            <div className="flex items-center gap-3 mb-3">
              <UserAvatar user={anniversary.user} size={36}/>

              <div>
                <p className="font-medium">{anniversary.user.username}</p>
                <p className="text-xs text-muted-foreground">
                  发布于 3天前
                </p>
              </div>
              <Button size="sm" className="ml-auto rounded-full">
                关注
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{stats.views} 次浏览</span>
              <span>{stats.likes} 点赞</span>
              <span>{stats.comments} 评论</span>
              <span>{stats.shares} 分享</span>
            </div>
          </div>

          {/* Middle: Comments (scrollable) */}
          <div className="flex-1 overflow-y-auto no-scrollbar  px-4 ">
            <div className="py-2 space-y-1">
              {mockComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </div>

          {/* Bottom: Actions & Comment Input (fixed) */}
          <div className="flex items-center justify-around gap-2 py-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                "h-auto px-3 py-2 flex items-center gap-1",
                isLiked
                  ? "text-destructive"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Heart className={cn("h-8 w-8", isLiked && "fill-current")} />
              <span className="text-xs leading-none"> {stats.likes}</span>
            </Button>

            <Button
              variant="ghost"
              className="h-auto px-3 py-2 flex items-center gap-1 text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs leading-none">{stats.comments}</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={cn(
                "h-auto px-3 py-2 flex flex-col items-center gap-1",
                isBookmarked
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Star
                className={cn("h-5 w-5", isBookmarked && "fill-current")}
              />
            </Button>

            <Button
              variant="ghost"
              onClick={() => setShareOpen(true)}
              className="h-auto px-3 py-2 f text-muted-foreground hover:text-primary"
            >
              <Share className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <SharePosterDialog
        anniversary={anniversary}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </>
  );
}

export function AnniversaryDetailDialog({
  anniversary,
  open,
  onOpenChange,
}: AnniversaryDetailDialogProps) {


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <VisuallyHidden>
          <DialogTitle></DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>

        {/* 自定义关闭按钮 */}
        {/* <DialogPortal>
          <DialogClose asChild>
            <Button
              size="icon"
              aria-label="Close"
              className="fixed left-4 top-4 z-[100] rounded-full p-2 text-white/80 backdrop-blur-sm hover:bg-gray-700/80
                       focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <X className="h-8 w-8" />
            </Button>
          </DialogClose>
        </DialogPortal> */}


        <DialogContent className="w-screen h-[100dvh] sm:max-w-[80vw] sm:h-[80vh]  max-w-none p-0 gap-0 sm:rounded-lg">
          {anniversary ? (
            <AnniversaryDetailContent anniversary={anniversary} />
          ) : <><div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div></>
          }

        </DialogContent>
      </Dialog>


    </>
  );
}
