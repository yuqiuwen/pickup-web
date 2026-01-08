"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center">
          <ShieldAlert className="h-24 w-24 text-red-500" />
        </div>
        <h1 className="mt-6 text-4xl font-bold text-gray-900">403</h1>
        <h2 className="mt-2 text-2xl font-semibold text-gray-700">权限不足</h2>
        <p className="mt-4 text-gray-600">
          抱歉，您没有权限访问此页面。
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => router.back()} variant="outline">
            返回上页
          </Button>
          <Button onClick={() => router.push('/')}>
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}

