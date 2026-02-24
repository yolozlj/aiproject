# API 枚举值完整列表

本文档列出了项目管理系统中所有API涉及的枚举字段及其可选值。

---

## 一、用户（Users）相关枚举

### 1. 用户角色（role）

**字段名**: `role`
**类型**: `Role`
**说明**: 用户在系统中的角色权限

| 前端值 | 数据库值 | 中文名称 | 英文名称 | 权限说明 |
|--------|---------|---------|---------|---------|
| `admin` | `admin` | 管理员 | Admin | 所有权限，包括用户管理、项目管理、系统设置 |
| `project_manager` | `project_manager` | 项目经理 | Project Manager | 项目管理、审核、分配权限 |
| `developer` | `developer` | 开发者 | Developer | 创建、查看、更新自己负责的项目 |
| `user` | `user` | 普通用户 | User | 创建、查看自己提交的项目 |

**使用场景**:
- 创建/编辑用户时必选
- 控制页面和功能的访问权限
- 决定用户可执行的操作

---

### 2. 用户状态（status）

**字段名**: `status`
**类型**: `UserStatus`
**说明**: 用户账号的激活状态

| 前端值 | 数据库值 | 中文名称 | 英文名称 | 说明 |
|--------|---------|---------|---------|------|
| `active` | `active` | 激活 | Active | 用户可以正常登录和使用系统 |
| `inactive` | `inactive` | 停用 | Inactive | 用户被禁用，无法登录系统 |

**使用场景**:
- 创建用户时设置（默认为 active）
- 停用/启用用户账号
- 登录时验证用户状态

---

## 二、项目（Projects）相关枚举

### 3. 项目类型（type）

**字段名**: `type`
**类型**: `ProjectType`
**说明**: 项目的业务类型分类

| 前端值 | 数据库值（中文） | 中文名称 | 英文名称 | 说明 |
|--------|---------------|---------|---------|------|
| `data_development` | `数据开发需求` | 数据开发需求 | Data Development | 数据分析、数据处理、BI报表等需求 |
| `system_development` | `系统开发需求` | 系统开发需求 | System Development | 系统功能开发、系统集成等需求 |

**使用场景**:
- 创建项目时必选
- 项目列表筛选
- 统计报表分类

**注意事项**:
- ⚠️ 数据库存储的是中文值（如"数据开发需求"）
- ⚠️ 前端使用英文值（如"data_development"）
- ✅ 系统会自动进行中英文转换

---

### 4. 项目状态（status）

**字段名**: `status`
**类型**: `ProjectStatus`
**说明**: 项目在生命周期中的阶段

| 前端值 | 数据库值（中文） | 中文名称 | 英文名称 | 说明 |
|--------|---------------|---------|---------|------|
| `submitted` | `需求提交` | 需求提交 | Submitted | 项目已提交，等待处理 |
| `pending_review` | `待评审` | 待评审 | Pending Review | 项目等待评审或审批 |
| `in_progress` | `开发中` | 开发中 | In Progress | 项目正在开发实施中 |
| `completed` | `已完成` | 已完成 | Completed | 项目已完成并交付 |

**状态流转**:
```
需求提交 → 待评审 → 开发中 → 已完成
```

**使用场景**:
- 创建项目时设置（默认为 submitted）
- 更新项目进度
- 项目列表筛选
- Dashboard 统计

**注意事项**:
- ⚠️ 数据库存储的是中文值（如"待评审"）
- ⚠️ 前端使用英文值（如"pending_review"）
- ✅ 系统会自动进行中英文转换

---

### 5. 优先级（priority）

**字段名**: `priority`
**类型**: `Priority`
**说明**: 项目的紧急程度和重要性

| 前端值 | 数据库值（中文） | 中文名称 | 英文名称 | 颜色标识 | 说明 |
|--------|---------------|---------|---------|---------|------|
| `low` | `低` | 低 | Low | 灰色 | 优先级较低，可以延后处理 |
| `medium` | `中` | 中 | Medium | 蓝色 | 正常优先级，按计划推进 |
| `high` | `高` | 高 | High | 橙色 | 优先级较高，需尽快处理 |
| `urgent` | `紧急` | 紧急 | Urgent | 红色 | 最高优先级，需立即处理 |

