
'use client';

import { useState, useMemo } from 'react';
import { 
  SearchIcon, 
  FilterIcon,
  SortAscIcon,
  SortDescIcon,
  LayoutGridIcon,
  LayoutListIcon,
  DownloadIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { Event } from '@/types/anniv';
import {EventType} from '@/lib/constant'
import { EventCard } from './EventCard';

import { getDaysUntil, getDaysSince } from '@/utils/time';

interface EventListProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onEventEdit?: (event: Event) => void;
  onEventDelete?: (event: Event) => void;
  onEventShare?: (event: Event) => void;
}

type SortField = 'date' | 'name' | 'days' | 'created';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export function EventList({
  events,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onEventShare,
}: EventListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredAndSortedEvents = useMemo(() => {
    let result = [...events];

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (event) =>
          event.name.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // 类型过滤
    if (typeFilter !== 'all') {
      result = result.filter((event) => event.type === typeFilter);
    }

    // 排序
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'days':
          const daysA = a.type === EventType.COUNTDOWN 
            ? getDaysUntil(a.event_date) 
            : getDaysSince(a.event_date);
          const daysB = b.type === EventType.COUNTDOWN 
            ? getDaysUntil(b.event_date) 
            : getDaysSince(b.event_date);
          comparison = daysA - daysB;
          break;
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [events, searchQuery, typeFilter, sortField, sortOrder]);

  const handleExport = () => {
    
  };

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索日程..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {/* 类型筛选 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FilterIcon className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>日程类型</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={typeFilter === 'all'}
                onCheckedChange={() => setTypeFilter('all')}
              >
                全部
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter === EventType.ANNIVERSARY}
                onCheckedChange={() => setTypeFilter(EventType.ANNIVERSARY)}
              >
                💕 纪念日
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter === EventType.BIRTHDAY}
                onCheckedChange={() => setTypeFilter(EventType.BIRTHDAY)}
              >
                🎂 生日
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter === EventType.COUNTDOWN}
                onCheckedChange={() => setTypeFilter(EventType.COUNTDOWN)}
              >
                ⏰ 倒数日
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 排序 */}
          <Select 
            value={`${sortField}-${sortOrder}`}
            onValueChange={(value) => {
              const [field, order] = value.split('-') as [SortField, SortOrder];
              setSortField(field);
              setSortOrder(order);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">日期升序</SelectItem>
              <SelectItem value="date-desc">日期降序</SelectItem>
              <SelectItem value="days-asc">天数升序</SelectItem>
              <SelectItem value="days-desc">天数降序</SelectItem>
              <SelectItem value="name-asc">名称 A-Z</SelectItem>
              <SelectItem value="name-desc">名称 Z-A</SelectItem>
              <SelectItem value="created-desc">最近创建</SelectItem>
            </SelectContent>
          </Select>

          {/* 视图切换 */}
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(v) => v && setViewMode(v as ViewMode)}
          >
            <ToggleGroupItem value="grid" aria-label="网格视图">
              <LayoutGridIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="列表视图">
              <LayoutListIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          {/* 导出 */}
          <Button variant="outline" onClick={handleExport}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      {/* 结果统计 */}
      <div className="text-sm text-muted-foreground">
        共 {filteredAndSortedEvents.length} 个日程
        {searchQuery && ` (搜索: "${searchQuery}")`}
      </div>

      {/* 日程列表 */}
      {filteredAndSortedEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">暂无日程</p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'
          }
        >
          {filteredAndSortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={onEventClick}
              onEdit={onEventEdit}
              onDelete={onEventDelete}
              onShare={onEventShare}
            />
          ))}
        </div>
      )}
    </div>
  );
}