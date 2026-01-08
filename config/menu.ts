import { Home, Package, Calendar, User, NotebookPen } from 'lucide-react';
import { MenuConfig } from '@/types/menu';

/**
 * 菜单配置
 * - roles 为空或不设置表示所有人都可以访问
 * - roles 有值表示只有指定角色可以访问
 */
export const menuConfig: MenuConfig = [
  {
    id: 'home',
    title: 'Home',
    path: '/',
    icon: Home,
    hidden: true,
  },
  {
    id: 'notes',
    title: '拾念',
    path: '/notes',
    icon: NotebookPen,

  },
  {
    id: 'anniversary',
    title: '纪念日',
    path: '/anniversary',
    icon: Calendar,
  },
];

// 用户菜单（头像下拉菜单）
export const userMenuConfig = [
  {
    id: 'profile',
    title: '个人中心',
    path: '/profile',
    children: [
      {
        id: 'profile',
        title: '个人信息',
        path: '/profile',
      },
      {
        id: 'settings',
        title: '设置',
        path: '/profile/settings',
      },
    ],
  },
];

