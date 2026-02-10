import { Heart, Star, MessageCircle, UserPlus, AtSign, UserCheck, Reply } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TAction, type RemindNotifyItem, ACTION_LABELS } from "@/types/notification";

interface NotificationItemProps {
  item: RemindNotifyItem;
  onRead?: (item: RemindNotifyItem) => void;
}

const actionStyle: Record<number, { icon: React.ElementType; color: string; bg: string }> = {
  [TAction.LIKE]: { icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  [TAction.COLLECT]: { icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
  [TAction.COMMENT]: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  [TAction.REPLY]: { icon: Reply, color: "text-blue-500", bg: "bg-blue-500/10" },
  [TAction.MENTION]: { icon: AtSign, color: "text-violet-500", bg: "bg-violet-500/10" },
  [TAction.FAN]: { icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  [TAction.INVITE]: { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
};

function formatTime(ts: number) {
  const date = new Date(ts * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString("zh-CN");
}

function buildDescription(item: RemindNotifyItem): string {
  const actionLabel = ACTION_LABELS[item.action] || "操作";
  const userNames = item.from_users.map((u) => u.username).join("、");
  const extra = item.user_total > item.from_users.length
    ? ` 等${item.user_total}人`
    : "";
  return `${userNames}${extra} ${actionLabel}了`;
}

export function NotificationItem({ item, onRead }: NotificationItemProps) {
  const style = actionStyle[item.action] || actionStyle[TAction.LIKE];
  const Icon = style.icon;
  const firstUser = item.from_users[0];
  const targetName = item.target?.name || item.target?.title || "";

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => onRead?.(item)}
    >
      {/* User avatar */}
      <Avatar className="h-9 w-9 shrink-0">
        {firstUser?.avatar && <AvatarImage src={firstUser.avatar} />}
        <AvatarFallback className={cn(style.bg, style.color, "text-xs")}>
          {firstUser?.username?.charAt(0) || <Icon className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-medium">{buildDescription(item)}</span>
        </p>
        {targetName && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {targetName}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatTime(item.ctime)}
        </p>
      </div>

      {/* Action icon */}
      <div className={cn("flex h-7 w-7 items-center justify-center rounded-full shrink-0", style.bg)}>
        <Icon className={cn("h-3.5 w-3.5", style.color)} />
      </div>
    </div>
  );
}
