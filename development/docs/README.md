# S-100海事服务平台文档

## 概述

S-100海事服务平台是一个基于分层递归架构的分布式海事数据服务系统，旨在为全球海事用户提供统一、可靠的海事信息访问入口。

### 项目目标

- **统一访问入口**：为终端用户提供单一、可信赖的海事数据来源
- **分层递归架构**：支持全球根节点 → 国家级节点 → 区域节点 → 叶子节点的层级结构
- **管理**：各节点自主管理本地数据，同时参与协作
- **标准化服务**：基于S-100标准提供统一的海事数据服务接口

### 核心特性

- 🌍 **全球覆盖**：支持全球范围内的海事数据服务
- 🏗️ **分层架构**：灵活的节点层级管理
- 🔐 **权限控制**：基于角色的细粒度权限管理
- 📊 **实时监控**：节点健康状态和服务能力监控
- 🔄 **协作**：节点间的数据共享和服务协调
- 📱 **响应式设计**：支持多设备访问

## 文档结构

### [系统架构](./architecture.md)
- 分层递归架构设计
- 节点类型和职责
- 数据流转和服务调用机制

### [用户角色与权限](./user-roles.md)
- 用户场景定义
- 角色权限体系
- 访问控制机制

### [API文档](./api/README.md)
- RESTful API规范
- 认证授权机制
- 错误处理规范

### [数据库设计](./database.md)
- 数据模型设计
- 表结构说明
- 关系映射

### [部署指南](./deployment.md)
- 环境要求
- 安装配置
- 运维指南

### [开发指南](./development.md)
- 开发环境搭建
- 代码规范
- 模块化设计原则

## 快速开始

### 环境要求

- Node.js 18+
- TypeScript 5+
- Prisma
- SQLite

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd s100-federal-maritime-platform
```

2. 安装依赖
```bash
npm install
```

3. 配置数据库
```bash
npm run db:push
npm run db:generate
```

4. 启动开发服务器
```bash
npm run dev
```

### 基本使用

1. 访问系统：打开浏览器访问 `http://localhost:3000`
2. 用户登录：使用系统预设账户或注册新账户
3. 节点管理：根据权限管理节点和服务
4. 数据访问：通过统一接口访问海事数据

## 技术栈

### 前端
- **框架**：Next.js 15 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS + shadcn/ui
- **状态管理**：React Context API + Zustand
- **地图组件**：React Leaflet

### 后端
- **运行时**：Node.js
- **框架**：Next.js API Routes
- **数据库**：Prisma ORM + SQLite
- **认证**：NextAuth.js
- **实时通信**：Socket.io

### 开发工具
- **代码检查**：ESLint
- **格式化**：Prettier
- **类型检查**：TypeScript
- **数据库管理**：Prisma Studio

## 贡献指南

### 开发流程

1. Fork 项目
2. 创建功能分支
3. 提交代码变更
4. 创建 Pull Request
5. 代码审查和合并

### 代码规范

- 遵循 TypeScript 严格模式
- 使用 ESLint 进行代码检查
- 遵循 KISS (Keep It Simple, Stupid) 原则
- 模块化设计，单一职责

### 提交规范

使用语义化提交信息：
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式化
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 许可证

本项目采用 MIT 许可证，详见 [LICENSE](../LICENSE) 文件。

## 联系方式

- 项目维护者：开发团队
- 邮箱：dev-team@example.com
- 问题反馈：[GitHub Issues](https://github.com/example/s100-platform/issues)

---

*最后更新时间：2024年*