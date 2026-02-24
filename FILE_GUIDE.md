# 项目文件目录指南

本文档详细介绍项目中各文件的用途和用法。

---

## 📁 根目录配置文件

### package.json
项目依赖配置文件，定义了所有 npm 依赖和脚本命令。

**常用命令：**
```bash
npm install          # 安装依赖
npm run dev         # 启动开发服务器
npm run build       # 构建生产版本
npm run build:single # 构建单页HTML版本
npm run lint        # 代码检查
npm run preview     # 预览构建结果
```

---

### vite.config.ts
Vite 构建工具配置文件。

**主要配置：**
- React 插件配置
- 路径别名设置 (`@` 指向 `src` 目录)
- 开发服务器端口：5173

---

### tsconfig.json / tsconfig.app.json / tsconfig.node.json
TypeScript 配置文件，定义类型检查规则。

---

### tailwind.config.js
Tailwind CSS 配置文件（未使用，已集成到 CSS 中）。

---

### postcss.config.js
PostCSS 配置文件，用于处理 CSS。

---

### eslint.config.js
ESLint 代码检查配置。

---

### .env.development / .env.production
环境变量配置文件。

**.env.development 示例：**
```env
VITE_API_BASE_URL=https://yach-teable.zhiyinlou.com/api
VITE_USERS_TABLE_ID=tblslYJz0kmyXI7tqc3
VITE_USERS_TOKEN=teable_acchiUHrNoh6oJb91hq_937Bj7yM8iAvl3FYFmghbYriE5b+Hh+/G/8Zmc4YwiA=
VITE_PROJECTS_TABLE_ID=tbl2XPxoSffear3Cvcm
VITE_PROJECTS_TOKEN=teable_accTMyliuowmHE4Rxvc_FtJIml2VQMB9QGJGB9y5OhfWUWh05I0TdPlwskTUli0=
VITE_APP_TITLE=项目管理系统
VITE_USE_MOCK=false
```

---

### opencode.json
OpenCode MCP 配置文件，用于部署到 EdgeOne Pages。

---

## 📁 scripts/ 脚本目录

### build-single.sh
构建单页 HTML 文件的脚本，将整个应用打包成单个 HTML 文件。

**用法：**
```bash
npm run build:single
# 或
bash scripts/build-single.sh
```

**输出：** `dist-single/index.html` (包含所有 CSS 和 JS)

---

### post-build-single.js
构建后处理脚本，用于优化单页 HTML 文件。

---

## 📁 src/ 源代码目录

### main.tsx
应用入口文件，负责渲染 React 应用。

### App.tsx
主应用组件，配置路由和全局布局。

---

### src/api/ API 层

| 文件 | 用途 |
|------|------|
| `client.ts` | Axios HTTP 客户端配置 |
| `auth.ts` | 认证相关 API |
| `user.ts` | 用户相关 API |
| `project.ts` | 项目相关 API |
| `teableClient.ts` | Teable 低代码平台客户端 |
| `projectsTableClient.ts` | 项目表客户端 |
| `mock.ts` | Mock 数据服务 |
| `testUserApi.ts` | 测试用户 API |
| `preference.ts` | 用户偏好设置 API |
| `attachmentApi.ts` | 附件上传 API |
| `realProjectApi.ts` | 真实项目 API |

---

### src/store/ 状态管理

使用 Zustand 进行状态管理。

| 文件 | 用途 |
|------|------|
| `authStore.ts` | 认证状态管理 |
| `projectStore.ts` | 项目状态管理 |
| `preferenceStore.ts` | 用户偏好状态 |
| `index.ts` | 状态管理入口 |

---

### src/router/ 路由

| 文件 | 用途 |
|------|------|
| `index.tsx` | 主路由配置 |
| `index.single.tsx` | 单页版本路由配置 |
| `ProtectedRoute.tsx` | 路由守卫组件 |

---

### src/pages/ 页面组件

| 目录 | 页面 |
|------|------|
| `Login/` | 登录页面 |
| `Dashboard/` | 仪表盘 |
| `Projects/` | 项目列表、详情、表单 |
| `Settings/` | 设置页面 |
| `ApiTest/` | API 测试页面 |

---

### src/components/ 公共组件

