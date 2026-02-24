# 后端 API 开发需求文档

## 📋 文档概述

本文档详细定义了项目管理系统的后端API规范，包括数据库表结构、字段定义、API接口规范、请求/响应格式等。

---

## 📊 数据库表结构

### 1. 用户表 (users)

**表名**: `users`

| 字段名 | 数据类型 | 长度 | 必填 | 唯一 | 默认值 | 说明 |
|--------|---------|------|------|------|--------|------|
| id | VARCHAR | 36 | ✅ | ✅ | UUID | 用户ID（主键） |
| username | VARCHAR | 50 | ✅ | ✅ | - | 用户名 |
| email | VARCHAR | 100 | ✅ | ✅ | - | 邮箱 |
| password | VARCHAR | 255 | ✅ | ❌ | - | 密码（bcrypt加密） |
| full_name | VARCHAR | 100 | ✅ | ❌ | - | 全名 |
| avatar | VARCHAR | 255 | ❌ | ❌ | NULL | 头像URL |
| role | VARCHAR | 20 | ✅ | ❌ | 'user' | 角色 |
| department | VARCHAR | 100 | ❌ | ❌ | NULL | 部门 |
| phone | VARCHAR | 20 | ❌ | ❌ | NULL | 电话 |
| status | VARCHAR | 20 | ✅ | ❌ | 'active' | 状态 |
| created_at | TIMESTAMP | - | ✅ | ❌ | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | - | ✅ | ❌ | CURRENT_TIMESTAMP | 更新时间 |

**字段枚举值**：
- `role`: `'admin'`, `'project_manager'`, `'developer'`, `'user'`
- `status`: `'active'`, `'inactive'`

**索引**：
```sql
PRIMARY KEY (id)
UNIQUE INDEX idx_username (username)
UNIQUE INDEX idx_email (email)
INDEX idx_role (role)
INDEX idx_status (status)
```

---

### 2. 项目表 (projects)

**表名**: `projects`

| 字段名 | 数据类型 | 长度 | 必填 | 唯一 | 默认值 | 说明 |
|--------|---------|------|------|------|--------|------|
| id | VARCHAR | 36 | ✅ | ✅ | UUID | 项目ID（主键） |
| name | VARCHAR | 200 | ✅ | ❌ | - | 项目名称 |
| type | VARCHAR | 50 | ✅ | ❌ | - | 项目类型 |
| description | TEXT | - | ✅ | ❌ | - | 项目描述 |
| priority | VARCHAR | 20 | ✅ | ❌ | 'medium' | 优先级 |
| status | VARCHAR | 50 | ✅ | ❌ | 'submitted' | 项目状态 |
| submitter_id | VARCHAR | 36 | ✅ | ❌ | - | 提交人ID（外键） |
| submitter_name | VARCHAR | 100 | ✅ | ❌ | - | 提交人姓名 |
| owner_id | VARCHAR | 36 | ❌ | ❌ | NULL | 负责人ID（外键） |
| owner_name | VARCHAR | 100 | ❌ | ❌ | NULL | 负责人姓名 |
| participant_ids | JSON | - | ❌ | ❌ | '[]' | 参与人员ID列表 |
| estimated_start_date | DATE | - | ❌ | ❌ | NULL | 预计开始时间 |
| estimated_end_date | DATE | - | ❌ | ❌ | NULL | 预计完成时间 |
| actual_start_date | DATE | - | ❌ | ❌ | NULL | 实际开始时间 |
| actual_end_date | DATE | - | ❌ | ❌ | NULL | 实际完成时间 |
| remarks | TEXT | - | ❌ | ❌ | NULL | 备注说明 |
| attachments | JSON | - | ❌ | ❌ | '[]' | 附件列表 |
| tags | JSON | - | ❌ | ❌ | '[]' | 标签 |
| created_at | TIMESTAMP | - | ✅ | ❌ | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | - | ✅ | ❌ | CURRENT_TIMESTAMP | 更新时间 |

