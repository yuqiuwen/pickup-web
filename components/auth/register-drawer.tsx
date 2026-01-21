"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendEmailCodeApi } from "@/lib/api/sys";
import { rsaEncrypt } from "@/utils/rsa";
import { useRSAKeyStore } from "@/stores/rsa-key-store";
import { Form, FormDescription } from "@/components/ui/form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { X } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useForm } from "react-hook-form";
import { signupSchema, SignupValues } from "@/lib/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "../custom/password-input";
import Link from "next/link";
import { EmailBizEnum } from "@/lib/constant";

interface RegisterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}

export function RegisterDrawer({
  open,
  onOpenChange,
  onSwitchToLogin,
}: RegisterDrawerProps) {
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);
  const { register } = useAuth();
  const { getPublicKey } = useRSAKeyStore();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit",
    defaultValues: {
      auth_type: 3,
      username: "",
      account: "",
      code: "",
      pwd: "",
      confirm_pwd: "",
    },
  });
  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (open) {
      (async () => {
        const key = await getPublicKey("user_pwd");
        setPublicKey(key);
      })();
    }
  }, [open, getPublicKey]);

  const handleDrawerOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
      setPublicKey(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSendCode = async () => {
    const ok = await form.trigger("account");
    if (!ok) return;
    setIsSendingCode(true);
    try {
      await sendEmailCodeApi(form.getValues("account"), EmailBizEnum.VERIFY_CODE_LOGIN);
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

  const onSubmit = async (values: SignupValues) => {
    try {
      const encryptedPwd = await rsaEncrypt(values.pwd, publicKey as CryptoKey);
      await register({
        auth_type: 3, // email
        username: values.username,
        account: values.account,
        pwd: encryptedPwd,
        code: values.code,
      });
      handleDrawerOpenChange(false);
    } finally {
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={handleDrawerOpenChange}
      direction="bottom"
      snapPoints={[1]}
    >
      <DrawerContent
        className="!fixed !inset-0 !m-0 !h-[100dvh] !max-h-[100dvh]
               !w-screen !max-w-none !rounded-none !border-0 p-0
               "
      >
        <DrawerTitle></DrawerTitle>

        <DrawerDescription></DrawerDescription>

        {/* 自定义关闭按钮 - 左上角 */}
        <div className="sticky top-0 z-40 h-16 flex items-center bg-gray-50 px-6 backdrop-blur">
          <DrawerClose asChild>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/80 backdrop-blur shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </DrawerClose>
        </div>
        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <div className="flex min-h-full items-start justify-center">
            <div className="mx-auto w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
              <div className="text-center">
                <h2 className="text-3xl font-bold">注册</h2>
                <p className="mt-2 text-sm text-gray-600">
                  创建您的账户，开始使用
                </p>
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-8 space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="请输入用户名"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="account"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="请输入邮箱"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex w-full items-center gap-2">
                            <Input
                              {...field}
                              type="text"
                              placeholder="请输入验证码"
                              disabled={isSubmitting}
                              className="flex-1"
                            />

                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleSendCode}
                              disabled={
                                isSubmitting || isSendingCode || countdown > 0
                              }
                              className="shrink-0 whitespace-nowrap"
                            >
                              {countdown > 0
                                ? `${countdown}s`
                                : isSendingCode
                                ? "已发送"
                                : "获取验证码"}
                            </Button>
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pwd"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <PasswordInput
                            {...field}
                            placeholder="请输入密码"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          8-20 个字符，仅支持英文、数字、下划线、短横线
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirm_pwd"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <PasswordInput
                            {...field}
                            placeholder="请确认密码"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "注册中..." : "注册"}
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    <span className="">已有账户？</span>{" "}
                    <button
                      type="button"
                      className="underline cursor-pointer"
                      onClick={() => {
                        form.reset();
                        onOpenChange(false);
                        onSwitchToLogin?.();
                      }}
                    >
                      立即登录
                    </button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
