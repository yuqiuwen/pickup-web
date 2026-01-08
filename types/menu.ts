import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon?: LucideIcon;
  isActive?: boolean; // 是否激活
  hidden?: boolean; // 是否隐藏
  requiredRoles?: string[]; // 允许访问的角色，为空表示所有人都可以访问
  children?: MenuItem[];
}

export type MenuConfig = MenuItem[];

