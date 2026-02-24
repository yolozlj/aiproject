import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../dist-single');
const htmlPath = path.join(distDir, 'index.html');

console.log('🔧 开始后处理单HTML文件...');

// 读取HTML
let html = fs.readFileSync(htmlPath, 'utf-8');

// 1. 修复路径（移除绝对路径）
html = html.replace(/href="\/([^"]+)"/g, 'href="$1"');
html = html.replace(/src="\/([^"]+)"/g, 'src="$1"');

// 2. 内联外部脚本
const scriptRegex = /<script[^>]*src="([^"]+)"[^>]*><\/script>/g;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const scriptPath = path.join(distDir, match[1]);
  if (fs.existsSync(scriptPath)) {
    const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
    html = html.replace(match[0], `<script type="module">${scriptContent}</script>`);
  }
}

// 3. 内联外部样式
const linkRegex = /<link[^>]*href="([^"]+\.css)"[^>]*>/g;
while ((match = linkRegex.exec(html)) !== null) {
  const cssPath = path.join(distDir, match[1]);
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    html = html.replace(match[0], `<style>${cssContent}</style>`);
  }
}

// 4. 添加CSP meta标签
if (!html.includes('<meta http-equiv="Content-Security-Policy"')) {
  html = html.replace(
    '<head>',
    `<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;">`
  );
}

// 5. 写回HTML
fs.writeFileSync(htmlPath, html, 'utf-8');

// 6. 清理多余文件
const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.rmSync(assetsDir, { recursive: true, force: true });
}

const localesDir = path.join(distDir, 'locales');
if (fs.existsSync(localesDir)) {
  fs.rmSync(localesDir, { recursive: true, force: true });
}

console.log('✅ 后处理完成！');
console.log(`📄 最终文件: ${htmlPath}`);
console.log(`📏 文件大小: ${(fs.statSync(htmlPath).size / 1024 / 1024).toFixed(2)} MB`);
