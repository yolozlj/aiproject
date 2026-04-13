import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '@/types';
import * as authApi from '@/api/auth';
import type { SSOUser } from '@/api/auth';
import { getUserByEmail, getUserByWorkcode, updateUserWorkcodeByEmail } from '@/api/user';
import { clearExternalUserIdsCache } from '@/api/realProjectApi';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  loginWithSSO: (ssoToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  updateToken: (token: string) => void;
  checkAuth: () => Promise<void>;
}

// 自定义错误：携带 SSO 用户信息，供登录页面跳转注册使用
export class AccountNotRegisteredError extends Error {
  ssoUser: SSOUser;
  constructor(ssoUser: SSOUser) {
    super('account_not_registered');
    this.ssoUser = ssoUser;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      loginWithSSO: async (ssoToken: string) => {
        try {
          // 1. 调用 FC 后端验证 SSO token
          const { jwtToken, ssoUser } = await authApi.loginWithSSOCallback(ssoToken);

          // 2. 优先用工号匹配，找不到再降级用邮箱
          let user = await getUserByWorkcode(ssoUser.workcode);
          if (!user) {
            user = await getUserByEmail(ssoUser.email);
            // 邮箱降级匹配成功，自动补全工号（使用专用函数确保用真实 record ID 更新）
            if (user && ssoUser.workcode) {
              updateUserWorkcodeByEmail(ssoUser.email, ssoUser.workcode).catch(console.error);
              user = { ...user, workcode: ssoUser.workcode };
            }
          }

          if (!user) {
            // 用户不在系统中，跳转权限申请页面
            throw new AccountNotRegisteredError(ssoUser);
          }

          if (user.status === 'inactive') {
            // 用户存在但待审批
            throw new Error('account_pending_approval');
          }

          // 3. 登录成功，保存到 localStorage 和 Zustand
          localStorage.setItem('token', jwtToken);
          localStorage.setItem('user', JSON.stringify(user));

          clearExternalUserIdsCache();
          set({
            user,
            token: jwtToken,
            isAuthenticated: true,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          clearExternalUserIdsCache();
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      setUser: (user: User) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
      },

      updateToken: (token: string) => {
        localStorage.setItem('token', token);
        set({ token });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          const user = await authApi.getCurrentUser();
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// 权限检查 Hook（完全不变）
export const usePermission = () => {
  const { user } = useAuthStore();

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;

    const role = user.role;

    // 权限矩阵
    const permissions: Record<Role, Record<string, string[]>> = {
      admin: {
        project: ['create', 'read', 'update', 'delete', 'review', 'assign'],
        user: ['create', 'read', 'update', 'delete'],
        settings: ['read', 'update'],
      },
      project_manager: {
        project: ['create', 'read', 'update', 'review', 'assign'],
        user: ['read'],
        settings: ['read', 'update'],
      },
      developer: {
        project: ['create', 'read', 'update'],
        user: ['read'],
        settings: ['read', 'update'],
      },
      user: {
        project: ['create', 'read'],
        user: ['read'],
        settings: ['read', 'update'],
      },
      external: {
        project: ['create', 'read'],
        user: [],
        settings: ['read'],
      },
    };

    const rolePermissions = permissions[role];
    if (!rolePermissions) return false;

    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action);
  };

  const canCreate = (resource: string) => hasPermission(resource, 'create');
  const canRead = (resource: string) => hasPermission(resource, 'read');
  const canUpdate = (resource: string) => hasPermission(resource, 'update');
  const canDelete = (resource: string) => hasPermission(resource, 'delete');
  const canReview = (resource: string) => hasPermission(resource, 'review');
  const canAssign = (resource: string) => hasPermission(resource, 'assign');

  return {
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canReview,
    canAssign,
    user,
  };
};
