import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from 'html2canvas-pro';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventBadge } from "@/components/custom/event-badge";
import { Copy, Download, Check, Link2, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import type { AnniversaryItemFeed } from "@/types/anniv";
import { cn } from "@/lib/utils";
import { RepeatType } from "@/lib/constant";
import { calcDiffDays } from "@/hooks/use-anniv-calc";
import { CountdownDisplay } from "@/components/custom/countdown-display";
import { UserGroupSelect } from "@/components/biz/common/UserGroupSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SimpleUser, ShareGroup } from "@/types/auth";
import { Textarea } from "@/components/ui/textarea";

interface SharePosterDialogProps {
  anniversary: AnniversaryItemFeed;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SharePosterDialog({
  anniversary,
  open,
  onOpenChange,
}: SharePosterDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const [selectedUsers, setSelectedUsers] = useState<SimpleUser[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<ShareGroup[]>([]);
  const [shareMessage, setShareMessage] = useState("");

  // Generate share URL
  const shareUrl = `${window.location.origin}/anniversary/${anniversary.id}`;


  const [diffDays, pastDays] = calcDiffDays(anniversary);
  const showPast = anniversary.repeat_type !== RepeatType.NONE && pastDays > 0;
  const selectedCount = selectedUsers.length + selectedGroups.length;


  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("链接已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("复制失败，请手动复制");
    }
  };
  const onClose = () => {
    setSelectedUsers([]);
    setSelectedGroups([]);
    setShareMessage("");
    onOpenChange(false);
  }

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      onClose()
    }
    onOpenChange(open)
  }

  const handleShareToUsersGroups = () => {
    if (selectedUsers.length === 0 && selectedGroups.length === 0) {
      toast.error("请选择至少一个用户或组");
      return;
    }

    // In a real app, this would call an API
    const shareData = {
      anniversary_id: anniversary.id,
      users: selectedUsers.map((u) => u.id),
      groups: selectedGroups.map((g) => g.id),
      message: shareMessage,
    };
    console.log("Sharing to users/groups:", shareData);

    toast.success(
      `已分享给 ${selectedUsers.length} 个用户和 ${selectedGroups.length} 个组`
    );

    // Reset and close
    onClose()
  };

  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `${anniversary.name}-分享海报.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("海报已保存");
    } catch (error) {
      console.log(error);
      toast.error("生成海报失败");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open: boolean) => handleDialogOpen(open)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>分享纪念日</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="poster" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="poster" className="gap-2">
              <Share2 className="h-4 w-4" />
              海报分享
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              分享给好友
              {selectedCount > 0 && (
                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
                  {selectedCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Poster Share Tab */}
          <TabsContent value="poster" className="space-y-4 mt-4">
            {/* Quick Actions */}
            <div className="flex gap-2 mb-4">
              <Button

                className="flex-1"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                {copied ? "已复制" : "复制链接"}
              </Button>
              <Button

                className="flex-1"
                onClick={handleDownloadPoster}
                disabled={isGenerating}
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? "生成中..." : "保存海报"}
              </Button>
            </div>


            {/* Poster Preview */}
            <div className="rounded-xl overflow-hidden shadow-medium">
              <div
                ref={posterRef}
                className={cn(
                  "p-6 relative",
                  anniversary.type === 1 && "bg-gradient-to-br from-anniversary/20 via-background to-anniversary/10",
                  anniversary.type === 2 && "bg-gradient-to-br from-birthday/20 via-background to-birthday/10",
                  anniversary.type === 3 && "bg-gradient-to-br from-countdown/20 via-background to-countdown/10"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <EventBadge type={anniversary.type} size="sm" />
                  <span className="text-xs text-muted-foreground font-medium">
                    拾念 · Pickup
                  </span>
                </div>

                {/* Main Content */}
                <div className="text-center py-4">
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {anniversary.name}
                  </h2>

                  {anniversary.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {anniversary.description}
                    </p>
                  )}

                  {/* Days Display */}
                  <div className="flex items-center justify-center gap-6 my-6">
                    <div className="text-center">
                      <div
                        className={cn(
                          "text-4xl font-bold ",
                          anniversary.type === 1 && "text-anniversary",
                          anniversary.type === 2 && "text-birthday",
                          anniversary.type === 3 && "text-countdown"
                        )}
                      >
                        <CountdownDisplay
                          days={diffDays}
                          isPast={diffDays < 0}
                          size="lg"
                        />
                      </div>
                    </div>

                    {showPast && (
                      <div className="text-center pl-6 border-l border-border">
                        <div className="flex items-center justify-center gap-1 text-primary">
                          <span className="text-5xl font-bold">{pastDays}</span>
                          <span className="text-sm">天</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          已过去
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-sm text-muted-foreground">
                    {anniversary.event_date}
                    {anniversary.location && ` · ${anniversary.location}`}
                  </div>
                </div>

                {/* Media */}
                {anniversary.medias.length > 0 && (
                  <div className="mt-4 rounded-lg overflow-hidden aspect-video bg-muted">
                    <img
                      src={anniversary.medias[0].url}
                      alt=""
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}

                {/* QR Code */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    扫码查看详情
                  </div>
                  <div className="p-2 bg-background rounded-lg shadow-sm border">
                    <QRCodeCanvas
                      value={shareUrl}
                      size={64}
                      level="M"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Share to Users/Groups Tab */}
          <TabsContent value="users" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* User/Group Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  选择好友或组
                </label>
                <UserGroupSelect
                  selectedUsers={selectedUsers}
                  selectedGroups={selectedGroups}
                  onSelectUser={(user) =>
                    setSelectedUsers([...selectedUsers, user])
                  }
                  onSelectGroup={(group) =>
                    setSelectedGroups([...selectedGroups, group])
                  }
                  onRemoveUser={(user) =>
                    setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id))
                  }
                  onRemoveGroup={(group) =>
                    setSelectedGroups(selectedGroups.filter((g) => g.id !== group.id))
                  }
                  placeholder="搜索我的好友或组..."
                />
              </div>

              {/* Share Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  分享留言（可选）
                </label>
                <Textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="附上一条留言..."
                  className="resize-none"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {shareMessage.length}/200
                </p>
              </div>

              {/* Preview Card */}
              <div className="rounded-lg border p-3 bg-muted/30">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center text-lg shrink-0",
                      anniversary.type === 1 && "bg-anniversary/20",
                      anniversary.type === 2 && "bg-birthday/20",
                      anniversary.type === 3 && "bg-countdown/20"
                    )}
                  >
                    {anniversary.type === 1 && "❤️"}
                    {anniversary.type === 2 && "🎂"}
                    {anniversary.type === 3 && "⏰"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {anniversary.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {anniversary.event_date}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {diffDays < 0
                        ? `已经过去 ${pastDays} 天`
                        : `还有 ${diffDays} 天`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Share Button */}
              <Button
                className="w-full"
                onClick={handleShareToUsersGroups}
                disabled={selectedCount === 0}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {selectedCount > 0
                  ? `分享给 ${selectedCount} 个好友/组`
                  : "请选择好友或组"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