**字段枚举值**：
- `type`: `'data_development'`, `'system_development'`
- `priority`: `'low'`, `'medium'`, `'high'`, `'urgent'`
- `status`: `'submitted'`, `'pending_review'`, `'in_progress'`, `'completed'`

**JSON 字段格式**：

`participant_ids` 示例：
```json
["user-id-1", "user-id-2", "user-id-3"]
```

`attachments` 示例：
```json
[
  {
    "id": "attachment-uuid",
    "fileName": "需求文档.pdf",
    "fileUrl": "https://cdn.example.com/files/xxx.pdf",
    "fileSize": 1024000,
    "fileType": "application/pdf",
    "uploadedAt": "2024-01-01T00:00:00Z",
    "uploadedBy": "user-id"
  }
]
```

`tags` 示例：
```json
["重要", "紧急", "数据"]
```

**索引**：
```sql
PRIMARY KEY (id)
INDEX idx_type (type)
INDEX idx_status (status)
INDEX idx_priority (priority)
INDEX idx_submitter (submitter_id)
INDEX idx_owner (owner_id)
INDEX idx_created_at (created_at DESC)
FOREIGN KEY (submitter_id) REFERENCES users(id)
FOREIGN KEY (owner_id) REFERENCES users(id)
```

---

### 3. 项目历史记录表 (project_histories)

**表名**: `project_histories`

| 字段名 | 数据类型 | 长度 | 必填 | 唯一 | 默认值 | 说明 |
|--------|---------|------|------|------|--------|------|
| id | VARCHAR | 36 | ✅ | ✅ | UUID | 记录ID（主键） |
| project_id | VARCHAR | 36 | ✅ | ❌ | - | 项目ID（外键） |
| user_id | VARCHAR | 36 | ✅ | ❌ | - | 操作用户ID（外键） |
| user_name | VARCHAR | 100 | ✅ | ❌ | - | 操作用户姓名 |
| action | VARCHAR | 100 | ✅ | ❌ | - | 操作类型 |
| changes | JSON | - | ✅ | ❌ | - | 变更内容 |
| created_at | TIMESTAMP | - | ✅ | ❌ | CURRENT_TIMESTAMP | 创建时间 |

**action 字段示例**：
- "创建项目"
- "更新状态"
- "修改信息"
- "上传附件"
- "删除附件"
- "分配负责人"

**changes 字段格式**：
```json
{
  "status": {
    "from": "submitted",
    "to": "in_progress"
  },
  "owner_id": {
    "from": null,
    "to": "user-id-123"
  }
}
```

**索引**：
```sql
PRIMARY KEY (id)
INDEX idx_project (project_id)
INDEX idx_created_at (created_at DESC)
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
FOREIGN KEY (user_id) REFERENCES users(id)
```

---

### 4. 用户设置表 (user_preferences)

**表名**: `user_preferences`

| 字段名 | 数据类型 | 长度 | 必填 | 唯一 | 默认值 | 说明 |
|--------|---------|------|------|------|--------|------|
| user_id | VARCHAR | 36 | ✅ | ✅ | - | 用户ID（主键、外键） |
| theme | VARCHAR | 20 | ✅ | ❌ | 'minimal' | 主题 |
| language | VARCHAR | 10 | ✅ | ❌ | 'zh-CN' | 语言 |
| created_at | TIMESTAMP | - | ✅ | ❌ | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | - | ✅ | ❌ | CURRENT_TIMESTAMP | 更新时间 |

**字段枚举值**：
- `theme`: `'minimal'`, `'glass'`, `'dark'`
- `language`: `'zh-CN'`, `'en-US'`

**索引**：
```sql
PRIMARY KEY (user_id)
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

---

## 🔌 API 接口规范

### 通用规范

#### 请求头 (Request Headers)

```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

#### 统一响应格式

**成功响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

**错误响应**：
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

#### 分页参数

所有列表接口支持以下查询参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | ❌ | 1 | 页码（从1开始） |
| pageSize | number | ❌ | 10 | 每页数量 |

#### 分页响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "data": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 📡 API 接口列表

### 1. 认证接口

