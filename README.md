---
title: S-100 WebGIS Maritime Service Platform
description: A comprehensive maritime data service platform based on IHO S-100 standards
author: Development Team
date: 2024-01-01
version: 1.0.0
category: Project Overview
tags: [maritime, S-100, WebGIS, next.js]
language: zh-CN
---

# 🌊 S-100 海事服务平台 (S-100 WebGIS)

基于分层递归架构的全球海事数据服务网络，为终端用户提供统一、可靠的海事信息访问入口。采用现代化技术栈构建，符合国际海道测量组织（IHO）S-100系列标准。

## ✨ 技术栈

### 🎯 核心框架
- **⚡ Next.js 15** - 生产级 React 框架，使用 App Router
- **📘 TypeScript 5** - 类型安全的 JavaScript，提供更好的开发体验
- **🎨 Tailwind CSS 4** - 实用优先的 CSS 框架，快速构建 UI

### 🧩 UI 组件与样式
- **🧩 shadcn/ui** - 基于 Radix UI 的高质量可访问组件
- **🎯 Lucide React** - 美观一致的图标库
- **🌈 Framer Motion** - 生产级的 React 动画库
- **🎨 Next Themes** - 完美的深色模式支持

### 📋 表单与验证
- **🎣 React Hook Form** - 高性能表单与简单验证
- **✅ Zod** - TypeScript 优先的模式验证

### 🔄 状态管理与数据获取
- **🐻 Zustand** - 简单可扩展的状态管理
- **🔄 TanStack Query** - 强大的 React 数据同步
- **🌐 Axios** - 基于 Promise 的 HTTP 客户端

### 🗄️ 数据库与后端
- **🗄️ Prisma** - 下一代 Node.js 和 TypeScript ORM
- **🔐 NextAuth.js** - 完整的开源身份验证解决方案

### 🎨 高级 UI 功能
- **📊 TanStack Table** - 用于构建表格和数据网格的无头 UI
- **🖱️ DND Kit** - 现代 React 拖放工具包
- **📊 Recharts** - 基于 React 和 D3 构建的图表库
- **🖼️ Sharp** - 高性能图像处理

### 🌍 国际化与工具
- **🌍 Next Intl** - Next.js 国际化库
- **📅 Date-fns** - 现代 JavaScript 日期工具库
- **🪝 ReactUse** - 现代开发的必备 React 钩子集合

## 🎯 项目特色

- **🏗️ 分层架构** - 基于 IHO S-100 标准的分层递归节点架构
- **🎨 美观界面** - 完整的 shadcn/ui 组件库，具有高级交互功能
- **🔒 类型安全** - 完整的 TypeScript 配置和 Zod 验证
- **📱 响应式设计** - 移动优先的设计原则，具有流畅动画
- **🗄️ 数据库就绪** - Prisma ORM 配置，支持快速后端开发
- **🔐 身份验证** - NextAuth.js 提供安全的身份验证流程
- **📊 数据可视化** - 图表、表格和拖放功能
- **🌍 国际化支持** - 使用 Next Intl 的多语言支持
- **🚀 生产就绪** - 优化的构建和部署设置
- **🤖 AI 友好** - 结构化的代码库，适合 AI 辅助开发

## 🌊 S-100 标准支持

平台完全支持 IHO S-100 系列标准：

### 📊 支持的产品类型
- **S-101** - 电子海图（ENC）
- **S-102** - 高精度水深数据
- **S-104** - 动态水位信息
- **S-111** - 实时海流数据
- **S-124** - 航行警告信息
- **S-131** - 海洋保护区数据

### 🏗️ 分层节点架构
- **全球根节点** - IHO 全球协调节点
- **国家级节点** - 各国海事局总部节点
- **区域节点** - 海事分局区域节点
- **叶子节点** - 港口、码头等终端节点

### 👥 用户角色管理
- **系统管理员** - 全球网络治理和系统配置
- **节点管理员** - 区域数据服务和质量监控
- **数据管理员** - 本地数据发布和管理
- **服务管理员** - S-100 服务管理和维护
- **开发者** - API 访问和开发工具
- **终端用户** - 船长、船员等最终用户

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npm run db:setup

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

