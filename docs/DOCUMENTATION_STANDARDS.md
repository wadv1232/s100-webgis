# 文档规范

## 概述

本文档定义了S100海事服务系统项目的文档编写规范，确保文档的一致性、完整性和可维护性。

## 1. 文档结构规范

### 1.1 项目文档目录结构
```
docs/
├── README.md                           # 文档导航和概述
├── CODING_STANDARDS.md                 # 编码规范
├── DOCUMENTATION_STANDARDS.md          # 文档规范
├── ARCHITECTURE.md                     # 系统架构
├── API/
│   ├── README.md                       # API文档概述
│   ├── REST_API.md                     # REST API文档
│   ├── GRAPHQL_API.md                  # GraphQL API文档
│   └── WEBSOCKET_API.md                # WebSocket API文档
├── GUIDES/
│   ├── README.md                       # 开发指南概述
│   ├── GETTING_STARTED.md              # 快速开始
│   ├── DEVELOPMENT_SETUP.md            # 开发环境搭建
│   ├── DEPLOYMENT.md                   # 部署指南
│   ├── TESTING.md                      # 测试指南
│   └── TROUBLESHOOTING.md              # 故障排除
├── COMPONENTS/
│   ├── README.md                       # 组件文档概述
│   ├── UI_COMPONENTS.md                # UI组件文档
│   ├── MAP_COMPONENTS.md               # 地图组件文档
│   └── FORM_COMPONENTS.md              # 表单组件文档
├── FEATURES/
│   ├── README.md                       # 功能文档概述
│   ├── USER_MANAGEMENT.md              # 用户管理功能
│   ├── NODE_MANAGEMENT.md              # 节点管理功能
│   ├── SERVICE_MANAGEMENT.md           # 服务管理功能
│   └── MAP_SERVICES.md                 # 地图服务功能
├── DATABASE/
│   ├── README.md                       # 数据库文档概述
│   ├── SCHEMA.md                       # 数据库模式
│   ├── MIGRATIONS.md                   # 数据库迁移
│   └── SEEDING.md                      # 数据库种子
├── SECURITY/
│   ├── README.md                       # 安全文档概述
│   ├── AUTHENTICATION.md               # 认证机制
│   ├── AUTHORIZATION.md                # 授权机制
│   └── DATA_PROTECTION.md              # 数据保护
├── PERFORMANCE/
│   ├── README.md                       # 性能文档概述
│   ├── OPTIMIZATION.md                 # 性能优化
│   ├── MONITORING.md                   # 性能监控
│   └── SCALING.md                      # 扩展性
└── CHANGELOG/
    ├── README.md                       # 更新日志概述
    ├── v1.0.0.md                       # 版本1.0.0更新
    ├── v1.1.0.md                       # 版本1.1.0更新
    └── v2.0.0.md                       # 版本2.0.0更新
```

### 1.2 代码内文档结构
```
src/
├── components/
│   ├── ComponentName/
│   │   ├── index.tsx                   # 组件主文件
│   │   ├── ComponentName.tsx           # 组件实现
│   │   ├── ComponentName.types.ts      # 组件类型定义
│   │   ├── ComponentName.test.tsx      # 组件测试
│   │   ├── ComponentName.stories.tsx   # 组件故事书
│   │   └── README.md                   # 组件文档
│   └── ...
├── lib/
│   ├── services/
│   │   ├── serviceName.ts              # 服务实现
│   │   ├── serviceName.types.ts       # 服务类型定义
│   │   ├── serviceName.test.ts        # 服务测试
│   │   └── README.md                   # 服务文档
│   └── ...
├── hooks/
│   ├── useHookName.ts                  # Hook实现
│   ├── useHookName.test.ts            # Hook测试
│   └── README.md                       # Hook文档
└── ...
```

## 2. 文档格式规范

### 2.1 Markdown格式

