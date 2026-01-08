"use client";

import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { MenuItem } from '@/types/menu';

/**
 * 根据用户角色过滤菜单
 */
export function useMenu(menuConfig: MenuItem[]): MenuItem[] {
  const { user, isAuthenticated } = useAuth();

  return useMemo(() => {
    if (!isAuthenticated) {
      return [];
    }

    const filterMenuByRoles = (items: MenuItem[]): MenuItem[] => {
      return items.filter(item => {
        if (item.hidden) {
          return false;
        }
        // 如果菜单项没有指定角色要求，所有人都可以访问
        if (!item.requiredRoles || item.requiredRoles.length === 0) {
          return true;
        }

        // 检查用户是否有任一所需角色
        const hasPermission = user?.roles.some(role => item.requiredRoles?.includes(role));
        return hasPermission;
      }).map(item => {
        // 递归过滤子菜单
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: filterMenuByRoles(item.children),
          };
        }
        return item;
      });
    };

    return filterMenuByRoles(menuConfig);
  }, [menuConfig, user, isAuthenticated]);
}

