import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsRowSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 pb-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-border">
          <CardHeader>
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function FeedListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start justify-between gap-1">
            <div className="space-y-2 w-20 h-25">
              <Skeleton className="h-full" />
            </div>
            <div className="space-y-2 w-full">
              <Skeleton className="h-25" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function CalendarHeatmapSkeleton() {
  return (
    <Card className="p-6 border-0 shadow-card">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 * 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </Card>
  );
}