**使用场景**:
- 创建项目时必选
- 项目列表排序和筛选
- 资源分配决策
- Dashboard 统计

**注意事项**:
- ⚠️ 数据库存储的是中文值（如"高"）
- ⚠️ 前端使用英文值（如"high"）
- ✅ 系统会自动进行中英文转换

---

## 三、用户偏好（User Preferences）相关枚举

### 6. 主题（theme）

**字段名**: `theme`
**类型**: `Theme`
**说明**: 用户界面主题风格

| 值 | 中文名称 | 英文名称 | 说明 |
|----|---------|---------|------|
| `minimal` | 超极简 | Minimal | 纯白背景、细线条、微阴影 |
| `glass` | 玻璃拟态（高对比度） | Glassmorphism | 半透明背景、毛玻璃效果 |
| `dark` | 暗黑模式 | Dark Mode | 深色背景、高对比度、护眼 |

**使用场景**:
- 用户个人设置
- 界面主题切换

---

### 7. 语言（language）

**字段名**: `language`
**类型**: `Language`
**说明**: 系统界面语言

| 值 | 显示名称 | 说明 |
|----|---------|------|
| `zh-CN` | 中文 | 简体中文界面 |
| `en-US` | English | 英文界面 |

**使用场景**:
- 用户个人设置
- 界面语言切换
- i18n 国际化

---

## 四、数据映射关系

### Projects 表字段映射（重要）

由于历史原因，Projects 表在数据库中存储的是**中文值**，而前端代码使用的是**英文值**。系统通过 `projectMapper.ts` 自动进行双向转换。

#### 转换规则

**读取时（数据库 → 前端）**:
```typescript
// 项目类型
"数据开发需求" → "data_development"
"系统开发需求" → "system_development"

// 项目状态
"需求提交" → "submitted"
"待评审" → "pending_review"
"开发中" → "in_progress"
"已完成" → "completed"

// 优先级
"低" → "low"
"中" → "medium"
"高" → "high"
"紧急" → "urgent"
```

**保存时（前端 → 数据库）**:
```typescript
// 项目类型
"data_development" → "数据开发需求"
"system_development" → "系统开发需求"

// 项目状态
"submitted" → "需求提交"
"pending_review" → "待评审"
"in_progress" → "开发中"
"completed" → "已完成"

// 优先级
"low" → "低"
"medium" → "中"
"high" → "高"
"urgent" → "紧急"
```

---

## 五、API 使用示例

### 1. 创建用户

```typescript
POST /api/users

{
  "username": "zhangsan",
  "password": "123456",
  "email": "zhangsan@example.com",
  "fullName": "张三",
  "role": "developer",        // ← 使用英文枚举值
  "department": "技术部",
  "phone": "13800138000",
  "status": "active"          // ← 使用英文枚举值
}
```

### 2. 创建项目

```typescript
POST /api/projects

{
  "name": "用户管理系统优化",
  "type": "system_development",    // ← 前端传英文值
  "description": "优化用户管理功能",
  "priority": "high",              // ← 前端传英文值
  "status": "submitted",           // ← 前端传英文值
  "submitterId": "user_001",
  "submitterName": "张三"
}

// 注意：系统会自动转换为中文后存入数据库
// type: "system_development" → "系统开发需求"
// priority: "high" → "高"
// status: "submitted" → "需求提交"
```

### 3. 筛选项目

```typescript
GET /api/projects?type=data_development&status=in_progress&priority=high

// 查询条件：
// - 项目类型：数据开发需求
// - 项目状态：开发中
// - 优先级：高
```

### 4. 更新项目状态

```typescript
PATCH /api/projects/:id

{
  "status": "completed"  // ← 前端传英文值，系统转为"已完成"存储
}
```

---

