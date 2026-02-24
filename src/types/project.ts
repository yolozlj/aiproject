import type { ProjectType, ProjectStatus, Priority } from './common';

// 附件
export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  uploadedBy: string;
}

// 项目表 (projects)
export interface Project {
  id: string;                          // 项目 ID (UUID)
  name: string;                        // 项目名称
  type: ProjectType;                   // 项目类型
  description: string;                 // 项目描述
  priority: Priority;                  // 优先级
  status: ProjectStatus;               // 状态

  // 人员信息
  submitterId: string;                 // 提交人 ID
  submitterName: string;               // 提交人姓名
  ownerId?: string;                    // 负责人 ID
  ownerName?: string;                  // 负责人姓名
  participantIds: string[];            // 参与人员 ID 列表

  // 时间信息
  estimatedStartDate?: Date;           // 预计开始时间
  estimatedEndDate?: Date;             // 预计完成时间
  actualStartDate?: Date;              // 实际开始时间
  actualEndDate?: Date;                // 实际完成时间
  createdAt: Date;                     // 创建时间
  updatedAt: Date;                     // 更新时间

  // 其他信息
  remarks?: string;                    // 备注说明
  attachments: Attachment[];           // 附件列表
  tags?: string[];                     // 标签
}

// 项目历史记录表 (project_histories)
export interface ProjectHistory {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action: string;                      // 操作类型
  changes: Record<string, any>;        // 变更内容（JSON）
  createdAt: Date;
}

// 创建项目请求
export interface CreateProjectRequest {
  name: string;
  type: ProjectType;
  description: string;
  priority: Priority;
  ownerId?: string;
  participantIds?: string[];
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  remarks?: string;
  tags?: string[];
}

// 更新项目请求
export interface UpdateProjectRequest {
  name?: string;
  type?: ProjectType;
  description?: string;
  priority?: Priority;
  ownerId?: string;
  participantIds?: string[];
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  remarks?: string;
  tags?: string[];
}

// 更新项目状态请求
export interface UpdateProjectStatusRequest {
  status: ProjectStatus;
  remarks?: string;
}

// 项目统计
export interface ProjectStats {
  total: number;
  submitted: number;
  pendingReview: number;
  inProgress: number;
  completed: number;
  dataProjects: number;
  systemProjects: number;
}
