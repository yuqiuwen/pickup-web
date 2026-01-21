import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tag } from "@/types/common";
import { getTagListApi } from "@/lib/api/sys";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/lib/utils";

function normalizeTagName(input: string) {
  return input.trim().replace(/^#/, "");
}

type Option = { type: "create"; name: string } | { type: "existing"; tag: Tag };

type UseTagOptions = {
  value?: Tag[]; // 受控值
  defaultValue?: Tag[]; // 非受控默认值
  onChange?: (tags: Tag[]) => void; // 通知父组件
};

const fetchTagListQuery = (params: { search: string }, enabled: boolean) => {
  return useQuery<Tag[]>({
    queryKey: ["tag-list", params.search],
    enabled,
    queryFn: async () => {
      const res = await getTagListApi(params);
      return res.data;
    },
    staleTime: 30_000,
  });
};

export function useTag(limit = 5, opts: UseTagOptions = {}) {
  const { value, defaultValue = [], onChange } = opts;
  // 使用 ref 来避免无限循环
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [internalTags, setInternalTags] = useState<Tag[]>(defaultValue);
  const tags = value ?? internalTags;

  const setTags = useCallback(
    (updater: Tag[] | ((prev: Tag[]) => Tag[])) => {
      const next =
        typeof updater === "function" ? (updater as any)(tags) : updater;

      const limited = next.slice(0, limit);

      // 非受控：更新内部 state
      if (value === undefined) setInternalTags(limited);

      // 使用 ref 调用 onChange 避免依赖变化
      onChangeRef.current?.(limited);
    },
    [tags, limit, onChange, value]
  );
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const normalized = normalizeTagName(keyword);
  const debounced = useDebouncedValue(normalized, 300);

  const queryEnabled = open && debounced.length > 0;
  const query = fetchTagListQuery({ search: debounced }, queryEnabled);

  const isLoading = query.isFetching; // 用它挂 Spinner

  const options: Option[] = useMemo(() => {
    if (!open) return [];
    if (!normalized) return [];

    const serverTags = query.data ?? [];
    const hasExact = serverTags.some((t) => t.name === normalized);

    if (serverTags.length === 0) {
      return [{ type: "create", name: normalized }];
    }
    if (hasExact) {
      return serverTags.map((t) => ({ type: "existing", tag: t }));
    }
    return [
      { type: "create", name: normalized },
      ...serverTags.map((t) => ({ type: "existing", tag: t })),
    ];
  }, [open, normalized, query.data]);

  const addTag = useCallback(
    (tag: Tag) => {
      setTags((prev) => {
        // 去重：按 id（有就按 id），否则按 name
        const exists = prev.some((t) =>
          tag.id ? t.id === tag.id : t.name === tag.name
        );
        if (exists) return prev;
        if (prev.length >= limit) return prev;
   

        return [...prev, tag];
      });
    },
    [limit, setTags]
  );

  const selectOption = useCallback(
    (opt: Option) => {
      if (opt.type === "create") addTag({ name: opt.name });
      else addTag(opt.tag);

      // 选中即完成一个 tag 添加：关闭 + 清空
      setOpen(false);
      setKeyword("");
    },
    [addTag]
  );

  const handleRemoveTag = useCallback(
    (tag: Tag) => {
      const key = tag.id ?? tag.name;
      setTags((prev) => prev.filter((t) => (t.id ?? t.name) !== key));
    },
    [setTags]
  );

  const openPicker = useCallback(() => {
    if (tags.length >= limit) return;
    setOpen(true);
  }, [tags.length, limit]);

  return {
    tags,
    open,
    keyword,
    options,
    isLoading,
    setKeyword,
    setOpen,
    openPicker,
    selectOption,
    handleRemoveTag,
  };
}