#### 文档头部
```markdown
---
title: 文档标题
description: 文档描述
author: 作者姓名
date: 2024-01-01
version: 1.0.0
category: 文档分类
tags: [标签1, 标签2]
---

# 文档标题

## 概述

本文档描述了...
```

#### 标题层级
```markdown
# 一级标题 (文档标题)
## 二级标题 (主要章节)
### 三级标题 (子章节)
#### 四级标题 (小节)
##### 五级标题 (子小节)
###### 六级标题 (段落标题)
```

#### 代码块
```markdown
```typescript
// TypeScript代码
const example: string = "Hello World";
```

```javascript
// JavaScript代码
const example = "Hello World";
```

```bash
# 命令行
npm install
```

```json
// JSON配置
{
  "key": "value"
}
```
```

#### 表格
```markdown
| 参数名 | 类型 | 必需 | 描述 | 默认值 |
|--------|------|------|------|--------|
| id | string | 是 | 用户ID | - |
| name | string | 是 | 用户名称 | - |
| email | string | 是 | 用户邮箱 | - |
| isActive | boolean | 否 | 是否激活 | true |
```

#### 链接和引用
```markdown
[链接文本](链接地址)

[内部链接](../GUIDES/GETTING_STARTED.md)

[外部链接](https://example.com)

[引用链接][reference-link]

[reference-link]: https://example.com
```

#### 图片
```markdown
![图片描述](图片路径)

![架构图](./images/architecture.png)

![流程图](./images/workflow.svg "工作流程")
```

#### 警告和提示
```markdown
> **注意**: 这是一个重要提示

> **警告**: 这是一个警告信息

> **危险**: 这是一个危险操作提示

> **提示**: 这是一个有用的提示
```

#### 列表
```markdown
无序列表：
- 项目1
- 项目2
  - 子项目1
  - 子项目2
- 项目3

有序列表：
1. 第一步
2. 第二步
   1. 子步骤1
   2. 子步骤2
3. 第三步

任务列表：
- [x] 已完成任务
- [ ] 未完成任务
```

### 2.2 JSDoc注释规范

#### 文件注释
```typescript
/**
 * @fileoverview 用户服务模块
 * 提供用户相关的业务逻辑和数据操作
 * @author 开发者姓名
 * @since 2024-01-01
 * @version 1.0.0
 * @module services/userService
 */
```

#### 类注释
```typescript
/**
 * 用户服务类
 * 提供用户管理的核心功能
 * @class UserService
 */
export class UserService {
  /**
   * 创建用户服务实例
   * @param {ApiClient} apiClient - API客户端
   */
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }
}
```

#### 函数注释
```typescript
/**
 * 获取用户信息
 * @param {string} userId - 用户ID
 * @returns {Promise<User>} 用户信息对象
 * @throws {Error} 当用户不存在时抛出错误
 * @example
 * ```typescript
 * const user = await userService.getUser('123');
 * console.log(user.name);
 * ```
 */
export const getUser = async (userId: string): Promise<User> => {
  // 实现
};
```

#### 接口注释
```typescript
/**
 * 用户接口定义
 * @interface User
 */
export interface User {
  /** 用户ID */
  id: string;
  /** 用户名称 */
  name: string;
  /** 用户邮箱 */
  email: string;
  /** 是否激活 */
  isActive: boolean;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}
```

#### 类型注释
```typescript
/**
 * 用户状态枚举
 * @enum {string}
 */
export enum UserStatus {
  /** 激活状态 */
  ACTIVE = 'active',
  /** 未激活状态 */
  INACTIVE = 'inactive',
  /** 待审核状态 */
  PENDING = 'pending'
}
```

## 3. 文档内容规范

### 3.1 API文档规范

