#!/usr/bin/env bash
# ============================================================
# tan17ocean 个人主页一键部署脚本
# 1) 重新构建 dist
# 2) 推送源码到 main 分支
# 3) 用克隆的 gh-pages 工作区替换 dist 内容并推送上线
# 依赖：GitHub 凭据已录入系统凭据管理器（见 README 部署节）
# ============================================================
set -e
cd "$(dirname "$0")"
export LANG=C.UTF-8
export http_proxy=http://127.0.0.1:7897
export https_proxy=http://127.0.0.1:7897
export HTTP_PROXY=http://127.0.0.1:7897
export HTTPS_PROXY=http://127.0.0.1:7897

REPO_URL="https://github.com/tan17ocean/tan17ocean.github.io.git"
TMP_DIR="/tmp/gh-pages-deploy"

echo "==> [1/4] 重新构建 dist"
npm run build

# 修复 GitHub Pages Jekyll 丢弃 _ 开头文件的问题
echo "==> [1.5/4] 修复 Jekyll 下划线文件问题"
node scripts/fix-jekyll.js

# GitHub Pages 默认启用 Jekyll，会忽略 _ 开头的文件
# 创建 .nojekyll 禁用 Jekyll（双重保险）
touch dist/.nojekyll

echo "==> [2/4] 推送源码到 main"
git push origin main

echo "==> [3/4] 准备 gh-pages 工作区（临时克隆）"
rm -rf "$TMP_DIR"
git clone --depth 1 -b gh-pages "$REPO_URL" "$TMP_DIR"

echo "==> [4/4] 替换构建产物并推送 gh-pages"
cd "$TMP_DIR"
# 若线上已存在 content.json（后台「保存并发布」维护的数据），先备份，部署时不覆盖
HAS_CONTENT=false
if git cat-file -e HEAD:content.json 2>/dev/null; then
  HAS_CONTENT=true
  git show HEAD:content.json > "$OLDPWD/.deploy-keep-content.json"
fi
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} + 2>/dev/null || true
# 复制 dist 到当前目录（含隐藏文件；不能用 .* 通配，会误带 . 与 ..）
cp -r "$OLDPWD/dist/"* . 2>/dev/null || true
[ -f "$OLDPWD/dist/.nojekyll" ] && cp "$OLDPWD/dist/.nojekyll" .
if [ "$HAS_CONTENT" = true ]; then
  cp "$OLDPWD/.deploy-keep-content.json" content.json
  rm -f "$OLDPWD/.deploy-keep-content.json"
  echo "已保留线上 content.json（后台数据不会被重置）"
fi
git add -A
git commit -m "deploy: fix Jekyll ignoring underscore files (.nojekyll)"
git push origin HEAD:gh-pages
cd / && rm -rf "$TMP_DIR"

echo "==> 部署完成"