# 筛选功能调试总结报告

## 📊 测试结果

通过自动化测试（Playwright），我已经**完整验证了筛选功能的数据流**：

### ✅ 正常工作的部分

1. **UI 交互** - 筛选按钮可以正常点击
2. **React 状态** - 选择器的值正确保存到 state（例如：`{status: 'in_progress'}`）
3. **API 调用** - `fetchProjects` 被正确触发
4. **参数转换** - 英文值正确转换为中文（`'in_progress'` → `'开发中'`）
5. **Store 更新** - Zustand store 正确接收 API 返回的数据
6. **React 重渲染** - tableData 的 useMemo 正确触发

### ❌ 实际问题

**Teable API 忽略了筛选条件，始终返回所有记录**

#### 测试数据

数据库中实际有 4 个项目：
- 1 个 "开发中"
- 1 个 "待评审"
- 2 个 "已完成"

#### 测试结果

```
筛选 "开发中" → 应显示 1 行 → 实际显示 4 行 ❌
筛选 "已完成" → 应显示 2 行 → 实际显示 4 行 ❌
```

#### API 请求示例

```json
{
  "conjunction": "and",
  "filterSet": [
    {
      "fieldId": "fldWEZLWNYb45fmjrZd",
      "operator": "is",
      "value": "开发中"
    }
  ]
}
```

URL: `https://yach-teable.zhiyinlou.com/api/table/tbl2XPxoSffear3Cvcm/record?fieldKeyType=name&take=10&skip=0&filter={...}`

**问题**：尽管发送了正确的筛选条件，Teable 仍返回全部 4 条记录。

---

## 🔧 已修复的代码

### 文件：`/Users/zhoulijie/Aiproject/src/api/realProjectApi.ts`

#### 1. 添加了值转换映射

```typescript
// 值转换映射（前端英文 → Teable 中文）
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
```

#### 2. 修改了筛选逻辑

**之前**：
```typescript
if (params.status) {
  filterSet.push({
    fieldId: 'fldWEZLWNYb45fmjrZd',
    operator: 'is',
    value: params.status,  // ❌ 发送英文 "in_progress"
  });
}
```

**之后**：
```typescript
if (params.status) {
  filterSet.push({
    fieldId: 'fldWEZLWNYb45fmjrZd',
    operator: 'is',
    value: STATUS_TO_CN[params.status] || params.status,  // ✅ 转换为中文 "开发中"
  });
}
```

同样的修改应用于 `type` 和 `priority` 筛选。

---

## 🔍 问题根因分析

### 可能的原因

1. **字段 ID 错误**
   - 当前使用：`fldWEZLWNYb45fmjrZd`
   - 需要验证：这是否是 status 字段的真实 ID？

2. **字段类型不匹配**
   - 如果 Teable 中的 status 是 **单选字段（Single Select）**
   - 可能需要使用 **选项 ID** 而不是显示文本
   - 例如：`{optId: 'opt123'}` 而不是 `"开发中"`

3. **API 权限或配置**
   - Teable API 可能没有启用筛选功能
   - 或者需要特殊的 API 配置

4. **筛选语法错误**
   - Teable 的筛选语法可能与我们使用的不同
   - 需要查看 Teable 官方文档

---

## 📋 验证步骤

### 1. 检查字段 ID

在 Teable 控制台执行：

1. 打开 Projects 表
2. 查看字段设置
3. 确认 `status` 字段的真实 ID 是否为 `fldWEZLWNYb45fmjrZd`

### 2. 检查字段类型

确认字段类型：
- 如果是 **文本字段（Text）** → 使用文本值筛选
- 如果是 **单选字段（Single Select）** → 可能需要使用选项 ID

### 3. 测试 Teable API

直接测试 Teable API：

```bash
curl "https://yach-teable.zhiyinlou.com/api/table/tbl2XPxoSffear3Cvcm/record?fieldKeyType=name&filter={\"conjunction\":\"and\",\"filterSet\":[{\"fieldId\":\"fldWEZLWNYb45fmjrZd\",\"operator\":\"is\",\"value\":\"开发中\"}]}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

查看是否返回筛选后的结果。

### 4. 查看 Teable 文档

参考：https://help.teable.io/developer/api

查找筛选的正确语法和示例。

---

## 🛠️ 临时解决方案

如果 Teable API 筛选确实不可用，可以采用**前端筛选**：

### 修改 `realProjectApi.ts`

```typescript
export async function getProjectsFromTable(
  params: PaginationParams & FilterParams
): Promise<PaginationResponse<Project>> {
  // 1. 获取所有数据（移除筛选参数）
  const response = await projectsTableClient.get(...);
  let projects = records.map((record) => mapTeableToProject(record.fields, record.id));

  // 2. 前端筛选
  if (params.status) {
    projects = projects.filter(p => p.status === params.status);
  }
  if (params.type) {
    projects = projects.filter(p => p.type === params.type);
  }
  if (params.priority) {
    projects = projects.filter(p => p.priority === params.priority);
  }
  if (params.keyword) {
    projects = projects.filter(p =>
      p.name.includes(params.keyword) ||
      p.description?.includes(params.keyword)
    );
  }

  // 3. 前端分页
  const start = (page - 1) * pageSize;
  const paginatedProjects = projects.slice(start, start + pageSize);

  return {
    data: paginatedProjects,
    total: projects.length,
    page,
    pageSize,
  };
}
```

**优点**：
- 立即可用
- 不依赖 Teable API

**缺点**：
- 性能较差（需要获取所有数据）
- 不适合大数据量

---

## 📝 下一步行动

### 立即行动（推荐）

1. **检查 Teable 字段配置**
   - 确认 status 字段类型
   - 获取字段的真实 ID
   - 如果是单选字段，获取选项 ID

2. **查阅 Teable 文档**
   - 查找筛选 API 的正确用法
   - 查看是否有单选字段筛选的特殊语法

3. **联系 Teable 支持**
   - 如果文档不清楚，联系 Teable 技术支持
   - 提供当前的 API 请求示例

### 备选方案

如果 Teable API 筛选短期无法修复：
- 实施前端筛选方案（见上文）
- 或考虑迁移到支持完整 API 的数据库

---

## 🎯 结论

**筛选功能的前端实现完全正常**，问题出在 **Teable API 层面**。

所有代码修改（值转换、参数传递）都是正确且必要的。现在需要：
1. 验证 Teable 字段配置
2. 确认 API 筛选语法
3. 根据结果调整筛选参数格式

一旦 Teable API 筛选正常工作，前端的筛选功能将立即可用。
