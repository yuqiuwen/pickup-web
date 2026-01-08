import request from '@/lib/request-client';
import { LoginRequest, LoginResponse, RegisterRequest, ResetPasswordRequest, User } from '@/types/auth';

export const authApi = {
  /**
   * 用户登录
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await request.post<LoginResponse>('/v1/auth/login', data);
    if (response.data) {
      // 保存 access_token 和过期时间
      request.setToken(response.data.access_token, response.data.expire_in);
      return response.data;
    }
    throw new Error('登录失败');
  },

  /**
   * 用户注册
   */
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await request.post<LoginResponse>('/v1/auth/signup', data);
    if (response.data) {
      // 保存 access_token 和过期时间
      request.setToken(response.data.access_token, response.data.expire_in);
      return response.data;
    }
    throw new Error('注册失败');
  },

  /**
   * 用户登出
   */
  logout: async (): Promise<void> => {
    await request.post('/v1/auth/logout');
    request.clearToken();
  },

  /**
   * 刷新 token
   */
  refreshToken: async (): Promise<{ access_token: string; expire_in: number }> => {
    const response = await request.post<{ access_token: string; expire_in: number }>('/v1/auth/refresh');
    if (response.data) {
      request.setToken(response.data.access_token, response.data.expire_in);
      return response.data;
    }
    throw new Error('刷新 token 失败');
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await request.get<User>('/v1/me');
    if (response.data) {
      if (!response.data.roles) {
        response.data.roles = [];
      }
      return response.data;
    }
    throw new Error('获取用户信息失败');
  },

  /**
   * 重置密码
   */
  resetPassword: async (data: ResetPasswordRequest) => {
    return await request.post('/v1/auth/reset_password', data);
  },
};

