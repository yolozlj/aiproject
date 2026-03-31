// 通用类型定义

export type Role = 'admin' | 'project_manager' | 'developer' | 'user' | 'external';

export type UserStatus = 'active' | 'inactive';

export type ProjectType = 'data_development' | 'system_development';

export type ProjectStatus = 'submitted' | 'pending_review' | 'in_progress' | 'completed';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Theme = 'minimal' | 'dark';

export type Language = 'zh-CN' | 'en-US';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

export interface FilterParams {
  type?: ProjectType;
  status?: ProjectStatus;
  priority?: Priority;
  keyword?: string; // 搜索关键词（搜索项目名称和描述）
  search?: string; // 保留兼容性，实际使用 keyword
  submitter?: string; // 提交人姓名
  owner?: string; // 负责人姓名
  startDate?: string;
  endDate?: string;
  createdAtStart?: string;     // 创建时间范围起
  createdAtEnd?: string;       // 创建时间范围止
  actualEndDateStart?: string; // 实际完成时间范围起
  actualEndDateEnd?: string;   // 实际完成时间范围止
  sortBy?: string; // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序方向
  myProjects?: boolean; // 我的项目：提交人或负责人是当前用户
  myTodo?: boolean; // 我的待办：负责人是当前用户且状态为非完成
}
