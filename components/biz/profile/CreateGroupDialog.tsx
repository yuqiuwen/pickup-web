import { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserSelect } from "@/components/biz/common/UserSelect";
import { Users, Image } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { GroupFormValues, groupSchema, userFormSchema } from "@/lib/schema/user";
import { createGroupApi } from "@/lib/api/sys";
import { Form, FormLabel, FormControl, FormMessage, FormItem, FormField, FormDescription } from "@/components/ui/form";

interface CreateGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}


const defaultForm = (): GroupFormValues => {
    return {
        name: "",
        description: undefined,
        cover: undefined,
        is_public: false,
        members: []
    }
}

export function CreateGroupDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateGroupDialogProps) {

    const form = useForm({
        resolver: zodResolver(groupSchema),
        defaultValues: defaultForm(),
        mode: "onSubmit",
    });
    const isSubmitting = form.formState.isSubmitting;

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
        onSuccess?.();
    };

    return (
        <Dialog open={open} onOpenChange={(open: boolean) => {
            if (!open) onClose()
            onOpenChange(open)
        }}>

            <DialogContent className="sm:max-w-lg ">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        创建组
                    </DialogTitle>
                </DialogHeader>
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
                                            placeholder="搜索并添加成员..."
                                        />
                                    </div>
                                )}
                            ></Controller>
                        </div>




                        <DialogFooter>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        onClose();

                                    }}
                                >
                                    取消
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "创建中..." : "创建"}
                                </Button>
                            </div>

                        </DialogFooter>

                    </form>
                </Form>
            </DialogContent>

        </Dialog>

    );
}