#### REST API文档
```markdown
## 获取用户信息

### 请求
- **方法**: `GET`
- **路径**: `/api/users/{id}`
- **认证**: Bearer Token

### 路径参数
| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| id | string | 是 | 用户ID |

### 查询参数
| 参数名 | 类型 | 必需 | 描述 | 默认值 |
|--------|------|------|------|--------|
| include | string | 否 | 包含的字段 | - |

### 请求示例
```bash
curl -X GET "http://localhost:3000/api/users/123?include=profile" \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json"
```

### 响应
#### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "用户不存在"
  }
}
```

### 状态码
| 状态码 | 描述 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 404 | 用户不存在 |
| 500 | 服务器内部错误 |
```

### 3.2 组件文档规范

#### 组件文档模板
```markdown
# 组件名称

## 概述

组件描述和用途说明。

## 使用示例

### 基本使用
```tsx
import { ComponentName } from '@/components/ComponentName';

<ComponentName prop1="value1" prop2={value2}>
  子内容
</ComponentName>
```

### 高级使用
```tsx
<ComponentName
  prop1="value1"
  prop2={value2}
  onEvent={handleEvent}
>
  <ChildComponent />
</ComponentName>
```

## 属性

### 必需属性
| 属性名 | 类型 | 描述 |
|--------|------|------|
| prop1 | string | 属性1描述 |

### 可选属性
| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| prop2 | number | 0 | 属性2描述 |

### 事件属性
| 属性名 | 类型 | 描述 |
|--------|------|------|
| onEvent | (data: DataType) => void | 事件处理函数 |

## 样式

### CSS类名
```css
.component-name {
  /* 组件样式 */
}

.component-name--modifier {
  /* 修饰符样式 */
}
```

### Tailwind类名
```tsx
<div className="flex items-center justify-center p-4">
  {/* 内容 */}
</div>
```

## 无障碍性

### ARIA属性
- `aria-label`: 描述组件用途
- `aria-describedby`: 关联描述文本

### 键盘导航
- `Tab`: 聚焦组件
- `Enter`: 激活组件
- `Escape`: 关闭组件

## 测试

### 单元测试
```tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName prop1="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

## 相关组件

- [RelatedComponent1](./RelatedComponent1.md)
- [RelatedComponent2](./RelatedComponent2.md)

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本
- 实现基本功能
```

### 3.3 功能文档规范

#### 功能文档模板
```markdown
# 功能名称

## 概述

功能描述和业务价值说明。

## 用户故事

作为 [用户角色]，我想要 [功能需求]，以便 [业务价值]。

## 功能流程

### 流程图
```mermaid
graph TD
    A[开始] --> B[步骤1]
    B --> C[步骤2]
    C --> D[步骤3]
    D --> E[结束]
```

### 详细步骤
1. **步骤1**: 描述步骤1的具体操作
2. **步骤2**: 描述步骤2的具体操作
3. **步骤3**: 描述步骤3的具体操作

## 界面设计

### 页面布局
- **顶部**: 导航栏和搜索
- **主体**: 内容区域
- **底部**: 操作按钮

### 交互设计
- **点击**: 点击按钮触发操作
- **拖拽**: 拖拽元素重新排序
- **键盘**: 支持键盘快捷键

## 技术实现

### 前端实现
- **组件**: 使用React组件实现
- **状态管理**: 使用Zustand管理状态
- **API调用**: 使用自定义Hook调用API

### 后端实现
- **API**: RESTful API设计
- **数据库**: 使用Prisma ORM
- **认证**: 使用JWT认证

### 数据流
```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as 数据库
    
    U->>F: 用户操作
    F->>B: API请求
    B->>D: 数据查询
    D->>B: 返回数据
    B->>F: 返回响应
    F->>U: 更新界面
