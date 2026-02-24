# Teable API 集成文档

## 概述

本项目已成功接入 Teable API，用于用户数据的 CRUD 操作。所有用户相关的 API 请求现在都直接连接到真实的 Teable 数据库。

## 配置文件

### 环境变量 (.env.development)

```env
# Teable API Configuration
VITE_API_BASE_URL=https://yach-teable.zhiyinlou.com/api
VITE_TEABLE_TOKEN=teable_acchiUHrNoh6oJb91hq_937Bj7yM8iAvl3FYFmghbYriE5b+Hh+/G/8Zmc4YwiA=

# Table IDs
VITE_USERS_TABLE_ID=tblslYJz0kmyXI7tqc3

# App Configuration
VITE_APP_TITLE=项目管理系统
VITE_USE_MOCK=false
```

## 新增文件

### 1. `/src/types/teable.ts`
定义了 Teable API 的所有类型：
- `TeableResponse` - API 响应格式
- `TeableRecord` - 单条记录格式
- `TeableFilter` - 筛选条件
- `TeableOrderBy` - 排序规则
- `TeableUserFields` - Users 表字段映射
- `USER_FIELD_IDS` - 字段 ID 常量

### 2. `/src/api/teableClient.ts`
Teable 专用的 Axios 客户端：
- 自动添加 Bearer Token 认证
- 统一的错误处理
- 请求/响应拦截器

### 3. `/src/utils/userMapper.ts`
数据映射工具：
- `mapTeableToUser()` - 将 Teable 格式转换为前端 User 类型
- `mapUserToTeable()` - 将前端 User 类型转换为 Teable 格式

### 4. `/src/api/user.ts` (已更新)
实现了完整的 Users API 接口：
- `getUserList()` - 获取用户列表（支持分页、筛选、排序）
- `getUserById()` - 根据 ID 获取用户详情
- `createUser()` - 创建用户
- `updateUser()` - 更新用户
- `deleteUser()` - 删除用户
- `searchUsers()` - 搜索用户
- `getUserByUsername()` - 根据用户名查找用户
- `getUserByEmail()` - 根据邮箱查找用户

## API 使用示例

### 1. 获取用户列表

```typescript
import { getUserList } from '@/api/user';

// 基础查询
const result = await getUserList({
  page: 1,
  pageSize: 20,
});

// 带筛选和排序
const result = await getUserList({
  page: 1,
  pageSize: 20,
  keyword: 'john',      // 搜索关键词
  role: 'admin',        // 按角色筛选
  status: 'active',     // 按状态筛选
  sortBy: 'createdAt',  // 排序字段
  sortOrder: 'desc',    // 排序方向
});

console.log(result.data);   // User[] 数组
console.log(result.total);  // 总数
console.log(result.page);   // 当前页
```

### 2. 获取用户详情

```typescript
import { getUserById } from '@/api/user';

const user = await getUserById('rec_xxxxx');
console.log(user);
```

### 3. 创建用户

```typescript
import { createUser } from '@/api/user';

const newUser = await createUser({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'hashed_password',
  fullName: 'John Doe',
  role: 'developer',
  status: 'active',
});
```

### 4. 更新用户

```typescript
import { updateUser } from '@/api/user';

const updatedUser = await updateUser('rec_xxxxx', {
  fullName: 'Jane Doe',
  department: 'Engineering',
});
```

### 5. 删除用户

```typescript
import { deleteUser } from '@/api/user';

await deleteUser('rec_xxxxx');
```

### 6. 搜索用户

```typescript
import { searchUsers } from '@/api/user';

// 用于人员选择器等场景
const users = await searchUsers('john', 10);
console.log(users); // UserSimple[]
```

### 7. 根据用户名查找

```typescript
import { getUserByUsername } from '@/api/user';

// 用于登录验证
const user = await getUserByUsername('johndoe');
if (user) {
  // 找到用户，验证密码
} else {
  // 用户不存在
}
```

## Teable API 特点

