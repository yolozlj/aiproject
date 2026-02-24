/**
 * Teable API 类型定义
 */

// Teable API 响应格式
export interface TeableResponse<T = any> {
  records: TeableRecord<T>[];
  offset?: string;
}

// Teable 单条记录格式
export interface TeableRecord<T = any> {
  id: string;  // Record ID (rec_xxx)
  fields: T;
  createdTime?: string;
  lastModifiedTime?: string;
}

// Teable 筛选条件
export interface TeableFilter {
  conjunction: 'and' | 'or';
  filterSet: TeableFilterItem[];
}

export interface TeableFilterItem {
  fieldId: string;  // 必须使用 field ID (fldXXX)，不能使用字段名
  operator: TeableOperator;
  value: any;
}

// Teable 筛选操作符
export type TeableOperator =
  // Text
  | 'is'
  | 'isNot'
  | 'contains'
  | 'doesNotContain'
  | 'isEmpty'
  | 'isNotEmpty'
  // Number
  | 'isGreater'
  | 'isLess'
  | 'isGreaterEqual'
  | 'isLessEqual'
  // Date
  | 'isBefore'
  | 'isAfter'
  | 'isWithin';

// Teable 排序
export interface TeableOrderBy {
  fieldId: string;  // 必须使用 field ID (fldXXX)
  order: 'asc' | 'desc';
}

// Teable 查询参数
export interface TeableQueryParams {
  fieldKeyType?: 'name' | 'id';  // 字段键类型（推荐使用 'name'）
  take?: number;                 // 每页数量 (1-1000)
  skip?: number;                 // 跳过数量
  filter?: string;               // JSON 字符串
  orderBy?: string;              // JSON 字符串
  projection?: string[];         // 返回字段列表
  search?: string;               // 搜索关键词
}

// Teable 创建/更新记录请求
export interface TeableCreateRequest<T = any> {
  fieldKeyType: 'name' | 'id';
  records: {
    fields: T;
  }[];
}

export interface TeableUpdateRequest<T = any> {
  fieldKeyType: 'name' | 'id';
  record: {
    fields: Partial<T>;
  };
}

// Users 表字段映射
export interface TeableUserFields {
  id: string;                    // fld0mLFfG9G3VgpjmLV
  username: string;              // fld7WopPaB3uHDdCzfI
  password: string;              // fldXnWsvIM96OTRUv5L
  email: string;                 // fldriCmtaG7eSIaptpn
  full_name: string;             // fldUA8av97AJkHJbxoP
  avatar?: string;               // fldC62x7bVyrxYjrSho
  role: string;                  // fldj0oyuLlNC6Y3rWSt
  department?: string;           // fldpkwZB6oJYsnQHqQC
  phone?: string;                // fldkFP6qOoWrF7Y004C
  status: string;                // fldYFy7uHBqE2lazWyZ
  created_at?: string;           // fldKA7Yihd0FuT1i1tK (ISO 8601)
  updated_at?: string;           // fldmDLbZ6uPFlUaP1SG (ISO 8601)
}

// Users 表字段 ID 常量
export const USER_FIELD_IDS = {
  id: 'fld0mLFfG9G3VgpjmLV',
  username: 'fld7WopPaB3uHDdCzfI',
  password: 'fldXnWsvIM96OTRUv5L',
  email: 'fldriCmtaG7eSIaptpn',
  full_name: 'fldUA8av97AJkHJbxoP',
  avatar: 'fldC62x7bVyrxYjrSho',
  role: 'fldj0oyuLlNC6Y3rWSt',
  department: 'fldpkwZB6oJYsnQHqQC',
  phone: 'fldkFP6qOoWrF7Y004C',
  status: 'fldYFy7uHBqE2lazWyZ',
  created_at: 'fldKA7Yihd0FuT1i1tK',
  updated_at: 'fldmDLbZ6uPFlUaP1SG',
} as const;

// Projects 表字段映射
export interface TeableProjectFields {
  id: string;                          // fld46oWI0StH9oOKDV4
  name: string;                        // fld1SCaFG2iX7judrSW
  type: string;                        // fldnegKyvsnE3OLTUAi
  description?: string;                // fldTDfbFWXjJNlWCneW
  priority: string;                    // fldQBpUEYcHO7IgaLnH
  status: string;                      // fldWEZLWNYb45fmjrZd
  submitter_id?: string;               // fldEWHCI985uASc6yhk
  submitter_name?: string;             // fldaVowEIZesoVZFnYS
  owner_id?: string;                   // fldwANT0tqNN4M97yvQ
  owner_name?: string;                 // fldWm8agqkosmfJSzvh
  participant_ids?: string | null;     // fld2wDVKGYj6yzqgpHc (JSON array string, null to clear)
  estimated_start_date?: string;       // fldEILgUcagqd4qnT1w (ISO 8601)
  estimated_end_date?: string;         // flde3JT53TzfGhiKGwW (ISO 8601)
  actual_start_date?: string;          // fldjE5YswRM2BZ178xf (ISO 8601)
  actual_end_date?: string;            // fldWgNF7P4aiPMNdGwU (ISO 8601)
  attachments?: string | null;         // fldphqYiSDfVyNSZOn2 (JSON array string, null to clear)
  remarks?: string;                    // fld4CyYKm4pcfCOWX0E
  tags?: string | null;                // fldmsUuyiJBerUzkcEl (JSON array string, null to clear)
  created_at?: string;                 // fldcN8LCRU5At3mwrX0 (ISO 8601)
  updated_at?: string;                 // fldYZ6dmNO8Sw1T84Un (ISO 8601)
}

// Projects 表字段 ID 常量
export const PROJECT_FIELD_IDS = {
  id: 'fld46oWI0StH9oOKDV4',
  name: 'fld1SCaFG2iX7judrSW',
  type: 'fldnegKyvsnE3OLTUAi',
  description: 'fldTDfbFWXjJNlWCneW',
  priority: 'fldQBpUEYcHO7IgaLnH',
  status: 'fldWEZLWNYb45fmjrZd',
  submitter_id: 'fldEWHCI985uASc6yhk',
  submitter_name: 'fldaVowEIZesoVZFnYS',
  owner_id: 'fldwANT0tqNN4M97yvQ',
  owner_name: 'fldWm8agqkosmfJSzvh',
  participant_ids: 'fld2wDVKGYj6yzqgpHc',
  estimated_start_date: 'fldEILgUcagqd4qnT1w',
  estimated_end_date: 'flde3JT53TzfGhiKGwW',
  actual_start_date: 'fldjE5YswRM2BZ178xf',
  actual_end_date: 'fldWgNF7P4aiPMNdGwU',
  attachments: 'fldphqYiSDfVyNSZOn2',
  remarks: 'fld4CyYKm4pcfCOWX0E',
  tags: 'fldmsUuyiJBerUzkcEl',
  created_at: 'fldcN8LCRU5At3mwrX0',
  updated_at: 'fldYZ6dmNO8Sw1T84Un',
} as const;
