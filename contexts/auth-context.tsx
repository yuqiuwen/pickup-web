"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginRequest, RegisterRequest, ResetPasswordRequest } from '@/types/auth';
import { authApi } from '@/lib/api/auth';
import request from '@/lib/request-client';
import { toast } from "sonner"
import { useRSAKeyStore } from '@/stores/rsa-key-store';
import { rsaEncrypt } from '@/utils/rsa';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resetPassword: (data: ResetPasswordRequest, logoutAfterReset?: boolean) => Promise<void>;
  loginDrawerOpen: boolean;
  registerDrawerOpen: boolean;
  openLoginDrawer: () => void;
  openRegisterDrawer: () => void;
  closeLoginDrawer: () => void;
  closeRegisterDrawer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginDrawerOpen, setLoginDrawerOpen] = useState(false);
  const [registerDrawerOpen, setRegisterDrawerOpen] = useState(false);

  const { getPublicKey } = useRSAKeyStore();

  // 初始化时检查是否已登录
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = request.getAccessToken();
        if (token) {
          // 尝试获取用户信息
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      // 登录只返回 token，不返回用户信息
      await authApi.login(data);
      // 登录成功后获取用户信息
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      toast.success('登录成功', {
        "description": `欢迎回来，${userData.username}！`,
      });
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      // 注册只返回 token，不返回用户信息
      await authApi.register(data);
      // 注册成功后获取用户信息
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      toast.success('注册成功', {
        "description": `欢迎加入，${userData.username}！`,
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      toast.success('退出成功', {
        "description": '您已安全退出',
      });
    } catch (error) {
      // 即使退出失败也清除本地状态
      setUser(null);
      request.clearToken();
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest, logoutAfterReset: boolean = true) => {
    try {
      const key = await getPublicKey("user_pwd");
      if (!key) {
        toast.error("缺失密钥");
        return;
      }
      const encryptedPwd = await rsaEncrypt(data.new_pwd, key);
      await authApi.resetPassword({
        account: data.account,
        code: data.code,
        validate_way: data.validate_way,
        new_pwd: encryptedPwd,
      });
      toast.success('密码重置成功', { "description": '请使用新密码登录' });
      logoutAfterReset && await logout();
      openLoginDrawer();
    } catch (error) {
      throw error;
    }
  };

  const openLoginDrawer = (loginParams?: LoginRequest) => {
    setRegisterDrawerOpen(false);
    setLoginDrawerOpen(true);
  };

  const openRegisterDrawer = () => {
    setLoginDrawerOpen(false);
    setRegisterDrawerOpen(true);
  };

  const closeLoginDrawer = () => setLoginDrawerOpen(false);
  const closeRegisterDrawer = () => setRegisterDrawerOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        resetPassword,
        loginDrawerOpen,
        registerDrawerOpen,
        openLoginDrawer,
        openRegisterDrawer,
        closeLoginDrawer,
        closeRegisterDrawer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

