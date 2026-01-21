
"use client";

import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Flag,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EventActionsProps {
  eventId: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  shareUrl?: string;
  onLike?: () => void;
  onUnlike?: () => void;
  onBookmark?: () => void;
  onUnbookmark?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  className?: string;
}

export const EventActions: React.FC<EventActionsProps> = ({
  eventId,
  likesCount,
  commentsCount,
  isLiked,
  isBookmarked,
  shareUrl,
  onLike,
  onUnlike,
  onBookmark,
  onUnbookmark,
  onComment,
  onShare,
  onReport,
  className,
}) => {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLikeClick = () => {
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 300);
    
    if (isLiked) {
      onUnlike?.();
    } else {
      onLike?.();
    }
  };

  const handleBookmarkClick = () => {
    if (isBookmarked) {
      onUnbookmark?.();
    } else {
      onBookmark?.();
    }
  };

  const handleCopyLink = async () => {
    const url = shareUrl || window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCount = (count: number): string => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        {/* 点赞按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1.5",
                isLiked && "text-red-500 hover:text-red-600"
              )}
              onClick={handleLikeClick}
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-transform",
                  isLiked && "fill-current",
                  isLikeAnimating && "scale-125"
                )}
              />
              {likesCount > 0 && (
                <span className="text-sm">{formatCount(likesCount)}</span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isLiked ? "取消点赞" : "点赞"}</p>
          </TooltipContent>
        </Tooltip>

        {/* 评论按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={onComment}
            >
              <MessageCircle className="h-5 w-5" />
              {commentsCount > 0 && (
                <span className="text-sm">{formatCount(commentsCount)}</span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>评论</p>
          </TooltipContent>
        </Tooltip>

        {/* 收藏按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                isBookmarked && "text-yellow-500 hover:text-yellow-600"
              )}
              onClick={handleBookmarkClick}
            >
              <Bookmark
                className={cn("h-5 w-5", isBookmarked && "fill-current")}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isBookmarked ? "取消收藏" : "收藏"}</p>
          </TooltipContent>
        </Tooltip>

        {/* 分享按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>分享</p>
          </TooltipContent>
        </Tooltip>

        {/* 更多操作 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "已复制" : "复制链接"}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ExternalLink className="mr-2 h-4 w-4" />
              在新窗口打开
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onReport}
              className="text-destructive focus:text-destructive"
            >
              <Flag className="mr-2 h-4 w-4" />
              举报
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
};

export default EventActions;