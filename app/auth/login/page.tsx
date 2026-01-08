"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { rsaEncrypt } from "@/utils/rsa";
import { useRSAKeyStore } from "@/stores/rsa-key-store";

export default function LoginPage() {
  const [account, setAccount] = useState("");
  const [code, setcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);

  const { login } = useAuth();
  const { getPublicKey } = useRSAKeyStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    (async () => {
      const key = await getPublicKey("user_pwd");
      setPublicKey(key);
    })();
  }, [getPublicKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      toast.error("登录失败，缺失密钥");
      return;
    }
    if (!account || !code) {
      toast.error("请填写所有字段");
      return;
    }

    setIsLoading(true);

    try {
      const encryptedPwd = await rsaEncrypt(code, publicKey as CryptoKey);
      const data = {
        account: account,
        auth_type: 2 as const,
        code_type: "pwd" as const,
        code: encryptedPwd,
      };
      await login(data);

      // 获取重定向地址，如果没有则默认跳转到首页
      const from = searchParams?.get("from") || "/";
      router.push(from);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">登录</h2>
          <p className="mt-2 text-sm text-gray-600">欢迎回来！请登录您的账户</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="account">账号 / 邮箱</Label>
              <Input
                id="account"
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="请输入账号或邮箱"
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="code">密码</Label>
              <Input
                id="code"
                type="code"
                value={code}
                onChange={(e) => setcode(e.target.value)}
                placeholder="请输入密码"
                disabled={isLoading}
                className="mt-1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "登录中..." : "登录"}
          </Button>

          <div className="flex flex-col items-center gap-2 p-2 text-sm">
          <div>
          <span className="text-gray-600">忘记密码？</span>{" "}
            <Link
              href="/auth/reset-password"
              className="font-medium text-blue-500 hover:text-blue-400"
            >
              重置密码
            </Link>
          </div>
           
            <div>
            <span className="text-gray-600">还没有账户？</span>{" "}
            <Link
              href="/auth/register"
              className="font-medium text-blue-500 hover:text-blue-400"
            >
              立即注册
            </Link>
            
            </div>
            
          </div>
        </form>
      </div>
    </div>
  );
}
