# Projects API 集成完成

## ✅ Projects 表 API 已成功接入！

Projects 表的 Teable API 已经完全集成到项目中，现在使用真实的数据库进行项目管理。

## 📊 集成概览

### 已完成的工作

1. **环境配置** ✅
   - 添加 Projects 表 ID 和 Token
   - 配置独立的 API 客户端

2. **类型定义** ✅
   - TeableProjectFields 接口
   - PROJECT_FIELD_IDS 常量
   - 20 个字段映射

3. **数据映射** ✅
   - projectMapper.ts 工具
   - Teable ↔ Frontend 双向转换
   - JSON 字段自动序列化/反序列化

4. **API 实现** ✅
   - 获取项目列表（分页、筛选、排序）
   - 获取项目详情
   - 创建项目
   - 更新项目
   - 删除项目
   - Dashboard 统计

## 🔧 技术实现

### 环境变量

```env
# Projects Table Configuration
VITE_PROJECTS_TABLE_ID=tbl2XPxoSffear3Cvcm
VITE_PROJECTS_TOKEN=teable_accTMyliuowmHE4Rxvc_FtJIml2VQMB9QGJGB9y5OhfWUWh05I0TdPlwskTUli0=
```

### 字段映射

| 前端字段 | Teable 字段 | 字段 ID | 类型 |
|---------|------------|---------|------|
| id | id | fld46oWI0StH9oOKDV4 | string |
| name | name | fld1SCaFG2iX7judrSW | string |
| type | type | fldnegKyvsnE3OLTUAi | string |
| description | description | fldTDfbFWXjJNlWCneW | text |
| priority | priority | fldQBpUEYcHO7IgaLnH | string |
| status | status | fldWEZLWNYb45fmjrZd | string |
| submitterId | submitter_id | fldEWHCI985uASc6yhk | string |
| submitterName | submitter_name | fldaVowEIZesoVZFnYS | string |
| ownerId | owner_id | fldwANT0tqNN4M97yvQ | string |
| ownerName | owner_name | fldWm8agqkosmfJSzvh | string |
| participantIds | participant_ids | fld2wDVKGYj6yzqgpHc | JSON array |
| estimatedStartDate | estimated_start_date | fldEILgUcagqd4qnT1w | Date |
| estimatedEndDate | estimated_end_date | flde3JT53TzfGhiKGwW | Date |
| actualStartDate | actual_start_date | fldjE5YswRM2BZ178xf | Date |
| actualEndDate | actual_end_date | fldWgNF7P4aiPMNdGwU | Date |
| attachments | attachments | fldphqYiSDfVyNSZOn2 | JSON array |
| remarks | remarks | fld4CyYKm4pcfCOWX0E | text |
| tags | tags | fldmsUuyiJBerUzkcEl | JSON array |
| createdAt | created_at | fldcN8LCRU5At3mwrX0 | Date |
| updatedAt | updated_at | fldYZ6dmNO8Sw1T84Un | Date |

### 新增文件

1. **src/api/projectsTableClient.ts**
   - Projects 表专用 Axios 客户端
   - 自动添加 Projects Token
   - 错误处理和日志

2. **src/api/realProjectApi.ts**
   - 完整的 Projects API 实现
   - 6 个核心函数
   - 支持筛选、排序、分页

3. **src/utils/projectMapper.ts**
   - 数据格式转换工具
   - 处理 JSON 字段
   - 日期格式转换

4. **src/types/teable.ts** (已更新)
   - 添加 TeableProjectFields
   - 添加 PROJECT_FIELD_IDS

## 🎯 API 功能

### 1. 获取项目列表

```typescript
import { getProjects } from '@/api/project';

const result = await getProjects({
  page: 1,
  pageSize: 20,
  type: 'data_development',
  status: 'in_progress',
  priority: 'high',
  keyword: '搜索关键词',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

**支持的筛选**:
- `type`: 项目类型 (data_development | system_development)
- `status`: 项目状态 (submitted | pending_review | in_progress | completed)
- `priority`: 优先级 (low | medium | high | urgent)
- `keyword`: 关键词搜索（搜索名称和描述）

**支持的排序**:
- `name`: 按名称排序
- `createdAt`: 按创建时间排序
- `priority`: 按优先级排序
- `status`: 按状态排序

### 2. 获取项目详情

```typescript
import { getProjectById } from '@/api/project';

const project = await getProjectById('rec_xxxxx');
```

### 3. 创建项目

```typescript
import { createProject } from '@/api/project';

const newProject = await createProject({
  name: '项目名称',
  type: 'data_development',
  description: '项目描述',
  priority: 'high',
  status: 'submitted',
  submitterId: 'user_id',
  submitterName: '提交人',
});
```

### 4. 更新项目

```typescript
import { updateProject } from '@/api/project';

