# S-100海事服务平台 - 种子数据使用指南

## 🎯 重构成果

✅ **成功重构prisma seed数据，按照功能模块分类，遵循KISS原则**

### 📁 新的目录结构
```
prisma/seed/
├── auth/           # 🔐 认证和权限模块
├── nodes/          # 🌐 节点管理模块
├── datasets/       # 📊 数据集管理模块
├── services/       # 🚀 服务管理模块
├── system/         # ⚙️ 系统配置模块
├── index.ts        # 主种子文件
├── run-seed.ts     # 种子脚本运行器
├── test-seed.ts    # 完整性测试脚本
├── README.md       # 详细说明文档
└── USAGE.md        # 使用指南（本文件）
```

## 🚀 快速开始

### 1. 首次初始化
```bash
# 完整的数据库设置（推荐）
npm run db:setup
```

### 2. 开发环境重置
```bash
# 重置数据库并重新初始化
npm run db:reset -- --force
```

### 3. 单独运行种子脚本
```bash
# 直接运行种子脚本
npx tsx prisma/seed/run-seed.ts
```

### 4. 验证数据完整性
```bash
# 运行完整性测试
npx tsx prisma/seed/test-seed.ts
```

## 📊 数据统计

运行完成后，数据库包含：

| 模块 | 数据类型 | 数量 |
|------|----------|------|
| 🔐 认证权限 | 用户场景 | 5个 |
| | 角色权限 | 40+个 |
| | 场景角色关联 | 5个 |
| | 用户 | 8个 |
| 🌐 节点管理 | 节点层级 | 5个 |
| | 节点能力 | 7个 |
| 📊 数据集管理 | 数据集 | 5个 |
| 🚀 服务管理 | 服务实例 | 9个 |
| | 服务目录条目 | 7个 |
| ⚙️ 系统配置 | 系统配置 | 10个 |
| | 示例帖子 | 4个 |

## 🎨 功能模块详解

### 🔐 认证和权限模块 (`auth/`)

**功能**: 用户、角色、权限管理
**包含**:
- 用户场景（终端用户、数据管理员、区域管理者、系统管理员、服务提供商）
- 角色权限（6种用户角色的默认权限）
- 场景角色关联
- 示例用户（各级管理员和终端用户）

**特色**:
- 完整的RBAC权限体系
- 支持场景化权限配置
- 符合IHO S-100标准的用户角色定义

### 🌐 节点管理模块 (`nodes/`)

**功能**: S-100分层节点架构
**包含**:
- 节点层级结构（全球根节点→国家级→区域级→叶子节点）
- 节点能力（S-100产品和服务能力）

**特色**:
- 完整的4层节点架构
- 支持多种S-100产品类型（S101、S102、S104、S111）
- 真实的地理位置和覆盖范围

### 📊 数据集管理模块 (`datasets/`)

**功能**: S-100产品数据集管理
**包含**:
- 示例数据集（电子海图、高精度水深、动态水位、实时海流）
- 完整的元数据信息
- 地理覆盖范围

**特色**:
- 覆盖主要S-100产品类型
- 真实的港口数据（上海港、宁波港）
- 完整的数据集生命周期管理

### 🚀 服务管理模块 (`services/`)

**功能**: OGC服务管理
**包含**:
- 服务实例（WMS、WFS、WCS）
- 服务目录条目
- 服务发现和访问

**特色**:
- 标准OGC服务支持
- 自动服务端点生成
- 服务目录扁平化管理

### ⚙️ 系统配置模块 (`system/`)

**功能**: 系统配置和示例内容
**包含**:
- 系统基础配置
- 安全配置
- 同步和缓存配置
- 示例内容

**特色**:
- 分类化的配置管理
- 生产环境友好的默认值
- 便于演示的示例内容

## 🔧 自定义和扩展

### 添加新的功能模块
```typescript
// 1. 在对应目录创建新文件
// prisma/seed/modules/new-module/01-feature.seed.ts

// 2. 导出种子函数
export async function seedNewFeature() {
  // 种子数据逻辑
}

// 3. 在主文件中导入和调用
// prisma/seed/index.ts
import { seedNewFeature } from './modules/new-module/01-feature.seed'
```

### 修改现有数据
```typescript
// 找到对应的功能模块文件
// 例如：修改用户场景
// prisma/seed/auth/01-user-scenarios.seed.ts

// 更新数据内容
const scenarios = await Promise.all([
  prisma.userScenario.create({
    data: {
      name: '新的用户场景',
      description: '场景描述',
      icon: 'Icon',
      color: 'blue',
      isActive: true
    }
  })
])
```

### 添加新的节点或数据集
```typescript
// 修改节点层级文件
// prisma/seed/nodes/01-node-hierarchy.seed.ts

// 添加新节点
const newNode = await prisma.node.create({
  data: {
    name: '新节点',
    type: NodeType.LEAF,
    level: 3,
    // ... 其他字段
  }
})
```

## 🧪 测试和验证

### 运行完整性测试
```bash
npx tsx prisma/seed/test-seed.ts
```

### 检查特定模块数据
```bash
# 检查用户数据
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const users = await prisma.user.findMany();
console.log('用户列表:', users.map(u => u.name));
await prisma.\$disconnect();
"
```

### 验证数据关联
```bash
# 检查节点和数据集关联
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const datasets = await prisma.dataset.findMany({ include: { node: true } });
console.log('数据集关联:', datasets.map(d => \`\${d.name} -> \${d.node?.name}\`));
await prisma.\$disconnect();
"
```

## ⚠️ 注意事项

### 开发环境 vs 生产环境
- **开发环境**: 自动清理现有数据，便于调试
- **生产环境**: 跳过数据初始化，避免数据丢失

### 数据依赖关系
模块间有严格的依赖关系，必须按以下顺序执行：
1. 认证和权限模块
2. 节点管理模块
3. 数据集管理模块
4. 服务管理模块
5. 系统配置模块

### 错误处理
- 每个模块都有独立的错误处理
- 重复数据会被自动跳过
- 详细的日志输出便于调试

## 🔄 数据流程

```
认证权限 → 节点管理 → 数据集管理 → 服务管理 → 系统配置
    ↓           ↓           ↓           ↓           ↓
  用户场景   节点层级     数据集      服务实例     系统配置
  角色权限   节点能力               服务目录     示例内容
  场景关联
  用户数据
```

## 🎉 总结

✅ **重构完成！新的种子数据结构具有以下优势：**

1. **模块化设计**: 按功能分类，便于维护和扩展
2. **KISS原则**: 每个文件职责单一，代码简洁明了
3. **完整测试**: 包含完整性测试脚本，确保数据质量
4. **详细文档**: 完善的使用说明和API文档
5. **易于扩展**: 清晰的扩展指南，便于添加新功能

🚀 **S-100海事服务平台现已具备完整的、高质量的种子数据，支持快速开发和演示！**