"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AppLayout } from "@/components/layout/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Shield,
  Settings,
  UserRoundPen,
  Venus,
  Mars,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { userFormSchema, UserFormValues } from "@/lib/schema/user";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { formatTimestamp } from "@/utils/time";
import { useEffect, useState } from "react";
import ProfileForm from "@/components/biz/profile/ProfileForm";
import { Drawer, DrawerContent } from "@/components/ui/drawer";


export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  if (!user) {
    return null;
  }

  const userInitials = user.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const onOpenChangeProfileEdit = async () => {
    setShowProfileEdit(false);
    await refreshUser();
  };

  return (
    <AppLayout>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* 左侧：概览卡片 */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="truncate pb-2 px-1">
                  {user.username}
                </CardTitle>
                <CardDescription className="truncate">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">ID: {user.id}</Badge>
                    {user.gender === 0 ? (
                      <Venus size={16} className="text-pink-500" />
                    ) : user.gender == 1 ? (
                      <Mars size={16} className="text-blue-500" />
                    ) : (
                      ""
                    )}
                  </div>
                </CardDescription>
              </div>

              <div className="min-w-0">
                <CardTitle className="truncate">{user.title}</CardTitle>
              </div>
            </div>

            <CardDescription className="truncate">
              {user.introduce}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-wrap justify-between gap-2">
              <div> </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  className="h-8 w-14 rounded-full"
                  variant="outline"
                  onClick={() => setShowProfileEdit(!showProfileEdit)}
                >
                  <UserRoundPen />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">生日</span>
                <span className="font-medium">{user.birth}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">手机号</span>
                <span className="font-medium">{user.phone ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">邮箱</span>
                <span className="font-medium">{user.phone ?? "-"}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">注册时间</span>
                <span className="font-medium">
                  {formatTimestamp(user.ctime, "YYYY-MM-DD")}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="text-xs text-muted-foreground"></CardFooter>
        </Card>

        {/* 右侧：详情/编辑 */}
      </div>

      <ProfileForm
        defaultValues={user}
        open={showProfileEdit}
        onOpenChange={onOpenChangeProfileEdit}
      />
    </AppLayout>
  );
}
