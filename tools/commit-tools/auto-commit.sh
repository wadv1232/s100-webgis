#!/bin/bash

# 自动提交脚本 - 每次修复完成后自动提交到 GitHub

echo "🚀 开始自动提交流程..."

# 检查是否有更改
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ 没有检测到更改，无需提交"
    exit 0
fi

# 添加所有更改
echo "📦 添加所有更改到暂存区..."
git add .

# 获取当前时间戳
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 创建提交信息
COMMIT_MESSAGE="🔧 Auto-fix: 修复按钮样式一致性和模拟数据冲突 - $TIMESTAMP"

# 提交更改
echo "💾 提交更改..."
git commit -m "$COMMIT_MESSAGE"

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push origin master

echo "✅ 自动提交完成！"
echo "📋 提交信息: $COMMIT_MESSAGE"