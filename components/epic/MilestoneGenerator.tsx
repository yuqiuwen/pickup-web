// lib/components/event/MilestoneGenerator.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  differenceInDays,
  addDays,
  addMonths,
  addYears,
  format,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Milestone,
  Heart,
  Baby,
  Calendar,
  Sparkles,
  ChevronRight,
  Bell,
  BellOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type MilestoneType =
  | "days"
  | "months"
  | "years"
  | "weeks"
  | "special";

export interface MilestoneItem {
  id: string;
  type: MilestoneType;
  label: string;
  date: Date;
  daysFromNow: number;
  isPast: boolean;
  isToday: boolean;
  icon: React.ElementType;
  color: string;
  enabled: boolean;
}

interface MilestoneGeneratorProps {
  eventName: string;
  eventDate: Date;
  eventType: 1 | 2 | 3; // 1纪念日 2生日 3倒数日
  onMilestoneToggle?: (milestoneId: string, enabled: boolean) => void;
  onMilestoneClick?: (milestone: MilestoneItem) => void;
}

// 里程碑配置
const milestoneConfigs = {
  // 天数里程碑
  days: [
    { value: 100, label: "100天" },
    { value: 200, label: "200天" },
    { value: 365, label: "365天" },
    { value: 500, label: "500天" },
    { value: 520, label: "520天" },
    { value: 1000, label: "1000天" },
    { value: 1314, label: "1314天" },
    { value: 2000, label: "2000天" },
    { value: 3000, label: "3000天" },
  ],
  // 周数里程碑
  weeks: [
    { value: 52, label: "52周" },
    { value: 100, label: "100周" },
  ],
  // 月数里程碑
  months: [
    { value: 1, label: "1个月" },
    { value: 3, label: "3个月" },
    { value: 6, label: "半年" },
    { value: 12, label: "1年" },
    { value: 18, label: "1年半" },
    { value: 24, label: "2年" },
    { value: 36, label: "3年" },
  ],
  // 年数里程碑
  years: [
    { value: 1, label: "1周年", special: "纸婚" },
    { value: 2, label: "2周年", special: "棉婚" },
    { value: 3, label: "3周年", special: "皮婚" },
    { value: 5, label: "5周年", special: "木婚" },
    { value: 7, label: "7周年", special: "铜婚" },
    { value: 10, label: "10周年", special: "锡婚" },
    { value: 15, label: "15周年", special: "水晶婚" },
    { value: 20, label: "20周年", special: "瓷婚" },
    { value: 25, label: "25周年", special: "银婚" },
    { value: 30, label: "30周年", special: "珍珠婚" },
    { value: 40, label: "40周年", special: "红宝石婚" },
    { value: 50, label: "50周年", special: "金婚" },
    { value: 60, label: "60周年", special: "钻石婚" },
  ],
  // 宝宝专属里程碑
  baby: [
    { value: 30, label: "满月", type: "days" },
    { value: 100, label: "百天", type: "days" },
    { value: 1, label: "1岁生日", type: "years" },
    { value: 2, label: "2岁生日", type: "years" },
    { value: 3, label: "3岁生日", type: "years" },
  ],
};

// 获取里程碑图标
const getMilestoneIcon = (
  type: MilestoneType,
  eventType: 1 | 2 | 3
): React.ElementType => {
  if (eventType === 2) return Baby;
  switch (type) {
    case "days":
      return Calendar;
    case "years":
      return Heart;
    case "special":
      return Sparkles;
    default:
      return Milestone;
  }
};

// 获取里程碑颜色
const getMilestoneColor = (
  daysFromNow: number,
  isToday: boolean
): string => {
  if (isToday) return "bg-green-500";
  if (daysFromNow < 0) return "bg-gray-400";
  if (daysFromNow <= 7) return "bg-red-500";
  if (daysFromNow <= 30) return "bg-orange-500";
  if (daysFromNow <= 90) return "bg-yellow-500";
  return "bg-blue-500";
};

