"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem as ShadcnFormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PasswordInput } from "@/components/custom/password-input";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRSAKeyStore } from "@/stores/rsa-key-store";
import { sendEmailCodeApi } from "@/lib/api/sys";
import { toast } from "sonner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  RESET_DEFAULTS,
  resetPasswordSchema,
  ResetPasswordValues,
} from "@/lib/schema/auth";
import { rsaEncrypt } from "@/utils/rsa";
import { EmailBizEnum } from "@/lib/constant";
import { UpdateUserSettingsApi } from "@/lib/api/user";

/** 开关值：严格 OFF/on */
type OnOff = "OFF" | "ON";
const toOnOff = (checked: boolean): OnOff => (checked ? "ON" : "OFF");
const toChecked = (value: OnOff | undefined): boolean => value === "ON";

/** ========== Item（设置行）组件 ========== */
function Item(props: {
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  const { title, description, right } = props;
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div className="min-w-0">
        <div className="text-sm font-medium leading-6">{title}</div>
        {description ? (
          <div className="mt-1 text-sm text-muted-foreground leading-6">
            {description}
          </div>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

/** ========== RHF 开关字段（OFF/on） ========== */
function OnOffSwitchField(props: {
  form: ReturnType<typeof useForm<any>>;
  name: string;
  label: string;
  description?: string;
}) {
  const { form, name, label, description } = props;

  const onChange = async (field, checked) => {
    const next = toOnOff(checked)     
    field.onChange(next)
    const prev = field.prev
    try {
      const paylod = [{name, value: next}]
      await UpdateUserSettingsApi(paylod)
    } catch (e) {
      field.onChange(prev)
    } finally {

    }
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <ShadcnFormItem className="flex items-center justify-between gap-6 py-4">
          <div className="min-w-0">
            <FormLabel className="text-sm font-medium">{label}</FormLabel>
            {description ? (
              <FormDescription className="mt-1">{description}</FormDescription>
            ) : null}
          </div>
          <FormControl>
            <Switch
              checked={toChecked(field.value as OnOff)}
              onCheckedChange={(checked) =>  {
                onChange(field, checked)
              }}
            />
          </FormControl>
        </ShadcnFormItem>
      )}
    />
  );
}

/** ========== Dialog：修改邮箱 ========== */
const changeEmailSchema = z
  .object({
    oldEmail: z.email("请输入正确的旧邮箱"),
    code: z.string().min(4, "请输入邮箱验证码"),
    newEmail: z.email("请输入正确的新邮箱"),
    newEmailConfirm: z.email("请输入正确的新邮箱确认"),
  })
  .refine((v) => v.newEmail === v.newEmailConfirm, {
    message: "两次输入的新邮箱不一致",
    path: ["newEmailConfirm"],
  });

type ChangeEmailValues = z.infer<typeof changeEmailSchema>;

/** ========== Dialog：修改登录密码 ========== */
const changePasswordSchema = z
  .object({
    email: z.email("请输入正确的邮箱"),
    code: z.string().min(4, "请输入邮箱验证码"),
    newPassword: z.string().min(8, "新密码至少 8 位"),
    newPasswordConfirm: z.string().min(8, "新密码至少 8 位"),
  })
  .refine((v) => v.newPassword === v.newPasswordConfirm, {
    message: "两次输入的新密码不一致",
    path: ["newPasswordConfirm"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

/** ========== 通知设置 ========== */
const notificationSchema = z.object({
  ntfy_anniv_invite: z.enum(["ON", "OFF"]),
  ntfy_anniv_remind: z.enum(["ON", "OFF"]),
  ntfy_comment: z.enum(["ON", "OFF"]),
  ntfy_like_collect: z.enum(["ON", "OFF"]),
  ntfy_mention: z.enum(["ON", "OFF"]),
  ntfy_follow: z.enum(["ON", "OFF"]),
  ntfy_pickup_week: z.enum(["ON", "OFF"]),
  ntfy_pickup_month: z.enum(["ON", "OFF"]),
});

type NotificationValues = z.infer<typeof notificationSchema>;

/** ========== 隐私设置 ========== */
const privacySchema = z.object({
  privacy_unaccept_anniv_invite: z.enum(["ON", "OFF"]),
  privacy_hide_follow: z.enum(["ON", "OFF"]),
  privacy_hide_fan: z.enum(["ON", "OFF"]),
  privacy_hide_anniv: z.enum(["ON", "OFF"]),
  privacy_hide_pickup: z.enum(["ON", "OFF"]),
  privacy_hide_collect: z.enum(["ON", "OFF"]),
});

type PrivacyValues = z.infer<typeof privacySchema>;

export default function SettingsCenter() {
  /** Dialog open state */
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { user, userSettings, resetPassword, openLoginDrawer, refreshUserSettings } = useAuth();


  /** Drawer(Sheet) open state */
  const [favDrawerOpen, setFavDrawerOpen] = useState(false);

  useEffect(() => {

    (async () => {
        const data = await refreshUserSettings()
      if (data) {
        notificationForm.reset(data)
        privacyForm.reset(data)
      }

    })()
  }, [])


  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const changeEmailForm = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      oldEmail: "",
      code: "",
      newEmail: "",
      newEmailConfirm: "",
    },
    mode: "onSubmit",
  });

  const changePasswordForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
    defaultValues: {...RESET_DEFAULTS},
  });

  const notificationForm = useForm<NotificationValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
    ntfy_anniv_invite: "ON",        // 纪念日邀请
    ntfy_anniv_remind: "ON",        // 纪念日提醒
    ntfy_comment: "ON",             // 评论
    ntfy_like_collect: "ON",        // 点赞收藏
    ntfy_mention: "ON",             // 提及@
    ntfy_follow: "ON",              // 新增关注
    ntfy_pickup_week: "ON",         // 拾念周报
    ntfy_pickup_month: "ON",        // 拾念月报
    },
  });

  const privacyForm = useForm<PrivacyValues>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      privacy_unaccept_anniv_invite: "OFF",  // 不接受纪念日邀请
      privacy_hide_follow: "OFF",            // 隐藏我的关注
      privacy_hide_fan: "OFF",               // 隐藏我的粉丝
      privacy_hide_anniv: "OFF",                  // 隐藏纪念日
      privacy_hide_pickup: "OFF",                 // 隐藏拾念
      privacy_hide_collect: "OFF"
    },
  });

  const isChangePasswordSubmitting = changePasswordForm.formState.isSubmitting;

  const handleSendCode = async () => {
    const ok = await changePasswordForm.trigger("account");
    if (!ok) return;
    setIsSendingCode(true);
    try {
      await sendEmailCodeApi(
        changePasswordForm.getValues("account"),
        EmailBizEnum.VERIFY_CODE_SET_PWD
      );
      toast.success("验证码已发送", {
        description: "请查看您的邮箱",
      });
      setCountdown(60);
    } catch (error) {
      toast.error("发送失败", {
        description:
          error instanceof Error ? error.message : "发送验证码失败，请稍后重试",
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const onResetSubmit = async (values: ResetPasswordValues) => {
    await resetPassword({
      ...values,
      validate_way: "code",
    }, false);

    onOpenPasswordDialogChange(false)
    openLoginDrawer();
  };

  const onOpenPasswordDialogChange = (open: boolean) => {
    if (open) {
      changePasswordForm.reset({...RESET_DEFAULTS, account: user?.email || ""});
    } else {
      changePasswordForm.reset();
    }
    setPasswordDialogOpen(open);
  };

  return (
    <AppLayout>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="">个人中心</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>偏好设置</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="">
        <Tabs defaultValue="security">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="security">账号与安全</TabsTrigger>
            <TabsTrigger value="general">通用设置</TabsTrigger>
            <TabsTrigger value="notifications">通知设置</TabsTrigger>
            <TabsTrigger value="privacy">隐私设置</TabsTrigger>
          </TabsList>

          {/* ========== 账号与安全 ========== */}
          <TabsContent value="security" className="mt-6">
            <div className="rounded-lg border bg-card">
              <div className="px-6">
                {/* 邮箱 */}
                <Item
                  title="邮箱"
                  description="用于登录、找回密码与安全通知。"
                  right={
                    <Dialog
                      open={emailDialogOpen}
                      onOpenChange={setEmailDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">修改</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>修改邮箱</DialogTitle>
                          <DialogDescription>
                            请输入旧邮箱、验证码并绑定新邮箱。
                          </DialogDescription>
                        </DialogHeader>

                        <Form {...changeEmailForm}>
                          <form
                            className="space-y-4"
                            onSubmit={changeEmailForm.handleSubmit((values) => {
                              // TODO: 接入接口
                              console.log("changeEmail submit:", values);
                              setEmailDialogOpen(false);
                              changeEmailForm.reset();
                            })}
                          >
                            <FormField
                              control={changeEmailForm.control}
                              name="oldEmail"
                              render={({ field }) => (
                                <ShadcnFormItem>
                                  <FormLabel>旧邮箱</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="name@domain.com"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </ShadcnFormItem>
                              )}
                            />

                            <FormField
                              control={changeEmailForm.control}
                              name="code"
                              render={({ field }) => (
                                <ShadcnFormItem>
                                  <FormLabel>邮箱验证码</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="请输入验证码"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </ShadcnFormItem>
                              )}
                            />

                            <FormField
                              control={changeEmailForm.control}
                              name="newEmail"
                              render={({ field }) => (
                                <ShadcnFormItem>
                                  <FormLabel>新邮箱</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="new@domain.com"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </ShadcnFormItem>
                              )}
                            />

                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setEmailDialogOpen(false);
                                  changeEmailForm.reset();
                                }}
                              >
                                取消
                              </Button>
                              <Button type="submit">保存</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  }
                />

                <Separator />

                {/* 登录密码 */}
                <Item
                  title="登录密码"
                  description="定期修改密码可提升账号安全。"
                  right={
                    <Dialog
                      open={passwordDialogOpen}
                      onOpenChange={onOpenPasswordDialogChange}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">修改</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>修改登录密码</DialogTitle>
                          <DialogDescription>
                            通过邮箱验证码验证后设置新密码。
                          </DialogDescription>
                        </DialogHeader>

                        <Form {...changePasswordForm}>
                          <form
                            className="space-y-4"
                            onSubmit={changePasswordForm.handleSubmit(
                              onResetSubmit
                            )}
                          >
                            <FormField
                              control={changePasswordForm.control}
                              name="account"
                              render={({ field }) => (
                                <ShadcnFormItem>
                                  <FormLabel>邮箱</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="name@domain.com"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </ShadcnFormItem>
                              )}
                            />
                            <div className="">
                              <FormField
                                control={changePasswordForm.control}
                                name="code"
                                render={({ field }) => (
                                  <ShadcnFormItem>
                                    <FormLabel>邮箱验证码</FormLabel>
                                    <FormControl>
                                      <ButtonGroup className="w-full">
                                        <Input
                                          placeholder="请输入验证码"
                                          {...field}
                                        />

                                        <Button
                                          type="button"
                                          onClick={handleSendCode}
                                          disabled={
                                            isChangePasswordSubmitting ||
                                            isSendingCode ||
                                            countdown > 0
                                          }
                                        >
                                          {countdown > 0
                                            ? `${countdown}s`
                                            : isSendingCode
                                            ? "已发送"
                                            : "获取验证码"}
                                        </Button>
                                      </ButtonGroup>
                                    </FormControl>
                                    <FormMessage />
                                  </ShadcnFormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={changePasswordForm.control}
                              name="new_pwd"
                              render={({ field }) => (
                                <ShadcnFormItem>
                                  <FormLabel>新密码</FormLabel>
                                  <FormControl>
                                    <PasswordInput
                                      placeholder="至少 8 位"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </ShadcnFormItem>
                              )}
                            />

                            <FormField
                              control={changePasswordForm.control}
                              name="confirm_pwd"
                              render={({ field }) => (
                                <ShadcnFormItem>
                                  <FormLabel>再次确认新密码</FormLabel>
                                  <FormControl>
                                    <PasswordInput
                                      placeholder="再次输入新密码"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </ShadcnFormItem>
                              )}
                            />

                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setPasswordDialogOpen(false);
                                  changePasswordForm.reset();
                                }}
                              >
                                取消
                              </Button>
                              <Button type="submit">保存</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  }
                />

                <Separator />

                {/* 登录设备管理（预留） */}
                <Item
                  title="登录设备管理"
                  description="查看并管理已登录的设备。"
                  right={
                    <Button variant="outline" disabled>
                      预留
                    </Button>
                  }
                />

                <Separator />

                {/* 注销账号（预留） */}
                <Item
                  title="注销账号"
                  description="永久删除账号相关数据（谨慎操作）。"
                  right={
                    <Button variant="destructive" disabled>
                      预留
                    </Button>
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* ========== 通用设置（预留） ========== */}
          <TabsContent value="general" className="mt-6">
            <div className="rounded-lg border bg-card p-6">
              <div className="mt-2 text-sm text-muted-foreground">预留</div>
            </div>
          </TabsContent>

          {/* ========== 通知设置 ========== */}
          <TabsContent value="notifications" className="mt-6">
            <div className="rounded-lg border bg-card">
              <div className="px-6">
                <Form {...notificationForm}>
                  <form>
                    <OnOffSwitchField
                      form={notificationForm}
                      name="ntfy_comment"
                      label="评论"
                    />
                    <Separator />

                    <OnOffSwitchField
                      form={notificationForm}
                      name="ntfy_mention"
                      label="@"
                    />
                    <Separator />

                    <OnOffSwitchField
                      form={notificationForm}
                      name="ntfy_like_collect"
                      label="点赞收藏"
                    />
                    <Separator />

                    <OnOffSwitchField
                      form={notificationForm}
                      name="ntfy_follow"
                      label="新增关注"
                    />
                    <Separator />

                    <OnOffSwitchField
                      form={notificationForm}
                      name="ntfy_anniv_invite"
                      label="纪念日邀请"
                    />
                    <Separator />

                    <OnOffSwitchField
                      form={notificationForm}
                      name="ntfy_anniv_remind"
                      label="纪念日提醒"
                      description="默认开启"
                    />
                    <Separator />

                    <OnOffSwitchField
                      form={notificationForm}
                      name="ntfy_pickup_week"
                      label="拾念周报"
                    />
                    <Separator />

                    <OnOffSwitchField
                      form={notificationForm}
                      name="ntfy_pickup_month"
                      label="拾念月报"
                    />
                  </form>
                </Form>
              </div>
            </div>
          </TabsContent>

          {/* ========== 隐私设置 ========== */}
          <TabsContent value="privacy" className="mt-6">
            <div className="rounded-lg border bg-card">
              <div className="px-6">

                {/* 隐藏我的关注 */}
                <Form {...privacyForm}>
                  <form>
                  <OnOffSwitchField
                      form={privacyForm}
                      name="privacy_hide_collect"
                      label="隐藏我的收藏"
                    />
                    <Separator />

                    <OnOffSwitchField
                      form={privacyForm}
                      name="privacy_hide_follow"
                      label="隐藏我的关注"
                    />
                    <Separator />

                    <OnOffSwitchField
                      form={privacyForm}
                      name="privacy_hide_fan"
                      label="隐藏我的粉丝"
                    />
                  </form>
                </Form>

                <Separator />

                {/* 黑名单（预留） */}
                <Item
                  title="黑名单"
                  description="管理被你屏蔽的用户。"
                  right={
                    <Button variant="outline" disabled>
                      预留
                    </Button>
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