#### 1.1 用户登录

**接口**: `POST /api/auth/login`

**请求体**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user": {
      "id": "user-uuid",
      "username": "admin",
      "email": "admin@example.com",
      "fullName": "系统管理员",
      "avatar": "https://example.com/avatar.jpg",
      "role": "admin",
      "department": "技术部",
      "phone": "13800138000",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误码**:
- `1001`: 用户名或密码错误
- `3001`: 用户不存在
- `1004`: 用户已被禁用

---

#### 1.2 用户登出

**接口**: `POST /api/auth/logout`

**请求头**: 需要 Authorization

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

#### 1.3 获取当前用户信息

**接口**: `GET /api/auth/me`

**请求头**: 需要 Authorization

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "user-uuid",
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "系统管理员",
    "avatar": "https://example.com/avatar.jpg",
    "role": "admin",
    "department": "技术部",
    "phone": "13800138000",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**错误码**:
- `1002`: Token已过期
- `1003`: Token无效

---

#### 1.4 刷新Token

**接口**: `POST /api/auth/refresh`

**请求体**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

---

### 2. 用户接口

#### 2.1 获取用户列表

**接口**: `GET /api/users`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| pageSize | number | ❌ | 每页数量 |
| search | string | ❌ | 搜索关键词（姓名、邮箱） |

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "data": [
      {
        "id": "user-uuid",
        "username": "user1",
        "email": "user1@example.com",
        "fullName": "用户一",
        "avatar": "https://example.com/avatar.jpg",
        "role": "developer",
        "department": "技术部",
        "phone": "13800138000",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

---

#### 2.2 获取用户详情

**接口**: `GET /api/users/:id`

**路径参数**:
- `id`: 用户ID

**响应**: 同 1.3 获取当前用户信息

---

#### 2.3 更新用户信息

**接口**: `PUT /api/users/:id`

**路径参数**:
- `id`: 用户ID

**请求体**:
```json
{
  "fullName": "新姓名",
  "avatar": "https://example.com/new-avatar.jpg",
  "department": "新部门",
  "phone": "13900139000"
}
```

**响应**: 返回更新后的用户信息

---

#### 2.4 搜索用户

**接口**: `GET /api/users/search`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | ✅ | 搜索关键词 |

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "user-uuid",
      "fullName": "张三",
      "avatar": "https://example.com/avatar.jpg",
      "department": "技术部"
    }
  ]
}
```

---

### 3. 项目接口

#### 3.1 获取项目列表

**接口**: `GET /api/projects`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| pageSize | number | ❌ | 每页数量 |
| search | string | ❌ | 搜索关键词（项目名称） |
| type | string | ❌ | 项目类型 |
| status | string | ❌ | 项目状态 |
| priority | string | ❌ | 优先级 |
| startDate | string | ❌ | 开始日期（YYYY-MM-DD） |
| endDate | string | ❌ | 结束日期（YYYY-MM-DD） |

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "data": [
      {
        "id": "project-uuid",
        "name": "数据分析项目",
        "type": "data_development",
        "description": "项目描述",
        "priority": "high",
        "status": "in_progress",
        "submitterId": "user-uuid",
        "submitterName": "张三",
        "ownerId": "user-uuid",
        "ownerName": "李四",
        "participantIds": ["user-uuid-1", "user-uuid-2"],
        "estimatedStartDate": "2024-01-01",
        "estimatedEndDate": "2024-03-01",
        "actualStartDate": "2024-01-05",
        "actualEndDate": null,
        "remarks": "备注信息",
        "attachments": [],
        "tags": ["重要", "紧急"],
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  }
}
```

---

#### 3.2 获取项目详情

**接口**: `GET /api/projects/:id`

**路径参数**:
- `id`: 项目ID

**响应**: 返回单个项目对象（格式同3.1中的单个项目）

---

#### 3.3 创建项目

**接口**: `POST /api/projects`

**请求头**: 需要 Authorization