## 六、前端组件中使用枚举

### 1. Select 下拉选择

```tsx
// 角色选择
<Select>
  <Option value="admin">{t('user.role_admin')}</Option>
  <Option value="project_manager">{t('user.role_project_manager')}</Option>
  <Option value="developer">{t('user.role_developer')}</Option>
  <Option value="user">{t('user.role_user')}</Option>
</Select>

// 项目类型选择
<Select>
  <Option value="data_development">{t('project.type_data_development')}</Option>
  <Option value="system_development">{t('project.type_system_development')}</Option>
</Select>

// 项目状态选择
<Select>
  <Option value="submitted">{t('project.status_submitted')}</Option>
  <Option value="pending_review">{t('project.status_pending_review')}</Option>
  <Option value="in_progress">{t('project.status_in_progress')}</Option>
  <Option value="completed">{t('project.status_completed')}</Option>
</Select>

// 优先级选择
<Select>
  <Option value="low">{t('project.priority_low')}</Option>
  <Option value="medium">{t('project.priority_medium')}</Option>
  <Option value="high">{t('project.priority_high')}</Option>
  <Option value="urgent">{t('project.priority_urgent')}</Option>
</Select>
```

### 2. Tag 标签显示

```tsx
// 角色标签
<Tag color={getRoleColor(user.role)}>
  {t(`user.role_${user.role}`)}
</Tag>

// 项目状态标签
<Tag color={getStatusColor(project.status)}>
  {t(`project.status_${project.status}`)}
</Tag>

// 优先级标签
<Tag color={getPriorityColor(project.priority)}>
  {t(`project.priority_${project.priority}`)}
</Tag>
```

---

## 七、注意事项

### 1. 数据一致性
- ✅ **前端代码**：统一使用英文枚举值（如 `data_development`）
- ⚠️ **Projects 数据库**：存储中文值（如 `数据开发需求`）
- ⚠️ **Users 数据库**：存储英文值（如 `developer`）
- ✅ 系统通过 mapper 自动转换，开发者无需手动处理

### 2. 添加新枚举值的步骤

如果需要添加新的枚举值，需要修改以下文件：

1. **类型定义** - `src/types/common.ts`
   ```typescript
   export type Priority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';  // 添加 critical
   ```

2. **数据映射** - `src/utils/projectMapper.ts`
   ```typescript
   const PRIORITY_MAP: Record<string, Priority> = {
     // ... 其他映射
     '关键': 'critical',
     'critical': 'critical',
   };

   const PRIORITY_TO_CN: Record<Priority, string> = {
     // ... 其他映射
     'critical': '关键',
   };
   ```

3. **翻译文件** - `public/locales/zh-CN/translation.json`
   ```json
   {
     "project": {
       "priority_critical": "关键"
     }
   }
   ```

4. **英文翻译** - `public/locales/en-US/translation.json`
   ```json
   {
     "project": {
       "priority_critical": "Critical"
     }
   }
   ```

### 3. 验证枚举值

在使用枚举值时，建议进行类型检查：

```typescript
// ✅ 正确：使用 TypeScript 类型
import type { Role, ProjectType, Priority } from '@/types';

// ❌ 错误：使用字符串
const role = "admin";  // 没有类型检查

// ✅ 正确：使用类型注解
const role: Role = "admin";  // 有类型检查
```

---

## 八、枚举值完整清单

### 快速参考表

| 枚举字段 | 可选值数量 | 使用表 | 数据库格式 |
|---------|----------|-------|-----------|
| role | 4 | Users | 英文 |
| status (用户) | 2 | Users | 英文 |
| type (项目) | 2 | Projects | 中文 |
| status (项目) | 4 | Projects | 中文 |
| priority | 4 | Projects | 中文 |
| theme | 3 | UserPreferences | 英文 |
| language | 2 | UserPreferences | 英文 |

**总计**: 7 个枚举字段，21 个可选值

---

**文档版本**: 1.0
**最后更新**: 2026-02-18
**维护者**: 项目管理系统开发团队