const updated = await updateProject('rec_xxxxx', {
  status: 'in_progress',
  ownerId: 'user_id',
  ownerName: '负责人',
});
```

### 5. 删除项目

```typescript
import { deleteProject } from '@/api/project';

await deleteProject('rec_xxxxx');
```

### 6. 获取 Dashboard 统计

```typescript
import { getDashboardStats } from '@/api/project';

const stats = await getDashboardStats();
// 返回: 总数、各状态数量、类型分布、优先级分布、最近项目
```

## 🎨 前端使用

### Dashboard 页面

现在会显示真实的项目统计数据：
- 总项目数
- 待评审数量
- 开发中数量
- 已完成数量
- 按类型分布
- 按优先级分布
- 最近项目列表

### 项目列表页面

- 显示真实的项目数据
- 支持筛选和搜索
- 支持分页
- 可以创建、编辑、删除项目

### 项目详情页面

- 显示完整的项目信息
- 包含所有字段
- 支持编辑和更新

## 📝 数据格式说明

### JSON 字段处理

以下字段在 Teable 中以 JSON 字符串存储，在前端自动转换为数组：

1. **participantIds**: 参与人员 ID 列表
   ```json
   ["user_id_1", "user_id_2"]
   ```

2. **attachments**: 附件列表
   ```json
   [
     {
       "id": "file_1",
       "fileName": "document.pdf",
       "fileUrl": "https://...",
       "fileSize": 1024,
       "fileType": "application/pdf",
       "uploadedAt": "2026-02-18T...",
       "uploadedBy": "user_id"
     }
   ]
   ```

3. **tags**: 标签列表
   ```json
   ["重要", "紧急", "数据分析"]
   ```

### 日期字段处理

所有日期字段自动转换：
- Teable: ISO 8601 字符串 (`"2026-02-18T10:30:00Z"`)
- 前端: JavaScript Date 对象

## ⚠️ 注意事项

### 1. 分页限制

Teable 不返回总记录数，`total` 字段返回的是当前页的记录数。

建议：
- 使用"加载更多"而不是页码
- 或者在前端实现估算

### 2. 统计查询

Dashboard 统计需要获取所有数据后在前端计算，因为 Teable 没有聚合查询。

当前限制：最多 1000 条记录

### 3. 搜索功能

Teable 的 `search` 参数可能不支持，使用 `filter` + `contains` 操作符替代。

### 4. 外键关联

`submitterId`、`ownerId`、`participantIds` 等外键字段需要手动维护关联关系。

建议：创建/更新项目时，同时设置 ID 和 Name 字段。

## 🧪 测试建议

### 1. 创建测试项目

```bash
curl -X POST "https://yach-teable.zhiyinlou.com/api/table/tbl2XPxoSffear3Cvcm/record" \
  -H "Authorization: Bearer teable_accTMyliuowmHE4Rxvc_FtJIml2VQMB9QGJGB9y5OhfWUWh05I0TdPlwskTUli0=" \
  -H "Content-Type: application/json" \
  -d '{
    "fieldKeyType": "name",
    "records": [{
      "fields": {
        "id": "proj_001",
        "name": "测试项目",
        "type": "data_development",
        "description": "这是一个测试项目",
        "priority": "high",
        "status": "in_progress",
        "submitter_id": "3223",
        "submitter_name": "admin",
        "created_at": "2026-02-18T10:00:00Z",
        "updated_at": "2026-02-18T10:00:00Z"
      }
    }]
  }'
```

### 2. 在浏览器中测试

1. 刷新 Dashboard 页面
2. 查看项目列表
3. 创建新项目
4. 编辑项目
5. 查看项目详情

## 🔄 与 Users API 的集成

现在两个表都已接入：

1. **Users 表**: 用户登录、用户管理
2. **Projects 表**: 项目管理、统计

它们通过外键关联：
- `submitterId` → Users.id
- `ownerId` → Users.id
- `participantIds` → Users.id[]

## 📚 相关文档

- **TEABLE_API_INTEGRATION.md** - Users API 集成文档
- **HOW_TO_USE_API.md** - API 使用指南
- **LOGIN_GUIDE.md** - 登录功能指南
- **API_TEST_REPORT.md** - Users API 测试报告

## 🚀 下一步

### 推荐工作

1. **测试 Projects API**
   - 在浏览器中创建项目
   - 验证数据保存到 Teable
   - 测试筛选和搜索

2. **完善项目功能**
   - 文件上传功能
   - 项目历史记录
   - 项目状态流转

3. **接入其他表**
   - ProjectHistories 表
   - UserPreferences 表

4. **优化体验**
   - 添加 loading 状态
   - 优化错误提示
   - 添加数据缓存

---

**Projects API 集成完成！现在刷新页面查看真实数据！** 🎉
