---
title: 系统架构
description: S100海事服务系统整体架构设计
author: 开发团队
date: 2024-01-01
version: 1.0.0
category: 架构文档
tags: [架构, 设计, 系统]
---

# 系统架构

## 概述

S100海事服务系统采用现代化的前后端分离架构，基于Next.js 15框架构建，提供完整的海事数据服务解决方案。系统设计遵循高内聚、低耦合的原则，支持微服务部署和水平扩展。

## 整体架构

### 架构层次图
```
┌─────────────────────────────────────────────────────────────┐
│                        前端展示层                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Web端     │  │   移动端    │  │   管理后台   │           │
│  │  (Next.js)  │  │  (React)   │  │  (Next.js)  │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                        API网关层                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   路由管理   │  │   认证授权   │  │   限流控制   │           │
│  │ (Next.js)   │  │ (NextAuth) │  │ (自定义)     │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                        业务逻辑层                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  用户服务   │  │  节点服务   │  │  服务管理   │           │
│  │ (Service)   │  │ (Service)   │  │ (Service)   │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  地图服务   │  │  数据服务   │  │  监控服务   │           │
│  │ (Service)   │  │ (Service)   │  │ (Service)   │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                        数据访问层                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   ORM层     │  │   缓存层    │  │   消息队列   │           │
│  │  (Prisma)   │  │  (Redis)    │  │  (Socket)   │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                        数据存储层                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  关系数据库  │  │  文件存储   │  │  时序数据库  │           │
│  │ (PostgreSQL)│  │   (S3)      │  │ (InfluxDB)  │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈选择

#### 前端技术栈
- **框架**: Next.js 15 (App Router)
  - 服务端渲染(SSR)支持
  - 静态站点生成(SSG)
  - API路由集成
  - 图片优化
- **语言**: TypeScript 5
  - 静态类型检查
  - 更好的IDE支持
  - 代码重构友好
- **样式**: Tailwind CSS 4
  - 实用优先的CSS框架
  - 响应式设计
  - 自定义主题支持
- **组件库**: shadcn/ui + Radix UI
  - 无障碍访问
  - 可定制性
  - 现代化设计
- **状态管理**: Zustand
  - 轻量级状态管理
  - TypeScript支持
  - 中间件支持
- **地图**: Leaflet + React-Leaflet
  - 开源地图库
  - 丰富的插件生态
  - 良好的性能

#### 后端技术栈
- **API框架**: Next.js API Routes
  - 与前端统一框架
  - 服务端函数
  - 中间件支持
- **数据库**: Prisma ORM
  - 类型安全的数据库访问
  - 自动迁移
  - 数据可视化
- **认证**: NextAuth.js
  - 多种认证方式
  - 会话管理
  - 安全性
- **实时通信**: Socket.io
  - WebSocket支持
  - 房间管理
  - 事件系统

#### 基础设施
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **缓存**: 内存缓存 (开发) / Redis (生产)
- **文件存储**: 本地存储 (开发) / S3 (生产)
- **监控**: 自定义监控 + 日志系统

## 核心模块架构

### 1. 用户管理模块

#### 模块职责
- 用户注册和登录
- 用户信息管理
- 角色权限管理
- 用户行为审计

#### 技术实现
```typescript
// 用户服务架构
interface UserService {
  // 用户认证
  authenticate(email: string, password: string): Promise<User>;
  register(userData: RegisterData): Promise<User>;
  refreshToken(token: string): Promise<string>;
  
  // 用户管理
  getUserById(id: string): Promise<User>;
  updateUser(id: string, data: UpdateUserData): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // 权限管理
  hasPermission(userId: string, permission: string): Promise<boolean>;
  getUserRoles(userId: string): Promise<Role[]>;
  
  // 审计日志
  logUserAction(userId: string, action: string, metadata?: any): Promise<void>;
}
```

#### 数据流
```
用户请求 → API路由 → 认证中间件 → 用户服务 → 数据库 → 响应返回
```

### 2. 节点管理模块

#### 模块职责
- 节点注册和发现
- 节点健康监控
- 节点能力管理
- 节点覆盖范围

#### 技术实现
```typescript
// 节点服务架构
interface NodeService {
  // 节点管理
  registerNode(nodeData: NodeData): Promise<Node>;
  updateNode(id: string, data: UpdateNodeData): Promise<Node>;
  deleteNode(id: string): Promise<void>;
  
  // 健康监控
  checkNodeHealth(id: string): Promise<HealthStatus>;
  getNodeMetrics(id: string): Promise<NodeMetrics>;
  
  // 能力管理
  updateNodeCapabilities(id: string, capabilities: Capability[]): Promise<void>;
  getNodeCapabilities(id: string): Promise<Capability[]>;
  
