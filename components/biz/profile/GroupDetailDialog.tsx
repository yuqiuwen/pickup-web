import { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSelect } from "@/components/biz/common/UserSelect";

import {
    Users,
    Crown,
    Shield,
    User,
    Pencil,
    Trash2,
    UserPlus,
    MoreHorizontal,
    Image,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { ShareGroup, SimpleUser } from "@/types/auth";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Controller, useForm } from "react-hook-form";
import { createGroupApi, getGroupDetailApi } from "@/lib/api/sys";
import { GroupFormValues, groupSchema } from "@/lib/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { MemberRole, roleConfig } from "@/lib/constant"
import { UserAvatar } from "@/components/biz/common/UserAvatar";

interface GroupMember {
    id: number;
    name: string;
    avatar?: string;
    email?: string;
    role: "owner" | "admin" | "member";
    joined_at: string;
}

interface GroupDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: string;
    onUpdate?: () => void;
}

const defaultForm = (): GroupFormValues => {
    return {
        name: "",
        description: undefined,
        cover: undefined,
        is_public: false,
        owner_id: undefined,
        members: []
    }
}

export function GroupDetailDialog({
    open,
    onOpenChange,
    groupId,
    onUpdate,
}: GroupDetailDialogProps) {
    const { user } = useAuth();
    if (!user) return


    const [activeTab, setActiveTab] = useState("members");
    const [isEditing, setIsEditing] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteMembers, setInviteMembers] = useState<number[]>([]);
    const [initialUsers, setInitialUser] = useState<SimpleUser[]>([]);
    const form = useForm<GroupFormValues>({
        resolver: zodResolver(groupSchema),
        defaultValues: defaultForm(),
        mode: "onSubmit",
    });
    const cover = form.watch("cover");
    const name = form.watch("name");
    const members = form.watch("members") ?? [];
    const member_count = members?.length || 0;
    const isSubmitting = form.formState.isSubmitting;


    useEffect(() => {
        if (!groupId) return;

        (async () => {
            const {data} = await getGroupDetailApi(groupId)
            const newData = {
                ...data,
                members: data.members.map(item => item.user_id)
            }
            setInitialUser(data.members.map(item => ({...item.user, group_role: item.role})))
            form.reset(newData)
        })()
    }, [groupId])

    const userRole = user.id === form.getValues("owner_id") ? MemberRole.OWNER : MemberRole.MEMBER
    const canManage = userRole === MemberRole.OWNER;
    const isOwner = userRole === MemberRole.OWNER;


    const onClose = () => {
        form.reset()
        onOpenChange(false)

    }

    const handleSubmit = async (data: GroupFormValues) => {
        const payload = {
            ...data,
            is_public: data.is_public ? 1 : 0
        }
        await createGroupApi(payload)

        toast.success("创建成功");
        onClose()
        onUpdate?.();
    };



    const handleSaveEdit = async () => {


        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            toast.success("保存成功");
            setIsEditing(false);
            onUpdate?.();
        } catch (error) {
            toast.error("保存失败");
        }
    };

    const handleInvite = async () => {
        if (inviteMembers.length === 0) {
            toast.error("请选择要邀请的成员");
            return;
        }

        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            // FIXME: 邀请成员
            const users = []
            toast.success(`已邀请 ${users.map((u) => u.name).join("、")}`);
            setInviteMembers([]);
            setShowInvite(false);
        } catch (error) {
            toast.error("邀请失败");
        }
    };

    const handleRemoveMember = async (member: GroupMember) => {
        if (member.role === MemberRole.MEMBER) {
            toast.error("无法移除群主");
            return;
        }

        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            toast.success(`已移除 ${member.name}`);
            onUpdate?.();
        } catch (error) {
            toast.error("操作失败");
        }
    };

    const handleSetAdmin = async (member: GroupMember) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            toast.success(
                `已将 ${member.name} ${member.role === MemberRole.OWNER ? "取消群主" : "设为群主"}`
            );
            onUpdate?.();
        } catch (error) {
            toast.error("操作失败");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg ">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                {cover ? (
                                    <img
                                        src={cover}
                                        alt={name}
                                        className="h-full w-full rounded-xl object-cover"
                                    />
                                ) : (
                                    <Users className="h-5 w-5 text-primary" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium">{name}</h3>
                                <p className="text-xs text-muted-foreground font-normal">
                                    {member_count} 成员
                                </p>
                            </div>
                        </div>

                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full">
                        <TabsTrigger value="members" className="flex-1">
                            成员
                        </TabsTrigger>
                        {canManage && (
                            <TabsTrigger value="settings" className="flex-1">
                                设置
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Members Tab */}
                    <TabsContent value="members" className="mt-4">
                        {/* Invite button */}
                        {canManage && (
                            <div className="mb-4">
                                {showInvite ? (
                                    <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                                        <UserSelect
                                            value={inviteMembers}
                                            onChange={setInviteMembers}
                                            multiple={true}
                                            placeholder="搜索并邀请成员..."
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setShowInvite(false);
                                                    setInviteMembers([]);
                                                }}
                                            >
                                                取消
                                            </Button>
                                            <Button size="sm" onClick={handleInvite}>
                                                邀请
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => setShowInvite(true)}
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        邀请成员
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Member list */}
                        <ScrollArea className="h-64">
                            <div className="space-y-2">
                                {initialUsers.map((member) => {
 
                                    const config = roleConfig[member.group_role] ?? roleConfig[MemberRole.MEMBER];;
                                    const RoleIcon = config.icon;

                                    return (
                                        <div
                                            key={member.id}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <UserAvatar user={member} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm truncate">
                                                        {member.username}
                                                    </span>
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs flex items-center gap-1"
                                                    >
                                                        <RoleIcon className={cn("h-3 w-3", config.color)} />
                                                        {config.label}
                                                    </Badge>
                                                </div>
                                                {member.email && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {member.email}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions for non-owner */}
                                            {isOwner && member.group_role !== MemberRole.OWNER && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => handleSetAdmin(member)}
                                                        >
                                                            <Shield className="h-4 w-4 mr-2" />
                                                            {member.group_role === MemberRole.OWNER
                                                                ? "取消群主"
                                                                : "设为群主"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleRemoveMember(member)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            移除成员
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* Settings Tab */}
                    {canManage && (
                        <TabsContent value="settings" className="mt-4">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                    <div className="-mx-4 max-h-[50vh] overflow-y-auto px-4 space-y-4">
                                        {/* Name */}
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>名称</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="不超过20字符" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />


                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>描述</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="可选"
                                                            className="resize-none"
                                                            rows={3}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />


                                        {/* Is Public */}
                                        <FormField
                                            control={form.control}
                                            name="is_public"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>公开组</FormLabel>
                                                    <FormDescription>公开后其他用户可以搜索并申请加入</FormDescription>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />



                                        {/* Members */}
                                        <Controller
                                            name="members"
                                            control={form.control}
                                            render={({ field: { onChange, value, ref } }) => (
                                                <div className="space-y-2">
                                                    <Label>邀请成员</Label>
                                                    <UserSelect
                                                        value={value}
                                                        onChange={onChange}
                                                        multiple={true}
                                                        initialUsers={initialUsers}
                                                        placeholder="搜索并添加成员..."
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>


                                    <DialogFooter>

                                        {isOwner && (

                                            <>
                                                <div className="w-full flex flex-col gap-2 pt-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            onClose();

                                                        }}
                                                    >
                                                        取消
                                                    </Button>
                                                    <Button type="submit" disabled={isSubmitting}>保存</Button>

                                                    <Separator />
                                                    <Button variant="destructive" size="sm" className="w-full text-white">
                                                        <Trash2 className="h-4 w-4" />
                                                        解散组
                                                    </Button>
                                                </div>

                                            </>
                                        )}

                                    </DialogFooter>

                                </form>
                            </Form>



                        </TabsContent>
                    )}
                </Tabs>

            </DialogContent>
        </Dialog >
    );
}
