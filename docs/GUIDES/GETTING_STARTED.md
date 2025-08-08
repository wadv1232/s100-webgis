---
title: 快速开始
description: S100海事服务系统快速上手指南
author: 开发团队
date: 2024-01-01
version: 1.0.0
category: 开发指南
tags: [快速开始, 入门, 安装]
---

# 快速开始

## 概述

本指南将帮助您快速搭建和运行S100海事服务系统。按照以下步骤，您可以在几分钟内启动开发环境并开始使用系统。

## 环境要求

### 系统要求
- **操作系统**: Windows 10+, macOS 10.14+, 或 Linux (Ubuntu 18.04+)
- **内存**: 最少 8GB RAM，推荐 16GB+
- **存储**: 最少 2GB 可用空间

### 软件要求
- **Node.js**: 版本 18.0.0 或更高
- **npm**: 版本 8.0.0 或更高
- **Git**: 版本 2.0.0 或更高
- **浏览器**: Chrome 90+, Firefox 88+, 或 Safari 14+

### 验证环境
```bash
# 检查Node.js版本
node --version
# 应该输出: v18.x.x 或更高

# 检查npm版本
npm --version
# 应该输出: 8.x.x 或更高

# 检查Git版本
git --version
# 应该输出: 2.x.x 或更高
```

## 快速安装

### 1. 获取项目代码

#### 克隆项目
```bash
# 使用HTTPS克隆
git clone https://github.com/your-username/s100-webgis.git

# 或使用SSH克隆
git clone git@github.com:your-username/s100-webgis.git

# 进入项目目录
cd s100-webgis
```

#### 验证项目结构
```bash
# 查看项目结构
ls -la

# 应该看到以下主要文件和目录:
# - package.json        # 项目配置文件
# - next.config.ts      # Next.js配置
# - tailwind.config.ts  # Tailwind CSS配置
# - tsconfig.json       # TypeScript配置
# - src/               # 源代码目录
# - docs/              # 文档目录
# - prisma/            # 数据库相关
```

### 2. 安装依赖

#### 安装项目依赖
```bash
# 安装所有依赖包
npm install

# 安装过程可能需要几分钟，取决于网络速度
```

#### 验证依赖安装
```bash
# 检查node_modules目录
ls -la node_modules

# 检查关键依赖是否安装
npm list next react react-dom typescript tailwindcss prisma
```

### 3. 配置环境变量

#### 复制环境变量模板
```bash
# 复制环境变量模板文件
cp .env.example .env
```

#### 编辑环境变量
```bash
# 使用您喜欢的编辑器打开.env文件
# 例如使用VS Code:
code .env

# 或使用vim:
vim .env
```

#### 基本环境配置
```env
# 应用配置
NEXT_PUBLIC_APP_NAME=S100/S101/S102 海事服务系统
NEXT_PUBLIC_APP_VERSION=1.0.0

# 数据库配置
DATABASE_URL="file:./dev.db"

# 地图服务配置
NEXT_PUBLIC_TIANDITU_ENABLED=false
NEXT_PUBLIC_GAODE_MAP_ENABLED=false
NEXT_PUBLIC_TENCENT_MAP_ENABLED=false
NEXT_PUBLIC_BAIDU_MAP_ENABLED=false

# API配置
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# 认证配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# 开发配置
NODE_ENV=development
```

### 4. 初始化数据库

#### 推送数据库模式
```bash
# 推送数据库模式到数据库
npm run db:push
```

#### 运行数据库种子
```bash
# 运行数据库种子，插入初始数据
npm run db:seed
```

#### 验证数据库
```bash
# 检查数据库文件是否创建
ls -la dev.db

# 使用Prisma Studio查看数据库
npm run db:studio
```

### 5. 启动开发服务器

#### 启动开发服务器
```bash
# 启动开发服务器
npm run dev
```

#### 服务器启动日志
```
> s100-webgis@0.1.0 dev
> next dev

▲ Next.js 15.0.0
- Local:        http://localhost:3000
- Environments: development
- Network:      http://localhost:3000
✓ Ready in 3.2s
```

### 6. 验证系统运行