  // 覆盖范围
  updateNodeCoverage(id: string, coverage: GeoJSON): Promise<void>;
  getNodeCoverage(id: string): Promise<GeoJSON>;
}
```

#### 实时通信
```typescript
// WebSocket事件
interface NodeEvents {
  'node:registered': (node: Node) => void;
  'node:health-changed': (nodeId: string, status: HealthStatus) => void;
  'node:metrics-updated': (nodeId: string, metrics: NodeMetrics) => void;
  'node:coverage-updated': (nodeId: string, coverage: GeoJSON) => void;
}
```

### 3. 服务管理模块

#### 模块职责
- 服务注册和发现
- 服务状态监控
- 服务配置管理
- 服务发布和下线

#### 技术实现
```typescript
// 服务管理架构
interface ServiceManagementService {
  // 服务注册
  registerService(service: ServiceRegistration): Promise<Service>;
  updateService(id: string, data: UpdateServiceData): Promise<Service>;
  deleteService(id: string): Promise<void>;
  
  // 服务发现
  discoverServices(filter: ServiceFilter): Promise<Service[]>;
  getServiceById(id: string): Promise<Service>;
  
  // 状态管理
  updateServiceStatus(id: string, status: ServiceStatus): Promise<void>;
  getServiceMetrics(id: string): Promise<ServiceMetrics>;
  
  // 配置管理
  updateServiceConfig(id: string, config: ServiceConfig): Promise<void>;
  getServiceConfig(id: string): Promise<ServiceConfig>;
}
```

#### 服务类型支持
```typescript
// 支持的服务类型
enum ServiceType {
  WMS = 'wms',        // Web地图服务
  WFS = 'wfs',        // Web要素服务
  WCS = 'wcs',        // Web覆盖服务
  SOS = 'sos',        // 观测服务
  WPS = 'wps',        // Web处理服务
  CSW = 'csw',        // 目录服务
}
```

### 4. 地图服务模块

#### 模块职责
- 地图数据渲染
- 地图图层管理
- 地理数据编辑
- 地图交互控制

#### 技术实现
```typescript
// 地图服务架构
interface MapService {
  // 地图渲染
  initializeMap(container: HTMLElement, options: MapOptions): Promise<Map>;
  addLayer(map: Map, layer: Layer): Promise<void>;
  removeLayer(map: Map, layerId: string): Promise<void>;
  
  // 数据管理
  loadGeoData(url: string): Promise<GeoJSON>;
  saveGeoData(data: GeoJSON): Promise<string>;
  
  // 编辑功能
  enableEditing(map: Map): Promise<void>;
  disableEditing(map: Map): Promise<void>;
  saveEdits(map: Map): Promise<GeoJSON>;
  
  // 交互控制
  setView(map: Map, center: LatLng, zoom: number): Promise<void>;
  fitBounds(map: Map, bounds: LatLngBounds): Promise<void>;
}
```

#### 地图组件架构
```
MapContainer (地图容器)
├── MapControls (地图控件)
│   ├── ZoomControl (缩放控件)
│   ├── LayerControl (图层控件)
│   └── EditControl (编辑控件)
├── MapLayers (地图图层)
│   ├── BaseLayer (底图图层)
│   ├── OverlayLayer (覆盖图层)
│   └── VectorLayer (矢量图层)
└── MapInteractions (地图交互)
    ├── ClickHandler (点击处理)
    ├── DragHandler (拖拽处理)
    └── EditHandler (编辑处理)
