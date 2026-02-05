import { Calendar, Sparkles, Inbox, Trophy, FileText, Heart, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LikedItem } from "@/types/profile";
import { cn } from "@/lib/utils";

interface LikedCardProps {
  item: LikedItem;
  onRemove?: (id: string) => void;
  className?: string;
}

export function LikedCard({ item, onRemove, className }: LikedCardProps) {
  const typeConfig = {
    anniversary: { label: "纪念日", icon: Calendar, color: "bg-anniversary/10 text-anniversary" },
    memory: { label: "拾念", icon: Sparkles, color: "bg-primary/10 text-primary" },
    capsule: { label: "时间胶囊", icon: Inbox, color: "bg-countdown/10 text-countdown" },
    milestone: { label: "里程碑", icon: Trophy, color: "bg-birthday/10 text-birthday" },
    post: { label: "动态", icon: FileText, color: "bg-secondary text-secondary-foreground" },
  };

  const config = typeConfig[item.type];
  const TypeIcon = config.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "今天";
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  };

  return (
    <Card className={cn("p-4 hover:shadow-medium transition-shadow cursor-pointer group", className)}>
      <div className="flex items-start gap-4">
        {/* Cover/Icon */}
        <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0">
          {item.cover_image ? (
            <img
              src={item.cover_image}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className={cn("h-full w-full flex items-center justify-center", config.color)}>
              <TypeIcon className="h-6 w-6" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={cn("text-xs", config.color)}>
              {config.label}
            </Badge>
          </div>
          <h3 className="font-medium text-foreground truncate">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 rounded-full bg-gradient-to-br from-primary to-accent" />
              <span>{item.author.name}</span>
            </div>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
              {formatDate(item.liked_at)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>查看详情</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onRemove?.(item.id)}
            >
              取消点赞
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
