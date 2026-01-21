import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ErrorCode } from '@/types/api';
import { toast } from "sonner"

class RequestClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpireTime: number | null = null; // token 过期时间戳（毫秒）
  private isRefreshing: boolean = false;
  private refreshTokenPromise: Promise<string> | null = null;
  private AC_TOKEN_EXPIRE_KEY = 'ac_token_expire_in';
  private AC_TOKEN_KEY = 'access_token';

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // 支持 cookie (refresh_token)
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // 跳过刷新 token 接口本身，避免循环调用
        if (config.url?.includes('/v1/auth/refresh')) {
          return config;
        }

        // 检查 token 是否快过期（5分钟内）
        if (this.isAccessTokenExpiringSoon()) {
          try {
            // 刷新 token（如果有并发请求，会共享同一个刷新 Promise）
            await this.refreshAccessToken();
          } catch (error) {
            // 刷新失败，继续使用旧 token（或者会在响应拦截器中处理）
            console.error('Token refresh failed:', error);
          }
        }

        // 添加 access token（可能是刷新后的新 token）
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response;
        const code = data?.code;
        const errmsg = data?.errmsg;
        const msg = data?.msg;

        // 成功响应
        if (code === ErrorCode.SUCCESS) {
          return response;
        }
        // 未授权 - 跳转到登录页
        if (code === ErrorCode.UNAUTHORIZED) {
          this.handleUnauthorized();
          const error = new Error(errmsg || '未授权，请先登录');
          toast.error('未授权，请先登录');
          return Promise.reject(error);
        }

        // 无权限
        if (code === ErrorCode.FORBIDDEN) {
          const error = new Error(errmsg || '您没有权限访问此资源');
            toast.error('您没有权限访问此资源');
          return Promise.reject(error);
        }

        // 其他错误
        const error = new Error(msg || errmsg || '系统出错啦～');
          toast.error(errmsg || '系统出错啦～');
        return Promise.reject(error);
      },
      (error: AxiosError<ApiResponse>) => {
        // 网络错误或其他错误
        if (error.response) {
          if (error.response?.status !== 200) {
            toast.error('服务端出错啦');
          }
        } else if (error.request) {
          // 请求已经成功发起，但没有收到响应
          // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
          // 而在node.js中是 http.ClientRequest 的实例
          // message.error('None response! Please retry.');
        } else {
          console.log(error)
          toast.error('Request error, please retry.');
        }
        return Promise.reject(error);
      }
    );
  }

  private handleUnauthorized() {
    // 清除 token
    this.clearToken();
    // 跳转到首页
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  private isAccessTokenExpiringSoon = (): boolean => {
    const expireTime = localStorage.getItem(this.AC_TOKEN_EXPIRE_KEY);
    if (!expireTime) return false;
    
    const now = Math.floor(Date.now() / 1000);    // 当前时间戳（秒）
    const expire = parseInt(expireTime, 10);      // 过期时间戳（秒）
    
    // 剩余时间 < 5分钟（300秒）
    return expire - now < 5 * 60;
  }
  
  
  // 检查 token 是否已过期
  private isAccessTokenExpired = (): boolean => {
    const expireTime = localStorage.getItem(this.AC_TOKEN_EXPIRE_KEY);
    if (!expireTime) return true;
    
    const now = Math.floor(Date.now() / 1000);
    const expire = parseInt(expireTime, 10);
    
    return now >= expire;
  }
  
  private isLogin = () => {
    return !!this.getAccessToken();
  }



  /**
   * 刷新 access token
   */
  private async refreshAccessToken(): Promise<string> {
    // 如果正在刷新，返回现有的 Promise
    if (this.isRefreshing && this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    // 标记为正在刷新，创建新的刷新 Promise
    this.isRefreshing = true;
    this.refreshTokenPromise = (async () => {
      try {
        const response = await this.client.post<ApiResponse<{ access_token: string; expire_in: number }>>('/v1/auth/refresh');
        
        if (response.data.code !== ErrorCode.SUCCESS) {
          throw new Error(response.data.errmsg || '刷新 token 失败');
        }

        const { access_token, expire_in } = response.data.data!;
        this.setToken(access_token, expire_in);
        return access_token;
      } catch (error) {
        this.clearToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        throw error;
      } finally {
        // 刷新完成，重置状态
        this.isRefreshing = false;
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  /**
   * 设置 token 和过期时间
   */
  public setToken(token: string, expireIn: number) {
    this.accessToken = token;
    this.tokenExpireTime = expireIn;
    
    // 同步到 localStorage 和 cookie（供 middleware 使用）
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.AC_TOKEN_KEY, token);
      localStorage.setItem(this.AC_TOKEN_EXPIRE_KEY, this.tokenExpireTime.toString());
      // 设置 cookie 供 middleware 使用
      document.cookie = `access_token=${token}; path=/; max-age=${expireIn}; samesite=strict`;
    }
  }

  /**
   * 清除 token
   */
  public clearToken() {
    this.accessToken = null;
    this.tokenExpireTime = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.AC_TOKEN_KEY);
      localStorage.removeItem(this.AC_TOKEN_EXPIRE_KEY);
      // 删除 cookie
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  /**
   * @deprecated 使用 setToken(token, expireIn) 代替
   */
  public setAccessToken(token: string | null) {
    if (token === null) {
      this.clearToken();
    } else {
      // 兼容旧代码，默认 7 天过期
      this.setToken(token, 7 * 24 * 60 * 60);
    }
  }

  public getAccessToken(): string | null {
    if (!this.accessToken && typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(this.AC_TOKEN_KEY);
    }
    return this.accessToken;
  }

  public async get<T = any>(url: string, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async patch<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }
}

// 创建单例
const request = new RequestClient();

export default request;

