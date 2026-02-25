import client from './client';
import type {
  Project,
  ProjectHistory,
  ProjectStats,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateProjectStatusRequest,
  ApiResponse,
  PaginationParams,
  PaginationResponse,
  FilterParams,
} from '@/types';
import {
  getProjectsFromTable,
  getProjectByIdFromTable,
  createProjectInTable,
  updateProjectInTable,
  deleteProjectFromTable,
  getDashboardStatsFromTable,
} from './realProjectApi';

// 获取项目列表（分页、筛选）
export const getProjects = async (
  params: PaginationParams & FilterParams
): Promise<PaginationResponse<Project>> => {
  // 使用真实的 Teable API
  return getProjectsFromTable(params);
};

// 获取项目详情
export const getProjectById = async (id: string): Promise<Project> => {
  // 使用真实的 Teable API
  return getProjectByIdFromTable(id);
};

// 创建项目
export const createProject = async (data: CreateProjectRequest): Promise<Project> => {
  // 使用真实的 Teable API
  return createProjectInTable(data);
};

// 更新项目
export const updateProject = async (id: string, data: UpdateProjectRequest): Promise<Project> => {
  // 使用真实的 Teable API
  return updateProjectInTable(id, data);
};

// 删除项目
export const deleteProject = async (id: string): Promise<void> => {
  // 使用真实的 Teable API
  return deleteProjectFromTable(id);
};

// 更新项目状态
export const updateProjectStatus = async (
  id: string,
  data: UpdateProjectStatusRequest
): Promise<Project> => {
  const response = await client.patch<ApiResponse<Project>>(`/projects/${id}/status`, data);
  return response.data.data;
};

// 上传附件
export const uploadAttachment = async (id: string, file: File): Promise<{ fileUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await client.post<ApiResponse<{ fileUrl: string }>>(
    `/projects/${id}/attachments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
};

// 删除附件
export const deleteAttachment = async (id: string, attachmentId: string): Promise<void> => {
  await client.delete(`/projects/${id}/attachments/${attachmentId}`);
};

// 获取项目历史记录
export const getProjectHistory = async (id: string): Promise<ProjectHistory[]> => {
  const response = await client.get<ApiResponse<ProjectHistory[]>>(`/projects/${id}/history`);
  return response.data.data;
};

// 获取概览统计
export const getDashboardStats = async (): Promise<ProjectStats> => {
  // 使用真实的 Teable API
  return getDashboardStatsFromTable();
};