**请求体**:
```json
{
  "name": "新项目名称",
  "type": "data_development",
  "description": "项目描述",
  "priority": "medium",
  "ownerId": "user-uuid",
  "participantIds": ["user-uuid-1"],
  "estimatedStartDate": "2024-01-01",
  "estimatedEndDate": "2024-03-01",
  "remarks": "备注信息",
  "tags": ["标签1", "标签2"]
}
```

**响应**: 返回创建的项目对象

**说明**:
- `submitterId` 和 `submitterName` 由后端根据当前登录用户自动填充
- `status` 默认为 `"submitted"`

---

#### 3.4 更新项目

**接口**: `PUT /api/projects/:id`

**路径参数**:
- `id`: 项目ID

**请求头**: 需要 Authorization

**请求体**: 支持部分更新，字段同创建项目

**响应**: 返回更新后的项目对象

---

#### 3.5 删除项目

**接口**: `DELETE /api/projects/:id`

**路径参数**:
- `id`: 项目ID

**请求头**: 需要 Authorization

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

#### 3.6 更新项目状态

**接口**: `PATCH /api/projects/:id/status`

**路径参数**:
- `id`: 项目ID

**请求头**: 需要 Authorization

**请求体**:
```json
{
  "status": "in_progress",
  "remarks": "开始开发"
}
```

**响应**: 返回更新后的项目对象

**说明**:
- 状态变更会自动记录到 `project_histories` 表
- 如果状态变为 `in_progress` 且 `actualStartDate` 为空，自动设置为当前日期
- 如果状态变为 `completed` 且 `actualEndDate` 为空，自动设置为当前日期

---

#### 3.7 上传附件

**接口**: `POST /api/projects/:id/attachments`

**路径参数**:
- `id`: 项目ID

**请求头**:
- `Content-Type: multipart/form-data`
- `Authorization: Bearer <token>`

**请求体**:
- `file`: 文件对象（File）

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "fileUrl": "https://cdn.example.com/files/xxx.pdf"
  }
}
```

**说明**:
- 上传成功后，需要将附件信息添加到项目的 `attachments` 字段中
- 附件信息包含：id, fileName, fileUrl, fileSize, fileType, uploadedAt, uploadedBy

---

#### 3.8 删除附件

**接口**: `DELETE /api/projects/:id/attachments/:attachmentId`

**路径参数**:
- `id`: 项目ID
- `attachmentId`: 附件ID

**请求头**: 需要 Authorization

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

#### 3.9 获取项目历史记录

**接口**: `GET /api/projects/:id/history`

**路径参数**:
- `id`: 项目ID

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "history-uuid",
      "projectId": "project-uuid",
      "userId": "user-uuid",
      "userName": "张三",
      "action": "更新状态",
      "changes": {
        "status": {
          "from": "submitted",
          "to": "in_progress"
        }
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 4. 统计接口

#### 4.1 获取概览统计

**接口**: `GET /api/dashboard/stats`

**请求头**: 需要 Authorization

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 100,
    "submitted": 10,
    "pendingReview": 15,
    "inProgress": 50,
    "completed": 25,
    "dataProjects": 60,
    "systemProjects": 40
  }
}
```

**说明**:
- `total`: 项目总数
- `submitted`: 需求提交状态的项目数
- `pendingReview`: 待评审状态的项目数
- `inProgress`: 开发中状态的项目数
- `completed`: 已完成状态的项目数
- `dataProjects`: 数据开发类型的项目数
- `systemProjects`: 系统开发类型的项目数

---

### 5. 用户设置接口

#### 5.1 获取用户偏好设置

**接口**: `GET /api/preferences`

**请求头**: 需要 Authorization

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "userId": "user-uuid",
    "theme": "minimal",
    "language": "zh-CN",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 5.2 更新用户偏好设置

**接口**: `PUT /api/preferences`

**请求头**: 需要 Authorization

**请求体**:
```json
{
  "theme": "dark",
  "language": "en-US"
}
```

**响应**: 返回更新后的偏好设置

---

## 🔐 认证与鉴权

### Token 机制

- **Access Token**: 有效期 2 小时
- **Refresh Token**: 有效期 7 天
- Token 使用 JWT 格式

