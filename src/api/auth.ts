import type { User } from '@/types';

const FC_BASE_URL = import.meta.env.VITE_FC_BASE_URL as string;

// SSO 回调验证结果
export interface SSOUser {
  account_id: string;
  account: string;    // 账号名（如 zhoulijie1），适合作为 username
  name: string;       // 真实姓名
  workcode: string;   // 工号
  email: string;      // 企业邮箱
  yachid: string;     // 知音楼 ID
}

export interface SSOCallbackResult {
  jwtToken: string;
  ssoUser: SSOUser;
}

// 调用 FC 后端验证 SSO token，返回 JWT 和 SSO 用户信息
export const loginWithSSOCallback = async (ssoToken: string): Promise<SSOCallbackResult> => {
  const res = await fetch(`${FC_BASE_URL}/auth/callback?token=${encodeURIComponent(ssoToken)}`);
  const data = await res.json();

  if (!res.ok || !data.token) {
    throw new Error(data.error || 'SSO 验证失败');
  }

  return {
    jwtToken: data.token,
    ssoUser: data.user as SSOUser,
  };
};

// 登出（清除本地状态，由 store 层处理）
export const logout = async (): Promise<void> => {
  // SSO 登出在 store 层完成（清除 localStorage），此处为空实现
};

// 获取当前用户信息（从 localStorage）
export const getCurrentUser = async (): Promise<User> => {
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