| 目录 | 组件 |
|------|------|
| `Common/` | 通用组件（Loading, Empty, ConfirmModal, ErrorBoundary） |

---

### src/types/ TypeScript 类型定义

| 文件 | 用途 |
|------|------|
| `user.ts` | 用户类型 |
| `project.ts` | 项目类型 |
| `teable.ts` | Teable 类型 |
| `common.ts` | 通用类型 |
| `index.ts` | 类型导出入口 |

---

### src/utils/ 工具函数

| 文件 | 用途 |
|------|------|
| `i18n.ts` | 国际化配置 |
| `i18n.single.ts` | 单页版本国际化 |
| `userMapper.ts` | 用户数据映射 |
| `projectMapper.ts` | 项目数据映射 |
| `projectPermission.ts` | 项目权限判断 |
| `projectStatusFlow.ts` | 项目状态流转 |
| `mockData.ts` | Mock 数据生成 |

---

### src/styles/ 样式文件

| 文件 | 用途 |
|------|------|
| `global.css` | 全局样式 |
| `variables.css` | CSS 变量定义 |
| `themes/dark.css` | 暗黑主题 |
| `themes/minimal.css` | 极简主题 |

---

### src/hooks/ 自定义 Hooks

（项目中的自定义 React Hooks）

---

### src/assets/ 静态资源

图片等静态资源目录。

---

## 📁 public/ 公共资源

| 文件/目录 | 用途 |
|------|------|
| `locales/` | 国际化语言包 |
| `locales/en-US/translation.json` | 英文翻译 |
| `locales/zh-CN/translation.json` | 中文翻译 |
| `vite.svg` | 网站图标 |

---

## 📁 dist/ 构建输出

生产环境构建输出目录，包含编译后的静态文件。

---

## 📁 dist-single/ 单页版本

构建单页 HTML 后的输出目录。

---

## 📁 .edgeone/ EdgeOne 配置

EdgeOne Pages CLI 配置文件。

---

## 📁 文档文件 (*.md)

| 文件 | 用途 |
|------|------|
| `README.md` | 项目简介 |
| `GETTING_STARTED.md` | 入门指南 |
| `QUICK_START.md` | 快速开始 |
| `DATABASE_SCHEMA.md` | 数据库架构 |
| `API_DOCUMENTATION.md` | API 文档 |
| `API_ENUMS.md` | API 枚举定义 |
| `API_QUICK_REFERENCE.md` | API 快速参考 |
| `API_TEST_REPORT.md` | API 测试报告 |
| `HOW_TO_USE_API.md` | API 使用指南 |
| `TEABLE_API_INTEGRATION.md` | Teable 集成指南 |
| `API_BACKEND_REQUIREMENTS.md` | 后端需求 |
| `MOCK_DATA_GUIDE.md` | Mock 数据指南 |
| `LOGIN_GUIDE.md` | 登录指南 |
| `PROJECT_SUMMARY.md` | 项目概要 |
| `DESIGN_SYSTEM_COMPLETE.md` | 设计系统文档 |
| `LOGIN_REDESIGN.md` | 登录重新设计 |
| `PROJECT_LIST_REDESIGN.md` | 项目列表重新设计 |
| `DASHBOARD_REDESIGN.md` | 仪表盘重新设计 |
| `ATTACHMENT_UPLOAD_FEATURE.md` | 附件上传功能 |
| `SECURITY_FIX.md` | 安全修复 |
| `FILTER_DEBUG_SUMMARY.md` | 筛选调试总结 |
| `FILTER_FIX_COMPLETE.md` | 筛选修复完成 |
| `DEBUGGING_SUMMARY.md` | 调试总结 |
| `TEST_FILTER.md` | 测试筛选 |
| `ACCESSIBILITY.md` | 可访问性文档 |
| `PROJECTS_API_INTEGRATION.md` | 项目 API 集成 |

---

## 🚀 快速使用指南

### 开发模式
```bash
npm run dev
# 访问 http://localhost:5173
```

### 生产构建
```bash
npm run build
# 输出到 dist/
```

### 单页 HTML 构建
```bash
npm run build:single
# 输出到 dist-single/index.html
```

### 部署到 EdgeOne Pages
```bash
edgeone pages deploy dist -n 项目名
```

### 单页版本部署
```bash
edgeone pages deploy dist-single -n 项目名
```
