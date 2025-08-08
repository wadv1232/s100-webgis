# 数据库设计

## 概述

S-100海事服务平台采用关系型数据库设计，使用Prisma ORM进行数据访问。数据库设计支持分层递归架构，实现了节点管理、用户权限、数据集管理和服务能力等核心功能。

## 数据模型设计

### 核心实体关系

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │    Node     │    │  Dataset    │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id          │    │ id          │    │ id          │
│ email       │    │ name        │    │ name        │
│ username    │    │ type        │    │ description │
│ name        │    │ level       │    │ productType │
│ role        │    │ description │    │ version     │
│ nodeId      │───→│ apiUrl      │    │ status      │
│ isActive    │    │ coverage    │    │ fileName    │
│ createdAt   │    │ isActive    │    │ filePath    │
│ updatedAt   │    │ parentId    │───→│ fileSize    │
└─────────────┘    │ createdAt   │    │ publishedAt │
         │         │ updatedAt   │    │ nodeId      │───┐
         │         └─────────────┘    │ createdAt   │   │
         │                │           │ updatedAt   │   │
         │                │           └─────────────┘   │
         │                │                   │         │
         │                │                   │         │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│UserPermission│    │ ChildNode   │    │   Service   │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id          │    │ id          │    │ id          │
│ userId      │───→│ parentId    │───→│ datasetId   │───┘
│ permission  │    │ childId     │───→│ serviceType │
│ isGranted   │    │ createdAt   │    │ endpoint    │
│ createdAt   │    └─────────────┘    │ isActive    │
└─────────────┘                        │ createdAt   │
         │                             │ updatedAt   │
         │                             └─────────────┘
         │                                      │
         │                                      │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│RolePermission│    │ Capability  │    │UserScenario │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id          │    │ id          │    │ id          │
│ role        │    │ nodeId      │───→│ name        │
│ permission  │    │ productType │    │ description │
│ createdAt   │    │ serviceType │    │ icon        │
└─────────────┘    │ isEnabled   │    │ color       │
         │         │ endpoint    │    │ isActive    │
         │         │ version     │    │ createdAt   │
         │         │ createdAt   │    │ updatedAt   │
         │         │ updatedAt   │    └─────────────┘
         │         └─────────────┘           │
         │                │                  │
         │                │                  │
         │         ┌─────────────┐    ┌─────────────┐
         │         │   Post      │    │ScenarioRole │
         │         ├─────────────┤    ├─────────────┤
         │         │ id          │    │ id          │
         └─────────│ title       │    │ scenarioId  │───┘
                   │ content     │    │ role        │
                   │ published   │    │ permissions │
                   │ authorId    │───→│ createdAt   │
                   │ createdAt   │    └─────────────┘
                   │ updatedAt   │
                   └─────────────┘
