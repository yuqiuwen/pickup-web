"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  acceptInviteApi,
  declineInviteApi,
  previewInviteApi,
} from "@/lib/api/invite";
import request from "@/lib/request-client";
import { InviteState, StateTextMap } from "@/lib/constant";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Anniversary } from "@/types/anniv";
import { CalendarDays, Clock, Loader2, Mail, MapPin } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAnniv } from "@/hooks/use-anniv";

type Action = "accept" | "decline";
type InviteItem = {
  id: string;
  ttype: number;
  tid: string;
  state: number;
  invitee_email: string | null;
  invitee_user_id: number | null;
  message: string;
  expires_at: number; // unix seconds
  responded_at: string | null;
  target: Anniversary | null;
};

const STATE_BADGE: Record<number, string> = {
  [InviteState.PENDING]: "bg-slate-50 text-slate-700 border border-slate-200",
  [InviteState.SENT]: "bg-amber-50 text-amber-800 border border-amber-200",
  [InviteState.ACCEPTED]:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  [InviteState.DECLINED]: "bg-rose-50 text-rose-700 border border-rose-200",
  [InviteState.EXPIRED]: "bg-slate-50 text-slate-700 border border-slate-200",
  [InviteState.CANCELLED]: "bg-slate-50 text-slate-700 border border-slate-200",
};

function initials(name?: string) {
  const s = (name ?? "").trim();
  if (!s) return "?";
  return s.slice(0, 1).toUpperCase();
}

function stateHint(state: number) {
  switch (state) {
    case InviteState.PENDING:
      return "邀请尚未发送完成，暂不可操作。";
    case InviteState.ACCEPTED:
      return "你已接受过该邀请。";
    case InviteState.DECLINED:
      return "你已拒绝过该邀请。";
    case InviteState.EXPIRED:
      return "邀请已过期，请对方重新发送。";
    case InviteState.CANCELLED:
      return "邀请已被撤销。";
    default:
      return "";
  }
}

function fmtDateOnly(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(d);
}



export default function InviteActionPage({ action }: { action: Action }) {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token");

  const nextUrl = useMemo(() => {
    if (!token) return `/invites/${action}`;
    return `/invites/${action}?token=${encodeURIComponent(token)}`;
  }, [token, action]);

  const { formatAnnivTriggerTime } = useAnniv();
  const [invite, setInvite] = useState<InviteItem | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState<null | Action>(null);
  const [msg, setMsg] = useState<string>("");

  const canRespond = invite?.state === InviteState.SENT;

  // 预览（不要求登录）
  useEffect(() => {
    if (!token) return;
    setLoadingPreview(true);
    setMsg("");
    setInvite(null);

    (async () => {
      try {
        const resp = await previewInviteApi(token);
        const data = await resp.data;
        setInvite(data);
        if (data.state !== InviteState.SENT) {
        }
      } finally {
        setLoadingPreview(false);
      }
    })();
  }, [token]);

  async function handleRespond(act: Action) {
    if (!token) return;

    // 前端 UI 限制：只有已发送才能点
    if (!canRespond) {
      setMsg(
        `当前状态：${StateTextMap[invite?.state ?? -1] ?? "未知"}，不可操作。`
      );
      return;
    }

    const jwt = request.getAccessToken();
    if (!jwt) {
      router.replace(`/login?from=${encodeURIComponent(nextUrl)}`);
      return;
    }

    setSubmitting(act);
    setMsg("");

    try {
      const api = act === "accept" ? acceptInviteApi : declineInviteApi;
      const resp = await api(token);
      const data = await resp.data;

      // 成功后的跳转：你可以让后端返回 target_url；这里先回首页或一个结果页
      const target = data?.target_url ?? "/";
      router.replace(target);
    } finally {
      setSubmitting(null);
    }
  }

  if (!token)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
        <Card className="w-full max-w-lg p-6">
          <div className="text-lg font-semibold">链接无效</div>
          <div className="mt-2 text-sm text-muted-foreground">
            缺少 token 参数
          </div>
          <div className="mt-4">
            <Link className="text-sm font-medium underline" href="/">
              返回首页
            </Link>
          </div>
        </Card>
      </div>
    );

  const anniv = invite?.target ?? null;
  const inviterName = anniv?.owner?.username ?? "你的好友"; // 如果邀请人不是 owner，建议后端补 inviter 字段
  const annivName = anniv?.name ?? "纪念日";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-pink-50 to-muted/30">
      <div className="w-full max-w-xl space-y-4">
        <Card className="overflow-hidden shadow-sm">
          <VisuallyHidden>
            <CardHeader></CardHeader>
          </VisuallyHidden>
          <VisuallyHidden>
            <CardDescription></CardDescription>
          </VisuallyHidden>
          {/* 顶部封面区（C端重点：氛围 + 标题） */}
          <div className="relative">
            <div
              className="h-44 w-full bg-slate-200"
              style={{
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="text-white/90 text-sm">你收到一条邀请</div>
                <div className="mt-1 text-white text-xl font-semibold truncate">
                  加入「{annivName}」
                </div>
              </div>

              {invite ? (
                <Badge
                  className={
                    STATE_BADGE[invite.state] ??
                    STATE_BADGE[InviteState.EXPIRED]
                  }
                >
                  {StateTextMap[invite.state] ?? `状态(${invite.state})`}
                </Badge>
              ) : null}
            </div>
          </div>

          <CardContent className="p-5 space-y-4">
            {loadingPreview ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : invite ? (
              <>
                {/* “谁邀请你” + 简短描述 */}
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-semibold">
                    {initials(inviterName)}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {inviterName}
                      </span>{" "}
                      邀请你加入
                    </div>
                    <div className="mt-1 text-sm text-slate-700 line-clamp-2">
                      {anniv?.description?.trim()
                        ? anniv.description
                        : "一起记录重要日子，分享提醒与回忆。"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                    <CalendarDays className="h-4 w-4" />
                    {anniv?.event_date
                      ? fmtDateOnly(anniv.event_date)
                      : "日期未知"}
                  </span>

                  {anniv?.next_trigger_at ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      <Clock className="h-4 w-4" />
                      {formatAnnivTriggerTime(anniv)}（{anniv.tz}）
                    </span>
                  ) : null}

                  {anniv?.location ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      <MapPin className="h-4 w-4" />
                      {anniv.location}
                    </span>
                  ) : null}

                  {invite.invitee_email ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      <Mail className="h-4 w-4" />
                      发给：{invite.invitee_email}
                    </span>
                  ) : null}
                </div>

                {/* 留言（如果有） */}
                {invite.message?.trim() ? (
                  <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-xs font-semibold text-slate-500">
                      对方留言
                    </div>
                    <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                      {invite.message}
                    </div>
                  </div>
                ) : null}

                <Separator />

                {/* 状态提示（不可操作时显示） */}

                {/* 动作按钮 */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="bg-pink-600 hover:bg-pink-700"
                    disabled={!canRespond || submitting !== null}
                    onClick={() => handleRespond("accept")}
                  >
                    {submitting === "accept" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    接受邀请
                  </Button>

                  <Button
                    variant="outline"
                    disabled={!canRespond || submitting !== null}
                    onClick={() => handleRespond("decline")}
                  >
                    {submitting === "decline" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    拒绝
                  </Button>
                </div>

                {msg ? (
                  <Alert>
                    <AlertDescription>{msg}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="text-xs text-muted-foreground">
                  未登录将跳转登录，登录成功后会回到此页面继续操作。
                </div>
              </>
            ) : (
              <Alert>
                <AlertDescription>{msg || "邀请不可用"}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          <Link className="underline" href="/">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