### Token 刷新流程

1. Access Token 过期时，前端会收到 401 错误
2. 前端自动调用 `/api/auth/refresh` 接口
3. 使用 Refresh Token 获取新的 Access Token 和 Refresh Token
4. 重新发起原请求

### 权限控制

根据用户 `role` 字段进行权限判断：

| 角色 | 权限 |
|------|------|
| admin | 所有权限 |
| project_manager | 管理所有项目、审核、分配 |
| developer | 查看、更新自己负责的项目 |
| user | 创建、查看自己提交的项目 |

---

## 📝 业务规则

### 1. 项目状态流转

```
submitted → pending_review → in_progress → completed
```

- 只有 `admin` 和 `project_manager` 可以将项目从 `submitted` 改为 `pending_review`
- 只有 `admin` 和 `project_manager` 可以将项目从 `pending_review` 改为 `in_progress`
- 项目 `owner` 或以上权限可以将项目改为 `completed`

### 2. 项目操作权限

- **创建**: 所有角色
- **查看**:
  - `admin`, `project_manager`: 所有项目
  - `developer`: 自己负责的项目
  - `user`: 自己提交的项目
- **编辑**:
  - `admin`, `project_manager`: 所有项目
  - `developer`: 自己负责的项目
  - `user`: 自己提交且状态为 `submitted` 的项目
- **删除**: 仅 `admin`

### 3. 历史记录

以下操作需要记录到 `project_histories`:
- 创建项目
- 更新项目状态
- 修改项目信息（name, description, priority等）
- 分配/变更负责人
- 上传附件
- 删除附件

---

## ⚠️ 错误码定义

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |
| 1001 | 用户名或密码错误 |
| 1002 | Token已过期 |
| 1003 | Token无效 |
| 1004 | 无权限访问 |
| 2001 | 项目不存在 |
| 2002 | 项目状态不允许此操作 |
| 2003 | 文件上传失败 |
| 2004 | 文件大小超过限制 |
| 3001 | 用户不存在 |
| 3002 | 邮箱已被使用 |
| 3003 | 用户名已被使用 |

---

## 📌 注意事项

### 1. 时间格式
- 数据库存储: UTC 时间
- API 传输: ISO 8601 格式（如：`2024-01-01T00:00:00Z`）
- 日期参数: `YYYY-MM-DD` 格式

### 2. 密码加密
- 使用 bcrypt 算法
- 工作因子（cost）至少为 10

### 3. 文件上传
- 单个文件最大: 10MB
- 支持的文件类型: PDF, Word, Excel, 图片（JPG, PNG, GIF）

### 4. 分页
- `page` 从 1 开始
- `pageSize` 最大值: 100

### 5. 字段命名
- 数据库: 使用 `snake_case`（如：`full_name`）
- API: 使用 `camelCase`（如：`fullName`）
- 后端需要做字段名转换

---

## 🧪 测试账号

建议创建以下测试账号：

```sql
-- 管理员
INSERT INTO users (id, username, email, password, full_name, role, status)
VALUES (UUID(), 'admin', 'admin@example.com', '$2a$10$...', '系统管理员', 'admin', 'active');

-- 项目经理
INSERT INTO users (id, username, email, password, full_name, role, status)
VALUES (UUID(), 'pm', 'pm@example.com', '$2a$10$...', '项目经理', 'project_manager', 'active');

-- 开发者
INSERT INTO users (id, username, email, password, full_name, role, status)
VALUES (UUID(), 'dev', 'dev@example.com', '$2a$10$...', '开发工程师', 'developer', 'active');

-- 普通用户
INSERT INTO users (id, username, email, password, full_name, role, status)
VALUES (UUID(), 'user', 'user@example.com', '$2a$10$...', '普通用户', 'user', 'active');
```

密码统一为对应角色名 + `123`（如：`admin123`）

---

## 📞 联系方式

如有疑问，请联系前端开发团队。

---

**文档版本**: v1.0
**更新日期**: 2024-01-01