```

## 表结构详细说明

### 1. Node表 (节点表)

**描述**：存储节点的信息，支持分层递归架构。

**字段说明**：
- `id`: 节点唯一标识符 (String, Primary Key)
- `name`: 节点名称 (String, Required)
- `type`: 节点类型 (NodeType, Required)
  - `GLOBAL_ROOT`: 全球根节点
  - `NATIONAL`: 国家级节点
  - `REGIONAL`: 区域节点
  - `LEAF`: 叶子节点
- `level`: 节点层级深度 (Int, Required)
  - 0: 根节点
  - 1: 国家级
  - 2: 区域级
  - 3: 叶子节点
- `description`: 节点描述 (String, Optional)
- `apiUrl`: 节点API地址 (String, Required)
- `adminUrl`: 管理API地址 (String, Optional)
- `coverage`: 覆盖范围 (String, Optional, GeoJSON格式)
- `isActive`: 是否激活 (Boolean, Default: true)
- `healthStatus`: 健康状态 (NodeHealth, Default: OFFLINE)
  - `HEALTHY`: 健康
  - `WARNING`: 警告
  - `ERROR`: 错误
  - `OFFLINE`: 离线
- `lastHealthCheck`: 最后健康检查时间 (DateTime, Optional)
- `parentId`: 父节点ID (String, Optional, 自引用)
- `latitude`: 纬度坐标 (Float, Optional)
- `longitude`: 经度坐标 (Float, Optional)
- `createdAt`: 创建时间 (DateTime, Default: now())
- `updatedAt`: 更新时间 (DateTime, Default: updatedAt)

**关系**：
- `parent`: 自引用父节点关系 (1:N)
- `children`: 自引用子节点关系 (1:N)
- `datasets`: 关联的数据集 (1:N)
- `capabilities`: 关联的服务能力 (1:N)
- `users`: 关联的用户 (1:N)

**索引**：
- 主键索引：`id`
- 外键索引：`parentId`
- 复合索引：`type`, `level`, `isActive`

### 2. User表 (用户表)

**描述**：存储系统用户信息，支持角色和权限管理。

**字段说明**：
- `id`: 用户唯一标识符 (String, Primary Key)
- `email`: 邮箱地址 (String, Required, Unique)
- `username`: 用户名 (String, Required, Unique)
- `name`: 用户姓名 (String, Optional)
- `role`: 用户角色 (UserRole, Default: USER)
  - `ADMIN`: 系统管理员
  - `NODE_ADMIN`: 节点管理员
  - `DATA_MANAGER`: 数据管理员
  - `SERVICE_MANAGER`: 服务管理员
  - `USER`: 普通用户
  - `GUEST`: 游客
- `nodeId`: 所属节点ID (String, Optional)
- `isActive`: 是否激活 (Boolean, Default: true)
- `lastLoginAt`: 最后登录时间 (DateTime, Optional)
- `createdAt`: 创建时间 (DateTime, Default: now())
- `updatedAt`: 更新时间 (DateTime, Default: updatedAt)

**关系**：
- `node`: 关联的节点 (N:1)
- `posts`: 关联的文章 (1:N, 保持向后兼容)
- `userPermissions`: 关联的用户权限 (1:N)

**索引**：
- 主键索引：`id`
- 唯一索引：`email`, `username`
- 外键索引：`nodeId`
- 复合索引：`role`, `isActive`

### 3. Dataset表 (数据集表)

**描述**：存储S-100数据集信息，支持数据发布和管理。

**字段说明**：
- `id`: 数据集唯一标识符 (String, Primary Key)
- `name`: 数据集名称 (String, Required)
- `description`: 数据集描述 (String, Optional)
- `productType`: S-100产品类型 (S100Product, Required)
  - `S101`: 电子海图
  - `S102`: 高精度水深
  - `S104`: 动态水位
  - `S111`: 实时海流
  - `S124`: 航行警告
  - `S125`: 航行信息
  - `S131`: 海洋保护区
- `version`: 版本号 (String, Required)
- `status`: 数据集状态 (DatasetStatus, Default: UPLOADED)
  - `UPLOADED`: 已上传
  - `PROCESSING`: 处理中
  - `PUBLISHED`: 已发布
  - `ARCHIVED`: 已归档
  - `ERROR`: 错误
- `fileName`: 原始文件名 (String, Required)
- `filePath`: 文件存储路径 (String, Required)
- `fileSize`: 文件大小(字节) (Int, Required)
- `mimeType`: MIME类型 (String, Required)
- `coverage`: 覆盖范围 (String, Optional, GeoJSON格式)
- `metadata`: 元数据 (String, Optional, JSON格式)
- `publishedAt`: 发布时间 (DateTime, Optional)
- `nodeId`: 所属节点ID (String, Required)
- `createdAt`: 创建时间 (DateTime, Default: now())
- `updatedAt`: 更新时间 (DateTime, Default: updatedAt)

**关系**：
- `node`: 关联的节点 (N:1)
- `services`: 关联的服务 (1:N)

**索引**：
- 主键索引：`id`
- 外键索引：`nodeId`
- 复合索引：`productType`, `status`, `nodeId`

### 4. Capability表 (服务能力表)

**描述**：存储节点支持的服务能力信息。

**字段说明**：
- `id`: 服务能力唯一标识符 (String, Primary Key)
- `nodeId`: 节点ID (String, Required)
- `productType`: S-100产品类型 (S100Product, Required)
- `serviceType`: 服务类型 (ServiceType, Required)
  - `WFS`: Web要素服务
  - `WMS`: Web地图服务
  - `WCS`: Web覆盖服务
- `isEnabled`: 是否启用 (Boolean, Default: true)
- `endpoint`: 服务端点 (String, Optional)
- `version`: 服务版本 (String, Optional)
- `createdAt`: 创建时间 (DateTime, Default: now())
- `updatedAt`: 更新时间 (DateTime, Default: updatedAt)

**关系**：
- `node`: 关联的节点 (N:1)

**索引**：
- 主键索引：`id`
- 唯一索引：`nodeId`, `productType`, `serviceType`
- 外键索引：`nodeId`
- 复合索引：`productType`, `serviceType`, `isEnabled`

### 5. Service表 (服务实例表)

**描述**：存储具体的服务实例信息。

**字段说明**：
- `id`: 服务实例唯一标识符 (String, Primary Key)
- `datasetId`: 数据集ID (String, Required)
- `serviceType`: 服务类型 (ServiceType, Required)
- `endpoint`: 服务端点 (String, Required)
- `configuration`: 配置信息 (String, Optional, JSON格式)
- `isActive`: 是否激活 (Boolean, Default: true)
- `createdAt`: 创建时间 (DateTime, Default: now())
- `updatedAt`: 更新时间 (DateTime, Default: updatedAt)

**关系**：
- `dataset`: 关联的数据集 (N:1)

**索引**：
- 主键索引：`id`
- 外键索引：`datasetId`
- 复合索引：`serviceType`, `isActive`

### 6. RolePermission表 (角色权限表)

**描述**：定义角色默认权限的映射关系。

**字段说明**：
- `id`: 角色权限唯一标识符 (String, Primary Key)
- `role`: 用户角色 (UserRole, Required)
- `permission`: 权限类型 (Permission, Required)
  - 节点管理权限：
    - `NODE_CREATE`: 创建节点
    - `NODE_READ`: 查看节点
    - `NODE_UPDATE`: 更新节点
    - `NODE_DELETE`: 删除节点
  - 数据管理权限：
    - `DATASET_CREATE`: 创建数据集
    - `DATASET_READ`: 查看数据集
    - `DATASET_UPDATE`: 更新数据集
    - `DATASET_DELETE`: 删除数据集
    - `DATASET_PUBLISH`: 发布数据集
  - 服务管理权限：
    - `SERVICE_CREATE`: 创建服务
    - `SERVICE_READ`: 查看服务
    - `SERVICE_UPDATE`: 更新服务
    - `SERVICE_DELETE`: 删除服务
  - 用户管理权限：
    - `USER_CREATE`: 创建用户
    - `USER_READ`: 查看用户
    - `USER_UPDATE`: 更新用户
    - `USER_DELETE`: 删除用户
  - 系统管理权限：
    - `SYSTEM_CONFIG`: 系统配置
    - `SYSTEM_MONITOR`: 系统监控
- `createdAt`: 创建时间 (DateTime, Default: now())

**索引**：
- 主键索引：`id`
- 唯一索引：`role`, `permission`
- 复合索引：`role`

### 7. UserPermission表 (用户权限表)

**描述**：存储用户特定权限，可以覆盖角色权限。

**字段说明**：
- `id`: 用户权限唯一标识符 (String, Primary Key)
- `userId`: 用户ID (String, Required)
- `permission`: 权限类型 (Permission, Required)
- `isGranted`: 是否授予权限 (Boolean, Default: true)
  - `true`: 授予权限
  - `false`: 拒绝权限
- `createdAt`: 创建时间 (DateTime, Default: now())

**关系**：
- `user`: 关联的用户 (N:1)

**索引**：
- 主键索引：`id`
- 唯一索引：`userId`, `permission`
- 外键索引：`userId`
- 复合索引：`userId`, `isGranted`

### 8. UserScenario表 (用户场景表)

**描述**：存储用户场景定义，支持场景化的权限管理。

**字段说明**：
- `id`: 用户场景唯一标识符 (String, Primary Key)
- `name`: 场景名称 (String, Required)
- `description`: 场景描述 (String, Optional)
- `icon`: 图标 (String, Optional)
- `color`: 主题色 (String, Optional)
- `isActive`: 是否激活 (Boolean, Default: true)
- `createdAt`: 创建时间 (DateTime, Default: now())
- `updatedAt`: 更新时间 (DateTime, Default: updatedAt)

**关系**：
- `scenarioRoles`: 关联的场景角色 (1:N)

**索引**：
- 主键索引：`id`
- 复合索引：`isActive`

### 9. ScenarioRole表 (场景角色关联表)

**描述**：存储场景与角色的关联关系。

**字段说明**：
- `id`: 场景角色唯一标识符 (String, Primary Key)
- `scenarioId`: 场景ID (String, Required)
- `role`: 用户角色 (UserRole, Required)
- `permissions`: 权限配置 (String, Required, JSON格式)
- `createdAt`: 创建时间 (DateTime, Default: now())

**关系**：
- `scenario`: 关联的用户场景 (N:1)

**索引**：
- 主键索引：`id`
- 唯一索引：`scenarioId`, `role`
- 外键索引：`scenarioId`
- 复合索引：`role`

### 10. ChildNode表 (子节点关系表)

**描述**：存储节点间的多对多关系，支持复杂的架构。

**字段说明**：
- `id`: 子节点关系唯一标识符 (String, Primary Key)
- `parentId`: 父节点ID (String, Required)
- `childId`: 子节点ID (String, Required)
- `createdAt`: 创建时间 (DateTime, Default: now())

**关系**：
- `parent`: 关联的父节点 (N:1)
- `child`: 关联的子节点 (N:1)

**索引**：
- 主键索引：`id`
- 唯一索引：`parentId`, `childId`
- 外键索引：`parentId`, `childId`

### 11. Post表 (文章表)

**描述**：保持向后兼容的文章表。

**字段说明**：
- `id`: 文章唯一标识符 (String, Primary Key)
- `title`: 文章标题 (String, Required)
- `content`: 文章内容 (String, Optional)
- `published`: 是否发布 (Boolean, Default: false)
- `authorId`: 作者ID (String, Required)
- `createdAt`: 创建时间 (DateTime, Default: now())
- `updatedAt`: 更新时间 (DateTime, Default: updatedAt)

**关系**：
- `author`: 关联的用户 (N:1)

**索引**：
- 主键索引：`id`
- 外键索引：`authorId`
- 复合索引：`published`, `createdAt`

## 数据库设计原则

### 1. 规范化设计
- **第一范式 (1NF)**：所有字段都是原子的，不可再分
- **第二范式 (2NF)**：所有非主键字段都完全依赖于主键
- **第三范式 (3NF)**：所有非主键字段都直接依赖于主键，消除传递依赖

### 2. 性能优化
- **索引策略**：为常用查询字段创建索引
- **外键约束**：确保数据完整性
- **数据类型选择**：选择合适的数据类型减少存储空间
- **分区设计**：大数据量表考虑分区策略

### 3. 扩展性考虑
- **JSON字段**：使用JSON字段存储灵活的配置信息
- **软删除**：使用`isActive`字段实现软删除
- **版本控制**：支持数据版本管理
- **多语言支持**：预留多语言字段扩展

### 4. 安全性设计
- **敏感数据**：敏感信息加密存储
- **访问控制**：基于角色的数据访问控制
- **审计日志**：记录数据变更历史
- **数据备份**：定期数据备份策略

## 数据库操作

### 1. 基本CRUD操作

#### 创建节点
```sql
INSERT INTO nodes (id, name, type, level, description, apiUrl, coverage, isActive, healthStatus, parentId, latitude, longitude)
VALUES (
  'node_shanghai_port', 
  '上海港', 
  'LEAF', 
  3, 
  '上海港务局数据节点', 
  'https://shanghai-port.example.com/api', 
  '{"type":"Polygon","coordinates":[[[121.0,31.0],[121.5,31.0],[121.5,31.5],[121.0,31.5],[121.0,31.0]]]}', 
  true, 
  'HEALTHY', 
  'node_east_china_bureau', 
  31.23, 
  121.47
);
```

#### 查询节点
```sql
-- 查询所有叶子节点
SELECT * FROM nodes WHERE type = 'LEAF' AND isActive = true;

