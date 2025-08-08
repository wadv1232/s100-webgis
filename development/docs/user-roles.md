# 用户角色与权限体系

## 用户场景与角色定义

S-100海事服务平台基于实际海事业务场景，设计了完整的用户角色体系和权限管理机制。系统支持5种核心用户场景，每种场景对应特定的角色和权限配置。

### 用户场景分类

#### 1. 终端用户 (End User)
**代表人物**：伊娃船长 (Captain Eva)
**场景描述**：全球航行的导航员，只关心从统一入口获取数据
**核心需求**：
- 无缝全球漫游，自动切换数据源
- 多源数据融合显示
- 服务能力探索和查询
- 简单易用的操作界面

#### 2. 本地数据提供者 (Local Data Provider)
**代表人物**：李工 (Li Wei)
**场景描述**：上海港务局的数据管理员，负责上海港范围内的S-100数据
**核心需求**：
- 本地数据发布和管理
- 新服务试点和部署
- 紧急数据更新
- 向上级节点广播服务能力

#### 3. 区域节点管理员 (Regional Node Administrator)
**代表人物**：王处长 (Director Wang)
**场景描述**：中国海事局东海分局的管理者，负责协调管理华东沿海所有港口的数据服务
**核心需求**：
- 区域服务协调和监控
- 新节点接入管理
- 聚合能力查询
- 健康状态监控

#### 4. 国家级节点管理员 (National Node Administrator)
**代表人物**：张总工 (Chief Engineer Zhang)
**场景描述**：中国海事局总部的技术负责人，负责整个中国海区的S-100服务网络
**核心需求**：
- 国家级服务治理
- 区域节点管理
- 国际数据交换
- 全国服务能力聚合

#### 5. 全球根节点管理员 (Global Root Administrator)
**代表人物**：史密斯博士 (Dr. David Smith)
**场景描述**：IHO的协调员，负责维护全球S-100服务网络的成员国关系
**核心需求**：
- 全球网络监控
- 成员国关系管理
- 国际标准制定
- 全球服务协调

## 系统角色定义

### 1. 系统管理员 (ADMIN)
**权限级别**：最高权限
**适用场景**：系统维护和全局配置
**主要职责**：
- 系统全局配置
- 用户和权限管理
- 节点层级管理
- 系统监控和维护

**权限范围**：
- 所有节点管理权限
- 所有数据管理权限
- 所有服务管理权限
- 所有用户管理权限
- 系统配置权限

### 2. 节点管理员 (NODE_ADMIN)
**权限级别**：高权限
**适用场景**：节点管理和协调
**主要职责**：
- 节点配置和管理
- 子节点注册和监控
- 用户权限分配
- 服务能力管理

**权限范围**：
- 节点创建、查看、更新、删除
- 用户创建、查看、更新
- 数据集查看、发布
- 服务查看、管理
- 系统监控

### 3. 数据管理员 (DATA_MANAGER)
**权限级别**：中权限
**适用场景**：数据管理和发布
**主要职责**：
- 数据集管理
- 数据发布和更新
- 数据质量控制
- 元数据维护

**权限范围**：
- 数据集创建、查看、更新、删除、发布
- 服务查看
- 系统监控
- 有限的用户管理

### 4. 服务管理员 (SERVICE_MANAGER)
**权限级别**：中权限
**适用场景**：服务配置和管理
**主要职责**：
- 服务能力配置
- 服务监控
- 服务发布
- 性能优化

**权限范围**：
- 服务创建、查看、更新、删除
- 数据集查看
- 系统监控
- 节点查看

### 5. 普通用户 (USER)
**权限级别**：基础权限
**适用场景**：数据访问和使用
**主要职责**：
- 数据查询和使用
- 基本系统操作
- 个人信息管理

**权限范围**：
- 数据集查看
- 服务使用
- 个人信息管理

### 6. 游客 (GUEST)
**权限级别**：有限权限
**适用场景**：公开数据访问
**主要职责**：
- 查看公开数据
- 基本系统浏览

**权限范围**：
- 公开数据集查看
- 公开服务使用
- 无个人信息管理

## 权限体系设计

### 权限分类

#### 1. 节点管理权限
- **NODE_CREATE**：创建节点
- **NODE_READ**：查看节点
- **NODE_UPDATE**：更新节点
- **NODE_DELETE**：删除节点

#### 2. 数据管理权限
- **DATASET_CREATE**：创建数据集
- **DATASET_READ**：查看数据集
- **DATASET_UPDATE**：更新数据集
- **DATASET_DELETE**：删除数据集
- **DATASET_PUBLISH**：发布数据集

#### 3. 服务管理权限
- **SERVICE_CREATE**：创建服务
- **SERVICE_READ**：查看服务
- **SERVICE_UPDATE**：更新服务
- **SERVICE_DELETE**：删除服务

#### 4. 用户管理权限
- **USER_CREATE**：创建用户
- **USER_READ**：查看用户
- **USER_UPDATE**：更新用户
- **USER_DELETE**：删除用户

#### 5. 系统管理权限
- **SYSTEM_CONFIG**：系统配置
- **SYSTEM_MONITOR**：系统监控

### 角色权限映射

| 角色 | 节点管理 | 数据管理 | 服务管理 | 用户管理 | 系统管理 |
|------|----------|----------|----------|----------|----------|
| ADMIN | 全部权限 | 全部权限 | 全部权限 | 全部权限 | 全部权限 |
| NODE_ADMIN | CRU | R | CRU | CRU | M |
| DATA_MANAGER | R | CRUDP | R | - | M |
| SERVICE_MANAGER | R | R | CRUD | - | M |
| USER | R | R | R | - | - |
| GUEST | R(公开) | R(公开) | R(公开) | - | - |