### 1. 字段键类型 (fieldKeyType)
- `name`: 使用字段显示名称（如 "username"、"email"）
- `id`: 使用字段 ID（如 "fldXXXX"）

**推荐使用 `name`**，因为更易读易维护。

### 2. 筛选和排序必须使用字段 ID
虽然请求/响应体可以使用 `fieldKeyType=name`，但 `filter` 和 `orderBy` 参数中的 `fieldId` **必须使用真实的字段 ID**。

示例：
```typescript
// ✓ 正确
const filter = {
  fieldId: 'fld7WopPaB3uHDdCzfI',  // username 的字段 ID
  operator: 'is',
  value: 'johndoe'
};

// ✗ 错误
const filter = {
  fieldId: 'username',  // 不能使用字段名
  operator: 'is',
  value: 'johndoe'
};
```

### 3. 分页
- `take`: 每页数量（默认 100，最大 1000）
- `skip`: 跳过数量
- 计算方式：`skip = (page - 1) * pageSize`

### 4. 记录 ID
Teable 的记录有两种 ID：
- **Record ID** (`rec_xxxxx`): 由 Teable 自动生成，用于 API 操作
- **字段 ID** (`id` 字段): 表中的主键字段值

在我们的实现中，优先使用字段中的 `id`，如果不存在则使用 Record ID。

## 字段映射

| Teable 字段名 | 字段 ID | 前端字段名 | 类型 | 说明 |
|--------------|---------|-----------|------|------|
| id | fld0mLFfG9G3VgpjmLV | id | string | 用户 ID（主键） |
| username | fld7WopPaB3uHDdCzfI | username | string | 用户名 |
| password | fldXnWsvIM96OTRUv5L | password | string | 密码（加密） |
| email | fldriCmtaG7eSIaptpn | email | string | 邮箱 |
| full_name | fldUA8av97AJkHJbxoP | fullName | string | 全名 |
| avatar | fldC62x7bVyrxYjrSho | avatar | string | 头像 URL |
| role | fldj0oyuLlNC6Y3rWSt | role | string | 角色 |
| department | fldpkwZB6oJYsnQHqQC | department | string | 部门 |
| phone | fldkFP6qOoWrF7Y004C | phone | string | 电话 |
| status | fldYFy7uHBqE2lazWyZ | status | string | 状态 |
| created_at | fldKA7Yihd0FuT1i1tK | createdAt | Date | 创建时间 |
| updated_at | fldmDLbZ6uPFlUaP1SG | updatedAt | Date | 更新时间 |

## 测试

运行测试文件验证 API 是否正常工作：

```typescript
import { testUserApi } from '@/api/testUserApi';

testUserApi();
```

测试将执行以下操作：
1. 获取用户列表
2. 获取用户详情
3. 搜索用户
4. 根据用户名查找用户

## 注意事项

1. **Token 安全**:
   - 当前 Token 存储在 `.env` 文件中
   - 生产环境应使用更安全的方式管理 Token
   - 不要将包含 Token 的 `.env` 文件提交到 Git

2. **错误处理**:
   - 所有 API 函数都会抛出错误
   - 调用时应使用 try-catch 处理错误
   - 错误信息会在控制台打印

3. **数据验证**:
   - 创建/更新用户前应验证数据格式
   - 密码应在前端加密后再发送
   - 角色和状态值应符合枚举定义

4. **性能优化**:
   - Teable 不提供总记录数，需要额外查询或估算
   - 大量数据查询时考虑使用缓存
   - 搜索功能使用 Teable 的全文搜索，性能较好

## 后续工作

- [ ] 实现 Projects 表的 API 接口
- [ ] 实现 ProjectHistories 表的 API 接口
- [ ] 实现 UserPreferences 表的 API 接口
- [ ] 实现用户认证（登录/登出）
- [ ] 实现文件上传功能
- [ ] 添加 API 缓存机制
- [ ] 添加请求重试机制
- [ ] 完善错误提示和处理

## 参考资源

- [Teable API 文档](https://help.teable.io/developer/api)
- [Axios 文档](https://axios-http.com/)
- [TypeScript 类型系统](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
