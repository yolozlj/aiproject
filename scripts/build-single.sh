#!/bin/bash
set -e

echo "====================================="
echo "构建单HTML文件版本"
echo "====================================="

# 1. 清理旧构建
rm -rf dist-single

# 2. 备份原始文件
echo "步骤1: 备份原始文件..."
cp src/router/index.tsx src/router/index.tsx.backup
cp src/utils/i18n.ts src/utils/i18n.ts.backup

# 3. 替换为单文件版本
echo "步骤2: 临时替换文件..."
cp src/router/index.single.tsx src/router/index.tsx
cp src/utils/i18n.single.ts src/utils/i18n.ts

# 4. 构建
echo "步骤3: 执行构建..."
vite build --config vite.config.single.ts

# 5. 后处理
echo "步骤4: 后处理HTML..."
node scripts/post-build-single.js

# 6. 恢复原始文件
echo "步骤5: 恢复原始文件..."
mv src/router/index.tsx.backup src/router/index.tsx
mv src/utils/i18n.ts.backup src/utils/i18n.ts

echo "====================================="
echo "✅ 构建完成！"
echo "📄 输出文件: dist-single/index.html"
echo "📏 文件大小: $(du -h dist-single/index.html | cut -f1)"
echo "====================================="
