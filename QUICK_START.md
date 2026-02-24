# 快速开始

## 1. 安装依赖

```bash
cd /Users/zhoulijie/Aiproject
npm install
```

## 2. 配置环境变量

环境变量已配置在 `.env.development` 文件中：

```env
VITE_API_BASE_URL=https://yach-teable.zhiyinlou.com/api
VITE_TEABLE_TOKEN=teable_acchiUHrNoh6oJb91hq_937Bj7yM8iAvl3FYFmghbYriE5b+Hh+/G/8Zmc4YwiA=
VITE_USERS_TABLE_ID=tblslYJz0kmyXI7tqc3
VITE_USE_MOCK=false
```

## 3. 启动开发服务器

```bash
npm run dev
```

项目将在 `http://localhost:5173` 启动。

## 4. 测试 API 接口

在浏览器控制台或创建一个测试页面运行：

```typescript
import { getUserList } from '@/api/user';

// 测试获取用户列表
const result = await getUserList({ page: 1, pageSize: 10 });
console.log('用户列表:', result);
```

## 5. 项目结构

```
src/
├── api/                    # API 接口
│   ├── teableClient.ts     # Teable 客户端
│   ├── user.ts             # Users API
│   └── testUserApi.ts      # API 测试
├── types/                  # TypeScript 类型
│   ├── teable.ts           # Teable 类型
│   └── user.ts             # User 类型
└── utils/                  # 工具函数
    └── userMapper.ts       # 数据映射
```

## 6. 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

## 7. 下一步

- 查看 [TEABLE_API_INTEGRATION.md](./TEABLE_API_INTEGRATION.md) 了解 API 详细用法
- 开始开发项目管理功能
- 接入其他数据表的 API（Projects、ProjectHistories 等）

## 常见问题

### Q: API 请求失败？
A: 检查：
1. 环境变量是否正确配置
2. Teable Token 是否有效
3. 网络连接是否正常
4. 浏览器控制台的错误信息

### Q: 类型错误？
A: 确保：
1. TypeScript 版本正确
2. 类型定义文件已正确导入
3. 运行 `npm install` 安装所有依赖

### Q: 如何切换回 Mock 数据？
A: 修改 `.env.development`：
```env
VITE_USE_MOCK=true
```
