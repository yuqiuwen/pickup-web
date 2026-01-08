"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/contexts/auth-context";
import { useRSAKeyStore } from "@/stores/rsa-key-store";
import { rsaEncrypt } from "@/utils/rsa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/custom/password-input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";

import {
  LOGIN_DEFAULTS,
  loginSchema,
  RESET_DEFAULTS,
  type LoginValues,
} from "@/lib/schema/auth";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/schema/auth";
import { sendEmailCodeApi } from "@/lib/api/sys";

interface LoginDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister?: () => void;
}

type View = "login" | "reset";

export function LoginDrawer({
  open,
  onOpenChange,
  onSwitchToRegister,
}: LoginDrawerProps) {
  const [view, setView] = useState<View>("login");

  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { getPublicKey } = useRSAKeyStore();
  const { login, resetPassword } = useAuth();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: LOGIN_DEFAULTS,
  });

  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
    defaultValues: RESET_DEFAULTS,
  });

  const isLoginSubmitting = loginForm.formState.isSubmitting;
  const isResetSubmitting = resetForm.formState.isSubmitting;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (!open) return;
    if (view !== "login") return;

    (async () => {
      const key = await getPublicKey("user_pwd");
      if (!key) {
        toast.error("缺失密钥");
        return;
      }
      setPublicKey(key);
    })();
  }, [open, view, getPublicKey]);

  const handleDrawerOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // 关闭时统一清理
      loginForm.reset();
      resetForm.reset();
      setPublicKey(null);
      setView("login");
    }
    onOpenChange(nextOpen);
  };

  const onLoginSubmit = async (values: LoginValues) => {
    if (!publicKey) {
      toast.error("登录失败，缺失密钥");
      return;
    }

    const encryptedPwd = await rsaEncrypt(values.code, publicKey);
    await login({
      account: values.account,
      code_type: values.code_type,
      code: encryptedPwd,
    });

    handleDrawerOpenChange(false);
  };

  const handleSendResetCode = async () => {
    const ok = await resetForm.trigger("account");
    if (!ok) return;
    try {
      setIsSendingCode(true);
      const email = resetForm.getValues("account").trim();
      await sendEmailCodeApi(email, "set_pwd");

      toast.success("验证码已发送", {
        description: "请查看您的邮箱",
      });
      setCountdown(60);
    } finally {
      setIsSendingCode(false);
    }
  };

  const onResetSubmit = async (values: ResetPasswordValues) => {
    // if (!publicKey) {
    //     toast.error("重置密码失败，缺失密钥");
    //     return;
    //   }
    // const encryptedPwd = await rsaEncrypt(values.new_pwd, publicKey);
    await resetPassword(
      {
        ...values,
        validate_way: "code",
      },
      false
    );

    resetForm.reset();
    loginForm.reset({
      ...LOGIN_DEFAULTS,
      account: values.account,
      code: values.new_pwd,
    });
    setView("login");
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

        <div className="sticky top-0 z-40 flex h-16 items-center bg-gray-50 px-6 backdrop-blur">
          <DrawerClose asChild>
            <button
              type="button"
              className="absolute left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/80 backdrop-blur shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </DrawerClose>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <div className="flex min-h-full items-start justify-center">
            <div className="mx-auto w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
              <div className="text-center">
                <h2 className="text-3xl font-bold">
                  {view === "login" ? "登录" : "重置密码"}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {view === "login" ? "欢迎回来！请登录您的账户" : ""}
                </p>
              </div>

              {view === "login" && (
                <Form key="login" {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                    className="mt-8 space-y-6"
                    autoComplete="on"
                  >
                    <FormField
                      control={loginForm.control}
                      name="account"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="邮箱 / 账号"
                              disabled={isLoginSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              placeholder="请输入密码"
                              disabled={isLoginSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoginSubmitting}
                    >
                      {isLoginSubmitting ? "登录中..." : "登录"}
                    </Button>

                    <div className="flex flex-col items-center gap-2 p-2 text-sm text-gray-600">
                      <div>
                        <span>忘记密码？</span>{" "}
                        <button
                          type="button"
                          className="underline cursor-pointer"
                          onClick={() => {
                            // 切换到重置视图，同时清空重置表单
                            resetForm.reset(RESET_DEFAULTS);
                            setView("reset");
                          }}
                        >
                          重置密码
                        </button>
                      </div>

                      <div>
                        <span>还没有账户？</span>{" "}
                        <button
                          type="button"
                          onClick={() => {
                            handleDrawerOpenChange(false);
                            onSwitchToRegister?.();
                          }}
                          className="underline cursor-pointer"
                        >
                          立即注册
                        </button>
                      </div>
                    </div>
                  </form>
                </Form>
              )}
              {view === "reset" && (
                <Form key="reset" {...resetForm}>
                  <form
                    onSubmit={resetForm.handleSubmit(onResetSubmit)}
                    className="mt-8 space-y-6"
                  >
                    <FormField
                      control={resetForm.control}
                      name="account"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="请输入邮箱"
                              disabled={isResetSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={resetForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex w-full items-center gap-2">
                              <Input
                                {...field}
                                placeholder="请输入验证码"
                                disabled={isResetSubmitting}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="shrink-0 whitespace-nowrap"
                                onClick={handleSendResetCode}
                                disabled={
                                  isResetSubmitting ||
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={resetForm.control}
                      name="new_pwd"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              placeholder="请输入新密码"
                              disabled={isResetSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={resetForm.control}
                      name="confirm_pwd"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              placeholder="请确认新密码"
                              disabled={isResetSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isResetSubmitting}
                    >
                      {isResetSubmitting ? "提交中..." : "确认重置"}
                    </Button>

                    <div className="flex flex-col items-center gap-2 p-2 text-sm text-gray-600">
                      {view === "reset" && (
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              resetForm.reset(RESET_DEFAULTS);
                              setView("login");
                            }}
                            className="underline cursor-pointer"
                          >
                            返回登录
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
