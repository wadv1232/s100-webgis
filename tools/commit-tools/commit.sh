#!/bin/bash

# 简单的自动提交脚本

echo "🚀 开始自动提交..."

# 检查是否有更改
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ 没有更改需要提交"
    exit 0
fi

# 获取当前时间
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 添加所有更改
echo "📦 添加更改..."
git add .

# 提交
echo "💾 提交更改..."
git commit -m "🔧 Auto-fix: 自动修复和改进 - $TIMESTAMP

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>"

# 推送
echo "📤 推送到 GitHub..."
git push origin master

echo "✅ 自动提交完成！"