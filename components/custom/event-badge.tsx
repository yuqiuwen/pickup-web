import { cn } from "@/lib/utils";
import { Heart, Cake, Clock } from "lucide-react";
import { EventType } from "@/lib/constant";

interface EventBadgeProps {
  type: EventType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const eventConfig = {
  [EventType.ANNIVERSARY]: {
    label: "纪念日",
    icon: Heart,
    className: "bg-anniversary/15 text-anniversary border-anniversary/30",
  },
  [EventType.BIRTHDAY]: {
    label: "生日",
    icon: Cake,
    className: "bg-birthday/15 text-birthday border-birthday/30",
  },
  [EventType.COUNTDOWN]: {
    label: "倒数日",
    icon: Clock,
    className: "bg-countdown/15 text-countdown border-countdown/30",
  },
};

const sizeConfig = {
  sm: "h-5 px-1.5 text-xs gap-1",
  md: "h-6 px-2 text-xs gap-1.5",
  lg: "h-7 px-2.5 text-sm gap-2",
};

export function EventBadge({
  type,
  size = "md",
  showLabel = true,
  className,
}: EventBadgeProps) {
  const config = eventConfig[type];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.className,
        sizeConfig[size],
        className
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      {showLabel && config.label}
    </span>
  );
}
