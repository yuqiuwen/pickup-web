"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAnnivItemApi } from "@/lib/api/anniv";
import { AnniversaryDetailDialog } from "@/components/biz/anniversary/AnniversaryDetail";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { AnniversaryItemFeed } from "@/types/anniv"; // 按你的实际路径改

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const id = params.id;
  const [anniversary, setAnniversary  ] = useState<AnniversaryItemFeed | null>(null);

  
  useEffect(() => {
    if (!id) return;
    setAnniversary(null);

    getAnnivItemApi(id)
      .then((res) => {
        setAnniversary(res.data);
      })
      
  }, [id]);


  return (
    <AnniversaryDetailDialog
      anniversary={anniversary}
      open={true}
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    />
  );
}