打开 [http://localhost:3000](http://localhost:3000) 查看运行的应用程序。

## 🔧 开发环境

项目已配置了完整的开发环境优化：

- **React 严格模式** - 提供更好的开发体验
- **热重载优化** - 配置了适当的文件监听延迟
- **代码质量检查** - ESLint 和 TypeScript 检查
- **开发日志** - 详细的开发日志输出到 `dev.log`

## 📁 项目结构

```
├── src/                    # 源代码目录
│   ├── app/               # Next.js App Router 页面
│   │   ├── api/           # API 路由
│   │   ├── users/         # 用户管理页面
│   │   ├── nodes/         # 节点管理页面
│   │   ├── datasets/      # 数据集页面
│   │   ├── services/      # 服务管理页面
│   │   ├── developer/     # 开发者门户
│   │   └── ...
│   ├── components/        # 可重用 React 组件
│   │   ├── ui/           # shadcn/ui 组件
│   │   ├── services/     # 服务相关组件
│   │   └── ...
│   ├── hooks/            # 自定义 React 钩子
│   ├── lib/              # 工具函数和配置
│   │   ├── db/           # 数据库相关
│   │   ├── auth/         # 认证相关
│   │   ├── services/     # 服务相关
│   │   └── utils/        # 工具函数
│   └── contexts/         # React 上下文
├── tools/                # 工具和实用程序
│   ├── commit-tools/     # 自动提交工具
│   └── scripts/         # 开发脚本
├── logs/                 # 日志文件
│   ├── app/             # 应用程序日志
│   └── system/          # 系统工具日志
├── config/               # 配置文件
│   ├── app/             # 应用程序配置
│   ├── database/        # 数据库配置
│   └── linting/         # 代码检查配置
├── deployment/           # 部署相关文件
│   ├── docs/            # 部署文档
│   └── scripts/         # 部署脚本
└── development/          # 开发文档和指南
    ├── docs/            # 开发文档
    ├── guides/          # 开发指南
    └── api-docs/        # API 文档
```

## 🎨 可用功能与组件

### 🧩 UI 组件 (shadcn/ui)
- **布局**: Card, Separator, Aspect Ratio, Resizable Panels
- **表单**: Input, Textarea, Select, Checkbox, Radio Group, Switch
- **反馈**: Alert, Toast (Sonner), Progress, Skeleton
- **导航**: Breadcrumb, Menubar, Navigation Menu, Pagination
- **覆盖**: Dialog, Sheet, Popover, Tooltip, Hover Card
- **数据展示**: Badge, Avatar, Calendar

### 📊 高级数据功能
- **表格**: 强大的数据表格，支持排序、过滤、分页 (TanStack Table)
- **图表**: 使用 Recharts 的美观可视化
- **表单**: 使用 React Hook Form + Zod 验证的类型安全表单

### 🎨 交互功能
- **动画**: 使用 Framer Motion 的流畅微交互
- **拖放**: 使用 DND Kit 的现代拖放功能
- **主题切换**: 内置深色/浅色模式支持

### 🔐 后端集成
- **身份验证**: 使用 NextAuth.js 的现成身份验证流程
- **数据库**: 使用 Prisma 的类型安全数据库操作
- **API 客户端**: Axios + TanStack Query 的 HTTP 请求
- **状态管理**: 使用 Zustand 的简单可扩展状态管理

### 🌍 生产功能
- **国际化**: 使用 Next Intl 的多语言支持
- **图像优化**: 使用 Sharp 的自动图像处理
- **类型安全**: 端到端 TypeScript 和 Zod 验证
- **必备钩子**: 使用 ReactUse 的 100+ 个有用 React 钩子

## 📖 文档

详细文档请查看相应的目录：

- [架构文档](development/docs/architecture.md) - 系统架构设计
- [开发指南](development/docs/development.md) - 开发环境搭建和规范
- [用户角色](development/docs/user-roles.md) - 用户角色和权限管理
- [数据库设计](development/docs/database.md) - 数据库架构和模型
- [部署指南](deployment/docs/deployment.md) - 生产环境部署
- [API 文档](development/api-docs/README.md) - API 接口文档

## 🛠️ 工具和配置

### 工具 ([tools/](tools/))
- **自动提交工具** - 自动化 Git 提交脚本
- **开发脚本** - 数据更新和维护脚本

### 配置 ([config/](config/))
- **应用程序配置** - Next.js、TypeScript、Tailwind 配置
- **数据库配置** - Prisma 和数据库设置
- **代码检查** - ESLint 和代码质量配置

### 日志 ([logs/](logs/))
- **应用日志** - 开发服务器和应用程序日志
- **系统日志** - 工具和系统操作日志

## 🤝 贡献

欢迎贡献代码！请确保：

1. 遵循项目的代码规范
2. 运行 `npm run lint` 检查代码质量
3. 运行 `npm run db:setup` 确保数据库正常
4. 提交前测试所有功能

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

使用 ❤️ 为海事社区构建。符合 IHO S-100 标准 🌊