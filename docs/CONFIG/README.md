# 配置文档

本目录包含S100海事服务系统的配置文件说明、配置指南和最佳实践。

## 📋 配置概述

S100海事服务系统使用多种配置文件来管理不同方面的系统设置：

### 🗂️ 配置文件结构
```
config/
├── app/                    # 应用程序配置
│   ├── next.config.ts     # Next.js配置
│   ├── tailwind.config.ts  # Tailwind CSS配置
│   ├── postcss.config.mjs  # PostCSS配置
│   ├── tsconfig.json       # TypeScript配置
│   └── components.json     # shadcn/ui组件配置
├── map-env.ts             # 地图环境配置
├── map-config.ts          # 地图功能配置
└── linting/               # 代码检查配置
    └── eslint.config.mjs  # ESLint配置
```

## 🔧 核心配置文件

### Next.js配置 (`config/app/next.config.ts`)
- React严格模式配置
- 构建优化设置
- 模块别名配置
- 环境变量处理

### TypeScript配置 (`config/app/tsconfig.json`)
- 严格模式启用
- 模块解析配置
- 路径别名设置
- 编译选项优化

### Tailwind CSS配置 (`config/app/tailwind.config.ts`)
- 主题配置
- 插件设置
- 自定义样式
- 响应式设计配置

### 地图配置
- **地图环境配置** (`map-env.ts`) - 地图服务环境变量和API配置
- **地图功能配置** (`map-config.ts`) - 地图功能特性和行为配置

## 🌍 环境变量配置

### 必需的环境变量
```bash
# 数据库配置
DATABASE_URL="file:./dev.db"

# NextAuth配置
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# API配置
API_BASE_URL="http://localhost:3000/api"

# 地图服务配置
# 天地图
TIANDITU_KEY="your-tianditu-key"
# 高德地图
GAODE_KEY="your-gaode-key"
# 腾讯地图
TENCENT_KEY="your-tencent-key"
# 百度地图
BAIDU_KEY="your-baidu-key"
```

### 可选的环境变量
```bash
# 开发环境配置
NODE_ENV="development"

# 日志配置
LOG_LEVEL="debug"

# 缓存配置
CACHE_ENABLED="true"
CACHE_TTL="3600"
```

## 🗺️ 地图服务配置

### 支持的地图服务
- **天地图** - 中国官方地图服务
- **高德地图** - 阿里巴巴地图服务
- **腾讯地图** - 腾讯地图服务
- **百度地图** - 百度地图服务

### 配置示例
```typescript
// map-config.ts
export const mapConfig = {
  defaultProvider: 'tianditu',
  providers: {
    tianditu: {
      enabled: true,
      apiKey: process.env.TIANDITU_KEY,
      layers: ['vec', 'cva', 'ter', 'cta']
    },
    gaode: {
      enabled: true,
      apiKey: process.env.GAODE_KEY,
      layers: ['roadnet', 'satellite']
    }
  }
}
```

## 🎨 UI组件配置

### shadcn/ui配置 (`config/app/components.json`)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## 🔍 代码质量配置

### ESLint配置 (`config/linting/eslint.config.mjs`)
- TypeScript支持
- React规则配置
- 代码风格检查
- 导入/导出规则

### 配置规则
```javascript
export default {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  }
}
```

## 🚀 部署配置

### 开发环境配置
- 热重载启用
- 详细日志输出
- 源码映射启用
- 开发工具支持

### 生产环境配置
- 构建优化启用
- 错误监控配置
- 性能优化设置
- 安全配置启用

## 📝 配置最佳实践

### 1. 环境变量管理
- 使用 `.env` 文件进行本地开发
- 生产环境使用真实的环境变量
- 敏感信息不要提交到版本控制
- 使用默认值处理缺失的配置

### 2. 配置文件组织
- 按功能模块组织配置文件
- 使用TypeScript进行类型安全配置
- 提供配置验证和错误处理
- 保持配置文件的清晰和可维护性

### 3. 地图服务配置
- 为不同环境配置不同的API密钥
- 实现地图服务的降级处理
- 提供地图服务状态监控
- 支持动态切换地图服务

### 4. 安全配置
- 使用HTTPS进行生产部署
- 配置适当的安全头
- 实现API访问控制
- 定期更新依赖包

## 🔧 配置验证

系统启动时会自动验证关键配置：
- 数据库连接
- 环境变量完整性
- 地图服务API密钥
- 认证配置有效性

如果配置验证失败，系统会提供详细的错误信息和修复建议。

---

*最后更新: 2024-01-01*