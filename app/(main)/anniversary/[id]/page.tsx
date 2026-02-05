"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAnnivItemApi } from "@/lib/api/anniv";
import { AnniversaryDetailDialog } from "@/components/biz/anniversary/AnniversaryDetail";
import type { AnniversaryItemFeed } from "@/types/anniv";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [anniversary, setAnniversary] = useState<AnniversaryItemFeed | null>(null);

  useEffect(() => {
    if (!id) return;
    getAnnivItemApi(id).then((res) => setAnniversary(res.data)).catch(() => {});
  }, [id]);

  return (
    <AnniversaryDetailDialog
      anniversary={anniversary}
      open={true}
      onOpenChange={(open) => {
        if (!open) router.back(); // 直接访问详情时，关闭回列表更合理
      }}
    />
  );
}