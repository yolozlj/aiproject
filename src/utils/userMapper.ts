/**
 * User 数据映射工具
 * 用于在前端 User 类型和 Teable API 格式之间转换
 */
import type { User } from '@/types/user';
import type { TeableUserFields } from '@/types/teable';

/**
 * 将 Teable 用户字段转换为前端 User 类型
 */
export function mapTeableToUser(teableFields: TeableUserFields, recordId: string): User {
  return {
    id: teableFields.id || recordId,  // 优先使用字段中的 id，否则使用 recordId
    username: teableFields.username,
    email: teableFields.email,
    password: teableFields.password,
    fullName: teableFields.full_name,
    avatar: teableFields.avatar,
    role: teableFields.role as any,  // 需要确保角色值符合 Role 枚举
    department: teableFields.department,
    phone: teableFields.phone,
    status: teableFields.status as any,  // 需要确保状态值符合 UserStatus 枚举
    createdAt: teableFields.created_at ? new Date(teableFields.created_at) : new Date(),
    updatedAt: teableFields.updated_at ? new Date(teableFields.updated_at) : new Date(),
  };
}

/**
 * 将前端 User 类型转换为 Teable 用户字段
 */
export function mapUserToTeable(user: Partial<User>): Partial<TeableUserFields> {
  const teableFields: Partial<TeableUserFields> = {};

  if (user.id !== undefined) teableFields.id = user.id;
  if (user.username !== undefined) teableFields.username = user.username;
  if (user.password !== undefined) teableFields.password = user.password;
  if (user.email !== undefined) teableFields.email = user.email;
  if (user.fullName !== undefined) teableFields.full_name = user.fullName;
  if (user.avatar !== undefined) teableFields.avatar = user.avatar;
  if (user.role !== undefined) teableFields.role = user.role;
  if (user.department !== undefined) teableFields.department = user.department;
  if (user.phone !== undefined) teableFields.phone = user.phone;
  if (user.status !== undefined) teableFields.status = user.status;
  if (user.createdAt !== undefined) teableFields.created_at = user.createdAt.toISOString();
  if (user.updatedAt !== undefined) teableFields.updated_at = user.updatedAt.toISOString();

  return teableFields;
}
