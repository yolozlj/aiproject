import client from './client';
import type { UserPreference, ApiResponse } from '@/types';

// 获取用户偏好设置
export const getUserPreference = async (): Promise<UserPreference> => {
  const response = await client.get<ApiResponse<UserPreference>>('/preferences');
  return response.data.data;
};

// 更新用户偏好设置
export const updateUserPreference = async (
  data: Partial<UserPreference>
): Promise<UserPreference> => {
  const response = await client.put<ApiResponse<UserPreference>>('/preferences', data);
  return response.data.data;
};
