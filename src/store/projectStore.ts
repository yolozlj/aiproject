import { create } from 'zustand';
import type { Project, FilterParams } from '@/types';
import * as projectApi from '@/api/project';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  total: number;
  page: number;
  pageSize: number;
  filters: FilterParams;
  loading: boolean;

  // Actions
  fetchProjects: (page?: number, pageSize?: number) => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  setFilters: (filters: FilterParams) => Promise<void>;
  clearFilters: () => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  total: 0,
  page: 1,
  pageSize: 10,
  filters: {},
  loading: false,

  fetchProjects: async (page?: number, pageSize?: number) => {
    set({ loading: true });
    try {
      const state = get();
      const currentPage = page ?? state.page;
      const currentPageSize = pageSize ?? state.pageSize;
      // 同步更新 page/pageSize 状态，确保翻页后状态一致
      set({ page: currentPage, pageSize: currentPageSize });

      console.log('📡 fetchProjects 被调用，当前 filters:', state.filters);

      const requestParams = {
        page: currentPage,
        pageSize: currentPageSize,
        ...state.filters,
      };

      console.log('📤 API 请求参数:', requestParams);

      const response = await projectApi.getProjects(requestParams);

      console.log('📥 API 响应:', response);

      const newState = {
        projects: response.data,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        loading: false,
      };

      console.log('🔄 准备更新 store 状态:', newState);
      set(newState);

      // 验证状态是否真的更新了
      const updatedState = get();
      console.log('✅ store 状态已更新，当前 projects 数量:', updatedState.projects.length);
      console.log('📋 当前 projects:', updatedState.projects);
    } catch (error) {
      console.error('❌ fetchProjects 错误:', error);
      set({ loading: false });
      throw error;
    }
  },

  fetchProjectById: async (id: string) => {
    set({ loading: true });
    try {
      const project = await projectApi.getProjectById(id);
      set({ currentProject: project, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setFilters: async (filters: FilterParams) => {
    console.log('🔧 Store setFilters 被调用，filters:', filters);
    set({ filters, page: 1 });
    console.log('📞 Store 立即调用 fetchProjects');
    await get().fetchProjects(1);
  },

  clearFilters: async () => {
    console.log('🔧 Store clearFilters 被调用');
    set({ filters: {}, page: 1 });
    console.log('📞 Store 立即调用 fetchProjects');
    await get().fetchProjects(1);
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },
}));
