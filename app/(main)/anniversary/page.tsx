"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  RefreshCw,
  ArrowUp,
  ChevronRightIcon,
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  annivStatsQuery,
  useAnniv,
  useAnnivFeedQuery,
} from "@/hooks/use-anniv";
import { calcDiffDays } from "@/hooks/use-anniv-calc";
import { Separator } from "@/components/ui/separator";
import { annivQueryFormSchema, AnnivQueryFormValues } from "@/lib/schema/anniv";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import {
  CalendarHeatmapSkeleton,
  FeedListSkeleton,
  StatsRowSkeleton,
} from "@/components/biz/anniversary/skeleton";
import { ClearableInput } from "@/components/custom/clear-input";
import { ButtonGroup } from "@/components/ui/button-group";
import { Spinner } from "@/components/ui/spinner";
import { BackToTopBtn } from "@/components/custom/back-top-btn";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { AnniversaryDetailDialog } from "@/components/biz/anniversary/AnniversaryDetail";
import { dayjs } from "@/utils/dayjs";
import Link from "next/link";

type ViewMode = "list" | "calendar";
type CalendarView = "year" | "month" | "week";
type formConfig = {
  mode: FormMode;
  id?: string;
};

export default function Anniversaries() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [formConfig, setFormConfig] = useState<formConfig>({
    mode: FormMode.ADD,
    id: undefined,
  });

  // Calendar filter states
  const [selectedDate, setSelectedDate] = useState<Date | null>();
  const [selectedMonth, setSelectedMonth] = useState<{
    year: number;
    month: number;
  } | null>(null);

  const {
    data: annivStatData,
    isLoading: isStatsLoading,
    isError,
  } = annivStatsQuery();
  const {
    queryForm,
    data: feedList,
    showSkeleton,
    showMaskLoading,
    isEmpty,
    patchItem,
    resetAndRefresh,
    refresh,
    onSearch,
  } = useAnnivFeedQuery();

  const handleDateFilter = useCallback((date: Date | null) => {
    setSelectedDate(date);
    setSelectedMonth(null); // Clear month filter when selecting a date
  }, []);

  const handleMonthFilter = useCallback(
    (year: number, month: number | null) => {
      if (month === null) {
        setSelectedMonth(null);
      } else {
        setSelectedMonth({ year, month });
      }
      setSelectedDate(null); // Clear date filter when selecting a month
    },
    []
  );

  const isSameDay = (item: AnniversaryItemFeed, date: Date) => {
    return dayjs(item.next_trigger_at).tz(item.tz).toISOString() === date.toISOString()
  }

  const isSameMonth = (item: AnniversaryItemFeed, year: number, month: number) => {
    const itemTime = dayjs.utc(item.next_trigger_at).tz(item.tz);
    return itemTime.year() === year && itemTime.month() === month;
  }

  const onChangeCalendarView = (view: CalendarView) => {
    setCalendarView(view)
  }

  const filteredList = useMemo(() => {

    if (!selectedDate && !selectedMonth) return feedList;

    return feedList.filter((item: AnniversaryItemFeed) => {
      // 按“日”过滤
      if (selectedDate) {
        return isSameDay(item, selectedDate);
      }

      // 按“月”过滤
      if (selectedMonth) {
        return isSameMonth(item, selectedMonth.year, selectedMonth.month);
      }

      return true;
    });
  }, [feedList, selectedDate, selectedMonth]);

  return (
    <AppLayout>
      <div
        ref={containerRef}
        className="mx-auto min-h-full relative "
      >
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
            <SheetContent
              className="w-full sm:max-w-xl overflow-y-auto"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <SheetHeader>
                <SheetTitle>创建新纪念日</SheetTitle>
                <SheetDescription></SheetDescription>
              </SheetHeader>
              <div className="px-8 pb-4">
                <AnniversaryForm
                  mode={formConfig.mode}
                  id={formConfig.id}
                  onClose={() => setIsCreateOpen(false)}
                  refresh={resetAndRefresh}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Stats Row */}
        {isStatsLoading ? (
          <StatsRowSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4">
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

            <Card className="bg-card border-border col-span-2 sm:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground/60">
                  即将到来
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-0">
                {annivStatData?.next_anniv?.length
                  ? annivStatData.next_anniv.map((item, index) => (
                    <Item asChild key={item.id} size="sm" className="px-0">
                      <Link href={`/anniversary/${item.id}`}>
                        <ItemContent>
                          <ItemTitle> {item.name}</ItemTitle>
                        </ItemContent>
                        <ItemActions>
                          <ItemDescription>
                            {calcDiffDays(item)[0]} 天后
                          </ItemDescription>
                        </ItemActions>
                      </Link>
                    </Item>
                  ))
                  : "无"}
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
                      <ButtonGroup>
                        <ClearableInput
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="搜索"
                          className="rounded-l-md rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <Button
                          variant="outline"
                          onClick={onSearch}
                          type="button"
                        >
                          <Search className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </ButtonGroup>
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
                        onValueChange={(v) => {
                          field.onChange(v);
                          onSearch();
                        }}
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
              onClick={() => { setSelectedDate(null); setSelectedMonth(null); setViewMode("list") }}
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
              onClick={() => { setSelectedDate(new Date()); setSelectedMonth(null); setViewMode("calendar") }}
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
              <Select
                onValueChange={(v) => {
                  field.onChange(v);
                  onSearch();
                }}
                value={field.value}
              >
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
          <div className="flex items-center gap-2 my-2">
            {(["month", "year"] as CalendarView[]).map((view) => (
              <Button
                key={view}
                variant={calendarView === view ? "default" : "outline"}
                size="sm"
                onClick={() => onChangeCalendarView(view)}
              >
                {view === "year" && "年视图"}
                {view === "month" && "月视图"}
              </Button>
            ))}
          </div>
        )}

        {/* Content */}
        {viewMode === "list" ? (
          showSkeleton ? (
            <FeedListSkeleton />
          ) : (
            <div className="space-y-2 relative">
              {!isEmpty ? (
                filteredList.map((anniversary: AnniversaryItemFeed) => (
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
                    创建一个纪念日，开始记录美好时光
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

              {showMaskLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                  <Spinner />
                </div>
              )}
            </div>
          )
        ) : (
          // viewMode !== "list"
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            {/* 右侧（日历）：移动端在上；大屏在右（固定 300px） */}
            <div className="order-1 w-full lg:order-2 lg:w-[420px] lg:shrink-0">
              {showSkeleton ? (
                <CalendarHeatmapSkeleton />
              ) : (
                <Card className="p-6 border-0 shadow-card">
                  <CalendarHeatmap
                    anniversaries={feedList}
                    view={calendarView}
                    onDateFilter={handleDateFilter}
                    onMonthFilter={handleMonthFilter}
                    selectedDate={selectedDate}
                    selectedMonth={selectedMonth}
                  />
                </Card>
              )}
            </div>

            {/* 左侧（列表）：移动端在下；大屏在左（自适应占满） */}
            <div className="order-2 w-full lg:order-1 lg:flex-1">
              {showSkeleton ? (
                <FeedListSkeleton />
              ) : (
                <div className="space-y-2 relative">
                  {!isEmpty && filteredList.length !== 0 ? (
                    filteredList.map((anniversary: AnniversaryItemFeed) => (
                      <AnniversaryCard
                        key={anniversary.id}
                        anniversary={anniversary}
                        patchItem={patchItem}
                      />
                    ))
                  ) : (
                    <Card className="p-12 text-center border-0 shadow-card">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        还没有纪念日
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        创建一个纪念日，开始记录美好时光
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

                  {showMaskLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                      <Spinner />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating action buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
          {/* <Button
            variant="outline"
            size="icon"
            onClick={scrollToTop}
            className="h-10 w-10 rounded-full bg-background shadow-lg hover:shadow-xl transition-shadow"
          >
            <ArrowUp className="h-4 w-4" />
          </Button> */}
          <BackToTopBtn />
          <Button
            variant="outline"
            size="icon"
            onClick={refresh}
            type="button"
            className="h-10 w-10 rounded-full bg-background shadow-lg hover:shadow-xl transition-shadow"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
