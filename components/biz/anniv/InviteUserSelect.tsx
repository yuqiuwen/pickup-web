// src/lib/components/share/InviteUserSelect.tsx

import React, { useState } from 'react';
import { X, Search, UserPlus, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Group {
  id: string;
  name: string;
  memberCount: number;
}

interface InviteUserSelectProps {
  appUsers: string[];
  externalEmails: string[];
  groups: string[];
  onAppUsersChange: (users: string[]) => void;
  onExternalEmailsChange: (emails: string[]) => void;
  onGroupsChange: (groups: string[]) => void;
}

// 模拟数据
const mockUsers: User[] = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', avatar: '' },
  { id: '2', name: '李四', email: 'lisi@example.com', avatar: '' },
];

const mockGroups: Group[] = [
  { id: '1', name: '家人', memberCount: 5 },
  { id: '2', name: '好友', memberCount: 10 },
];

export function InviteUserSelect({
  appUsers,
  externalEmails,
  groups,
  onAppUsersChange,
  onExternalEmailsChange,
  onGroupsChange,
}: InviteUserSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [emailInput, setEmailInput] = useState('');

  const filteredUsers = mockUsers.filter(
    (u) =>
      (u.name.includes(searchQuery) || u.email.includes(searchQuery)) &&
      !appUsers.includes(u.id)
  );

  const addAppUser = (userId: string) => {
    onAppUsersChange([...appUsers, userId]);
  };

  const removeAppUser = (userId: string) => {
    onAppUsersChange(appUsers.filter((id) => id !== userId));
  };

  const addExternalEmail = () => {
    if (emailInput && !externalEmails.includes(emailInput)) {
      onExternalEmailsChange([...externalEmails, emailInput]);
      setEmailInput('');
    }
  };

  const removeExternalEmail = (email: string) => {
    onExternalEmailsChange(externalEmails.filter((e) => e !== email));
  };

  const toggleGroup = (groupId: string) => {
    if (groups.includes(groupId)) {
      onGroupsChange(groups.filter((id) => id !== groupId));
    } else {
      onGroupsChange([...groups, groupId]);
    }
  };

  const selectedUsers = mockUsers.filter((u) => appUsers.includes(u.id));

  return (
    <div className="space-y-4">
      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">
            <UserPlus className="h-4 w-4 mr-1" />
            站内用户
          </TabsTrigger>
          <TabsTrigger value="email">邮箱邀请</TabsTrigger>
          <TabsTrigger value="groups">
            <Users className="h-4 w-4 mr-1" />
            群组
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <Badge key={user.id} variant="secondary" className="gap-1">
                  {user.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeAppUser(user.id)}
                  />
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                onClick={() => addAppUser(user.id)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="输入邮箱地址..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addExternalEmail()}
            />
            <Button onClick={addExternalEmail}>添加</Button>
          </div>

          {externalEmails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {externalEmails.map((email) => (
                <Badge key={email} variant="secondary" className="gap-1">
                  {email}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeExternalEmail(email)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-2">
          {mockGroups.map((group) => (
            <div
              key={group.id}
              className={`flex items-center gap-3 p-3 rounded-md cursor-pointer border ${
                groups.includes(group.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:bg-muted'
              }`}
              onClick={() => toggleGroup(group.id)}
            >
              <Users className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-medium">{group.name}</p>
                <p className="text-sm text-muted-foreground">
                  {group.memberCount} 位成员
                </p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}