-- 查询指定节点的子节点
SELECT * FROM nodes WHERE parentId = 'node_east_china_bureau';

-- 递归查询节点层级
WITH RECURSIVE node_hierarchy AS (
  SELECT *, 0 as depth FROM nodes WHERE id = 'node_global_root'
  UNION ALL
  SELECT n.*, nh.depth + 1 FROM nodes n
  JOIN node_hierarchy nh ON n.parentId = nh.id
)
SELECT * FROM node_hierarchy ORDER BY depth;
```

#### 更新节点
```sql
UPDATE nodes 
SET healthStatus = 'WARNING', 
    lastHealthCheck = datetime('now'),
    updatedAt = datetime('now')
WHERE id = 'node_shanghai_port';
```

#### 删除节点
```sql
-- 软删除
UPDATE nodes 
SET isActive = false, 
    updatedAt = datetime('now')
WHERE id = 'node_shanghai_port';

-- 硬删除（谨慎使用）
DELETE FROM nodes WHERE id = 'node_shanghai_port';
```

### 2. 复杂查询

#### 权限查询
```sql
-- 查询用户的所有权限
SELECT DISTINCT rp.permission
FROM users u
JOIN role_permissions rp ON u.role = rp.role
LEFT JOIN user_permissions up ON u.id = up.userId AND up.isGranted = true
WHERE u.id = 'user_123'
AND rp.permission NOT IN (
  SELECT permission FROM user_permissions 
  WHERE userId = 'user_123' AND isGranted = false
)
UNION
SELECT permission FROM user_permissions 
WHERE userId = 'user_123' AND isGranted = true;
```

#### 服务能力查询
```sql
-- 查询指定区域的服务能力
SELECT n.name as node_name, n.type as node_type, c.productType, c.serviceType, c.isEnabled
FROM nodes n
JOIN capabilities c ON n.id = c.nodeId
WHERE n.isActive = true 
AND c.isEnabled = true
AND n.coverage IS NOT NULL
AND json_extract(n.coverage, '$.type') = 'Polygon'
-- 这里可以添加空间查询条件
ORDER BY n.level, n.name;
```

#### 数据集统计
```sql
-- 按节点统计数据集
SELECT n.name as node_name, n.type as node_type,
       COUNT(d.id) as total_datasets,
       SUM(CASE WHEN d.status = 'PUBLISHED' THEN 1 ELSE 0 END) as published_datasets,
       SUM(CASE WHEN d.status = 'PROCESSING' THEN 1 ELSE 0 END) as processing_datasets
