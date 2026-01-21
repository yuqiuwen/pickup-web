"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  Navigation,
  Search,
  X,
  Loader2,
  History,
  Star,
  Building,
  Home,
  Coffee,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  value?: Location;
  onChange: (location: Location | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface SearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  distance?: number;
}

// 模拟搜索结果
const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    name: "北京国贸大酒店",
    address: "北京市朝阳区建国门外大街1号",
    latitude: 39.9087,
    longitude: 116.4604,
    type: "hotel",
  },
  {
    id: "2",
    name: "三里屯太古里",
    address: "北京市朝阳区三里屯路19号",
    latitude: 39.9332,
    longitude: 116.4551,
    type: "shopping",
  },
  {
    id: "3",
    name: "故宫博物院",
    address: "北京市东城区景山前街4号",
    latitude: 39.9163,
    longitude: 116.3972,
    type: "landmark",
  },
  {
    id: "4",
    name: "星巴克（望京SOHO店）",
    address: "北京市朝阳区望京街9号望京SOHO塔1",
    latitude: 39.9987,
    longitude: 116.4756,
    type: "cafe",
  },
  {
    id: "5",
    name: "北京大学",
    address: "北京市海淀区颐和园路5号",
    latitude: 39.9869,
    longitude: 116.3059,
    type: "school",
  },
];

// 历史记录
const recentLocations: SearchResult[] = [
  {
    id: "h1",
    name: "公司",
    address: "北京市朝阳区酒仙桥路10号",
    latitude: 39.9799,
    longitude: 116.4945,
    type: "work",
  },
  {
    id: "h2",
    name: "家",
    address: "北京市海淀区中关村大街1号",
    latitude: 39.9841,
    longitude: 116.3074,
    type: "home",
  },
];

// 获取类型图标
const getTypeIcon = (type: string) => {
  switch (type) {
    case "home":
      return <Home className="h-4 w-4" />;
    case "work":
      return <Building className="h-4 w-4" />;
    case "cafe":
      return <Coffee className="h-4 w-4" />;
    case "shopping":
      return <ShoppingBag className="h-4 w-4" />;
    default:
      return <MapPin className="h-4 w-4" />;
  }
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = "添加地点",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // 模拟搜索
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    // 模拟API延迟
    await new Promise((resolve) => setTimeout(resolve, 300));

    const results = mockSearchResults.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.address.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results);
    setIsSearching(false);
  }, []);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // 获取当前位置
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("您的浏览器不支持地理位置服务");
      return;
    }

    setIsLocating(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      setCurrentLocation({ latitude, longitude });

      // 模拟逆地理编码
      const location: Location = {
        name: "当前位置",
        address: "北京市朝阳区某某街道",
        latitude,
        longitude,
      };

      onChange(location);
      setOpen(false);
    } catch (error) {
      console.error("获取位置失败:", error);
      alert("获取位置失败，请检查定位权限");
    } finally {
      setIsLocating(false);
    }
  };

  // 选择位置
  const handleSelectLocation = (result: SearchResult) => {
    const location: Location = {
      name: result.name,
      address: result.address,
      latitude: result.latitude,
      longitude: result.longitude,
    };
    onChange(location);
    setOpen(false);
    setSearchQuery("");
  };

  // 清除位置
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
          {value ? (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <div className="truncate">
                <span className="font-medium">{value.name}</span>
                {value.address && (
                  <span className="text-muted-foreground ml-1 text-xs">
                    {value.address}
                  </span>
                )}
              </div>
              <X
                className="h-4 w-4 ml-2 flex-shrink-0 hover:text-destructive"
                onClick={handleClear}
              />
            </div>
          ) : (
            placeholder
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>选择地点</DialogTitle>
          <DialogDescription>搜索或选择一个地点</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索地点..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* 定位按钮 */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={getCurrentLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            {isLocating ? "正在定位..." : "使用当前位置"}
          </Button>

          <ScrollArea className="h-[300px]">
            {/* 搜索结果 */}
            {searchQuery && searchResults.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground px-2">
                  搜索结果
                </Label>
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleSelectLocation(result)}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 无搜索结果 */}
            {searchQuery && !isSearching && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>未找到相关地点</p>
                <p className="text-sm">请尝试其他关键词</p>
              </div>
            )}

            {/* 最近使用 */}
            {!searchQuery && (
              <div className="space-y-4">
                {/* 常用地点 */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground px-2 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    常用地点
                  </Label>
                  {recentLocations.slice(0, 2).map((location) => (
                    <div
                      key={location.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleSelectLocation(location)}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {getTypeIcon(location.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{location.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {location.address}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 最近搜索 */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground px-2 flex items-center gap-1">
                    <History className="h-3 w-3" />
                    最近使用
                  </Label>
                  {recentLocations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleSelectLocation(location)}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        {getTypeIcon(location.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{location.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {location.address}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 热门地点 */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground px-2">
                    热门地点
                  </Label>
                  {mockSearchResults.slice(0, 3).map((location) => (
                    <div
                      key={location.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleSelectLocation(location)}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        {getTypeIcon(location.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{location.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {location.address}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPicker;