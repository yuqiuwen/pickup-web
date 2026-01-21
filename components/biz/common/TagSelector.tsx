"use client";

import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tag, X, Plus, Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
}

interface TagOption {
  label: string;
  color: string;
  count?: number;
}

// 预设标签
const presetTags: TagOption[] = [
  { label: "爱情", color: "#f43f5e", count: 12 },
  { label: "家人", color: "#8b5cf6", count: 8 },
  { label: "朋友", color: "#3b82f6", count: 6 },
  { label: "工作", color: "#22c55e", count: 4 },
  { label: "生日", color: "#f59e0b", count: 15 },
  { label: "纪念日", color: "#ec4899", count: 10 },
  { label: "重要", color: "#ef4444", count: 5 },
  { label: "节日", color: "#14b8a6", count: 7 },
  { label: "旅行", color: "#6366f1", count: 3 },
  { label: "考试", color: "#f97316", count: 2 },
];

// 标签颜色选项
const tagColors = [
  "#f43f5e", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#64748b", // slate
];

export const TagSelector: React.FC<TagSelectorProps> = ({
  value = [],
  onChange,
  placeholder = "添加标签",
  maxTags = 10,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedColor, setSelectedColor] = useState(tagColors[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 过滤可选标签（排除已选择的）
  const availableTags = presetTags.filter(
    (tag) => !value.includes(tag.label)
  );

  // 搜索过滤
  const filteredTags = inputValue
    ? availableTags.filter((tag) =>
        tag.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    : availableTags;

  // 添加标签
  const addTag = (tagLabel: string) => {
    if (value.length >= maxTags) {
      return;
    }
    if (!value.includes(tagLabel) && tagLabel.trim()) {
      onChange([...value, tagLabel.trim()]);
      setInputValue("");
    }
  };

  // 移除标签
  const removeTag = (tagLabel: string) => {
    onChange(value.filter((t) => t !== tagLabel));
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  // 获取标签颜色
  const getTagColor = (label: string): string => {
    const preset = presetTags.find((t) => t.label === label);
    if (preset) return preset.color;
    // 基于标签名生成颜色
    const hash = label.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return tagColors[hash % tagColors.length];
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full min-h-[40px] h-auto justify-start text-left font-normal",
            value.length === 0 && "text-muted-foreground"
          )}
        >
          <Tag className="h-4 w-4 mr-2 flex-shrink-0" />
          {value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {value.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="px-2 py-0.5 text-xs"
                  style={{
                    backgroundColor: `${getTagColor(tag)}20`,
                    color: getTagColor(tag),
                    borderColor: `${getTagColor(tag)}40`,
                  }}
                >
                  {tag}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer hover:opacity-70"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(tag);
                    }}
                  />
                </Badge>
              ))}
              {value.length < maxTags && (
                <span className="text-muted-foreground text-sm">
                  +添加
                </span>
              )}
            </div>
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                placeholder="输入或搜索标签..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {inputValue.trim() && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => addTag(inputValue)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 颜色选择器 */}
          {showColorPicker && (
            <div className="flex gap-1 mt-2 pt-2 border-t">
              {tagColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "w-6 h-6 rounded-full transition-all",
                    selectedColor === color
                      ? "ring-2 ring-offset-2 ring-primary"
                      : "hover:scale-110"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setSelectedColor(color);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          )}

          {/* 已选标签 */}
          {value.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {value.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="px-2 py-1 text-xs cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor: `${getTagColor(tag)}20`,
                    color: getTagColor(tag),
                  }}
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <ScrollArea className="h-[200px]">
          <div className="p-2 space-y-1">
            {/* 搜索匹配的新标签 */}
            {inputValue.trim() && !filteredTags.find((t) => t.label === inputValue) && (
              <div
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                onClick={() => addTag(inputValue)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <span>创建 "{inputValue}"</span>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            {/* 推荐标签 */}
            {!inputValue && (
              <div className="px-2 py-1 text-xs text-muted-foreground">
                推荐标签
              </div>
            )}

            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <div
                  key={tag.label}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                    value.includes(tag.label)
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  )}
                  onClick={() => {
                    if (value.includes(tag.label)) {
                      removeTag(tag.label);
                    } else {
                      addTag(tag.label);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.label}</span>
                    {tag.count && (
                      <span className="text-xs text-muted-foreground">
                        {tag.count}
                      </span>
                    )}
                  </div>
                  {value.includes(tag.label) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))
            ) : inputValue ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                未找到匹配的标签
              </div>
            ) : null}
          </div>
        </ScrollArea>

        <div className="p-2 border-t text-center text-xs text-muted-foreground">
          最多可添加 {maxTags} 个标签，已选 {value.length} 个
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TagSelector;