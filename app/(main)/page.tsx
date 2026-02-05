"use client";

import { useAuth } from '@/contexts/auth-context';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { LoginDrawer } from '@/components/auth/login-drawer';
import { RegisterDrawer } from '@/components/auth/register-drawer';
import { toast } from 'sonner';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export default function HomePage() {
  const { 
    user, 
    isLoading, 
    loginDrawerOpen, 
    registerDrawerOpen, 
    openLoginDrawer, 
    openRegisterDrawer,
    closeLoginDrawer,
    closeRegisterDrawer,
  } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // 未登录时显示欢迎页面
  if (!user) {
    return (
      <>
        <AppLayout>
          <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">欢迎来到 Pickup</h1>
              <p className="mt-4 text-lg text-gray-600">
              俯首拾念，岁月生花
              </p>
            </div>
            <div className="flex gap-4">
              <Button size="lg" onClick={openLoginDrawer}>登录</Button>
              <Button size="lg" variant="outline" onClick={openRegisterDrawer}>注册</Button>
            </div>
          </div>
        </AppLayout>
        <LoginDrawer 
          open={loginDrawerOpen} 
          onOpenChange={closeLoginDrawer}
          onSwitchToRegister={openRegisterDrawer}
        />
        <RegisterDrawer 
          open={registerDrawerOpen} 
          onOpenChange={closeRegisterDrawer}
          onSwitchToLogin={openLoginDrawer}
        />
      </>
    );
  }

  // 已登录时显示用户主页
  return (
    <AppLayout>
      <div className="space-y-6">
        <Card>
          <h1 className="text-3xl font-bold">欢迎回来，{user.username}！</h1>
          <p className="mt-2 text-gray-600">
            这是您的主页，您可以在这里查看系统概览和最新动态。
          </p>
        </Card>

        <Card className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 统计卡片 */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">总览</h3>
            <p className="mt-2 text-3xl font-bold">123</p>
            <p className="mt-1 text-sm text-gray-600">系统总数据</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Pickup</h3>
            <p className="mt-2 text-3xl font-bold">45</p>
            <p className="mt-1 text-sm text-gray-600">待处理项目</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">纪念日</h3>
            <p className="mt-2 text-3xl font-bold">8</p>
            <p className="mt-1 text-sm text-gray-600">即将到来</p>
          </div>
        </Card>

        {/* 最近活动 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold">最近活动</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between pb-3">
              <div>
                <p className="font-medium">系统更新</p>
                <p className="text-sm text-gray-500">版本 1.0.0 已发布</p>
              </div>
              <span className="text-sm text-gray-400">2 小时前</span>
            </div>
            <div className="flex items-center justify-between  pb-3">
              <div>
                <p className="font-medium">新增功能</p>
                <p className="text-sm text-gray-500">支持角色权限控制</p>
              </div>
              <span className="text-sm text-gray-400">5 小时前</span>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