FROM nodes n
LEFT JOIN datasets d ON n.id = d.nodeId
WHERE n.isActive = true
GROUP BY n.id, n.name, n.type
ORDER BY n.level, n.name;
```

### 3. 性能优化查询

#### 分页查询
```sql
-- 用户分页查询
SELECT id, email, username, name, role, isActive, createdAt
FROM users
WHERE isActive = true
ORDER BY createdAt DESC
LIMIT 10 OFFSET 0;
```

#### 索引优化查询
```sql
-- 使用索引的查询
EXPLAIN QUERY PLAN
SELECT * FROM nodes WHERE type = 'LEAF' AND isActive = true;
```

#### 聚合查询
```sql
-- 系统统计信息
SELECT 
  (SELECT COUNT(*) FROM users WHERE isActive = true) as active_users,
  (SELECT COUNT(*) FROM nodes WHERE isActive = true) as active_nodes,
  (SELECT COUNT(*) FROM datasets WHERE status = 'PUBLISHED') as published_datasets,
  (SELECT COUNT(*) FROM capabilities WHERE isEnabled = true) as active_capabilities;
```

## 数据库维护

### 1. 备份策略
- **全量备份**：每天凌晨2点进行全量备份
- **增量备份**：每小时进行增量备份
- **异地备份**：每周将备份数据同步到异地存储

### 2. 性能监控
- **查询性能**：监控慢查询日志
- **索引效率**：监控索引使用情况
- **存储空间**：监控数据库文件大小
- **连接数**：监控数据库连接数

### 3. 数据清理
- **过期数据**：定期清理过期数据
- **日志数据**：定期归档历史日志
- **临时数据**：清理临时文件和数据
- **碎片整理**：定期进行数据库碎片整理

---

*该数据库设计支持复杂的海事服务架构，具有良好的扩展性和性能特性。*