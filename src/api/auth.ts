import client from './client';
import type { LoginRequest, LoginResponse, User, ApiResponse } from '@/types';
import { mockLogin, mockGetCurrentUser } from './mock';
import { getUserByUsername } from './user';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// 登录
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  if (USE_MOCK) {
    return mockLogin(data);
  }

  // 使用真实的 Teable API 进行登录验证
  try {
    // 1. 根据用户名查找用户
    const user = await getUserByUsername(data.username);

    if (!user) {
      throw new Error('用户名或密码错误');
    }

    // 2. 验证密码（注意：这里是简化版本，实际应该使用加密密码比对）
    if (user.password !== data.password) {
      throw new Error('用户名或密码错误');
    }

    // 3. 生成 token（这里使用简单的 base64 编码，实际应该使用 JWT）
    const token = btoa(`${user.id}:${Date.now()}`);
    const refreshToken = btoa(`${user.id}:${Date.now() + 1000}`);

    // 4. 返回登录响应
    return {
      user,
      token,
      refreshToken,
    };
  } catch (error: any) {
    console.error('登录失败:', error);
    throw new Error(error.message || '登录失败，请稍后重试');
  }
};

// 登出
export const logout = async (): Promise<void> => {
  if (USE_MOCK) {
    return;
  }
  await client.post('/auth/logout');
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<User> => {
  if (USE_MOCK) {
    return mockGetCurrentUser();
  }

  // 从本地存储获取用户信息
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('未找到用户信息，请重新登录');
  }

  try {
    const user = JSON.parse(userStr) as User;
    return user;
  } catch (error) {
    throw new Error('用户信息格式错误，请重新登录');
  }
};

// 刷新 Token
export const refreshToken = async (): Promise<{ token: string; refreshToken: string }> => {
  if (USE_MOCK) {
    throw new Error('Mock mode does not support token refresh');
  }
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await client.post<ApiResponse<{ token: string; refreshToken: string }>>(
    '/auth/refresh',
    { refreshToken }
  );
  return response.data.data;
};
