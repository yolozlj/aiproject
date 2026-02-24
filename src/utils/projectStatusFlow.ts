import type { ProjectStatus } from '@/types/common';

/**
 * 状态转换映射关系
 *
 * 业务流程说明：
 * - 数据开发项目：submitted → (开发者领取) → pending_review → (项目经理确认) → in_progress → completed
 * - 系统开发项目：submitted → (项目经理审核) → pending_review → (项目经理分配) → in_progress → completed
 */
export const STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  submitted: ['pending_review'], // 可以进入待审核/待确认
  pending_review: ['in_progress', 'submitted'], // 可以批准进入开发，或退回
  in_progress: ['completed', 'pending_review'], // 可以完成，或退回重审
  completed: ['in_progress'], // 已完成的可以重新开发
};

/**
 * 状态中文标签
 */
export const STATUS_LABELS: Record<ProjectStatus, string> = {
  submitted: '已提交',
  pending_review: '待评审',
  in_progress: '进行中',
  completed: '已完成',
};

/**
 * 状态对应的颜色
 */
export const STATUS_COLORS: Record<ProjectStatus, string> = {
  submitted: 'default',
  pending_review: 'processing',
  in_progress: 'warning',
  completed: 'success',
};

/**
 * 状态对应的 Ant Design Tag 颜色
 */
export const STATUS_TAG_COLORS: Record<ProjectStatus, string> = {
  submitted: 'blue',
  pending_review: 'gold',
  in_progress: 'orange',
  completed: 'green',
};

/**
 * 状态流程步骤（用于 Steps 组件）
 */
export const STATUS_STEPS = [
  { title: '已提交', status: 'submitted' as ProjectStatus },
  { title: '待评审', status: 'pending_review' as ProjectStatus },
  { title: '进行中', status: 'in_progress' as ProjectStatus },
  { title: '已完成', status: 'completed' as ProjectStatus },
];

/**
 * 获取当前状态可转换的目标状态
 */
export const getNextAllowedStatuses = (currentStatus: ProjectStatus): ProjectStatus[] => {
  return STATUS_TRANSITIONS[currentStatus] || [];
};

/**
 * 获取状态中文标签
 */
export const getStatusLabel = (status: ProjectStatus): string => {
  return STATUS_LABELS[status] || status;
};

/**
 * 获取状态对应的颜色
 */
export const getStatusColor = (status: ProjectStatus): string => {
  return STATUS_COLORS[status] || 'default';
};

/**
 * 获取状态对应的 Tag 颜色
 */
export const getStatusTagColor = (status: ProjectStatus): string => {
  return STATUS_TAG_COLORS[status] || 'default';
};

/**
 * 获取状态在流程中的步骤索引
 */
export const getStatusStepIndex = (status: ProjectStatus): number => {
  return STATUS_STEPS.findIndex(step => step.status === status);
};

/**
 * 判断状态转换是否合法
 */
export const isValidStatusTransition = (
  currentStatus: ProjectStatus,
  nextStatus: ProjectStatus
): boolean => {
  const allowedStatuses = STATUS_TRANSITIONS[currentStatus] || [];
  return allowedStatuses.includes(nextStatus);
};

/**
 * 获取状态转换的操作名称
 */
export const getStatusTransitionAction = (
  currentStatus: ProjectStatus,
  nextStatus: ProjectStatus,
  hasOwner?: boolean
): string => {
  if (currentStatus === 'submitted' && nextStatus === 'pending_review') {
    return '提交审核';
  }
  if (currentStatus === 'pending_review' && nextStatus === 'in_progress') {
    // 如果已有负责人，说明是确认开发者领取；否则是审核通过并分配
    return hasOwner ? '确认并开始' : '批准开始';
  }
  if (currentStatus === 'pending_review' && nextStatus === 'submitted') {
    return '退回';
  }
  if (currentStatus === 'in_progress' && nextStatus === 'completed') {
    return '完成';
  }
  if (currentStatus === 'in_progress' && nextStatus === 'pending_review') {
    return '退回评审';
  }
  if (currentStatus === 'completed' && nextStatus === 'in_progress') {
    return '重新开发';
  }
  return '变更状态';
};

/**
 * 获取状态转换的确认提示
 */
export const getStatusTransitionConfirmMessage = (
  currentStatus: ProjectStatus,
  nextStatus: ProjectStatus,
  hasOwner?: boolean
): string => {
  const action = getStatusTransitionAction(currentStatus, nextStatus, hasOwner);
  const nextLabel = getStatusLabel(nextStatus);
  return `确认要${action}吗？项目状态将变更为"${nextLabel}"。`;
};
