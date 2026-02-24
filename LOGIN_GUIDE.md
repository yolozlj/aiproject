# 登录功能使用指南

## ✅ 登录功能已启用！

登录页面现在已经连接到真实的 Teable Users 表，可以使用数据库中的用户进行登录了。

## 🔐 测试账号

根据测试结果，数据库中有以下可用账号：

| 用户名 | 密码 | 角色 | 部门 |
|--------|------|------|------|
| admin | admin | 管理员 | 仓储 |

## 🚀 如何登录

### 方法 1: 在浏览器中登录

1. 访问登录页面:
   ```
   http://localhost:5173/login
   ```

2. 输入测试账号:
   - **用户名**: `admin`
   - **密码**: `admin`

3. 点击"登录"按钮

4. 登录成功后会自动跳转到主页（Dashboard）

### 方法 2: 直接访问首页

1. 访问首页:
   ```
   http://localhost:5173
   ```

2. 如果未登录，会自动跳转到登录页面

3. 登录后会返回到您想访问的页面

## 🔍 登录流程

登录时系统会：

1. **查找用户**: 根据用户名在 Teable Users 表中查找用户
2. **验证密码**: 比对密码是否正确
3. **生成 Token**: 创建访问令牌
4. **保存状态**: 将用户信息和 Token 保存到本地存储
5. **跳转页面**: 自动跳转到目标页面

## 📊 登录后可访问的页面

登录成功后，您可以访问：

- **概览页** (`/dashboard`) - 查看统计信息
- **项目页** (`/projects`) - 管理项目
- **设置页** (`/settings`) - 修改个人设置
- **API 测试页** (`/api-test`) - 测试 API（无需登录）

## 🎯 权限说明

根据用户角色，拥有不同的权限：

### Admin (管理员)
- ✅ 所有权限
- ✅ 创建、编辑、删除项目
- ✅ 管理用户
- ✅ 审核项目

### Project Manager (项目经理)
- ✅ 创建、编辑项目
- ✅ 审核项目
- ✅ 分配任务
- ❌ 删除项目
- ❌ 管理用户

### Developer (开发者)
- ✅ 查看项目
- ✅ 更新自己负责的项目
- ❌ 创建项目
- ❌ 删除项目

### User (普通用户)
- ✅ 创建需求
- ✅ 查看自己提交的项目
- ❌ 修改或删除项目

## 🔓 登出

点击页面右上角的用户头像，在下拉菜单中选择"退出登录"。

登出后：
- 清除本地存储的用户信息和 Token
- 自动跳转到登录页面

## ⚠️ 注意事项

### 安全提示

1. **密码未加密**:
   - 当前密码以明文形式存储在数据库中
   - 生产环境应使用 bcrypt 或其他加密算法

2. **Token 简化**:
   - 当前使用简单的 base64 编码生成 Token
   - 生产环境应使用 JWT (JSON Web Token)

3. **会话管理**:
   - Token 没有过期时间限制
   - 应该实现 Token 刷新机制

### 开发建议

未来可以改进：

- [ ] 实现密码加密（bcrypt）
- [ ] 使用 JWT 生成 Token
- [ ] 添加 Token 过期机制
- [ ] 实现 Token 自动刷新
- [ ] 添加"记住我"功能
- [ ] 实现多因素认证（2FA）
- [ ] 添加登录日志记录

## 🧪 测试登录

### 成功场景

1. **正确的用户名和密码**
   ```
   用户名: admin
   密码: admin
   ```
   ✅ 应该登录成功并跳转到 Dashboard

### 失败场景

1. **错误的用户名**
   ```
   用户名: wronguser
   密码: admin
   ```
   ❌ 提示"用户名或密码错误"

2. **错误的密码**
   ```
   用户名: admin
   密码: wrongpass
   ```
   ❌ 提示"用户名或密码错误"

3. **空字段**
   ```
   用户名: (空)
   密码: (空)
   ```
   ❌ 表单验证失败，提示必填

## 🔧 技术实现

### 登录 API

位置: `src/api/auth.ts`

```typescript
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  // 1. 根据用户名查找用户
  const user = await getUserByUsername(data.username);

  // 2. 验证密码
  if (user.password !== data.password) {
    throw new Error('用户名或密码错误');
  }

  // 3. 生成 Token
  const token = btoa(`${user.id}:${Date.now()}`);

  // 4. 返回登录信息
  return { user, token, refreshToken };
};
```

### 状态管理

位置: `src/store/authStore.ts`

使用 Zustand 管理认证状态：
- `user`: 当前用户信息
- `token`: 访问令牌
- `isAuthenticated`: 是否已登录

### 路由保护

位置: `src/router/ProtectedRoute.tsx`

未登录用户访问受保护的路由会自动跳转到登录页面。

## 📖 相关文档

- **API 文档**: `TEABLE_API_INTEGRATION.md`
- **使用指南**: `HOW_TO_USE_API.md`
- **测试报告**: `API_TEST_REPORT.md`

## ❓ 常见问题

### Q: 登录后为什么又跳转到登录页面？
A: 可能是 Token 失效或本地存储被清除。请检查浏览器的本地存储。

### Q: 能否添加新用户？
A: 可以使用 `createUser()` API 创建新用户，但需要管理员权限。

### Q: 忘记密码怎么办？
A: 当前版本没有找回密码功能。可以直接在数据库中查看或修改密码。

### Q: 能否同时登录多个账号？
A: 不支持。每次登录会覆盖之前的登录状态。

---

**现在就去试试登录功能吧！** 🚀

访问: http://localhost:5173/login
用户名: admin
密码: admin
