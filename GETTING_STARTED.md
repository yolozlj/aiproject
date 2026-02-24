# 快速开始指南

## 前置要求

- Node.js 18+ 
- npm 9+ 或 yarn 1.22+
- 现代浏览器（Chrome、Firefox、Safari、Edge 最新版）

## 安装步骤

### 1. 克隆或下载项目

```bash
cd /Users/zhoulijie/Aiproject
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

项目根目录已包含开发环境配置文件 `.env.development`：

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=项目管理系统
```

如需修改 API 地址，请编辑此文件。

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:5173 启动。

## 可用命令

```bash
# 启动开发服务器（带热更新）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 默认登录信息

由于后端 API 尚未对接，登录功能需要 Mock 数据或后端支持。

**测试账号**（需要后端实现）：
- 管理员：`admin` / `admin123`
- 项目经理：`pm` / `pm123`
- 开发者：`dev` / `dev123`
- 普通用户：`user` / `user123`

## 功能导航

### 1. 概览页 (Dashboard)
- 路径：`/dashboard`
- 功能：项目统计、数据可视化

### 2. 项目列表
- 路径：`/projects`
- 功能：查看、搜索、筛选项目

### 3. 创建项目
- 路径：`/projects/new`
- 功能：创建新项目

### 4. 项目详情
- 路径：`/projects/:id`
- 功能：查看项目详细信息

### 5. 编辑项目
- 路径：`/projects/:id/edit`
- 功能：编辑项目信息

### 6. 设置
- 路径：`/settings`
- 功能：主题切换、语言切换

## 主题切换

在设置页面可以切换三种主题：

1. **超极简**：纯白背景、细线条、微阴影
2. **玻璃拟态**：半透明背景、毛玻璃效果
3. **暗黑模式**：深色背景、高对比度

## 语言切换

支持中文和英文两种语言，在设置页面切换。

## 开发建议

### 调试

1. 打开浏览器开发者工具（F12）
2. 查看 Console 面板的日志
3. 查看 Network 面板的 API 请求

### Mock 数据

如果后端 API 尚未就绪，可以：

1. 使用 MSW (Mock Service Worker)
2. 修改 API 客户端返回 Mock 数据
3. 使用 JSON Server 搭建简易后端

### 热更新

开发服务器支持热更新（HMR），修改代码后浏览器会自动刷新。

## 常见问题

### Q: 启动失败，提示端口被占用？

A: 修改 `vite.config.ts` 中的端口：

```ts
server: {
  port: 5174, // 改为其他端口
  open: true,
}
```

### Q: API 请求失败？

A: 检查：
1. `.env.development` 中的 API 地址是否正确
2. 后端服务是否启动
3. 浏览器控制台的错误信息

### Q: 主题不生效？

A: 检查：
1. 清除浏览器缓存
2. 检查 localStorage 中的主题设置
3. 查看浏览器控制台是否有 CSS 错误

### Q: 构建失败？

A: 尝试：
1. 删除 `node_modules` 和 `package-lock.json`
2. 重新运行 `npm install`
3. 运行 `npm run build` 查看详细错误

## 目录说明

```
Aiproject/
├── public/               # 静态资源
│   └── locales/         # 国际化文件
├── src/
│   ├── api/            # API 接口
│   ├── components/     # 组件
│   ├── pages/          # 页面
│   ├── router/         # 路由
│   ├── store/          # 状态管理
│   ├── styles/         # 样式
│   ├── types/          # 类型定义
│   └── utils/          # 工具函数
├── dist/               # 构建产物（构建后生成）
└── node_modules/       # 依赖包（安装后生成）
```

## 下一步

1. 对接后端 API（参考 `API_DOCUMENTATION.md`）
2. 配置生产环境部署
3. 添加更多功能

## 获取帮助

- 查看 `README.md`
- 查看 `API_DOCUMENTATION.md`
- 查看 `DATABASE_SCHEMA.md`
- 查看 `PROJECT_SUMMARY.md`

---

开始使用项目管理系统！🚀