```

## 配置说明

### 环境变量
```env
# 功能相关配置
FEATURE_ENABLED=true
FEATURE_CONFIG_KEY=value
```

### 数据库配置
```sql
-- 功能相关表
CREATE TABLE feature_table (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 测试策略

### 单元测试
- 组件渲染测试
- 状态管理测试
- 工具函数测试

### 集成测试
- API集成测试
- 数据库集成测试
- 用户流程测试

### 端到端测试
- 用户操作流程测试
- 跨浏览器兼容性测试

## 监控和日志

### 关键指标
- **响应时间**: API响应时间 < 500ms
- **错误率**: 错误率 < 1%
- **用户满意度**: 用户满意度 > 90%

### 日志记录
```typescript
// 功能相关日志
logger.info('Feature action performed', {
  userId: '123',
  action: 'create',
  timestamp: new Date()
});
```

## 故障排除

### 常见问题
1. **问题1**: 描述问题和解决方案
2. **问题2**: 描述问题和解决方案

### 调试步骤
1. 检查配置文件
2. 查看日志文件
3. 测试API连接

## 相关资源

- [API文档](../API/REST_API.md)
- [组件文档](../COMPONENTS/UI_COMPONENTS.md)
- [数据库文档](../DATABASE/SCHEMA.md)
```

## 4. 文档维护规范

### 4.1 文档更新流程

#### 代码变更时
1. **功能开发**: 在开发功能时同步更新文档
2. **代码审查**: 将文档更新作为代码审查的一部分
3. **合并前**: 确保文档与代码保持一致

#### 版本发布时
1. **更新版本号**: 更新文档中的版本信息
2. **更新变更日志**: 记录版本变更内容
3. **发布文档**: 同步发布文档更新

### 4.2 文档审查清单

#### 内容审查
- [ ] 文档内容准确完整
- [ ] 代码示例可运行
- [ ] 链接和引用有效
- [ ] 格式符合规范

#### 技术审查
- [ ] 技术描述准确
- [ ] API参数和响应正确
- [ ] 配置说明清晰
- [ ] 错误处理说明完整

#### 用户体验审查
- [ ] 文档结构清晰
- [ ] 语言表达简洁
- [ ] 示例易于理解
- [ ] 导航和索引完善

### 4.3 文档版本控制

#### 版本标记
```markdown
---
version: 1.0.0
lastUpdated: 2024-01-01
---
```

#### 变更记录
```markdown
## 变更记录

### v1.0.0 (2024-01-01)
- 初始版本发布
- 实现基本功能文档

### v1.1.0 (2024-01-15)
- 添加新功能文档
- 更新API文档
- 修复文档错误
```

## 5. 工具和自动化

### 5.1 文档生成工具

#### 自动化脚本
```bash
#!/bin/bash
# 生成API文档
npm run docs:generate-api

# 生成组件文档
npm run docs:generate-components

# 生成类型文档
npm run docs:generate-types
```

#### CI/CD集成
```yaml
# .github/workflows/docs.yml
name: Documentation
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Generate documentation
        run: npm run docs:generate
      - name: Deploy documentation
        run: npm run docs:deploy
```

### 5.2 文档验证工具

#### 链接检查
```bash
# 检查文档中的链接
npm run docs:check-links
```

#### 格式检查
```bash
# 检查文档格式
npm run docs:lint
```

#### 拼写检查
```bash
# 检查文档拼写
npm run docs:spellcheck
```

## 6. 最佳实践

### 6.1 文档编写原则

#### 清晰性
- 使用简洁明了的语言
- 避免技术术语过度使用
- 提供具体的示例

#### 完整性
- 覆盖所有重要功能
- 包含错误处理说明
- 提供配置选项说明

#### 一致性
- 使用统一的格式和风格
- 保持术语的一致性
- 遵循文档结构规范

### 6.2 文档维护原则

#### 及时性
- 代码变更时及时更新文档
- 定期审查和更新文档
- 响应用户反馈

#### 可访问性
- 提供多种格式的文档
- 确保文档易于搜索
- 支持屏幕阅读器

#### 协作性
- 鼓励团队参与文档编写
- 建立文档审查机制
- 收集用户反馈

## 遵循这些规范将确保文档的质量、一致性和可维护性。