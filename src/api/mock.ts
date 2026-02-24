// Mock API 实现
import type {
  LoginRequest,
  LoginResponse,
  User,
  Project,
  ProjectStats,
  CreateProjectRequest,
  UpdateProjectRequest,
  PaginationResponse,
  FilterParams,
} from '@/types';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_STATS, generateMockToken } from '@/utils/mockData';

// 延迟函数，模拟网络请求
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock 登录
export const mockLogin = async (data: LoginRequest): Promise<LoginResponse> => {
  await delay();

  const user = Object.values(MOCK_USERS).find(
    (u) => u.username === data.username && u.password === data.password
  );

  if (!user) {
    throw new Error('用户名或密码错误');
  }

  // 移除密码字段
  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword as User,
    token: generateMockToken(user.username),
    refreshToken: generateMockToken(user.username) + '-refresh',
  };
};

// Mock 获取当前用户
export const mockGetCurrentUser = async (): Promise<User> => {
  await delay(200);

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('未登录');
  }

  // 从 token 中提取用户名
  const username = token.split('-')[2];
  const user = Object.values(MOCK_USERS).find((u) => u.username === username);

  if (!user) {
    throw new Error('用户不存在');
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
};

// Mock 获取项目列表
export const mockGetProjects = async (params: {
  page: number;
  pageSize: number;
  search?: string;
  type?: string;
  status?: string;
  priority?: string;
}): Promise<PaginationResponse<Project>> => {
  await delay();

  let filteredProjects = [...MOCK_PROJECTS];

  // 搜索
  if (params.search) {
    filteredProjects = filteredProjects.filter((p) =>
      p.name.toLowerCase().includes(params.search!.toLowerCase())
    );
  }

  // 类型筛选
  if (params.type) {
    filteredProjects = filteredProjects.filter((p) => p.type === params.type);
  }

  // 状态筛选
  if (params.status) {
    filteredProjects = filteredProjects.filter((p) => p.status === params.status);
  }

  // 优先级筛选
  if (params.priority) {
    filteredProjects = filteredProjects.filter((p) => p.priority === params.priority);
  }

  const total = filteredProjects.length;
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  const data = filteredProjects.slice(start, end);

  return {
    data,
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
};

// Mock 获取项目详情
export const mockGetProjectById = async (id: string): Promise<Project> => {
  await delay(200);

  const project = MOCK_PROJECTS.find((p) => p.id === id);
  if (!project) {
    throw new Error('项目不存在');
  }

  return project;
};

// Mock 创建项目
export const mockCreateProject = async (data: CreateProjectRequest): Promise<Project> => {
  await delay(500);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const newProject: Project = {
    id: `project-${Date.now()}`,
    name: data.name,
    type: data.type,
    description: data.description,
    priority: data.priority,
    status: 'submitted',
    submitterId: currentUser.id,
    submitterName: currentUser.fullName,
    ownerId: data.ownerId,
    ownerName: data.ownerId ? '负责人' : undefined,
    participantIds: data.participantIds || [],
    estimatedStartDate: data.estimatedStartDate ? new Date(data.estimatedStartDate) : undefined,
    estimatedEndDate: data.estimatedEndDate ? new Date(data.estimatedEndDate) : undefined,
    actualStartDate: undefined,
    actualEndDate: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    remarks: data.remarks,
    attachments: [],
    tags: data.tags,
  };

  MOCK_PROJECTS.unshift(newProject);
  return newProject;
};

// Mock 更新项目
export const mockUpdateProject = async (
  id: string,
  data: Partial<Project>
): Promise<Project> => {
  await delay(500);

  const index = MOCK_PROJECTS.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error('项目不存在');
  }

  MOCK_PROJECTS[index] = {
    ...MOCK_PROJECTS[index],
    ...data,
    updatedAt: new Date(),
  };

  return MOCK_PROJECTS[index];
};

// Mock 删除项目
export const mockDeleteProject = async (id: string): Promise<void> => {
  await delay(300);

  const index = MOCK_PROJECTS.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error('项目不存在');
  }

  MOCK_PROJECTS.splice(index, 1);
};

// Mock 获取统计数据
export const mockGetStats = async (): Promise<ProjectStats> => {
  await delay(300);

  return {
    total: MOCK_PROJECTS.length,
    submitted: MOCK_PROJECTS.filter((p) => p.status === 'submitted').length,
    pendingReview: MOCK_PROJECTS.filter((p) => p.status === 'pending_review').length,
    inProgress: MOCK_PROJECTS.filter((p) => p.status === 'in_progress').length,
    completed: MOCK_PROJECTS.filter((p) => p.status === 'completed').length,
    dataProjects: MOCK_PROJECTS.filter((p) => p.type === 'data_development').length,
    systemProjects: MOCK_PROJECTS.filter((p) => p.type === 'system_development').length,
  };
};
