"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { sendEmailCodeApi } from '@/lib/api/sys';
import { rsaEncrypt } from '@/utils/rsa';
import { useRSAKeyStore } from '@/stores/rsa-key-store';

export default function RegisterPage() {
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);
  const { register } = useAuth();
  const { getPublicKey } = useRSAKeyStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    (async () => {
      const key = await getPublicKey('user_pwd');
      setPublicKey(key);
    })();
  }, [getPublicKey]);
  
  const handleSendCode = async () => {
    if (!email) {
      toast.error('邮箱错误', {
        description: '请先输入邮箱地址',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('邮箱格式错误', {
        description: '请输入有效的邮箱地址',
      });
      return;
    }

    setIsSendingCode(true);
    try {
      await sendEmailCodeApi(email, 'sign');
      toast.success('验证码已发送', {
        description: '请查看您的邮箱',
      });
      setCountdown(60);
    } catch (error) {
      toast.error('发送失败', {
        description: error instanceof Error ? error.message : '发送验证码失败，请稍后重试',
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !code || !password || !confirmPassword) {
      toast.error('表单错误', {
        description: '请填写所有字段',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('密码不匹配', {
        description: '两次输入的密码不一致',
      });
      return;
    }

    if (password.length < 6) {
      toast.error('密码太短', {
        description: '密码长度至少为 6 个字符',
      });
      return;
    }

    setIsLoading(true);
    try {
      const encryptedPwd = await rsaEncrypt(password, publicKey as CryptoKey);
      await register({ 
        auth_type: 3, // email
        username, 
        account: email, 
        pwd: encryptedPwd, 
        code 
      });
      // 获取重定向地址，如果没有则默认跳转到首页
      const from = searchParams?.get('from') || '/';
      router.push(from);
    } catch (error) {
      // 错误已在 API 层处理
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">注册</h2>
          <p className="mt-2 text-sm text-gray-600">
            创建您的账户，开始使用
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="code">验证码</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入验证码"
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={isLoading || isSendingCode || countdown > 0}
                  className="whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : isSendingCode ? '已发送' : '获取验证码'}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码（至少 6 位）"
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                disabled={isLoading}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '注册中...' : '注册'}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">已有账户？</span>{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              立即登录
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

