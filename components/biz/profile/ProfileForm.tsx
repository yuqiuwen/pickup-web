"use client";

import { useForm } from "react-hook-form";
import { userFormSchema, UserFormValues } from "@/lib/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Mars, Venus } from "lucide-react";
import { updateMeApi } from "@/lib/api/user";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export const userFormDefaults = (): UserFormValues => {
  return {
    username: "",
    birth: "",
    phone: "",
    email: "",
    introduce: "",
    gender: undefined,
    title: "",
  };
};
export default function ProfileForm({ open, onOpenChange, defaultValues }) {
  const form = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: defaultValues ?? userFormDefaults(),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues ?? userFormDefaults());
      const gender = form.getValues("gender");
      if (typeof gender === "number") {
        form.setValue("gender", String(gender));
      }
    }
  }, [open, defaultValues]);

  const isSubmitting = form.formState.isSubmitting;
  const onSubmit = async (data: UserFormValues) => {
    let body = Object.assign({}, data);
    if (typeof data.gender === "string") {
      if (data.gender !== "") {
        body.gender = Number(data.gender);
      } else {
        body.gender = null;
      }
    }

      await updateMeApi(body);
      toast.success("更新成功");
      handleOpenChange(false);

  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange?.(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="w-full
      sm:max-w-none
      md:w-[50vw]
      md:max-w-none"
      >
        <SheetHeader>
          <SheetTitle>编辑个人资料</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>

        <div className="p-4">
          <Form {...form}>
            <form
              id="profile-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="px-4"
            >
              <div className="space-y-6 ">
                {/* account 通常不允许改，这里只展示 */}

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>昵称</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入昵称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>生日</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>性别</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <ToggleGroupItem value="0" aria-label="女">
                            <Venus className="text-pink-500" />
                          </ToggleGroupItem>
                          <ToggleGroupItem value="1" aria-label="男">
                            <Mars className="text-blue-500" />
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>手机号</FormLabel>
              <FormControl>
                <Input
                  placeholder="可选"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="introduce"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>个人简介</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="写点自我介绍..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
        <SheetFooter>
          <Button type="submit" form="profile-form" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "保存"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
