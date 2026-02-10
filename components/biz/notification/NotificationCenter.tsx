"use client";

import { useMemo, useState } from "react";
import {
    Bell, MessageCircle, Heart, UserCheck,
    ChevronRight, Megaphone, Monitor, MessageSquare, Check,
    X, EllipsisVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { RemindDetailPanel } from "./RemindDetailPanel";
import {
    TAction,
    type NotifySection,
    type RemindNotifyItem,
    type UnReadMsgCnt,
} from "@/types/notification";
import { useMessages } from "@/contexts/messages-context";
import { useAnnounceSection, useCommentMentionSection, useFanSection, useLikeCollectSection, useRemindSection, useSysSection, useUnreadCount } from "@/hooks/use-ntfy";
import { resetAllUnreadCountApi } from "@/lib/api/notification";

// Mock unread counts
const initialUnreadCnt: UnReadMsgCnt = {
    sys_cnt: 0,
    announce_cnt: 0,
    fan_cnt: 0,
    like_cnt: 0,
    collect_cnt: 0,
    comment_cnt: 0,
    invite_cnt: 0,
    mention_cnt: 0,
};



// Section definitions
const sections: {
    key: NotifySection;
    label: string;
    icon: React.ElementType;
    getCount: (u: UnReadMsgCnt) => number;
    actions: string;
}[] = [
        {
            key: "comment_mention",
            label: "评论和@",
            icon: MessageCircle,
            getCount: (u) => u.comment_cnt + u.mention_cnt,
            actions: `${TAction.COMMENT},${TAction.REPLY},${TAction.MENTION}`,
        },
        {
            key: "like_collect",
            label: "赞和收藏",
            icon: Heart,
            getCount: (u) => u.like_cnt + u.collect_cnt,
            actions: `${TAction.LIKE},${TAction.COLLECT}`,
        },
        {
            key: "fan",
            label: "新增粉丝",
            icon: UserCheck,
            getCount: (u) => u.fan_cnt,
            actions: `${TAction.FAN}`,
        },
    ];

const bottomItems = [
    { key: "sys", label: "系统通知", icon: Monitor, countKey: "sys_cnt" as const, getCount: (u) => u.sys_cnt, },
    { key: "announce", label: "公告栏", icon: Megaphone, countKey: "announce_cnt" as const, getCount: (u) => u.announce_cnt, },
    { key: "chat", label: "私信", icon: MessageSquare, countKey: null, getCount: () => null, actions: null },
];


export function NotificationCenter() {
    const [activeKey, setActiveKey] = useState<NotifySection | null>(null);
    const { open, setOpen } = useMessages()

    const {data: unread = initialUnreadCnt, isLoading: unreadLoading, refetch} = useUnreadCount(open)
    const qLikeCollect = useLikeCollectSection(open, activeKey);
    const qCommentMention = useCommentMentionSection(open, activeKey);
    const qFan = useFanSection(open, activeKey);
    const qSys = useSysSection(open, activeKey);
    const qAnnounce = useAnnounceSection(open, activeKey);

    const current = useMemo(() => {
        switch (activeKey) {
            case "like_collect": return qLikeCollect;
            case "comment_mention": return qCommentMention;
            case "fan": return qFan;
            case "sys": return qSys;
            case "announce": return qAnnounce;
            default: return null;
        }
    }, [activeKey, qLikeCollect, qCommentMention, qFan, qSys, qAnnounce]);



    const totalUnread =
        unread.sys_cnt + unread.announce_cnt + unread.fan_cnt +
        unread.like_cnt + unread.collect_cnt + unread.comment_cnt +
        unread.invite_cnt + unread.mention_cnt;

    const handleReadAll = async () => {
        await resetAllUnreadCountApi()
        refetch()
     };


    const activeSection = [...sections, ...bottomItems].find((s) => s.key === activeKey);

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) setActiveKey(null); setOpen(v); }}>
            <DialogContent className="w-screen h-[100dvh] sm:max-w-[400px] sm:h-[80vh] max-w-none p-0 gap-0 sm:rounded-lg [&>button.absolute]:hidden">
                {activeKey ? (
                    <RemindDetailPanel
                        title={activeSection.label}
                        items={current.items}
                        hasMore={false}
                        loading={false}
                        onLoadMore={() => { }}
                        onBack={() => {
                            setActiveKey(null)
                            refetch()
                        } }
                        onItemClick={() => { }}
                    />
                ) : (
                    <div className="flex flex-col">
                        <DialogHeader className="px-4 pt-4 pb-3 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <DialogTitle>消息</DialogTitle>
                                    {totalUnread > 0 && (
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                            {totalUnread}
                                        </span>
                                    )}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                            <EllipsisVertical className="h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={handleReadAll}>
                                            <Check className="mr-2 h-4 w-4" />
                                            全部已读
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </DialogHeader>

                        {/* Top 3 sections */}
                        <div className="grid grid-cols-3 gap-2 p-3">
                            {sections.map((sec) => {
                                const count = sec.getCount(unread);
                                const Icon = sec.icon;
                                return (
                                    <button
                                        key={sec.key}
                                        className={cn(
                                            "flex flex-col items-center gap-1.5 rounded-xl p-3 transition-colors",
                                            "hover:bg-muted/60 active:bg-muted"
                                        )}
                                        onClick={() => setActiveKey(sec.key)}
                                    >
                                        <div className="relative">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                <Icon className="h-5 w-5 text-foreground" />
                                            </div>
                                            {count > 0 && (
                                                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 bg-[#ff6699] items-center justify-center rounded-full px-1 text-[10px] font-medium text-white">
                                                    {count > 99 ? "99+" : count}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">{sec.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Bottom list */}
                        <div className="border-t">
                            {bottomItems.map((item) => {
                                const Icon = item.icon;
                                const count = item.countKey ? unread[item.countKey] : 0;
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => setActiveKey(item.key)}
                                        className={cn(
                                            "flex w-full items-center gap-3 px-4 py-3 transition-colors",
                                            "hover:bg-muted/50 active:bg-muted",
                                            "border-b last:border-b-0"
                                        )}
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted shrink-0">
                                            <Icon className="h-4.5 w-4.5 text-foreground" />
                                        </div>
                                        <span className="flex-1 text-sm font-medium text-foreground text-left">
                                            {item.label}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            {count > 0 && (
                                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff6699] px-1.5 text-[10px] font-medium text-white">
                                                    {count > 99 ? "99+" : count}
                                                </span>
                                            )}
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}