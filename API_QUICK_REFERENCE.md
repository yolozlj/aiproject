# API 快速参考表

## 📊 数据库表汇总

| 表名 | 中文名 | 主要字段 | 说明 |
|------|--------|----------|------|
| users | 用户表 | id, username, email, password, role | 存储用户信息 |
| projects | 项目表 | id, name, type, status, priority | 存储项目信息 |
| project_histories | 项目历史 | id, project_id, action, changes | 记录项目变更 |
| user_preferences | 用户设置 | user_id, theme, language | 用户偏好设置 |

## 🔑 关键字段对照

### 数据库字段 → API字段

| 数据库字段 | API字段 | 类型 | 说明 |
|-----------|---------|------|------|
| full_name | fullName | string | 全名 |
| submitter_id | submitterId | string | 提交人ID |
| submitter_name | submitterName | string | 提交人姓名 |
| owner_id | ownerId | string | 负责人ID |
| owner_name | ownerName | string | 负责人姓名 |
| participant_ids | participantIds | array | 参与人员ID列表 |
| estimated_start_date | estimatedStartDate | date | 预计开始时间 |
| estimated_end_date | estimatedEndDate | date | 预计完成时间 |
| actual_start_date | actualStartDate | date | 实际开始时间 |
| actual_end_date | actualEndDate | date | 实际完成时间 |
| created_at | createdAt | datetime | 创建时间 |
| updated_at | updatedAt | datetime | 更新时间 |

## 📡 API 接口速查

### 认证 (Authentication)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 登录 |
| POST | /api/auth/logout | 登出 |
| GET | /api/auth/me | 获取当前用户 |
| POST | /api/auth/refresh | 刷新Token |

### 用户 (Users)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/users | 获取用户列表 |
| GET | /api/users/:id | 获取用户详情 |
| PUT | /api/users/:id | 更新用户信息 |
| GET | /api/users/search | 搜索用户 |

### 项目 (Projects)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/projects | 获取项目列表 |
| GET | /api/projects/:id | 获取项目详情 |
| POST | /api/projects | 创建项目 |
| PUT | /api/projects/:id | 更新项目 |
| DELETE | /api/projects/:id | 删除项目 |
| PATCH | /api/projects/:id/status | 更新项目状态 |
| POST | /api/projects/:id/attachments | 上传附件 |
| DELETE | /api/projects/:id/attachments/:attachmentId | 删除附件 |
| GET | /api/projects/:id/history | 获取历史记录 |

### 统计 (Dashboard)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/dashboard/stats | 获取概览统计 |

### 设置 (Preferences)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/preferences | 获取用户设置 |
| PUT | /api/preferences | 更新用户设置 |

## 🎯 枚举值速查

### 用户角色 (role)
- `admin` - 管理员
- `project_manager` - 项目经理
- `developer` - 开发者
- `user` - 普通用户

### 用户状态 (status)
- `active` - 激活
- `inactive` - 停用

### 项目类型 (type)
- `data_development` - 数据开发需求
- `system_development` - 系统开发需求

### 项目状态 (status)
- `submitted` - 需求提交
- `pending_review` - 待评审
- `in_progress` - 开发中
- `completed` - 已完成

### 优先级 (priority)
- `low` - 低
- `medium` - 中
- `high` - 高
- `urgent` - 紧急

### 主题 (theme)
- `minimal` - 超极简
- `glass` - 玻璃拟态
- `dark` - 暗黑模式

### 语言 (language)
- `zh-CN` - 中文
- `en-US` - 英文

## 📦 响应格式模板

### 成功响应
```json
{
  "code": 0,
  "message": "success",
  "data": { }
}
```

### 分页响应
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "data": [],
    "total": 0,
    "page": 1,
    "pageSize": 10
  }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

## 🔢 常用错误码

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
| 2001 | 项目不存在 |
| 3001 | 用户不存在 |

## 🔐 认证说明

### 请求头格式
```
Authorization: Bearer <access_token>
```

### Token 有效期
- Access Token: 2小时
- Refresh Token: 7天

## 📝 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 项目经理 | pm | pm123 |
| 开发者 | dev | dev123 |
| 普通用户 | user | user123 |

---

**注意**: 详细的接口规范请参考 `API_BACKEND_REQUIREMENTS.md`