export const MilestoneGenerator: React.FC<MilestoneGeneratorProps> = ({
  eventName,
  eventDate,
  eventType,
  onMilestoneToggle,
  onMilestoneClick,
}) => {
  const [enabledMilestones, setEnabledMilestones] = useState<Set<string>>(
    new Set()
  );
  const [showPast, setShowPast] = useState(false);

  // 生成里程碑列表
  const milestones = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const items: MilestoneItem[] = [];

    // 天数里程碑
    milestoneConfigs.days.forEach((config) => {
      const date = addDays(eventDate, config.value);
      const daysFromNow = differenceInDays(date, today);
      items.push({
        id: `days-${config.value}`,
        type: "days",
        label: `第${config.label}`,
        date,
        daysFromNow,
        isPast: daysFromNow < 0,
        isToday: daysFromNow === 0,
        icon: getMilestoneIcon("days", eventType),
        color: getMilestoneColor(daysFromNow, daysFromNow === 0),
        enabled: enabledMilestones.has(`days-${config.value}`),
      });
    });

    // 年数里程碑
    milestoneConfigs.years.forEach((config) => {
      const date = addYears(eventDate, config.value);
      const daysFromNow = differenceInDays(date, today);
      items.push({
        id: `years-${config.value}`,
        type: "years",
        label: `${config.label}${config.special ? ` (${config.special})` : ""}`,
        date,
        daysFromNow,
        isPast: daysFromNow < 0,
        isToday: daysFromNow === 0,
        icon: getMilestoneIcon("years", eventType),
        color: getMilestoneColor(daysFromNow, daysFromNow === 0),
        enabled: enabledMilestones.has(`years-${config.value}`),
      });
    });

    // 按日期排序
    items.sort((a, b) => a.date.getTime() - b.date.getTime());

    return items;
  }, [eventDate, eventType, enabledMilestones]);

  // 过滤显示的里程碑
  const displayMilestones = showPast
    ? milestones
    : milestones.filter((m) => !m.isPast || m.isToday);

  // 下一个即将到来的里程碑
  const nextMilestone = milestones.find((m) => m.daysFromNow >= 0);

  // 切换里程碑提醒
  const handleToggleMilestone = (id: string, enabled: boolean) => {
    const newSet = new Set(enabledMilestones);
    if (enabled) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setEnabledMilestones(newSet);
    onMilestoneToggle?.(id, enabled);
  };

  // 批量开启/关闭
  const handleToggleAll = (enabled: boolean) => {
    const newSet = new Set<string>();
    if (enabled) {
      displayMilestones.forEach((m) => {
        if (!m.isPast) {
          newSet.add(m.id);
        }
      });
    }
    setEnabledMilestones(newSet);
  };

  return (
    <div className="space-y-6">
      {/* 下一个里程碑高亮卡片 */}
      {nextMilestone && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full text-white",
                    nextMilestone.color
                  )}
                >
                  <nextMilestone.icon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    距离下一个里程碑
                  </p>
                  <h3 className="text-xl font-bold">{nextMilestone.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(nextMilestone.date, "yyyy年MM月dd日", {
                      locale: zhCN,
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {nextMilestone.isToday ? (
                  <div className="space-y-1">
                    <Badge className="bg-green-500">今天</Badge>
                    <p className="text-2xl font-bold">🎉</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-primary">
                      {nextMilestone.daysFromNow}
                    </p>
                    <p className="text-sm text-muted-foreground">天后</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 里程碑列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Milestone className="h-5 w-5" />
              里程碑时间表
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="show-past"
                  checked={showPast}
                  onCheckedChange={setShowPast}
                />
                <Label htmlFor="show-past" className="text-sm">
                  显示已过里程碑
                </Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleToggleAll(enabledMilestones.size === 0)
                }
              >
                {enabledMilestones.size === 0 ? (
                  <>
                    <Bell className="mr-1 h-4 w-4" />
                    全部开启提醒
                  </>
                ) : (
                  <>
                    <BellOff className="mr-1 h-4 w-4" />
                    全部关闭提醒
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {displayMilestones.map((milestone) => (
              <TooltipProvider key={milestone.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent cursor-pointer",
                        milestone.isToday && "border-green-500 bg-green-50",
                        milestone.isPast && "opacity-60"
                      )}
                      onClick={() => onMilestoneClick?.(milestone)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full text-white",
                            milestone.color
                          )}
                        >
                          <milestone.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{milestone.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(milestone.date, "yyyy年MM月dd日", {
                              locale: zhCN,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {milestone.isToday ? (
                          <Badge className="bg-green-500">今天!</Badge>
                        ) : milestone.isPast ? (
                          <span className="text-sm text-muted-foreground">
                            已过 {Math.abs(milestone.daysFromNow)} 天
                          </span>
                        ) : (
                          <span className="text-sm font-medium">
                            还有 {milestone.daysFromNow} 天
                          </span>
                        )}
                        {!milestone.isPast && (
                          <Switch
                            checked={milestone.enabled}
                            onCheckedChange={(checked) =>
                              handleToggleMilestone(milestone.id, checked)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {eventName} - {milestone.label}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-primary">
                {milestones.filter((m) => m.isPast).length}
              </p>
              <p className="text-sm text-muted-foreground">已达成</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold text-orange-500">
                {milestones.filter((m) => !m.isPast).length}
              </p>
              <p className="text-sm text-muted-foreground">待达成</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold text-green-500">
                {enabledMilestones.size}
              </p>
              <p className="text-sm text-muted-foreground">已开启提醒</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MilestoneGenerator;