"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { AnniversaryCard } from "@/components/biz/anniversary/AnniversaryCard";
import { AnniversaryForm } from "@/components/biz/anniversary/AnniversaryForm";
import { CalendarHeatmap } from "@/components/biz/anniversary/CalendarHeatmap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Plus,
  Search,
  List,
  Calendar,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Anniversary,
  AnniversaryItemFeed,
  AnnivStat,
} from "@/types/anniv";
import {
  EventType,
  CalendarType,
  FormMode,
  MediaType,
  RepeatType,
  ShareMode,
  SelectEventTypeOptions,
} from "@/lib/constant";
import { getAnnivStatApi } from "@/lib/api/anniv";
import { useQuery } from "@tanstack/react-query";
import {
  annivStatsQuery,
  useAnniv,
  useAnnivFeedQuery,
} from "@/hooks/use-anniv";
import { useAnnivCalc } from "@/hooks/use-anniv-calc";
import { Separator } from "@/components/ui/separator";
import { annivQueryFormSchema, AnnivQueryFormValues } from "@/lib/schema/anniv";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import { CalendarHeatmapSkeleton, FeedListSkeleton, StatsRowSkeleton } from "@/components/biz/anniversary/skeleton";

// Mock data
const mockAnniversaries: Anniversary[] = [
  {
    id: "1",
    name: "我们的第一次相遇",
    description: "在咖啡店的那个下午，阳光正好，你穿着白色连衣裙",
    event_date: "2019-02-14",
    calendar_type: 1,
    type: 1,
    share_mode: ShareMode.PUBLIC,
    location: "星巴克·国贸店",
    tags: ["爱情", "初遇", "咖啡"],
    media: [
      {
        id: "1",
        type: MediaType.IMAGE,
        url: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=200",
      },
    ],
    is_reminder: true,
    repeat_type: RepeatType.YEARLY,
    is_public: false,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "2",
    name: "妈妈的生日",
    description: "记得提前准备礼物和蛋糕",
    event_date: "2025-03-08",
    calendar_type: 2,
    type: 2,
    share_mode: ShareMode.PRIVATE,
    tags: ["家人", "生日"],
    media: [],
    is_reminder: true,
    repeat_type: RepeatType.YEARLY,
    is_public: false,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "3",
    name: "新年倒计时",
    description: "2026年来了！",
    event_date: "2026-01-01",
    calendar_type: 1,
    type: 3,
    share_mode: ShareMode.PRIVATE,
    tags: ["新年"],
    media: [],
    is_reminder: true,
    repeat_type: RepeatType.YEARLY,
    is_public: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "4",
    name: "结婚纪念日",
    description: "最美好的决定",
    event_date: "2026-01-17",
    calendar_type: 1,
    type: 1,
    share_mode: ShareMode.PUBLIC,
    location: "巴厘岛",
    tags: ["婚姻", "爱情"],
    media: [
      {
        id: "2",
        type: "image",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=200",
      },
    ],
    is_reminder: true,
    repeat_type: RepeatType.YEARLY,
    is_public: false,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

type ViewMode = "list" | "calendar";
type CalendarView = "year" | "month" | "week";

export default function Anniversaries() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-asc");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    data: annivStatData,
    isLoading: isStatsLoading,
    isError,
  } = annivStatsQuery();
  const {
    queryForm,
    data: feedList,
    isFetching,
    isEmpty,
    isLoading: isFeedLoading,
    patchItem
  } = useAnnivFeedQuery();

  const diffDays = annivStatData?.next_anniv
    ? useAnnivCalc(annivStatData.next_anniv).calcDiffDays()
    : "";

  const isQuerySubmitting = queryForm.formState.isSubmitting;


  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">纪念日</h1>
            <p className="text-sm text-muted-foreground">
              珍藏每一个重要的日子
            </p>
          </div>

          <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <SheetTrigger asChild>
              <Button className="warm-gradient text-white shadow-warm">
                <Plus className="mr-2 h-4 w-4" />
                创建纪念日
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
              <SheetHeader className="">
                <SheetTitle>创建新纪念日</SheetTitle>
                <SheetDescription></SheetDescription>
              </SheetHeader>
              <div className="px-8 pb-4">
                <AnniversaryForm
                  mode={FormMode.ADD}
                  onClose={() => setIsCreateOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Stats Row */}
        {isStatsLoading ? (
          <StatsRowSkeleton />
        ) : (
          <div className="grid grid-cols-3 gap-4 pb-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground/60">
                  今年
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {annivStatData?.year_total}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground/60">
                  下一个日程
                </CardTitle>
              </CardHeader>
              <CardContent>
                {annivStatData?.next_anniv ? (
                  <>
                    <p className="text-sm font-semibold text-foreground">
                      {annivStatData.next_anniv.name}
                    </p>
                    <p className="text-2xl font-bold text-accent mt-1">
                      {diffDays}
                    </p>
                    <p className="text-xs text-foreground/60">天后</p>
                  </>
                ) : (
                  "无"
                )}
              </CardContent>
            </Card>

            <Card className=" border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground/60">
                  共享
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {annivStatData?.share_total}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Toolbar */}
        <Card className="p-4 mb-6">
          <Form {...queryForm}>
            <form className="flex flex-wrap items-end gap-3 p-4 bg-muted/20 rounded-lg">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <FormField
                    control={queryForm.control}
                    name="name"
                    render={({ field }) => (
                      <>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="搜索纪念日..."
                          {...field}
                          className="pl-9"
                        />
                      </>
                    )}
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <FormField
                    control={queryForm.control}
                    name="type"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-28">
                          <SlidersHorizontal className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="类型" />
                        </SelectTrigger>
                        <SelectContent>
                          {SelectEventTypeOptions.map((item) => {
                            return (
                              <SelectItem
                                value={item.str_value}
                                key={item.value}
                              >
                                {item.label}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </Card>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between text-sm space-x-4 pb-2">
          <div className="rounded-lg bg-muted/50 ">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "h-8 px-3",
                viewMode === "list" && "bg-background shadow-sm"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("calendar")}
              className={cn(
                "h-8 px-3",
                viewMode === "calendar" && "bg-background shadow-sm"
              )}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>

          <Controller
            control={queryForm.control}
            name="order_by"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-34">
                  <ArrowUpDown className="w-2" />
                  <SelectValue placeholder="排序" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="default">默认排序</SelectItem>
                  <SelectItem value="next_trigger_at.asc">日期升序</SelectItem>
                  <SelectItem value="next_trigger_at.desc">日期降序</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Calendar view options */}
        {viewMode === "calendar" && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            {(["month", "year"] as CalendarView[]).map((view) => (
              <Button
                key={view}
                variant={calendarView === view ? "default" : "outline"}
                size="sm"
                onClick={() => setCalendarView(view)}
              >
                {view === "year" && "年视图"}
                {view === "month" && "月视图"}
              </Button>
            ))}
          </div>
        )}

        {/* Content */}
        {viewMode === "list" ? (
          isFeedLoading ? ( 
            <FeedListSkeleton />
          ) : (
            <div className="space-y-2">
              {!isEmpty ? (
                feedList.map((anniversary: AnniversaryItemFeed) => (
                  <AnniversaryCard
                    key={anniversary.id}
                    anniversary={anniversary}
                    patchItem={patchItem}
                  />
                ))
              ) : (
                <Card className="p-12 text-center border-0 shadow-card">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">还没有纪念日</h3>
                  <p className="text-muted-foreground mb-4">
                    创建你的第一个纪念日，开始记录美好时光
                  </p>
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="warm-gradient text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    创建纪念日
                  </Button>
                </Card>
              )}
            </div>
          )
        ) :  (
          isFeedLoading ? (
            <CalendarHeatmapSkeleton />
          ) : (
            <Card className="p-6 border-0 shadow-card">
              <CalendarHeatmap anniversaries={feedList} view={calendarView} />
            </Card>
          )
        )}
      </div>
    </AppLayout>
  );
}
