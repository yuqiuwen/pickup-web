"use client";

import { useAuth } from '@/contexts/auth-context';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PickupPage() {

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pickup 管理</h1>
            <p className="mt-2 text-gray-600">
              管理您的 Pickup 项目和任务
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建 Pickup
          </Button>
        </div>

        {/* Pickup 列表 */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold">所有 Pickup</h2>
          </div>
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-medium">Pickup 项目 #{item}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    这是一个示例 Pickup 项目描述
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      进行中
                    </span>
                    <span className="text-xs text-gray-400">
                      创建于 2024-01-0{item}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  查看详情
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

