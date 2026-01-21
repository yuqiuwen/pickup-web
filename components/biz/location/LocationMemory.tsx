// lib/components/event/LocationMemory.tsx
"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Navigation, Clock, Camera, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface LocationMemoryItem {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  date: Date;
  description?: string;
  photos?: string[];
  created_at: Date;
}

interface LocationMemoryProps {
  eventId: string;
  locations: LocationMemoryItem[];
  currentLocation?: { lat: number; lng: number };
  onAddLocation?: (location: Omit<LocationMemoryItem, "id" | "created_at">) => void;
  onRemoveLocation?: (id: string) => void;
}

// 计算两点距离（米）
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3; // 地球半径（米）
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// 地点卡片组件
const LocationCard: React.FC<{
  location: LocationMemoryItem;
  distance?: number;
  isNearby?: boolean;
  onRemove?: () => void;
}> = ({ location, distance, isNearby, onRemove }) => {
  return (
    <Card
      className={cn(
        "relative transition-all",
        isNearby && "border-primary ring-2 ring-primary/20"
      )}
    >
      {isNearby && (
        <Badge className="absolute -top-2 -right-2 bg-primary">
          📍 你在附近
        </Badge>
      )}
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* 地点图片 */}
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            {location.photos && location.photos.length > 0 ? (
              <img
                src={location.photos[0]}
                alt={location.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* 地点信息 */}
          <div className="flex-1 space-y-1">
            <h4 className="font-semibold">{location.name}</h4>
            <p className="text-sm text-muted-foreground">{location.address}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {format(location.date, "yyyy年MM月dd日", { locale: zhCN })}
              </span>
              {distance !== undefined && (
                <>
                  <span>•</span>
                  <Navigation className="h-3 w-3" />
                  <span>
                    {distance < 1000
                      ? `${Math.round(distance)}米`
                      : `${(distance / 1000).toFixed(1)}公里`}
                  </span>
                </>
              )}
            </div>
            {location.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {location.description}
              </p>
            )}
          </div>

          {/* 删除按钮 */}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// 添加地点对话框
const AddLocationDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    date: string;
    description?: string;
  }) => void;
}> = ({ open, onOpenChange, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    lat: 0,
    lng: 0,
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("您的浏览器不支持地理位置功能");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
        setIsGettingLocation(false);
      },
      (error) => {
        alert("获取位置失败：" + error.message);
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: "",
      address: "",
      lat: 0,
      lng: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加地点回忆</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>地点名称</Label>
            <Input
              placeholder="例如：我们第一次约会的咖啡店"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>详细地址</Label>
            <Input
              placeholder="输入地址"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>坐标位置</Label>
            <div className="flex gap-2">
              <Input
                placeholder="纬度"
                type="number"
                step="any"
                value={formData.lat || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    lat: parseFloat(e.target.value),
                  }))
                }
              />
              <Input
                placeholder="经度"
                type="number"
                step="any"
                value={formData.lng || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    lng: parseFloat(e.target.value),
                  }))
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? "获取中..." : "获取位置"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>日期</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>描述（可选）</Label>
            <Textarea
              placeholder="记录当时的故事..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit">添加</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// 附近提醒弹窗
const NearbyAlert: React.FC<{
  location: LocationMemoryItem;
  onClose: () => void;
}> = ({ location, onClose }) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <div className="space-y-4 py-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">那天我们在这里</h3>
          <p className="text-muted-foreground">{location.name}</p>
          <p className="text-sm text-muted-foreground">
            {format(location.date, "yyyy年MM月dd日", { locale: zhCN })}
          </p>
          {location.description && (
            <p className="text-sm italic">"{location.description}"</p>
          )}
          {location.photos && location.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {location.photos.slice(0, 4).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt=""
                  className="aspect-square rounded-lg object-cover"
                />
              ))}
            </div>
          )}
          <Button onClick={onClose} className="w-full">
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const LocationMemory: React.FC<LocationMemoryProps> = ({
  eventId,
  locations,
  currentLocation,
  onAddLocation,
  onRemoveLocation,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [nearbyAlert, setNearbyAlert] = useState<LocationMemoryItem | null>(
    null
  );
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );

  // 计算每个地点的距离
  const locationsWithDistance = locations.map((location) => {
    const distance = currentLocation
      ? calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          location.lat,
          location.lng
        )
      : undefined;
    return {
      ...location,
      distance,
      isNearby: distance !== undefined && distance < 500, // 500米内视为附近
    };
  });

  // 检测是否有附近的地点需要提醒
  useEffect(() => {
    const nearbyLocation = locationsWithDistance.find(
      (loc) => loc.isNearby && !dismissedAlerts.has(loc.id)
    );
    if (nearbyLocation && !nearbyAlert) {
      setNearbyAlert(nearbyLocation);
    }
  }, [locationsWithDistance, dismissedAlerts, nearbyAlert]);

  const handleDismissAlert = () => {
    if (nearbyAlert) {
      setDismissedAlerts((prev) => new Set([...prev, nearbyAlert.id]));
      setNearbyAlert(null);
    }
  };

  const handleAddLocation = (data: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    date: string;
    description?: string;
  }) => {
    onAddLocation?.({
      name: data.name,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      date: new Date(data.date),
      description: data.description,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          地点回忆
        </h3>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          添加地点
        </Button>
      </div>

      {/* 当前位置信息 */}
      {currentLocation && (
        <div className="flex items-center gap-2 rounded-lg bg-muted p-2 text-sm">
          <Navigation className="h-4 w-4 text-primary" />
          <span>
            当前位置: {currentLocation.lat.toFixed(4)},{" "}
            {currentLocation.lng.toFixed(4)}
          </span>
        </div>
      )}

      {/* 地点列表 */}
      {locationsWithDistance.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">
              还没有添加地点回忆，快来记录你们的足迹吧！
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {locationsWithDistance
            .sort((a, b) => (b.isNearby ? 1 : 0) - (a.isNearby ? 1 : 0))
            .map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                distance={location.distance}
                isNearby={location.isNearby}
                onRemove={() => onRemoveLocation?.(location.id)}
              />
            ))}
        </div>
      )}

      {/* 添加地点对话框 */}
      <AddLocationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddLocation}
      />

      {/* 附近提醒弹窗 */}
      {nearbyAlert && (
        <NearbyAlert location={nearbyAlert} onClose={handleDismissAlert} />
      )}
    </div>
  );
};

export default LocationMemory;