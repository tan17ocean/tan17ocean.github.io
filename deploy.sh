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

REPO_URL="https://github.com/tan17ocean/tan17ocean.github.io.git"
TMP_DIR="/tmp/gh-pages-deploy"

echo "==> [1/4] 重新构建 dist"
npm run build

echo "==> [2/4] 推送源码到 main"
git push origin main

echo "==> [3/4] 准备 gh-pages 工作区（临时克隆）"
rm -rf "$TMP_DIR"
git clone --depth 1 -b gh-pages "$REPO_URL" "$TMP_DIR"

echo "==> [4/4] 替换构建产物并推送 gh-pages"
cd "$TMP_DIR"
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -r "$OLDPWD/dist/"* .
git add -A
git commit -m "deploy: login + admin dashboard"
git push origin HEAD:gh-pages
cd / && rm -rf "$TMP_DIR"

echo "==> 部署完成"