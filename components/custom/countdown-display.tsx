import { cn } from "@/lib/utils";

interface CountdownDisplayProps {
  days: number;
  isPast?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeConfig = {
  sm: {
    number: "text-2xl",
    label: "text-xs",
    container: "gap-0.5",
  },
  md: {
    number: "text-3xl",
    label: "text-sm",
    container: "gap-1",
  },
  lg: {
    number: "text-5xl",
    label: "text-base",
    container: "gap-1.5",
  },
  xl: {
    number: "text-7xl",
    label: "text-lg",
    container: "gap-2",
  },
};

export function CountdownDisplay({
  days,
  isPast = false,
  size = "md",
  className,
}: CountdownDisplayProps) {
  const config = sizeConfig[size];
  const absDays = Math.abs(days);

  return (
    <div
      className={cn(
        "flex flex-col items-center",
        config.container,
        className
      )}
    >
      <span
        className={cn(
          "font-bold text-gradient-warm leading-none",
          config.number
        )}
      >
        {absDays}
      </span>
      <span className={cn("text-muted-foreground", config.label)}>
        {isPast ? "天前" : days === 0 ? "今天" : "天后"}
      </span>
    </div>
  );
}
