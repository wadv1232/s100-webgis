# API文档自动生成系统

## 概述

本项目实现了一个完整的API文档自动生成系统，能够自动扫描API路由文件，生成标准化的API文档，包括对外数据服务API、协作API和内部综合管理API三类文档。

## 功能特性

### 1. 自动扫描API路由
- 扫描 `src/app/api` 目录下的所有 `route.ts` 文件
- 自动识别HTTP方法（GET、POST、PUT、DELETE等）
- 解析路径参数和动态路由

### 2. 智能分类系统
- **对外数据服务API (Public Data Service API)**: 为第三方开发者和系统集成商提供的标准海事数据服务API接口
- **协作API (Federation API)**: 用于节点间通信，实现能力发现与聚合，对上级节点可见
- **内部综合管理API (Administration API)**: 供本级管理员通过管理后台进行操作，拥有最高权限，不对外公开

### 3. 自动生成内容
- API端点基本信息（方法、路径、描述）
- 请求参数和路径参数
- 响应状态码和描述
- 安全级别和认证方式
- 版本信息

### 4. 动态页面生成
- 使用生成的数据动态渲染API文档页面
- 替代硬编码的API文档内容
- 支持实时更新和同步

## 使用方法

### 1. 生成API文档

```bash
# 生成API文档数据
npm run docs:generate

# 或者使用完整命令
node scripts/generate-api-docs.js
```

### 2. 开发模式

```bash
# 生成文档并启动开发服务器
npm run docs:dev
```

### 3. 查看生成的文档

生成的API文档可以在以下页面查看：

- **自动生成示例**: http://localhost:3000/generated-api-docs
- **对外API文档**: http://localhost:3000/external-api
- **内部API文档**: http://localhost:3000/internal-api  
- **完整API文档**: http://localhost:3000/api-docs

## 文件结构

```
scripts/
├── generate-api-docs.js              # 主要的API文档生成脚本
└── update-api-pages.js              # API页面更新脚本（可选）

src/
├── lib/
│   └── generated/
│       └── api-documentation.ts      # 自动生成的API文档数据
└── app/
    ├── generated-api-docs/
    │   └── page.tsx                  # 使用生成数据的示例页面
    ├── external-api/
    │   └── page.tsx                  # 对外API文档页面
    ├── internal-api/
    │   └── page.tsx                  # 内部API文档页面
    └── api-docs/
        └── page.tsx                  # 完整API文档页面
```

## 生成的数据结构

### ApiEndpoint 接口
```typescript
interface ApiEndpoint {
  method: string;                    // HTTP方法
  path: string;                     // API路径
  description: string;              // API描述
  category: 'public' | 'federation' | 'administration'; // API分类
  version: string;                  // 版本号
  authentication: string;           // 认证方式
  securityLevel: 'low' | 'medium' | 'high' | 'critical'; // 安全级别
  parameters?: Array<{              // 请求参数
    name: string;
    type: string;
    required: boolean;
    description: string;
    example?: string;
  }>;
  requestBody?: {                   // 请求体
    type: string;
    description: string;
    example: string;
  };
  responses: Array<{                // 响应信息
    code: number;
    description: string;
    example?: string;
  }>;
  tags?: string[];                  // 标签
  deprecated?: boolean;             // 是否已废弃
}
```

### ApiCategory 接口
```typescript
interface ApiCategory {
  name: string;                     // 分类名称
  description: string;              // 分类描述
  icon: string;                     // 图标名称
  securityLevel: string;           // 安全级别
  endpoints: ApiEndpoint[];        // 该分类下的API端点
}
```

### ApiDocumentation 接口
```typescript
interface ApiDocumentation {
  public: ApiCategory[];            // 对外API
  federation: ApiCategory[];        // 协作API
  administration: ApiCategory[];     // 内部管理API
  generatedAt: string;             // 生成时间
  version: string;                 // 文档版本
}
```

## 分类规则

### 对外数据服务API (Public)
- 路径包含 `/v1/` 的API
- 不包含 `/admin/` 或 `/internal/` 的API
- 认证方式：API Key
- 安全级别：medium

### 协作API (Federation)
- 路径包含 `/nodes/` 或 `/federation/` 的API
- 认证方式：Internal Token + IP Whitelist
- 安全级别：high

### 内部综合管理API (Administration)
- 路径包含 `/admin/` 或 `/internal/` 的API
- 认证方式：Internal Token + IP Whitelist
- 安全级别：high 或 critical

## 自定义扩展

### 1. 添加新的API分类

在 `scripts/generate-api-docs.js` 中的 `getCategoryName` 方法中添加新的分类规则：

```javascript
getCategoryName(path) {
  if (path.includes('/new-service/')) return '新服务分类';
  // ... 其他现有规则
  return '其他服务';
}
```

### 2. 自定义描述

在 `getCategoryDescription` 方法中添加对应的描述：

```javascript
getCategoryDescription(categoryName) {
  const descriptions = {
    '新服务分类': '新服务的详细描述',
    // ... 其他现有描述
  };
  return descriptions[categoryName] || 'API服务';
}
```

### 3. 修改安全级别

在 `inferSecurityLevel` 方法中调整安全级别的判断逻辑：

```javascript
inferSecurityLevel(routePath) {
  if (routePath.includes('/critical/')) {
    return 'critical';
  }
  // ... 其他现有规则
  return 'low';
}
```

## 最佳实践

### 1. API文件命名规范
- 使用 `route.ts` 作为API路由文件名
- 目录结构清晰，按功能模块组织
- 动态路由使用 `[param]` 格式

### 2. 注释规范
- 在API函数前添加JSDoc注释
- 包含参数说明和返回值描述
- 标注API的用途和限制

### 3. 定期更新
- 每次添加新API后运行生成脚本
- 在CI/CD流程中集成文档生成
- 定期检查生成的文档准确性

## 故障排除

### 1. 生成的文档为空
检查 `src/app/api` 目录是否存在 `route.ts` 文件
确保API文件导出了正确的函数

### 2. 分类不正确
检查路径是否包含正确的关键词
确认 `inferCategory` 方法的逻辑

### 3. 页面无法访问
确认开发服务器正在运行
检查页面组件是否正确导入生成的数据

## 示例输出

运行生成脚本后，会在 `src/lib/generated/api-documentation.ts` 中生成如下结构的数据：

```typescript
export const apiDocumentation: ApiDocumentation = {
  "public": [
    {
      "name": "S-101电子海图服务",
      "description": "提供电子海图数据的Web要素服务和Web地图服务",
      "icon": "Map",
      "securityLevel": "medium",
      "endpoints": [
        {
          "method": "GET",
          "path": "/api/v1/s101/wfs",
          "description": "获取S-101电子海图Web要素服务",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "API Key",
          "securityLevel": "medium",
          "responses": [...]
        }
      ]
    }
  ],
  "federation": [...],
  "administration": [...],
  "generatedAt": "2024-01-20T10:30:00Z",
  "version": "1.0.0"
}
```

## 总结

这个API文档自动生成系统实现了：
- ✅ 完全自动化的API文档生成
- ✅ 智能的三级分类系统
- ✅ 标准化的文档格式
- ✅ 动态的页面渲染
- ✅ 易于扩展和维护

通过这个系统，开发者可以专注于API功能的实现，文档生成和更新完全自动化，大大提高了开发效率和文档的准确性。