```

## 数据库架构

### 数据库设计原则
- **规范化**: 遵循数据库规范化原则
- **性能**: 优化查询性能和索引设计
- **扩展性**: 支持水平扩展和分片
- **安全性**: 数据加密和访问控制

### 核心表结构

#### 用户相关表
```sql
-- 用户表
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户角色关联表
CREATE TABLE user_roles (
  user_id VARCHAR(36) REFERENCES users(id),
  role_id VARCHAR(36) REFERENCES roles(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by VARCHAR(36) REFERENCES users(id),
  PRIMARY KEY (user_id, role_id)
);
```

#### 节点相关表
```sql
-- 节点表
CREATE TABLE nodes (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  location GEOGRAPHY(POINT),
  coverage GEOGRAPHY(POLYGON),
  config JSON,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 节点能力表
CREATE TABLE node_capabilities (
  id VARCHAR(36) PRIMARY KEY,
  node_id VARCHAR(36) REFERENCES nodes(id),
  service_type VARCHAR(50) NOT NULL,
  capability JSON NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 节点健康状态表
CREATE TABLE node_health (
  id VARCHAR(36) PRIMARY KEY,
  node_id VARCHAR(36) REFERENCES nodes(id),
  status VARCHAR(50) NOT NULL,
  metrics JSON,
  last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 服务相关表
```sql
-- 服务表
CREATE TABLE services (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  version VARCHAR(50),
  endpoint_url VARCHAR(500) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  config JSON,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 服务节点关联表
CREATE TABLE service_nodes (
  service_id VARCHAR(36) REFERENCES services(id),
  node_id VARCHAR(36) REFERENCES nodes(id),
  is_primary BOOLEAN DEFAULT false,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (service_id, node_id)
);
```

### 索引设计
```sql
-- 用户表索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 节点表索引
CREATE INDEX idx_nodes_status ON nodes(status);
CREATE INDEX idx_nodes_type ON nodes(type);
CREATE INDEX idx_nodes_location ON nodes USING GIST(location);
CREATE INDEX idx_nodes_coverage ON nodes USING GIST(coverage);

-- 服务表索引
CREATE INDEX idx_services_type ON services(type);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_endpoint ON services(endpoint_url);

-- 健康状态表索引
CREATE INDEX idx_node_health_node_id ON node_health(node_id);
CREATE INDEX idx_node_health_status ON node_health(status);
CREATE INDEX idx_node_health_last_check ON node_health(last_check);
```

## 安全架构

### 认证架构
```
客户端 → 认证中间件 → 身份验证 → 权限检查 → 业务逻辑
```

#### 认证流程
1. **用户登录**: 提供用户名和密码
2. **身份验证**: 验证用户凭据
3. **令牌生成**: 生成JWT访问令牌
4. **权限检查**: 验证用户权限
5. **访问控制**: 控制资源访问

#### 安全措施
- **密码加密**: 使用bcrypt加密存储密码
- **JWT令牌**: 使用JWT进行无状态认证
- **HTTPS**: 强制使用HTTPS协议
- **CORS**: 配置跨域资源共享
- **CSRF**: 防止跨站请求伪造

### 数据安全
- **输入验证**: 严格验证所有输入数据
- **SQL注入防护**: 使用参数化查询
- **XSS防护**: 转义输出内容
- **敏感数据**: 加密存储敏感信息

## 性能架构

### 缓存策略
```
浏览器缓存 → CDN缓存 → 应用缓存 → 数据库缓存
```

#### 缓存层次
1. **浏览器缓存**: 静态资源缓存
2. **CDN缓存**: 全球内容分发
3. **应用缓存**: Redis缓存热点数据
4. **数据库缓存**: 查询结果缓存

#### 性能优化
- **代码分割**: 懒加载和代码分割
- **图片优化**: 图片压缩和格式优化
- **数据库优化**: 索引优化和查询优化
- **并发处理**: 异步处理和并发控制

## 部署架构

### 开发环境
```
本地开发机 → 开发数据库 → 本地缓存
```

### 测试环境
```
测试服务器 → 测试数据库 → 测试缓存
```

### 生产环境
```
负载均衡 → 应用服务器集群 → 数据库集群 → 缓存集群
```

#### 容器化部署
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/db
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7
    ports:
      - "6379:6379"
```

## 监控架构

### 监控指标
- **应用指标**: 响应时间、错误率、并发数
- **系统指标**: CPU、内存、磁盘、网络
- **业务指标**: 用户活跃度、功能使用率

### 日志系统
```
应用日志 → 日志收集 → 日志存储 → 日志分析
```

#### 日志级别
- **ERROR**: 错误日志
- **WARN**: 警告日志
- **INFO**: 信息日志
- **DEBUG**: 调试日志

### 告警机制
- **实时告警**: 关键指标异常告警
- **邮件通知**: 重要事件邮件通知
- **短信通知**: 紧急情况短信通知

## 扩展性设计

### 水平扩展
- **应用层**: 支持多实例部署
- **数据库层**: 支持读写分离和分片
- **缓存层**: 支持集群部署

### 微服务架构
```
API网关 → 用户服务 → 节点服务 → 服务管理 → 地图服务
```

#### 服务拆分原则
- **业务边界**: 按业务功能拆分
- **数据边界**: 按数据访问拆分
- **团队边界**: 按团队职责拆分

## 总结

S100海事服务系统采用现代化的架构设计，具有以下特点：

- **高可用性**: 多层冗余和故障转移
- **高性能**: 缓存策略和优化设计
- **高扩展性**: 水平扩展和微服务支持
- **高安全性**: 多层安全防护机制
- **易维护性**: 模块化设计和标准化

系统架构设计充分考虑了海事数据服务的特殊需求，支持大规模数据处理和实时服务提供，为海事行业提供完整的数据服务解决方案。

---

*最后更新: 2024-01-01*