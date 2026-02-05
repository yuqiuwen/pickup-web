import { getGroupListApi, getGroupMemberOptionsApi, getMemberListApi } from "@/lib/api/sys";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShareGroup, SimpleUser } from "@/types/auth";
import { useDebouncedValue } from "@/lib/utils";


type UseGroupOpts = {
  groups: ShareGroup[];
  members: SimpleUser[];
};


export function useGroupMemberSearch(kw: string, delay = 300) {
  const debouncedKw = useDebouncedValue(kw, delay);
  const [data, setData] = useState<UseGroupOpts>({ groups: [], members: [] });
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!debouncedKw) {
      setData({ groups: [], members: [] });
      return;
    }
    setLoading(true);

    try {
      const r = await getGroupMemberOptionsApi({ search: debouncedKw });
      setData(r.data);
    } finally {
      setLoading(false);
    }
  }, [debouncedKw]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,

    loadData,
  };
}


export function useMemberSearch(kw: string, delay = 300) {
  const debouncedKw = useDebouncedValue(kw, delay);
  const [data, setData] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!debouncedKw) {
      setData([]);
      return;
    }
    setLoading(true);

    try {
      const r = await getMemberListApi({ search: debouncedKw });
      setData(r.data);
    } finally {
      setLoading(false);
    }
  }, [debouncedKw]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,

    loadData,
  };
}


export function useGroupSearch(kw?: string, delay = 300) {
  const debouncedKw = useDebouncedValue(kw, delay);
  const [data, setData] = useState<ShareGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const r = await getGroupListApi({ search: debouncedKw });
      setData(r.data);
    } finally {
      setLoading(false);
    }
  }, [debouncedKw]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,

    loadData,
  };
}