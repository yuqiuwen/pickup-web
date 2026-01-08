"use client";

import { useAuth } from '@/contexts/auth-context';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';

export default function AnniversaryPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">纪念日管理</h1>
            <p className="mt-2 text-gray-600">
              记录和管理重要的日子
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            添加纪念日
          </Button>
        </div>

        {/* 即将到来的纪念日 */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold">即将到来</h2>
          </div>
          <div className="divide-y">
            {[
              { name: '生日', date: '2024-02-14', days: 15 },
              { name: '结婚纪念日', date: '2024-03-20', days: 49 },
              { name: '工作周年', date: '2024-04-01', days: 61 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{item.days}</p>
                  <p className="text-sm text-gray-500">天后</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 所有纪念日 */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold">所有纪念日</h2>
          </div>
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-medium">纪念日 #{item}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    2024-0{item}-15
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                      重要
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  编辑
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

