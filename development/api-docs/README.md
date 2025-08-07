# API文档

## 概述

S-100海事服务平台提供RESTful API接口，支持海事数据的查询、管理和服务调用。所有API遵循统一的设计规范，确保接口的一致性和易用性。

## API设计原则

### 1. RESTful设计
- 使用HTTP动词表示操作类型
- 资源使用名词复数形式
- 支持内容协商和版本控制
- 统一的响应格式

### 2. 统一响应格式
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req_123456789"
}
```

### 3. 错误处理
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "请求的资源不存在",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req_123456789"
}
```

## 认证授权

### 1. JWT认证
所有受保护的API都需要在请求头中包含JWT令牌：

```http
Authorization: Bearer <jwt-token>
```

### 2. API密钥认证
部分API支持API密钥认证：

```http
X-API-Key: <api-key>
```

### 3. 权限检查
系统会根据用户角色和权限进行访问控制，无权限的请求会返回403错误。

## API版本控制

### 1. 版本URL
所有API都包含版本号：

```
/api/v1/{resource}
```

### 2. 版本兼容性
- v1：当前稳定版本
- v2：测试版本（可选）
- 废弃版本会提前通知

## API端点分类

### 1. 用户管理API
管理用户账户、权限和认证。

#### 用户认证
```http
POST /api/v1/auth/login
```

**请求体**：
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "用户名称",
      "role": "USER"
    },
    "token": "jwt_token_here",
    "expiresIn": 3600
  }
}
```

#### 用户列表
```http
GET /api/v1/users
```

**查询参数**：
- `page`: 页码（默认1）
- `limit`: 每页数量（默认10）
- `role`: 角色筛选
- `isActive`: 是否激活
- `search`: 搜索关键词

**响应**：
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "email": "user@example.com",
        "name": "用户名称",
        "role": "USER",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### 用户详情
```http
GET /api/v1/users/{id}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "用户名称",
    "role": "USER",
    "isActive": true,
    "nodeId": "node_123",
    "permissions": ["DATASET_READ", "SERVICE_READ"],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 创建用户
```http
POST /api/v1/users
```

**请求体**：
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "name": "新用户",
  "role": "USER",
  "nodeId": "node_123"
}
```

#### 更新用户
```http
PUT /api/v1/users/{id}
```

**请求体**：
```json
{
  "name": "更新后的名称",
  "role": "DATA_MANAGER",
  "isActive": true
}
```

#### 删除用户
```http
DELETE /api/v1/users/{id}
```

#### 用户元数据
```http
GET /api/v1/users/meta
```

**响应**：
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "value": "ADMIN",
        "label": "系统管理员",
        "description": "系统完全管理权限"
      }
    ],
    "permissions": [
      {
        "value": "NODE_CREATE",
        "label": "创建节点",
        "category": "节点管理"
      }
    ],
    "scenarios": [
      {
        "id": "scenario_1",
        "name": "终端用户",
        "description": "全球航行的导航员",
        "roles": ["USER"]
      }
    ]
  }
}
```

### 2. 节点管理API
管理节点的注册、配置和监控。

#### 节点列表
```http
GET /api/v1/nodes
```

**查询参数**：
- `type`: 节点类型筛选
- `level`: 节点层级筛选
- `parentId`: 父节点ID
- `isActive`: 是否激活

**响应**：
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "node_123",
        "name": "上海港",
        "type": "LEAF",
        "level": 3,
        "description": "上海港务局数据节点",
        "apiUrl": "https://shanghai-port.example.com/api",
        "coverage": {
          "type": "Polygon",
          "coordinates": [[[...]]]
        },
        "isActive": true,
        "healthStatus": "HEALTHY",
        "lastHealthCheck": "2024-01-01T00:00:00Z",
        "parentId": "node_456",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 节点详情
```http
GET /api/v1/nodes/{id}
```

#### 创建节点
```http
POST /api/v1/nodes
```

**请求体**：
```json
{
  "name": "新节点",
  "type": "LEAF",
  "level": 3,
  "description": "节点描述",
  "apiUrl": "https://new-node.example.com/api",
  "coverage": {
    "type": "Polygon",
    "coordinates": [[[...]]]
  },
  "parentId": "node_456"
}
```

#### 更新节点
```http
PUT /api/v1/nodes/{id}
```

#### 删除节点
```http
DELETE /api/v1/nodes/{id}
```

#### 节点健康状态
```http
GET /api/v1/nodes/{id}/health
```

