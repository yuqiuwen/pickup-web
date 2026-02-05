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
  Heart,
  Star,
  Users,
  Plus,
  Sparkle,
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
import { CreateGroupDialog } from "@/components/biz/profile/CreateGroupDialog";
import { GroupDetailDialog } from "@/components/biz/profile/GroupDetailDialog";
import { ShareGroup } from "@/types/auth";
import { FavoriteItem, LikedItem } from "@/types/profile";
import { LikedCard } from "@/components/biz/profile/LikedCard";
import { FavoriteCard } from "@/components/biz/profile/FavoriteCard";
import { GroupCard } from "@/components/biz/profile/GroupCard";
import { useGroupSearch } from "@/hooks/use-group";
import { UserAvatar } from "@/components/biz/common/UserAvatar";
import { getUserStatsApi } from "@/lib/api/user";
import { UserStats } from "@/types/user";
import { Spinner } from "@/components/ui/spinner";
import { getLikesCollectApi } from "@/lib/api/relationship";


const defaultUserStats = {
  follow_cnt: 0,
  fan_cnt: 0,
  like_cnt: 0,
  collect_cnt: 0,
  comment_cnt: 0,
}


export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("groups");
  const [groups] = useState<ShareGroup[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [likes, setLikes] = useState<LikedItem[]>([]);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>(defaultUserStats)

  // Group dialogs
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupDetail, setShowGroupDetail] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ShareGroup | null>(null);
  const [loading, setLoading] = useState(false)
  const [likeData, setLikeData] = useState([])

  const { data: groupData, loading: groupLoading, loadData: loadGroupData } = useGroupSearch()

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRemoveLike = (id: string) => {
    setLikes((prev) => prev.filter((item) => item.id !== id));
  };

  const handleViewGroupDetail = (group: ShareGroup) => {
    setSelectedGroup(group);
    setShowGroupDetail(true);
  };

  const fetchLikesCollectList = async () => {
    const { data } = await getLikesCollectApi()
    setLikeData(data)
  }

  const handleTabChange = async (next: string) => {
    setActiveTab(next)
    switch (next) {
      case 'pickup':
        // TODO
        return

      case 'likes':
        await fetchLikesCollectList()

      case 'groups':
        loadGroupData()
    }

  }

  useEffect(() => {
    if (!user) return
    (async () => {
      const { data } = await getUserStatsApi()
      setUserStats(data)
    })()
  }, [user])

  if (!user) {
    return null;
  }


  const onOpenChangeProfileEdit = async () => {
    setShowProfileEdit(false);
    await refreshUser();
  };

  return (
    <AppLayout>

      <div className="flex flex-col gap-4 relative">
        {/* 左侧：概览卡片 */}
        <div className="flex flex-col items-center justify-center">
          <div>
            <div className="flex items-center justify-center gap-4">
              <UserAvatar user={user} size={80} />
              <div className="min-w-0 space-y-1">
                <div className="truncate">
                  {user.username}
                </div>
                <div className="truncate ">
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
                </div>

                <div className="truncate text-muted-foreground text-sm">
                  {user.introduce}
                </div>
              </div>

              <div className="min-w-0">
                <span className="truncate">{user.title}</span>
              </div>
            </div>




          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div>
                <span>{userStats.follow_cnt}</span>
                <span className="text-muted-foreground"> 关注</span>
              </div>
              <div>
                <span>{userStats.fan_cnt}</span>
                <span className="text-muted-foreground"> 粉丝</span>
              </div>
              <div>
                <span>{userStats.collect_cnt}</span>
                <span className="text-muted-foreground"> 收藏</span>
              </div>
              <div>
                <span>{userStats.like_cnt}</span>
                <span className="text-muted-foreground"> 点赞</span>
              </div>
            </div>


            <div className="flex gap-2 absolute top-0 right-0">
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


        </div>

        {/* 右侧：详情/编辑 */}
        <div>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-3 bg-transparent border-b rounded-none h-auto p-0 mb-6">
              <TabsTrigger
                value="pickup"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Sparkle className="h-4 w-4 mr-2" />
                拾念

              </TabsTrigger>
              <TabsTrigger
                value="groups"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Users className="h-4 w-4 mr-2" />
                组

              </TabsTrigger>

              <TabsTrigger
                value="likes"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Heart className="h-4 w-4 mr-2" />
                点赞收藏

              </TabsTrigger>
            </TabsList>

            <TabsContent value="groups">


            </TabsContent>

            {/* Groups Tab */}
            <TabsContent value="groups">
              {groupLoading ? <div className="flex items-center justify-center py-10">
                <Spinner className="h-4 w-4" />
              </div> : (
                <>
                  {!!groupData.length && <div className="flex items-center justify-between mb-4">
                    <div></div>
                    <Button
                      size="sm"
                      className="warm-gradient text-white"
                      onClick={() => setShowCreateGroup(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      创建组
                    </Button>
                  </div>}
                  <div className="space-y-3">
                    {groupData.map((group) => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        onViewDetail={handleViewGroupDetail}
                      />
                    ))}
                  </div>
                  {groupData.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>还没有加入任何组</p>
                      <Button

                        className="mt-2"
                        onClick={() => setShowCreateGroup(true)}
                      >
                        创建第一个组
                      </Button>
                    </div>
                  )}
                </>
              )}

            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <div className="flex items-center justify-between mb-4">
              </div>
              <div className="space-y-3">
                {favorites.map((item) => (
                  <FavoriteCard
                    key={item.id}
                    item={item}
                    onRemove={handleRemoveFavorite}
                  />
                ))}
              </div>
              {favorites.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>还没有收藏任何内容</p>
                  <p className="text-sm mt-1">浏览广场发现精彩内容</p>
                </div>
              )}
            </TabsContent>

            {/* Likes Tab */}
            <TabsContent value="likes">
              <div className="flex items-center justify-between mb-4">
              </div>
              <div className="space-y-3">
                {likes.map((item) => (
                  <LikedCard
                    key={item.id}
                    item={item}
                    onRemove={handleRemoveLike}
                  />
                ))}
              </div>
              {likes.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>还没有点赞任何内容</p>
                  <p className="text-sm mt-1">去广场发现有趣的人和事</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ProfileForm
        defaultValues={user}
        open={showProfileEdit}
        onOpenChange={onOpenChangeProfileEdit}
      />

      {/* Dialogs */}
      <CreateGroupDialog
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
        onSuccess={() => {
          // Refresh groups list
        }}
      />

      <GroupDetailDialog
        open={showGroupDetail}
        onOpenChange={setShowGroupDetail}
        groupId={selectedGroup?.id}
        onUpdate={() => {
          // Refresh groups list
        }}
      />
    </AppLayout>
  );
}
