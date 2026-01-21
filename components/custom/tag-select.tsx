import { useTag } from "@/hooks/use-tag";
import * as React from "react";
import {Command, CommandItem, CommandInput, CommandGroup, CommandEmpty, CommandList} from "@/components/ui/command"
import {Badge} from  "@/components/ui/badge"
import {Popover, PopoverTrigger, PopoverContent} from  "@/components/ui/popover"
import {Button} from "@/components/ui/button"
import {Spinner} from "@/components/ui/spinner"
import { Plus, X } from "lucide-react";
import { Tag } from "@/types/common";


type TagSelectorProps = {
    limit?: number;
    value?: Tag[]; // 受控
    defaultValue?: Tag[]; // 非受控
    onChange?: (tags: Tag[]) => void;
  };


export function TagSelector({limit=5, value, defaultValue, onChange}: TagSelectorProps) {
  const {
    tags,
    open,
    setOpen,
    keyword,
    setKeyword,
    options,
    isLoading,
    openPicker,
    selectOption,
    handleRemoveTag,
  } = useTag(limit, { value, defaultValue, onChange });

  const listRef = React.useRef<HTMLDivElement | null>(null);

  const createOpt = React.useMemo(() => {
    const opt = options.find((o) => o.type === "create");
    return opt && opt.type === "create" ? opt : undefined;
  }, [options]);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map((tag) => (
        <Badge key={tag.id ?? tag.name} variant="secondary" className="h-7 gap-1 pr-1.5">
          #{tag.name}
          <button
            type="button"
            onClick={() => handleRemoveTag(tag)}
            className="ml-1 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {tags.length < limit && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={openPicker}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="p-0 w-64" align="start">
            <Command shouldFilter={false}>
              <div className="flex items-center gap-2 px-2">
                <CommandInput
                  value={keyword}
                  onValueChange={setKeyword}
                  placeholder="搜索..."
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    if (isLoading) return;              // 可选：加载中不处理
                    if (!createOpt) return;             // 没有“创建项”就交给 cmdk 默认 Enter 行为

                    // 看当前高亮项（aria-selected=true）
                    const active = listRef.current?.querySelector(
                      '[cmdk-item][aria-selected="true"]'
                    ) as HTMLElement | null;

                    const activeIsCreate = active?.dataset.create === "true";

                    // 如果用户箭头选中了某个 existing item，就让默认 Enter 选中它
                    if (active && !activeIsCreate) return;

                    // 否则 Enter 直接创建
                    e.preventDefault();
                    selectOption(createOpt);
                  }}
                />
                {isLoading && <Spinner className="h-4 w-4" />}
              </div>

              <CommandList ref={listRef}>
                <CommandEmpty>
                  {keyword.trim() ? "无匹配，回车可创建" : "请输入关键词"}
                </CommandEmpty>

                <CommandGroup>
                  {options.map((opt) => {
                    const key =
                      opt.type === "existing"
                        ? `e:${opt.tag.id ?? opt.tag.name}`
                        : `c:${opt.name}`;

                    const label =
                      opt.type === "existing" ? `#${opt.tag.name}` : `创建：#${opt.name}`;

                    return (
                      <CommandItem
                        key={key}
                        // 给创建项打标记，Enter 时识别
                        data-create={opt.type === "create" ? "true" : "false"}
                        value={label}
                        onSelect={() => selectOption(opt)}
                      >
                        {label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}