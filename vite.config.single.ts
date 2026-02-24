import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile({
      removeViteModuleLoader: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // 构建时替换环境变量
    'import.meta.env.VITE_ROUTER_MODE': JSON.stringify('hash'),
    // API配置（从.env.development复制）
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://yach-teable.zhiyinlou.com/api'),
    'import.meta.env.VITE_USERS_TABLE_ID': JSON.stringify('tblslYJz0kmyXI7tqc3'),
    'import.meta.env.VITE_USERS_TOKEN': JSON.stringify('teable_acchiUHrNoh6oJb91hq_937Bj7yM8iAvl3FYFmghbYriE5b+Hh+/G/8Zmc4YwiA='),
    'import.meta.env.VITE_PROJECTS_TABLE_ID': JSON.stringify('tbl2XPxoSffear3Cvcm'),
    'import.meta.env.VITE_PROJECTS_TOKEN': JSON.stringify('teable_accTMyliuowmHE4Rxvc_FtJIml2VQMB9QGJGB9y5OhfWUWh05I0TdPlwskTUli0='),
    'import.meta.env.VITE_APP_TITLE': JSON.stringify('项目管理系统'),
    'import.meta.env.VITE_USE_MOCK': JSON.stringify('false'),
  },
  build: {
    cssCodeSplit: false,           // 禁用CSS拆分
    assetsInlineLimit: 100000000,  // 强制内联所有资源
    outDir: 'dist-single',         // 输出到独立目录
    rollupOptions: {
      output: {
        manualChunks: undefined,    // 禁用代码拆分
        inlineDynamicImports: true, // 内联动态导入
      },
    },
  },
})