**响应**：
```json
{
  "success": true,
  "data": {
    "nodeId": "node_123",
    "status": "HEALTHY",
    "lastCheck": "2024-01-01T00:00:00Z",
    "metrics": {
      "responseTime": 150,
      "uptime": 99.9,
      "services": {
        "total": 5,
        "healthy": 5,
        "unhealthy": 0
      }
    }
  }
}
```

#### 节点服务能力
```http
GET /api/v1/nodes/{id}/capabilities
```

**响应**：
```json
{
  "success": true,
  "data": {
    "nodeId": "node_123",
    "capabilities": [
      {
        "productType": "S101",
        "serviceType": "WMS",
        "isEnabled": true,
        "endpoint": "/api/v1/s101/wms",
        "version": "1.0.0"
      }
    ]
  }
}
```

### 3. 数据集管理API
管理S-100数据集的上传、处理和发布。

#### 数据集列表
```http
GET /api/v1/datasets
```

**查询参数**：
- `productType`: 产品类型筛选
- `status`: 状态筛选
- `nodeId`: 节点ID筛选
- `page`: 页码
- `limit`: 每页数量

**响应**：
```json
{
  "success": true,
  "data": {
    "datasets": [
      {
        "id": "dataset_123",
        "name": "上海港电子海图",
        "description": "上海港S-101电子海图数据",
        "productType": "S101",
        "version": "1.0.0",
        "status": "PUBLISHED",
        "fileName": "shanghai-port-s101.zip",
        "fileSize": 1024000,
        "mimeType": "application/zip",
        "coverage": {
          "type": "Polygon",
          "coordinates": [[[...]]]
        },
        "publishedAt": "2024-01-01T00:00:00Z",
        "nodeId": "node_123",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 数据集详情
```http
GET /api/v1/datasets/{id}
```

#### 上传数据集
```http
POST /api/v1/datasets
```

**请求体**（multipart/form-data）：
```
file: 数据文件
name: 数据集名称
description: 数据集描述
productType: S101
coverage: GeoJSON格式的覆盖范围
```

#### 更新数据集
```http
PUT /api/v1/datasets/{id}
```

#### 删除数据集
```http
DELETE /api/v1/datasets/{id}
```

#### 发布数据集
```http
POST /api/v1/datasets/{id}/publish
```

**响应**：
```json
{
  "success": true,
  "data": {
    "datasetId": "dataset_123",
    "status": "PUBLISHED",
    "publishedAt": "2024-01-01T00:00:00Z",
    "services": [
      {
        "serviceType": "WMS",
        "endpoint": "/api/v1/s101/wms",
        "isActive": true
      }
    ]
  }
}
```

### 4. 服务能力API
查询和管理系统的服务能力。

#### 系统服务能力
```http
GET /api/v1/capabilities
```

**查询参数**：
- `bbox`: 地理范围筛选
- `productType`: 产品类型筛选
- `serviceType`: 服务类型筛选

**响应**：
```json
{
  "success": true,
  "data": {
    "capabilities": [
      {
        "nodeId": "node_123",
        "nodeName": "上海港",
        "productType": "S101",
        "serviceType": "WMS",
        "isEnabled": true,
        "endpoint": "/api/v1/s101/wms",
        "version": "1.0.0",
        "coverage": {
          "type": "Polygon",
          "coordinates": [[[...]]]
        }
      }
    ]
  }
}
```

### 5. S-100服务API
提供标准的S-100数据服务接口。

#### S-101 WMS服务
```http
GET /api/v1/s101/wms
```

**查询参数**：
- `service`: WMS
- `version`: 1.1.1
- `request`: GetMap
- `layers`: layer_name
- `styles`: style_name
- `srs`: EPSG:4326
- `bbox`: xmin,ymin,xmax,ymax
- `width`: 图像宽度
- `height`: 图像高度
- `format`: image/png

#### S-101 WFS服务
```http
GET /api/v1/s101/wfs
```

**查询参数**：
- `service`: WFS
- `version`: 1.0.0
- `request`: GetFeature
- `typeName`: feature_type
- `bbox`: xmin,ymin,xmax,ymax
- `outputFormat`: application/json

#### S-102 WMS服务
```http
GET /api/v1/s102/wms
```

#### S-102 WCS服务
```http
GET /api/v1/s102/wcs
```

#### S-111 WFS服务
```http
GET /api/v1/s111/wfs
```

#### S-104 WMS服务
```http
GET /api/v1/s104/wms
```

### 6. 监控API
提供系统监控和健康检查接口。

#### 系统健康状态
```http
GET /api/v1/health
```

**响应**：
```json
{
  "success": true,
  "data": {
    "status": "HEALTHY",
    "timestamp": "2024-01-01T00:00:00Z",
    "components": {
      "database": "HEALTHY",
      "cache": "HEALTHY",
      "storage": "HEALTHY"
    },
    "metrics": {
      "uptime": 86400,
      "memory": {
        "used": 512,
        "total": 1024,
        "percentage": 50
      },
      "cpu": {
        "usage": 25.5
      }
    }
  }
}
```

#### 系统监控数据
```http
GET /api/v1/monitoring
```

**查询参数**：
- `metric`: 指标类型（cpu, memory, disk, network）
- `period`: 时间段（1h, 24h, 7d, 30d）
- `interval`: 采样间隔

**响应**：
```json
{
  "success": true,
  "data": {
    "metric": "cpu",
    "period": "24h",
    "interval": "5m",
    "data": [
      {
        "timestamp": "2024-01-01T00:00:00Z",
        "value": 25.5
      }
    ]
  }
}
```

#### 健康历史记录
```http
GET /api/v1/monitoring/health-history
```

**查询参数**：
- `nodeId`: 节点ID（可选）
- `period`: 时间段
- `status`: 状态筛选

## 错误代码

### 1. 客户端错误 (4xx)
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证
- `403 Forbidden`: 权限不足
- `404 Not Found`: 资源不存在
- `422 Unprocessable Entity`: 数据验证失败
- `429 Too Many Requests`: 请求频率限制

### 2. 服务端错误 (5xx)
- `500 Internal Server Error`: 服务器内部错误
- `502 Bad Gateway`: 网关错误
- `503 Service Unavailable`: 服务不可用
- `504 Gateway Timeout`: 网关超时

### 3. 业务错误代码
- `USER_NOT_FOUND`: 用户不存在
- `INVALID_PASSWORD`: 密码错误
- `INSUFFICIENT_PERMISSIONS`: 权限不足
- `NODE_NOT_FOUND`: 节点不存在
- `DATASET_NOT_FOUND`: 数据集不存在
- `SERVICE_UNAVAILABLE`: 服务不可用
- `INVALID_DATA_FORMAT`: 数据格式错误

## 请求限制

### 1. 频率限制
- 未认证用户：60次/分钟
- 已认证用户：600次/分钟
- 管理员用户：6000次/分钟

### 2. 并发限制
- 每个用户最多10个并发请求
- 每个IP最多100个并发请求

### 3. 数据大小限制
- 请求体大小：10MB
- 响应体大小：50MB
- 文件上传：100MB

## 示例代码

### 1. JavaScript/TypeScript
```typescript
// API客户端示例
class S100ApiClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async request<T>(
    method: string,
    path: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // 用户管理
  async getUsers(params?: any) {
    return this.request('GET', '/api/v1/users', params);
  }

  async getUser(id: string) {
    return this.request('GET', `/api/v1/users/${id}`);
  }

  // 节点管理
  async getNodes(params?: any) {
    return this.request('GET', '/api/v1/nodes', params);
  }

  async getNodeHealth(id: string) {
    return this.request('GET', `/api/v1/nodes/${id}/health`);
  }

  // 数据服务
  async getCapabilities(params?: any) {
    return this.request('GET', '/api/v1/capabilities', params);
  }

  async getS101Wms(params: any) {
    return this.request('GET', '/api/v1/s101/wms', params);
  }
}
```

### 2. Python
```python
# API客户端示例
import requests
import json

class S100ApiClient:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def request(self, method, path, data=None):
        url = f"{self.base_url}{path}"
        response = requests.request(
            method,
            url,
            headers=self.headers,
            json=data
        )
        response.raise_for_status()
        return response.json()

    def get_users(self, params=None):
        return self.request('GET', '/api/v1/users', params)

    def get_nodes(self, params=None):
        return self.request('GET', '/api/v1/nodes', params)

    def get_capabilities(self, params=None):
        return self.request('GET', '/api/v1/capabilities', params)
```

### 3. cURL
```bash
# 用户认证
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 获取用户列表
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer jwt_token_here"

# 获取节点列表
curl -X GET http://localhost:3000/api/v1/nodes \
  -H "Authorization: Bearer jwt_token_here"

# 获取S-101 WMS服务
curl -X GET "http://localhost:3000/api/v1/s101/wms?service=WMS&version=1.1.1&request=GetMap&layers=s101&styles=&srs=EPSG:4326&bbox=120,30,122,32&width=800&height=600&format=image/png"
```

---

*该API文档提供了完整的接口规范，支持各种客户端的集成和开发。*