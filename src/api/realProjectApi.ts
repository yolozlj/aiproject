/**
 * Projects Table 真实 API 实现
 * 连接到 Teable Projects 表
 */
import projectsTableClient from './projectsTableClient';
import type {
  TeableResponse,
  TeableRecord,
  TeableProjectFields,
  TeableQueryParams,
  TeableCreateRequest,
  TeableUpdateRequest,
  TeableFilter,
  TeableOrderBy,
  PROJECT_FIELD_IDS,
} from '@/types/teable';
import type { Project, PaginationParams, PaginationResponse, FilterParams, ProjectStats } from '@/types';
import { mapTeableToProject, mapProjectToTeable } from '@/utils/projectMapper';

const PROJECTS_TABLE_ID = import.meta.env.VITE_PROJECTS_TABLE_ID;

// 值转换映射（前端英文 -> Teable 中文）
const TYPE_TO_CN: Record<string, string> = {
  'data_development': '数据开发需求',
  'system_development': '系统开发需求',
};

const STATUS_TO_CN: Record<string, string> = {
  'submitted': '需求提交',
  'pending_review': '待评审',
  'in_progress': '开发中',
  'completed': '已完成',
};

const PRIORITY_TO_CN: Record<string, string> = {
  'low': '低',
  'medium': '中',
  'high': '高',
  'urgent': '紧急',
};

/**
 * 获取项目列表
 */
