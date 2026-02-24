/**
 * Project 数据映射工具
 * 用于在前端 Project 类型和 Teable API 格式之间转换
 */
import type { Project, Attachment } from '@/types/project';
import type { TeableProjectFields } from '@/types/teable';
import type { ProjectType, ProjectStatus, Priority } from '@/types/common';

// 中英文映射
const TYPE_MAP: Record<string, ProjectType> = {
  '数据开发需求': 'data_development',
  '系统开发需求': 'system_development',
  'data_development': 'data_development',
  'system_development': 'system_development',
};

const STATUS_MAP: Record<string, ProjectStatus> = {
  '需求提交': 'submitted',
  '待评审': 'pending_review',
  '开发中': 'in_progress',
  '已完成': 'completed',
  'submitted': 'submitted',
  'pending_review': 'pending_review',
  'in_progress': 'in_progress',
  'completed': 'completed',
};

const PRIORITY_MAP: Record<string, Priority> = {
  '低': 'low',
  '中': 'medium',
  '高': 'high',
  '紧急': 'urgent',
  'low': 'low',
  'medium': 'medium',
  'high': 'high',
  'urgent': 'urgent',
};

// 反向映射（前端 -> 中文）
const TYPE_TO_CN: Record<ProjectType, string> = {
  'data_development': '数据开发需求',
  'system_development': '系统开发需求',
};

const STATUS_TO_CN: Record<ProjectStatus, string> = {
  'submitted': '需求提交',
  'pending_review': '待评审',
  'in_progress': '开发中',
  'completed': '已完成',
};

const PRIORITY_TO_CN: Record<Priority, string> = {
  'low': '低',
  'medium': '中',
  'high': '高',
  'urgent': '紧急',
};

/**
 * 将 Teable 项目字段转换为前端 Project 类型
 */
export function mapTeableToProject(teableFields: TeableProjectFields, recordId: string): Project {
  // 解析 JSON 字符串字段
  const parseJsonField = (field: string | undefined): any[] => {
    if (!field) return [];
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  };

  // 解析附件字段
  const parseAttachments = (field: any): Attachment[] => {
    if (!field) return [];

    // Teable 附件字段可能是：
    // 1. 已经是对象数组（Teable API 直接返回）
    // 2. JSON 字符串（需要解析）
    // 3. 字符串格式（旧数据）

    try {
      let attachmentsData: any = field;

      // 如果是字符串，尝试解析
      if (typeof field === 'string') {
        attachmentsData = JSON.parse(field);
      }

      // 如果是数组，进行映射
      if (Array.isArray(attachmentsData)) {
        return attachmentsData.map((att: any) => ({
          id: att.id || att.attachmentId || String(Date.now()),
          fileName: att.name || att.fileName || att.filename || 'unknown',
          fileUrl: att.presignedUrl || att.url || att.fileUrl || '',
          fileSize: att.size || att.fileSize || 0,
          fileType: att.mimetype || att.mimeType || att.fileType || 'application/octet-stream',
          uploadedAt: att.uploadedAt ? new Date(att.uploadedAt) : new Date(),
          uploadedBy: att.uploadedBy || att.uploader || '未知',
        }));
      }

      return [];
    } catch (error) {
      console.error('解析附件字段失败:', error);
      return [];
    }
  };

  return {
    // 使用 Record ID 作为前端主键，因为 Teable API 需要使用 Record ID
    id: recordId,
    name: teableFields.name,
    type: TYPE_MAP[teableFields.type] || 'data_development',
    description: teableFields.description || '',
    priority: PRIORITY_MAP[teableFields.priority] || 'medium',
    status: STATUS_MAP[teableFields.status] || 'submitted',

    // 人员信息
    submitterId: teableFields.submitter_id || '',
    submitterName: teableFields.submitter_name || '',
    ownerId: teableFields.owner_id,
    ownerName: teableFields.owner_name,
    participantIds: parseJsonField(teableFields.participant_ids),

    // 时间信息
    estimatedStartDate: teableFields.estimated_start_date ? new Date(teableFields.estimated_start_date) : undefined,
    estimatedEndDate: teableFields.estimated_end_date ? new Date(teableFields.estimated_end_date) : undefined,
    actualStartDate: teableFields.actual_start_date ? new Date(teableFields.actual_start_date) : undefined,
    actualEndDate: teableFields.actual_end_date ? new Date(teableFields.actual_end_date) : undefined,
    createdAt: teableFields.created_at ? new Date(teableFields.created_at) : new Date(),
    updatedAt: teableFields.updated_at ? new Date(teableFields.updated_at) : new Date(),

    // 其他信息
    attachments: parseAttachments(teableFields.attachments),
    remarks: teableFields.remarks,
    tags: parseJsonField(teableFields.tags),
  };
}

/**
 * 将前端 Project 类型转换为 Teable 项目字段
 */
export function mapProjectToTeable(project: Partial<Project>): Partial<TeableProjectFields> {
  const teableFields: Partial<TeableProjectFields> = {};

  // 序列化 JSON 字段
  // 注意：Teable API 要求显式传递 null 来清空字段，而不是 undefined
  const stringifyJsonField = (field: any[] | undefined): string | null | undefined => {
    if (field === undefined) return undefined; // 字段未提供，不更新
    if (!field || field.length === 0) return null; // 字段为空数组，清空该字段
    return JSON.stringify(field);
  };

  if (project.id !== undefined) teableFields.id = project.id;
  if (project.name !== undefined) teableFields.name = project.name;
  if (project.type !== undefined) teableFields.type = TYPE_TO_CN[project.type];
  if (project.description !== undefined) teableFields.description = project.description;
  if (project.priority !== undefined) teableFields.priority = PRIORITY_TO_CN[project.priority];
  if (project.status !== undefined) teableFields.status = STATUS_TO_CN[project.status];

  // 人员信息
  if (project.submitterId !== undefined) teableFields.submitter_id = project.submitterId;
  if (project.submitterName !== undefined) teableFields.submitter_name = project.submitterName;
  if (project.ownerId !== undefined) teableFields.owner_id = project.ownerId;
  if (project.ownerName !== undefined) teableFields.owner_name = project.ownerName;
  if (project.participantIds !== undefined) teableFields.participant_ids = stringifyJsonField(project.participantIds);

  // 时间信息 - 处理 Date 对象或字符串
  const formatDateField = (date: Date | string | undefined): string | undefined => {
    if (!date) return undefined;
    if (typeof date === 'string') return date;
    return date.toISOString();
  };

  if (project.estimatedStartDate !== undefined) teableFields.estimated_start_date = formatDateField(project.estimatedStartDate);
  if (project.estimatedEndDate !== undefined) teableFields.estimated_end_date = formatDateField(project.estimatedEndDate);
  if (project.actualStartDate !== undefined) teableFields.actual_start_date = formatDateField(project.actualStartDate);
  if (project.actualEndDate !== undefined) teableFields.actual_end_date = formatDateField(project.actualEndDate);
  if (project.createdAt !== undefined) teableFields.created_at = formatDateField(project.createdAt);
  if (project.updatedAt !== undefined) teableFields.updated_at = formatDateField(project.updatedAt);

  // 其他信息
  if (project.attachments !== undefined) teableFields.attachments = stringifyJsonField(project.attachments);
  if (project.remarks !== undefined) teableFields.remarks = project.remarks;
  if (project.tags !== undefined) teableFields.tags = stringifyJsonField(project.tags);

  return teableFields;
}
