export interface User {
  id: number;
  username: string;
  account?: string;
  email: string;
  roles: string[];
  avatar?: string;
  phone?: string;
  gender?: number;
  birth?: string;
  title?: string;
  introduce?: string;
  ctime?: number;
}

export interface SimpleUser {
  id: number;
  username: string;
  account?: string;
  avatar?: string;
  gender?: number;
  title?: string;
}

export interface LoginRequest {
  account: string;
  code: string;
  code_type: "pwd" | "code";
  auth_type?: 1 | 2 | 3 | 4; // phone / account / email / wechat
}

export interface RegisterRequest {
  auth_type: 1 | 2 | 3 | 4; // phone / account / email / wechat
  account: string;
  pwd: string;
  username: string;
  code: string;
}

export interface LoginResponse {
  access_token: string;
  expire_in: number; // token 过期时间（秒）
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface ResetPasswordRequest {
  account: string;
  code: string;
  new_pwd: string;
  validate_way: "pwd" | "code";
}

export interface ShareGroup {
  id: string;
  owner_id: number;
  name: string;
  description: string;
  cover: string;
  max_members: number;
  is_public: number;
  member_count: number
}


export type TUserSettings = Record<string, string>;