export async function getProjectsFromTable(
  params: PaginationParams & FilterParams
): Promise<PaginationResponse<Project>> {
  console.log('📊 获取项目列表 - 参数:', params);

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const queryParams: TeableQueryParams = {
    fieldKeyType: 'name', // 响应使用字段名
    take: pageSize,
    skip,
  };

  // 构建筛选条件
  const filterSet: any[] = [];

  // 兼容 keyword 和 search 两个参数
  const searchKeyword = params.keyword || params.search;

  if (params.type) {
    filterSet.push({
      fieldId: 'fldnegKyvsnE3OLTUAi', // 筛选必须使用字段 ID
      operator: 'is',
      value: TYPE_TO_CN[params.type] || params.type, // 转换为中文
    });
  }

  if (params.status) {
    filterSet.push({
      fieldId: 'fldWEZLWNYb45fmjrZd', // 筛选必须使用字段 ID
      operator: 'is',
      value: STATUS_TO_CN[params.status] || params.status, // 转换为中文
    });
  }

  if (params.priority) {
    filterSet.push({
      fieldId: 'fldQBpUEYcHO7IgaLnH', // 筛选必须使用字段 ID
      operator: 'is',
      value: PRIORITY_TO_CN[params.priority] || params.priority, // 转换为中文
    });
  }

  if (searchKeyword) {
    filterSet.push({
      conjunction: 'or',
      filterSet: [
        { fieldId: 'fld1SCaFG2iX7judrSW', operator: 'contains', value: searchKeyword }, // name
        { fieldId: 'fldTDfbFWXjJNlWCneW', operator: 'contains', value: searchKeyword }, // description
      ],
    });
  }

  if (filterSet.length > 0) {
    const filter: TeableFilter = {
      conjunction: 'and',
      filterSet,
    };
    queryParams.filter = JSON.stringify(filter);
    console.log('🔍 筛选条件:', filter);
  } else {
    console.log('📝 无筛选条件，获取所有项目');
  }

  // 构建排序
  if (params.sortBy) {
    const fieldIdMap: Record<string, string> = {
      name: 'fld1SCaFG2iX7judrSW',
      createdAt: 'fldcN8LCRU5At3mwrX0',
      priority: 'fldQBpUEYcHO7IgaLnH',
      status: 'fldWEZLWNYb45fmjrZd',
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
    // 🚨 临时方案：由于 Teable API 筛选不生效，先获取所有数据再在前端筛选
    // TODO: 等 Teable API 筛选修复后，移除此前端筛选逻辑
    const hasFilters = params.type || params.status || params.priority || searchKeyword || params.submitter || params.owner;

    // 如果有筛选条件，暂时不传给 API（因为 API 不生效）
    const apiQueryParams: TeableQueryParams = {
      fieldKeyType: 'name',
      take: hasFilters ? 100 : pageSize, // 有筛选时获取更多数据
      skip: hasFilters ? 0 : skip,
    };

    console.log('📡 fetchProjects 被调用，当前 filters:', params);

    const response = await projectsTableClient.get<TeableResponse<TeableProjectFields>>(
      `/table/${PROJECTS_TABLE_ID}/record`,
      { params: apiQueryParams }
    );

    const records = response.data.records || [];
    let projects = records.map((record) => mapTeableToProject(record.fields, record.id));

    console.log(`📥 从 Teable 获取到 ${projects.length} 个项目`);

    // 🔍 前端筛选（临时方案）
    let filteredProjects = projects;

    if (params.type) {
      filteredProjects = filteredProjects.filter(p => p.type === params.type);
      console.log(`🔍 按类型筛选 (${params.type}): ${filteredProjects.length} 个项目`);
    }

    if (params.status) {
      filteredProjects = filteredProjects.filter(p => p.status === params.status);
      console.log(`🔍 按状态筛选 (${params.status}): ${filteredProjects.length} 个项目`);
    }

    if (params.priority) {
      filteredProjects = filteredProjects.filter(p => p.priority === params.priority);
      console.log(`🔍 按优先级筛选 (${params.priority}): ${filteredProjects.length} 个项目`);
    }

    if (searchKeyword) {
      filteredProjects = filteredProjects.filter(p =>
        p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
      console.log(`🔍 按关键词筛选 (${searchKeyword}): ${filteredProjects.length} 个项目`);
    }

    if (params.submitter) {
      const kw = params.submitter.toLowerCase();
      filteredProjects = filteredProjects.filter(p =>
        p.submitterName && p.submitterName.toLowerCase().includes(kw)
      );
      console.log(`🔍 按提交人筛选 (${params.submitter}): ${filteredProjects.length} 个项目`);
    }

    if (params.owner) {
      const kw = params.owner.toLowerCase();
      filteredProjects = filteredProjects.filter(p =>
        p.ownerName && p.ownerName.toLowerCase().includes(kw)
      );
      console.log(`🔍 按负责人筛选 (${params.owner}): ${filteredProjects.length} 个项目`);
    }

    // 🔍 前端分页（临时方案）
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProjects = hasFilters ? filteredProjects.slice(startIndex, endIndex) : filteredProjects;

    console.log(`✅ 最终返回 ${paginatedProjects.length} 个项目（共 ${filteredProjects.length} 个符合条件）`);

    return {
      data: paginatedProjects,
      total: hasFilters ? filteredProjects.length : records.length,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('❌ 获取项目列表失败:', error);
    throw error;
  }
}

/**
 * 根据 ID 获取项目详情
 */
export async function getProjectByIdFromTable(id: string): Promise<Project> {
  try {
    const response = await projectsTableClient.get<TeableRecord<TeableProjectFields>>(
      `/table/${PROJECTS_TABLE_ID}/record/${id}`,
      { params: { fieldKeyType: 'name' } }
    );

    return mapTeableToProject(response.data.fields, response.data.id);
  } catch (error) {
    console.error('获取项目详情失败:', error);
    throw error;
  }
}

/**
 * 创建项目
 */
export async function createProjectInTable(projectData: any): Promise<Project> {
  // 获取当前登录用户信息作为提交人
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const teableFields = mapProjectToTeable({
    ...projectData,
    submitterId: currentUser?.id || '',
    submitterName: currentUser?.fullName || currentUser?.username || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);

  const requestBody: TeableCreateRequest<TeableProjectFields> = {
    fieldKeyType: 'name',
    records: [
      {
        fields: teableFields as TeableProjectFields,
      },
    ],
  };

  try {
    const response = await projectsTableClient.post<{ records: TeableRecord<TeableProjectFields>[] }>(
      `/table/${PROJECTS_TABLE_ID}/record`,
      requestBody
    );

    const createdRecord = response.data.records[0];
    return mapTeableToProject(createdRecord.fields, createdRecord.id);
  } catch (error) {
    console.error('创建项目失败:', error);
    throw error;
  }
}

/**
 * 更新项目
 */
export async function updateProjectInTable(id: string, projectData: any): Promise<Project> {
  const teableFields = mapProjectToTeable({
    ...projectData,
    updatedAt: new Date(),
  } as any);

  const requestBody: TeableUpdateRequest<TeableProjectFields> = {
    fieldKeyType: 'name',
    record: {
      fields: teableFields,
    },
  };

  try {
    const response = await projectsTableClient.patch<TeableRecord<TeableProjectFields>>(
      `/table/${PROJECTS_TABLE_ID}/record/${id}`,
      requestBody
    );

    return mapTeableToProject(response.data.fields, response.data.id);
  } catch (error) {
    console.error('更新项目失败:', error);
    throw error;
  }
}

/**
 * 删除项目
 */
export async function deleteProjectFromTable(id: string): Promise<void> {
  try {
    await projectsTableClient.delete(`/table/${PROJECTS_TABLE_ID}/record/${id}`);
  } catch (error) {
    console.error('删除项目失败:', error);
    throw error;
  }
}

/**
 * 更新项目状态
 */
export async function updateProjectStatusInTable(
  id: string,
  status: string,
  remarks?: string
): Promise<Project> {
  return updateProjectInTable(id, {
    status,
    remarks,
  });
}

/**
 * 获取 Dashboard 统计数据
 * 由于 Teable 没有聚合查询，这里需要获取所有数据后在前端计算
 */
export async function getDashboardStatsFromTable(): Promise<ProjectStats> {
  try {
    // 获取所有项目（不分页）
    const response = await projectsTableClient.get<TeableResponse<TeableProjectFields>>(
      `/table/${PROJECTS_TABLE_ID}/record`,
      {
        params: {
          fieldKeyType: 'name',
          take: 1000, // 获取最多 1000 条
        },
      }
    );

    const records = response.data.records || [];
    const projects = records.map((record) => mapTeableToProject(record.fields, record.id));

    // 统计各状态数量
    const submittedCount = projects.filter((p) => p.status === 'submitted').length;
    const pendingReviewCount = projects.filter((p) => p.status === 'pending_review').length;
    const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
    const completedCount = projects.filter((p) => p.status === 'completed').length;

    // 按类型统计
    const projectsByType = [
      { type: 'data_development' as const, count: projects.filter((p) => p.type === 'data_development').length },
      { type: 'system_development' as const, count: projects.filter((p) => p.type === 'system_development').length },
    ];

    // 按优先级统计
    const projectsByPriority = [
      { priority: 'low' as const, count: projects.filter((p) => p.priority === 'low').length },
      { priority: 'medium' as const, count: projects.filter((p) => p.priority === 'medium').length },
      { priority: 'high' as const, count: projects.filter((p) => p.priority === 'high').length },
      { priority: 'urgent' as const, count: projects.filter((p) => p.priority === 'urgent').length },
    ];

    // 最近项目（按创建时间排序，取前 5 个）
    const recentProjects = projects
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    // 计算按类型的数量
    const dataProjectsCount = projects.filter((p) => p.type === 'data_development').length;
    const systemProjectsCount = projects.filter((p) => p.type === 'system_development').length;

    return {
      total: projects.length,
      submitted: submittedCount,
      pendingReview: pendingReviewCount,
      inProgress: inProgressCount,
      completed: completedCount,
      dataProjects: dataProjectsCount,
      systemProjects: systemProjectsCount,
    };
  } catch (error) {
    console.error('获取统计数据失败:', error);
    throw error;
  }
}
