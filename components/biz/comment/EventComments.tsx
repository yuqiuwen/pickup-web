
"use client";

import React, { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  MessageCircle,
  Send,
  Heart,
  MoreHorizontal,
  Reply,
  Trash2,
  Flag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/biz/common/UserAvatar";

export interface CommentUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  user: CommentUser;
  content: string;
  created_at: Date;
  likes_count: number;
  is_liked: boolean;
  replies?: Comment[];
  reply_to?: CommentUser;
}

interface EventCommentsProps {
  eventId: string;
  comments: Comment[];
  currentUser?: CommentUser;
  onAddComment?: (content: string, replyToId?: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onLikeComment?: (commentId: string) => void;
  onUnlikeComment?: (commentId: string) => void;
  onReportComment?: (commentId: string) => void;
}

// 单条评论组件
const CommentItem: React.FC<{
  comment: Comment;
  currentUserId?: string;
  isReply?: boolean;
  onReply?: (commentId: string, userName: string) => void;
  onDelete?: (commentId: string) => void;
  onLike?: (commentId: string) => void;
  onUnlike?: (commentId: string) => void;
  onReport?: (commentId: string) => void;
}> = ({
  comment,
  currentUserId,
  isReply = false,
  onReply,
  onDelete,
  onLike,
  onUnlike,
  onReport,
}) => {
  const isOwn = currentUserId === comment.user.id;
  const timeAgo = formatDistanceToNow(comment.created_at, {
    locale: zhCN,
    addSuffix: true,
  });

  return (
    <div className={cn("flex gap-3", isReply && "ml-12")}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
        <AvatarFallback className="bg-[#e9638f] text-white">{comment.user.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{comment.user.name}</span>
          {comment.reply_to && (
            <>
              <span className="text-muted-foreground text-xs">回复</span>
              <span className="text-primary text-sm">
                @{comment.reply_to.name}
              </span>
            </>
          )}
          <span className="text-muted-foreground text-xs">{timeAgo}</span>
        </div>
        <p className="text-sm">{comment.content}</p>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 gap-1 px-2",
              comment.is_liked && "text-red-500"
            )}
            onClick={() =>
              comment.is_liked
                ? onUnlike?.(comment.id)
                : onLike?.(comment.id)
            }
          >
            <Heart
              className={cn("h-3.5 w-3.5", comment.is_liked && "fill-current")}
            />
            {comment.likes_count > 0 && (
              <span className="text-xs">{comment.likes_count}</span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2"
            onClick={() => onReply?.(comment.id, comment.user.name)}
          >
            <Reply className="h-3.5 w-3.5" />
            <span className="text-xs">回复</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {isOwn && (
                <DropdownMenuItem
                  onClick={() => onDelete?.(comment.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onReport?.(comment.id)}>
                <Flag className="mr-2 h-4 w-4" />
                举报
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 回复列表 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                isReply
                onReply={onReply}
                onDelete={onDelete}
                onLike={onLike}
                onUnlike={onUnlike}
                onReport={onReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const EventComments: React.FC<EventCommentsProps> = ({
  eventId,
  comments,
  currentUser,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  onUnlikeComment,
  onReportComment,
}) => {
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{
    id: string;
    userName: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment?.(newComment, replyTo?.id);
      setNewComment("");
      setReplyTo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyTo({ id: commentId, userName });
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5" />
          评论 ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 评论输入框 */}
        {currentUser && (
          <div className="flex gap-3">
            <UserAvatar user={currentUser} size={30}/>
        
            <div className="flex-1 space-y-2">
              {replyTo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>回复 @{replyTo.userName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1"
                    onClick={handleCancelReply}
                  >
                    取消
                  </Button>
                </div>
              )}
              <Textarea
                placeholder={
                  replyTo
                    ? `回复 @${replyTo.userName}...`
                    : "写下你的评论..."
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Send className="mr-1 h-4 w-4" />
                  {isSubmitting ? "发送中..." : "发送"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 评论列表 */}
        {comments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <MessageCircle className="mx-auto h-12 w-12 opacity-50" />
            <p className="mt-2">还没有评论，快来发表第一条评论吧！</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUser?.id}
                onReply={handleReply}
                onDelete={onDeleteComment}
                onLike={onLikeComment}
                onUnlike={onUnlikeComment}
                onReport={onReportComment}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventComments;