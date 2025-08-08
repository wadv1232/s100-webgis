# 数据库文档

本目录包含S100海事服务系统的数据库设计、种子数据、模拟数据等相关文档。

## 🗄️ 数据库概述

S100海事服务系统使用Prisma ORM配合SQLite数据库（开发环境）或PostgreSQL数据库（生产环境）进行数据管理。

### 📋 数据库技术栈
- **ORM**: Prisma
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **迁移工具**: Prisma Migrate
- **种子数据**: Prisma Seed

## 📊 数据库设计

### 核心数据模型
- **用户管理** - 用户、角色、权限
- **节点管理** - 节点层次、能力、覆盖范围
- **服务管理** - 服务注册、发布、监控
- **数据集管理** - 数据集、元数据、发布状态
- **地图配置** - 底图配置、图层设置

### 数据库关系图
```
User (用户)
├── Role (角色)
├── Permission (权限)
└── NodeAssignment (节点分配)

Node (节点)
├── NodeType (节点类型)
├── NodeCapability (节点能力)
├── NodeCoverage (节点覆盖范围)
└── NodeBaseMapConfig (节点底图配置)

Service (服务)
├── ServiceType (服务类型)
├── ServiceStatus (服务状态)
└── ServiceEndpoint (服务端点)

Dataset (数据集)
├── DatasetType (数据集类型)
├── DatasetMetadata (数据集元数据)
└── DatasetPublication (数据集发布)
```

## 🌱 种子数据

### 种子数据结构
```
prisma/seed/
├── index.ts              # 种子数据入口
├── run-seed.ts          # 种子数据运行脚本
├── test-seed.ts         # 测试种子数据
├── USAGE.md             # 种子数据使用指南
├── README.md            # 种子数据说明
├── system/              # 系统配置种子
│   ├── 01-system-config.seed.ts
│   └── 02-sample-posts.seed.ts
├── auth/                # 认证相关种子
│   ├── 01-user-scenarios.seed.ts
│   ├── 02-role-permissions.seed.ts
│   ├── 03-scenario-roles.seed.ts
│   └── 04-users.seed.ts
├── nodes/               # 节点相关种子
│   ├── 01-node-hierarchy.seed.ts
│   └── 02-node-capabilities.seed.ts
├── services/            # 服务相关种子
│   ├── 01-services.seed.ts
│   └── 02-service-directory.seed.ts
└── datasets/            # 数据集相关种子
    └── 01-datasets.seed.ts
```

### 种子数据使用
```bash
# 运行种子数据
npm run db:seed

# 重置数据库并运行种子
npm run db:reset

# 仅运行测试种子
npm run db:seed:test
```

## 🎭 模拟数据

### 模拟数据结构
```
mock-data/
├── README.md            # 模拟数据说明
├── index.ts             # 模拟数据入口
├── users/               # 用户模拟数据
│   └── users.ts
├── nodes/               # 节点模拟数据
│   └── nodes.ts
├── services/            # 服务模拟数据
│   └── services.ts
├── datasets/            # 数据集模拟数据
│   └── datasets.ts
├── s100/                # S100标准数据
│   └── s100.ts
├── s101/                # S101标准数据
│   ├── wms/
│   │   └── navigation-layer.json
│   └── wfs/
│       └── depth-features.json
├── s102/                # S102标准数据
│   ├── wms/
│   │   └── bathymetry-layer.json
│   └── wcs/
│       └── bathymetry-grid.tiff.metadata
├── s104/                # S104标准数据
│   └── wms/
│       └── water-level.json
├── s111/                # S111标准数据
│   └── wfs/
│       └── current-vectors.json
└── capabilities/        # 能力数据
    └── capabilities.ts
```

### 模拟数据用途
- **开发测试** - 提供开发和测试所需的样本数据
- **功能演示** - 支持系统功能的演示和展示
- **API测试** - 为API接口提供测试数据
- **UI开发** - 支持前端界面的开发和调试

## 🔄 数据库操作

### 常用数据库命令
```bash
# 推送schema到数据库
npm run db:push

# 生成Prisma客户端
npm run db:generate

# 创建迁移文件
npm run db:migrate:dev

# 应用迁移
npm run db:migrate:deploy

# 查看数据库
npm run db:studio

# 重置数据库
npm run db:reset
```

### 数据库种子操作
```bash
# 运行所有种子数据
npm run db:seed

# 运行特定种子文件
npx tsx prisma/seed/run-seed.ts

# 运行测试种子
npx tsx prisma/seed/test-seed.ts
```

## 📋 数据标准

### S100系列标准支持
- **S-101** - 电子海图（ENC）
- **S-102** - 高精度水深数据
- **S-104** - 动态水位信息
- **S-111** - 实时海流数据
- **S-124** - 航行警告信息

### 数据格式标准
- **WMS** - Web地图服务
- **WFS** - Web要素服务
- **WCS** - Web覆盖服务
- **GeoJSON** - 地理数据交换格式

## 🔧 数据管理最佳实践

### 1. 数据库设计
- 遵循数据库范式设计
- 使用适当的索引优化查询
- 实现数据完整性约束
- 考虑数据安全和隐私保护

### 2. 种子数据管理
- 使用版本控制管理种子数据
- 提供数据验证和清理
- 支持不同环境的种子数据
- 实现种子数据的增量更新

### 3. 模拟数据管理
- 保持模拟数据的真实性
- 提供多样化的数据样本
- 支持动态数据生成
- 实现模拟数据的版本管理

### 4. 数据迁移
- 使用Prisma迁移工具
- 保持迁移的可逆性
- 提供迁移回滚方案
- 记录迁移历史和变更

## 📊 数据监控

### 数据库性能监控
- 查询性能分析
- 索引使用情况
- 连接池状态
- 存储空间使用

### 数据质量监控
- 数据完整性检查
- 数据一致性验证
- 数据更新频率
- 数据访问模式

---

*最后更新: 2024-01-01*