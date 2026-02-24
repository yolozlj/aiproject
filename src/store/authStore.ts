import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '@/types';
import * as authApi from '@/api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  updateToken: (token: string, refreshToken: string) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          const response = await authApi.login({ username, password });

          // 保存到 localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.user));

          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            refreshToken: null,
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
          // 清除本地存储
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },

      setUser: (user: User) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
      },

      updateToken: (token: string, refreshToken: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        set({ token, refreshToken });
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
            refreshToken: null,
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
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// 权限检查 Hook
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