#### 访问应用
打开浏览器并访问: [http://localhost:3000](http://localhost:3000)

#### 检查主要功能
1. **首页**: 查看系统首页和导航
2. **地图服务**: 访问 `/map-services` 查看地图功能
3. **节点管理**: 访问 `/nodes` 查看节点管理
4. **用户管理**: 访问 `/users` 查看用户管理

#### 检查API端点
```bash
# 测试健康检查API
curl http://localhost:3000/api/health

# 测试用户API
curl http://localhost:3000/api/users

# 测试节点API
curl http://localhost:3000/api/nodes
```

## 常见问题解决

### 1. Node.js版本问题

#### 问题现象
```bash
npm ERR! Node.js v16.x.x is not supported
```

#### 解决方案
```bash
# 使用nvm安装Node.js 18
nvm install 18
nvm use 18

# 验证版本
node --version
```

### 2. 依赖安装失败

#### 问题现象
```bash
npm ERR! network request failed
npm ERR! This is a problem related to network connectivity
```

#### 解决方案
```bash
# 清除npm缓存
npm cache clean --force

# 使用淘宝镜像源
npm config set registry https://registry.npmmirror.com/

# 重新安装依赖
npm install
```

### 3. 数据库连接问题

#### 问题现象
```bash
Error: Cannot find module '.prisma/client'
```

#### 解决方案
```bash
# 重新生成Prisma客户端
npx prisma generate

# 重新推送数据库
npm run db:push
```

### 4. 端口占用问题

#### 问题现象
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

#### 解决方案
```bash
# 查找占用端口的进程
lsof -i :3000

# 终止占用端口的进程
kill -9 <PID>

# 或使用其他端口启动
PORT=3001 npm run dev
```

### 5. TypeScript错误

#### 问题现象
```bash
TypeScript compilation errors found
```

#### 解决方案
```bash
# 检查TypeScript配置
npx tsc --noEmit

# 修复TypeScript错误后重新启动
npm run dev
```

## 开发工具配置

### 1. VS Code配置

#### 推荐插件
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "Prisma.prisma",
    "ms-vscode.vscode-json"
  ]
}
```

#### 工作区设置
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### 2. Git配置

#### 用户配置
```bash
# 设置Git用户名
git config --global user.name "Your Name"

# 设置Git邮箱
git config --global user.email "your.email@example.com"

# 设置默认分支名
git config --global init.defaultBranch main
```

#### 别名配置
```bash
# 设置常用Git别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
```

### 3. 调试配置

#### VS Code调试配置
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

## 下一步

### 1. 学习项目结构
- 阅读 [项目架构文档](../ARCHITECTURE.md)
- 了解 [编码规范](../CODING_STANDARDS.md)
- 查看 [文档规范](../DOCUMENTATION_STANDARDS.md)

### 2. 开发新功能
- 创建新的功能分支
- 遵循编码规范
- 编写测试用例
- 提交Pull Request

### 3. 自定义配置
- 修改地图服务配置
- 自定义主题样式
- 添加新的API端点
- 集成第三方服务

### 4. 部署到生产环境
- 阅读 [部署指南](./DEPLOYMENT.md)
- 配置生产环境
- 设置监控和日志
- 性能优化

## 资源链接

### 官方文档
- [Next.js 文档](https://nextjs.org/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Prisma 文档](https://www.prisma.io/docs/)

### 社区资源
- [Next.js GitHub](https://github.com/vercel/next.js)
- [TypeScript GitHub](https://github.com/microsoft/TypeScript)
- [Tailwind CSS GitHub](https://github.com/tailwindlabs/tailwindcss)
- [Prisma GitHub](https://github.com/prisma/prisma)

### 工具和资源
- [VS Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

## 获取帮助

### 问题反馈
如果您遇到问题或有建议，请通过以下方式联系我们：

- **GitHub Issues**: [提交问题](https://github.com/your-username/s100-webgis/issues)
- **邮件支持**: support@example.com
- **社区论坛**: [社区讨论](https://discord.gg/your-community)

### 贡献指南
我们欢迎社区贡献！请阅读以下指南：

- [贡献指南](../../CONTRIBUTING.md)
- [行为准则](../../CODE_OF_CONDUCT.md)
- [许可证信息](../../LICENSE)

---

恭喜！您已经成功搭建了S100海事服务系统的开发环境。现在您可以开始探索系统功能并进行开发工作了。

*最后更新: 2024-01-01*