import type { Role, UserStatus, Theme, Language } from './common';

// 用户表 (users)
export interface User {
  id: string;                          // 用户 ID (UUID)
  username: string;                    // 用户名（唯一）
  email: string;                       // 邮箱（唯一）
  password: string;                    // 密码（加密存储）
  fullName: string;                    // 全名
  avatar?: string;                     // 头像 URL
  role: Role;                          // 角色
  department?: string;                 // 部门
  phone?: string;                      // 电话
  status: UserStatus;                  // 状态
  createdAt: Date;                     // 创建时间
  updatedAt: Date;                     // 更新时间
}

// 用户设置表 (user_preferences)
export interface UserPreference {
  userId: string;                      // 用户 ID（主键）
  theme: Theme;                        // 主题偏好
  language: Language;                  // 语言偏好
  createdAt: Date;
  updatedAt: Date;
}

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// 用户简化信息（用于下拉选择等）
export interface UserSimple {
  id: string;
  fullName: string;
  avatar?: string;
  department?: string;
}
