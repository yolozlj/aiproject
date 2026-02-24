/**
 * Users API - 真实的 Teable API 接口
 */
import teableClient from './teableClient';
import type {
  TeableResponse,
  TeableRecord,
  TeableUserFields,
  TeableQueryParams,
  TeableCreateRequest,
  TeableUpdateRequest,
  TeableFilter,
  TeableOrderBy,
} from '@/types/teable';
import type { User, UserSimple } from '@/types/user';
import { mapTeableToUser, mapUserToTeable } from '@/utils/userMapper';

const USERS_TABLE_ID = import.meta.env.VITE_USERS_TABLE_ID;

/**
 * 获取用户列表
 * @param params 查询参数
 */
export async function getUserList(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{
  data: User[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const skip = (page - 1) * pageSize;

  // 构建查询参数
  const queryParams: TeableQueryParams = {
    fieldKeyType: 'name',
    take: pageSize,
    skip,
  };

  // 构建筛选条件
  if (params?.keyword || params?.role || params?.status) {
    const filterSet: any[] = [];

    // 关键词搜索 (搜索用户名、邮箱、全名)
    if (params.keyword) {
      filterSet.push({
        conjunction: 'or',
        filterSet: [
          { fieldId: 'fld7WopPaB3uHDdCzfI', operator: 'contains', value: params.keyword },
          { fieldId: 'fldriCmtaG7eSIaptpn', operator: 'contains', value: params.keyword },
          { fieldId: 'fldUA8av97AJkHJbxoP', operator: 'contains', value: params.keyword },
        ],
      });
    }

    // 角色筛选
    if (params.role) {
      filterSet.push({
        fieldId: 'fldj0oyuLlNC6Y3rWSt',
        operator: 'is',
        value: params.role,
      });
    }

    // 状态筛选
    if (params.status) {
      filterSet.push({
        fieldId: 'fldYFy7uHBqE2lazWyZ',
        operator: 'is',
        value: params.status,
      });
    }

    if (filterSet.length > 0) {
      const filter: TeableFilter = {
        conjunction: 'and',
        filterSet,
      };
      queryParams.filter = JSON.stringify(filter);
    }
  }

  // 构建排序
  if (params?.sortBy) {
    const fieldIdMap: Record<string, string> = {
      username: 'fld7WopPaB3uHDdCzfI',
      email: 'fldriCmtaG7eSIaptpn',
      createdAt: 'fldKA7Yihd0FuT1i1tK',
      role: 'fldj0oyuLlNC6Y3rWSt',
      status: 'fldYFy7uHBqE2lazWyZ',
    };

    const fieldId = fieldIdMap[params.sortBy];
    if (fieldId) {
      const orderBy: TeableOrderBy[] = [
        {
          fieldId,
          order: params.sortOrder || 'asc',
        },
      ];
      queryParams.orderBy = JSON.stringify(orderBy);
    }
  }

  try {
    const response = await teableClient.get<TeableResponse<TeableUserFields>>(
      `/table/${USERS_TABLE_ID}/record`,
      { params: queryParams }
    );

    const records = response.data.records || [];
    const users = records.map((record) => mapTeableToUser(record.fields, record.id));

    return {
      data: users,
      total: records.length, // Teable 不直接返回总数，这里简化处理
      page,
      pageSize,
    };
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw error;
  }
}

/**
 * 根据 ID 获取用户详情
 * @param id 用户 Record ID
 */
export async function getUserById(id: string): Promise<User> {
  try {
    const response = await teableClient.get<TeableRecord<TeableUserFields>>(
      `/table/${USERS_TABLE_ID}/record/${id}`,
      { params: { fieldKeyType: 'name' } }
    );

    return mapTeableToUser(response.data.fields, response.data.id);
  } catch (error) {
    console.error('获取用户详情失败:', error);
    throw error;
  }
}

/**
 * 创建用户
 * @param user 用户数据
 */
export async function createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const teableFields = mapUserToTeable({
    ...user,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const requestBody: TeableCreateRequest<TeableUserFields> = {
    fieldKeyType: 'name',
    records: [
      {
        fields: teableFields as TeableUserFields,
      },
    ],
  };

  try {
    const response = await teableClient.post<{ records: TeableRecord<TeableUserFields>[] }>(
      `/table/${USERS_TABLE_ID}/record`,
      requestBody
    );

    const createdRecord = response.data.records[0];
    return mapTeableToUser(createdRecord.fields, createdRecord.id);
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
}

/**
 * 更新用户
 * @param id 用户 Record ID
 * @param user 更新的用户数据
 */
export async function updateUser(id: string, user: Partial<User>): Promise<User> {
  const teableFields = mapUserToTeable({
    ...user,
    updatedAt: new Date(),
  });

  const requestBody: TeableUpdateRequest<TeableUserFields> = {
    fieldKeyType: 'name',
    record: {
      fields: teableFields,
    },
  };

  try {
    const response = await teableClient.patch<TeableRecord<TeableUserFields>>(
      `/table/${USERS_TABLE_ID}/record/${id}`,
      requestBody
    );

    return mapTeableToUser(response.data.fields, response.data.id);
  } catch (error) {
    console.error('更新用户失败:', error);
    throw error;
  }
}

/**
 * 删除用户
 * @param id 用户 Record ID
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    await teableClient.delete(`/table/${USERS_TABLE_ID}/record/${id}`);
  } catch (error) {
    console.error('删除用户失败:', error);
    throw error;
  }
}

/**
 * 搜索用户（用于选择负责人、参与人等）
 * @param keyword 搜索关键词
 * @param limit 返回数量限制
 */
export async function searchUsers(keyword: string, limit: number = 10): Promise<UserSimple[]> {
  try {
    const response = await teableClient.get<TeableResponse<TeableUserFields>>(
      `/table/${USERS_TABLE_ID}/record`,
      {
        params: {
          fieldKeyType: 'name',
          search: keyword,
          take: limit,
          projection: ['id', 'full_name', 'avatar', 'department'],
        },
      }
    );

    const records = response.data.records || [];
    return records.map((record) => ({
      id: record.fields.id || record.id,
      fullName: record.fields.full_name,
      avatar: record.fields.avatar,
      department: record.fields.department,
    }));
  } catch (error) {
    console.error('搜索用户失败:', error);
    throw error;
  }
}

/**
 * 根据用户名查找用户（用于登录）
 * @param username 用户名
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    // 由于 Teable filter 可能不稳定，改为获取所有用户后在前端筛选
    const response = await teableClient.get<TeableResponse<TeableUserFields>>(
      `/table/${USERS_TABLE_ID}/record`,
      {
        params: {
          fieldKeyType: 'name',
          take: 100, // 获取所有用户
        },
      }
    );

    const records = response.data.records || [];

    // 在前端筛选出匹配的用户
    const matchedRecord = records.find(record =>
      record.fields && record.fields.username === username
    );

    if (!matchedRecord) {
      return null;
    }

    return mapTeableToUser(matchedRecord.fields, matchedRecord.id);
  } catch (error) {
    console.error('根据用户名查找用户失败:', error);
    throw error;
  }
}

/**
 * 根据邮箱查找用户
 * @param email 邮箱
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    // 由于 Teable filter 可能不稳定，改为获取所有用户后在前端筛选
    const response = await teableClient.get<TeableResponse<TeableUserFields>>(
      `/table/${USERS_TABLE_ID}/record`,
      {
        params: {
          fieldKeyType: 'name',
          take: 100, // 获取所有用户
        },
      }
    );

    const records = response.data.records || [];

    // 在前端筛选出匹配的用户
    const matchedRecord = records.find(record =>
      record.fields && record.fields.email === email
    );

    if (!matchedRecord) {
      return null;
    }

    return mapTeableToUser(matchedRecord.fields, matchedRecord.id);
  } catch (error) {
    console.error('根据邮箱查找用户失败:', error);
    throw error;
  }
}

// 兼容旧的导出方式
export const getUsers = getUserList;
