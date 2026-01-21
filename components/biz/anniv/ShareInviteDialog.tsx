"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Users,
  Mail,
  UserPlus,
  UsersRound,
  Search,
  X,
  Check,
  Send,
  Copy,
  Link,
  Share2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ShareConfig {
  invite_external_users: string[];
  invite_app_users: string[];
  invite_groups: string[];
  message: string;
}

interface ShareInviteDialogProps {
  value?: ShareConfig;
  onChange: (config: ShareConfig) => void;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

interface AppUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

interface UserGroup {
  id: string;
  name: string;
  memberCount: number;
  avatar?: string;
}

// 模拟数据
const mockAppUsers: AppUser[] = [
  { id: "u1", name: "张三", avatar: "", email: "zhangsan@example.com" },
  { id: "u2", name: "李四", avatar: "", email: "lisi@example.com" },
  { id: "u3", name: "王五", avatar: "", email: "wangwu@example.com" },
  { id: "u4", name: "赵六", avatar: "", email: "zhaoliu@example.com" },
  { id: "u5", name: "钱七", avatar: "", email: "qianqi@example.com" },
];

const mockGroups: UserGroup[] = [
  { id: "g1", name: "家人", memberCount: 5 },
  { id: "g2", name: "闺蜜团", memberCount: 4 },
  { id: "g3", name: "同事", memberCount: 12 },
  { id: "g4", name: "大学同学", memberCount: 8 },
];

export const ShareInviteDialog: React.FC<ShareInviteDialogProps> = ({
  value = {
    invite_external_users: [],
    invite_app_users: [],
    invite_groups: [],
    message: "",
  },
  onChange,
  trigger,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [localConfig, setLocalConfig] = useState<ShareConfig>(value);
  const [isSending, setIsSending] = useState(false);

  // 同步外部值
  React.useEffect(() => {
    setLocalConfig(value);
  }, [value]);

  // 搜索用户
  const filteredUsers = searchQuery
    ? mockAppUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockAppUsers;

  // 搜索群组
  const filteredGroups = searchQuery
    ? mockGroups.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockGroups;

  // 添加邮箱
  const addEmail = () => {
    const email = emailInput.trim();
    if (!email) return;

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("请输入有效的邮箱地址");
      return;
    }

    if (localConfig.invite_external_users.includes(email)) {
      toast.error("该邮箱已添加");
      return;
    }

    setLocalConfig({
      ...localConfig,
      invite_external_users: [...localConfig.invite_external_users, email],
    });
    setEmailInput("");
  };

  // 移除邮箱
  const removeEmail = (email: string) => {
    setLocalConfig({
      ...localConfig,
      invite_external_users: localConfig.invite_external_users.filter(
        (e) => e !== email
      ),
    });
  };

  // 切换用户选择
  const toggleUser = (userId: string) => {
    const isSelected = localConfig.invite_app_users.includes(userId);
    setLocalConfig({
      ...localConfig,
      invite_app_users: isSelected
        ? localConfig.invite_app_users.filter((id) => id !== userId)
        : [...localConfig.invite_app_users, userId],
    });
  };

  // 切换群组选择
  const toggleGroup = (groupId: string) => {
    const isSelected = localConfig.invite_groups.includes(groupId);
    setLocalConfig({
      ...localConfig,
      invite_groups: isSelected
        ? localConfig.invite_groups.filter((id) => id !== groupId)
        : [...localConfig.invite_groups, groupId],
    });
  };

  // 获取选中的总人数
  const getSelectedCount = () => {
    return (
      localConfig.invite_external_users.length +
      localConfig.invite_app_users.length +
      localConfig.invite_groups.length
    );
  };

  // 确认邀请
  const handleConfirm = async () => {
    setIsSending(true);
    try {
      // 模拟发送延迟
      await new Promise((resolve) => setTimeout(resolve, 500));
      onChange(localConfig);
      setOpen(false);
      toast.success(`已发送 ${getSelectedCount()} 个邀请`);
    } catch (error) {
      toast.error("发送失败，请重试");
    } finally {
      setIsSending(false);
    }
  };

  // 复制邀请链接
  const copyInviteLink = async () => {
    const link = `${window.location.origin}/invite/${Date.now()}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("邀请链接已复制");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" disabled={disabled} className="gap-2">
            <Users className="h-4 w-4" />
            邀请成员
            {getSelectedCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getSelectedCount()}
              </Badge>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            邀请共同成员
          </DialogTitle>
          <DialogDescription>
            邀请好友或群组共同关注这个日程，他们将收到提醒通知
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="gap-1">
              <UserPlus className="h-4 w-4" />
              好友
              {localConfig.invite_app_users.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {localConfig.invite_app_users.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-1">
              <UsersRound className="h-4 w-4" />
              群组
              {localConfig.invite_groups.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {localConfig.invite_groups.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-1">
              <Mail className="h-4 w-4" />
              邮箱
              {localConfig.invite_external_users.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {localConfig.invite_external_users.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* 好友列表 */}
          <TabsContent value="users" className="mt-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索好友..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-[200px]">
                <div className="space-y-1">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const isSelected = localConfig.invite_app_users.includes(
                        user.id
                      );
                      return (
                        <div
                          key={user.id}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                            isSelected ? "bg-primary/10" : "hover:bg-muted"
                          )}
                          onClick={() => toggleUser(user.id)}
                        >
                          <Checkbox checked={isSelected} />
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {user.name}
                            </p>
                            {user.email && (
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>未找到好友</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* 群组列表 */}
          <TabsContent value="groups" className="mt-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索群组..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-[200px]">
                <div className="space-y-1">
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => {
                      const isSelected = localConfig.invite_groups.includes(
                        group.id
                      );
                      return (
                        <div
                          key={group.id}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                            isSelected ? "bg-primary/10" : "hover:bg-muted"
                          )}
                          onClick={() => toggleGroup(group.id)}
                        >
                          <Checkbox checked={isSelected} />
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                            {group.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {group.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {group.memberCount} 位成员
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <UsersRound className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>未找到群组</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* 邮箱邀请 */}
          <TabsContent value="email" className="mt-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="输入邮箱地址..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addEmail()}
                />
                <Button onClick={addEmail} disabled={!emailInput.trim()}>
                  添加
                </Button>
              </div>

              {localConfig.invite_external_users.length > 0 ? (
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2">
                    {localConfig.invite_external_users.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeEmail(email)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>通过邮箱邀请站外好友</p>
                  <p className="text-xs">他们会收到邀请邮件</p>
                </div>
              )}

              {/* 复制邀请链接 */}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={copyInviteLink}
                >
                  <Link className="h-4 w-4" />
                  复制邀请链接
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* 邀请留言 */}
        <div className="space-y-2">
          <Label>邀请留言（可选）</Label>
          <Textarea
            placeholder="添加一句邀请语..."
            value={localConfig.message}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, message: e.target.value })
            }
            rows={2}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={getSelectedCount() === 0 || isSending}
            className="gap-2"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            发送邀请 ({getSelectedCount()})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareInviteDialog;