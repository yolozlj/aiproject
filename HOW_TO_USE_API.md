# Users API 使用指南

## 🎉 API 接入成功！

Users 表的 Teable API 已成功接入并经过测试验证。您现在可以在项目中使用这些 API 接口了。

## 🚀 快速开始

### 1. 访问测试页面

开发服务器已启动在: **http://localhost:5173**

访问测试页面查看 API 工作情况:
```
http://localhost:5173/api-test
```

### 2. 在代码中使用 API

```typescript
import { getUserList, getUserById, updateUser } from '@/api/user';

// 获取用户列表
const users = await getUserList({
  page: 1,
  pageSize: 20
});

// 获取用户详情
const user = await getUserById('recC4laa8NLZK6cbieZ');

// 更新用户
const updated = await updateUser('recC4laa8NLZK6cbieZ', {
  fullName: '新名字',
  department: '新部门'
});
```

## 📊 测试结果

✅ **所有核心功能测试通过**

- ✅ 获取用户列表 - 成功获取 3 个用户
- ✅ 根据 ID 获取详情 - 工作正常
- ✅ 筛选查询 - 支持精确匹配
- ✅ Token 认证 - 正常工作

详细测试报告: 查看 `API_TEST_REPORT.md`

## 🔍 当前数据库状态

数据库中有 **1 个有效用户**:

| 字段 | 值 |
|------|-----|
| ID | recC4laa8NLZK6cbieZ |
| 用户名 | admin |
| 全名 | 杰森 |
| 邮箱 | zhou@163.com |
| 角色 | 管理员 |
| 部门 | 仓储 |
| 电话 | 15310020003 |

> ⚠️ 注意: 数据库中还有 2 条空记录，建议清理

## 📝 可用的 API 接口

### 基础操作

```typescript
// 1. 获取用户列表（带分页和筛选）
getUserList(params?: {
  page?: number;          // 页码，默认 1
  pageSize?: number;      // 每页数量，默认 20
  keyword?: string;       // 搜索关键词
  role?: string;          // 角色筛选
  status?: string;        // 状态筛选
  sortBy?: string;        // 排序字段
  sortOrder?: 'asc' | 'desc';  // 排序方向
})

// 2. 获取用户详情
getUserById(id: string)

// 3. 创建用户
createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>)

// 4. 更新用户
updateUser(id: string, user: Partial<User>)

// 5. 删除用户
deleteUser(id: string)

// 6. 搜索用户（用于选择器）
searchUsers(keyword: string, limit?: number)

// 7. 根据用户名查找（用于登录）
getUserByUsername(username: string)

// 8. 根据邮箱查找
getUserByEmail(email: string)
```

## 🎯 使用示例

### 示例 1: 获取用户列表

```typescript
import { getUserList } from '@/api/user';

async function loadUsers() {
  try {
    const result = await getUserList({
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    console.log('用户列表:', result.data);
    console.log('总数:', result.total);
  } catch (error) {
    console.error('获取失败:', error);
  }
}
```

### 示例 2: 搜索并选择用户

```typescript
import { searchUsers } from '@/api/user';

// 用于人员选择器
async function handleSearch(keyword: string) {
  const users = await searchUsers(keyword, 5);
  // 返回 UserSimple[] 格式，包含 id, fullName, avatar, department
  return users;
}
```

### 示例 3: 用户登录验证

```typescript
import { getUserByUsername } from '@/api/user';

async function login(username: string, password: string) {
  // 查找用户
  const user = await getUserByUsername(username);

  if (!user) {
    throw new Error('用户不存在');
  }

  // 验证密码（实际应该在后端验证）
  if (user.password !== password) {
    throw new Error('密码错误');
  }

  return user;
}
```

### 示例 4: 更新用户信息

```typescript
import { updateUser } from '@/api/user';

async function updateProfile(userId: string) {
  const updated = await updateUser(userId, {
    fullName: '新名字',
    department: '技术部',
    phone: '13800138000'
  });

  console.log('更新后的用户:', updated);
}
```

## 🧪 测试工具

### 1. 浏览器测试页面

访问 `http://localhost:5173/api-test`

功能:
- ✅ 可视化界面
- ✅ 实时测试 API
- ✅ 查看请求和响应
- ✅ 表格展示数据

### 2. HTML 独立测试页面

打开 `test-api.html` 文件

功能:
- ✅ 不需要启动服务器
- ✅ 直接测试 Teable API
- ✅ 查看原始响应数据

### 3. Node.js 命令行测试

```bash
node test-api.js
```

功能:
- ✅ 快速验证 API 连接
- ✅ 命令行输出
- ✅ 自动化测试

## 🔐 安全提示

### 开发环境
- Token 存储在 `.env.development` 文件中
- 不要将此文件提交到 Git

### 生产环境建议
- ❌ 不要在前端代码中硬编码 Token
- ✅ 应该通过后端 API 代理请求
- ✅ 密码应该加密存储（当前是明文）
- ✅ 实现完整的身份认证系统

## 📖 相关文档

- **详细的 API 文档**: `TEABLE_API_INTEGRATION.md`
- **测试报告**: `API_TEST_REPORT.md`
- **快速开始**: `QUICK_START.md`
- **项目实施计划**: `.claude/plans/abundant-popping-reddy.md`

## ❓ 常见问题

### Q: 为什么搜索功能返回 400 错误？
A: Teable 的 search 参数在某些情况下不支持。解决方案：使用 filter 参数配合 "contains" 操作符实现搜索功能。

### Q: 如何筛选用户？
A: 使用 getUserList 的 keyword、role、status 参数，内部会自动转换为 Teable 的 filter 格式。

### Q: Record ID 和字段 id 有什么区别？
A:
- Record ID (rec_xxx): Teable 自动生成的记录标识符
- 字段 id: 表中的主键字段值
- 我们的 API 优先使用字段 id，如果不存在则使用 Record ID

### Q: 如何添加新用户？
A: 使用 createUser() 函数，传入用户数据。注意密码应该先加密。

## 🎨 下一步

现在您可以：

1. **在项目中使用这些 API**
   - 在登录页面集成用户认证
   - 在设置页面展示用户信息
   - 在项目表单中使用用户选择器

2. **接入其他表的 API**
   - Projects 表
   - ProjectHistories 表
   - UserPreferences 表

3. **完善功能**
   - 实现密码加密
   - 添加用户头像上传
   - 实现角色权限管理

## 💡 技术支持

如有问题，请查看:
- `/Users/zhoulijie/Aiproject/TEABLE_API_INTEGRATION.md` - 完整的技术文档
- `/Users/zhoulijie/Aiproject/API_TEST_REPORT.md` - 测试结果
- 浏览器控制台 - 查看错误信息

---

**祝您开发顺利！** 🚀
