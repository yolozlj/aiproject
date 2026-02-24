import type { Project } from '@/types/project';
import type { User } from '@/types/user';
import type { ProjectStatus } from '@/types/common';

/**
 * 判断用户是否可以编辑项目
 */
export const canEditProject = (project: Project, user: User): boolean => {
  // 管理员和项目经理可以编辑所有项目
  if (['admin', 'project_manager'].includes(user.role)) {
    return true;
  }

  // 开发者可以编辑自己负责的项目
  if (user.role === 'developer' && project.ownerId === user.id) {
    return true;
  }

  // 普通用户只能编辑自己提交的未审核项目
  if (user.role === 'user' && project.submitterId === user.id && project.status === 'submitted') {
    return true;
  }

  return false;
};

/**
 * 判断用户是否可以领取项目
 *
 * 业务规则：
 * - 开发者只能领取数据开发项目（data_development）
 * - 项目经理和管理员可以领取所有类型项目
 * - 只有 submitted 状态且未分配的项目可以领取
 */
export const canClaimProject = (project: Project, user: User): boolean => {
  // 只有开发者、项目经理和管理员可以领取
  if (!['developer', 'project_manager', 'admin'].includes(user.role)) {
    return false;
  }

  // 开发者只能领取数据开发项目，不能领取系统开发项目
  if (user.role === 'developer' && project.type !== 'data_development') {
    return false;
  }

  // 已分配的项目不能领取
  if (project.ownerId) {
    return false;
  }

  // 只有 submitted 状态的项目可以领取
  if (project.status !== 'submitted') {
    return false;
  }

  return true;
};

/**
 * 判断用户是否可以分配项目
 */
export const canAssignProject = (project: Project, user: User): boolean => {
  // 只有管理员和项目经理可以分配
  if (!['admin', 'project_manager'].includes(user.role)) {
    return false;
  }

  // 已完成的项目不能再分配
  if (project.status === 'completed') {
    return false;
  }

  return true;
};

/**
 * 判断用户是否可以变更状态
 */
export const canChangeStatus = (
  project: Project,
  user: User,
  newStatus: ProjectStatus
): boolean => {
  const hasReviewPermission = ['admin', 'project_manager'].includes(user.role);
  const isOwner = project.ownerId === user.id;

  // 定义允许的状态转换
  const transitions: Record<ProjectStatus, ProjectStatus[]> = {
    submitted: ['pending_review'],
    pending_review: ['in_progress', 'submitted'],
    in_progress: ['completed', 'pending_review'],
    completed: ['in_progress'],
  };

  // 检查状态转换是否合法
  const allowedNextStates = transitions[project.status] || [];
  if (!allowedNextStates.includes(newStatus)) {
    return false;
  }

  // 审核操作（submitted → pending_review）需要 review 权限
  if (project.status === 'submitted' && newStatus === 'pending_review') {
    return hasReviewPermission;
  }

  // 完成操作（in_progress → completed）需要是负责人或项目经理
  if (project.status === 'in_progress' && newStatus === 'completed') {
    return isOwner || hasReviewPermission;
  }

  // 其他状态变更需要项目经理权限或负责人权限
  return hasReviewPermission || isOwner;
};

/**
 * 判断用户是否可以删除项目
 */
export const canDeleteProject = (project: Project, user: User): boolean => {
  // 只有管理员可以删除项目
  if (user.role !== 'admin') {
    return false;
  }

  return true;
};

/**
 * 判断用户是否可以审核项目
 *
 * 业务规则：
 * - 只有管理员和项目经理可以审核
 * - pending_review 状态的项目可以审核
 * - 审核包括两种场景：
 *   1. 数据项目：开发者已领取，项目经理确认分配
 *   2. 系统项目：项目经理审核需求并准备分配
 */
export const canReviewProject = (project: Project, user: User): boolean => {
  // 只有管理员和项目经理可以审核
  if (!['admin', 'project_manager'].includes(user.role)) {
    return false;
  }

  // 只有待审核状态的项目可以审核
  if (project.status !== 'pending_review') {
    return false;
  }

  return true;
};

/**
 * 判断用户是否可以查看项目详情
 */
export const canViewProject = (project: Project, user: User): boolean => {
  // 管理员和项目经理可以查看所有项目
  if (['admin', 'project_manager'].includes(user.role)) {
    return true;
  }

  // 负责人可以查看自己的项目
  if (project.ownerId === user.id) {
    return true;
  }

  // 提交人可以查看自己提交的项目
  if (project.submitterId === user.id) {
    return true;
  }

  // 参与人可以查看参与的项目
  if (project.participantIds?.includes(user.id)) {
    return true;
  }

  return false;
};

/**
 * 判断用户是否可以完成项目
 */
export const canCompleteProject = (project: Project, user: User): boolean => {
  // 只有进行中的项目可以完成
  if (project.status !== 'in_progress') {
    return false;
  }

  // 项目经理和管理员可以完成
  if (['admin', 'project_manager'].includes(user.role)) {
    return true;
  }

  // 负责人可以完成自己的项目
  if (project.ownerId === user.id) {
    return true;
  }

  return false;
};