*注：C=创建, R=读取, U=更新, D=删除, P=发布, M=监控*

### 场景角色关联

#### 1. 终端用户场景
**主要角色**：USER, GUEST
**权限特点**：
- 以数据访问为主
- 有限的系统操作权限
- 基于地理位置的动态权限

#### 2. 本地数据提供者场景
**主要角色**：DATA_MANAGER, SERVICE_MANAGER
**权限特点**：
- 本地数据完全管理权限
- 有限的全局查看权限
- 服务配置和发布权限

#### 3. 区域节点管理员场景
**主要角色**：NODE_ADMIN
**权限特点**：
- 区域内节点管理权限
- 区域用户管理权限
- 区域服务监控权限

#### 4. 国家级节点管理员场景
**主要角色**：NODE_ADMIN
**权限特点**：
- 国家级节点管理权限
- 国际数据交换权限
- 全国服务协调权限

#### 5. 全球根节点管理员场景
**主要角色**：ADMIN
**权限特点**：
- 全局系统管理权限
- 国际标准制定权限
- 全球服务协调权限

## 权限控制机制

### 1. 基于角色的访问控制 (RBAC)

```typescript
// 角色权限检查示例
interface RolePermission {
  role: UserRole;
  permissions: Permission[];
}

// 检查用户是否有特定权限
function hasPermission(user: User, permission: Permission): boolean {
  // 检查角色权限
  const rolePermissions = getRolePermissions(user.role);
  if (rolePermissions.includes(permission)) {
    return true;
  }
  
  // 检查用户特定权限
  const userPermissions = getUserPermissions(user.id);
  return userPermissions.some(up => 
    up.permission === permission && up.isGranted
  );
}
```

### 2. 基于属性的访问控制 (ABAC)

```typescript
// 属性权限检查示例
interface AttributePermission {
  permission: Permission;
  conditions: {
    nodeType?: NodeType;
    nodeLevel?: number;
    datasetStatus?: DatasetStatus;
    [key: string]: any;
  };
}

// 基于属性的权限检查
function checkAttributePermission(
  user: User, 
  permission: Permission, 
  resource: any
): boolean {
  const attributePermission = getAttributePermission(user.role, permission);
  
  return Object.entries(attributePermission.conditions).every(
    ([key, value]) => resource[key] === value
  );
}
```

### 3. 层级权限继承

```typescript
// 层级权限继承示例
function getInheritedPermissions(user: User): Permission[] {
  const permissions = new Set<Permission>();
  
  // 获取用户直接权限
  const directPermissions = getUserPermissions(user.id);
  directPermissions.forEach(up => {
    if (up.isGranted) {
      permissions.add(up.permission);
    }
  });
  
  // 获取角色权限
  const rolePermissions = getRolePermissions(user.role);
  rolePermissions.forEach(permission => {
    permissions.add(permission);
  });
  
  // 获取节点层级继承权限
  if (user.nodeId) {
    const nodePermissions = getNodeInheritedPermissions(user.nodeId);
    nodePermissions.forEach(permission => {
      permissions.add(permission);
    });
  }
  
  return Array.from(permissions);
}
```

### 4. 动态权限计算

```typescript
// 动态权限计算示例
function calculateDynamicPermissions(user: User): Permission[] {
  const basePermissions = getInheritedPermissions(user);
  const dynamicPermissions: Permission[] = [];
  
  // 基于用户位置的动态权限
  if (user.location) {
    const locationPermissions = getLocationBasedPermissions(user.location);
    dynamicPermissions.push(...locationPermissions);
  }
  
  // 基于时间的动态权限
  const now = new Date();
  if (isBusinessHours(now)) {
    dynamicPermissions.push(Permission.SYSTEM_MONITOR);
  }
  
  // 基于系统状态的动态权限
  if (isSystemMaintenance()) {
    dynamicPermissions = dynamicPermissions.filter(
      p => !requiresSystemAvailability(p)
    );
  }
  
  return [...basePermissions, ...dynamicPermissions];
}
```

## 权限管理界面

### 1. 用户权限管理

**功能特性**：
- 用户创建和编辑
- 角色分配
- 权限细粒度控制
- 权限继承关系查看
- 权限变更历史记录

**界面组件**：
- 用户列表和搜索
- 权限矩阵显示
- 角色选择器
- 权限复选框组
- 权限预览和确认

### 2. 角色权限管理

**功能特性**：
- 角色定义和配置
- 权限模板管理
- 权限继承规则设置
- 角色权限批量更新
- 权限冲突检测

**界面组件**：
- 角色列表和详情
- 权限矩阵编辑器
- 继承关系图
- 权限模板选择器
- 冲突警告提示

### 3. 场景权限管理

**功能特性**：
- 用户场景定义
- 场景角色关联
- 场景权限模板
- 动态权限规则
- 场景切换控制

**界面组件**：
- 场景列表和配置
- 角色关联矩阵
- 权限规则编辑器
- 场景预览
- 切换控制面板

## 安全考虑

### 1. 权限验证

- **服务端验证**：所有API请求必须进行权限验证
- **客户端验证**：UI界面基于权限动态显示
- **缓存验证**：权限变更时清除相关缓存
- **会话验证**：定期验证用户会话有效性

### 2. 权限审计

- **操作日志**：记录所有权限相关操作
- **访问日志**：记录用户访问和权限使用
- **变更日志**：记录权限变更历史
- **审计报告**：定期生成权限审计报告

### 3. 权限安全

- **最小权限原则**：用户只获得必要的权限
- **权限分离**：敏感操作需要多权限验证
- **权限过期**：临时权限自动过期
- **权限回收**：用户角色变更时权限自动回收

---

*该权限体系确保了系统的安全性和灵活性，支持复杂的海事业务场景和多层级的权限管理需求。*