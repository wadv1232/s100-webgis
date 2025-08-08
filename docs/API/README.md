---
title: API文档
description: API接口文档概述
author: 开发团队
date: 2024-01-01
version: 1.0.0
category: API文档
tags: [API, 接口, 文档]
---

# API文档

## 概述

S100海事服务系统提供完整的API接口，支持RESTful API、WebSocket API和GraphQL API三种接口形式，满足不同场景的数据交互需求。

## API架构

### 整体架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   RESTful API   │    │  WebSocket API  │    │   GraphQL API   │
│                 │    │                 │    │                 │
│ • CRUD操作      │    │ • 实时通信      │    │ • 灵活查询      │
│ • 标准HTTP方法  │    │ • 事件推送      │    │ • 类型安全      │
│ • 状态码响应    │    │ • 双向通信      │    │ • 单一端点      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Next.js API   │
                    │                 │
                    │ • 路由处理      │
                    │ • 中间件        │
                    │ • 错误处理      │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   业务逻辑层    │
                    │                 │
                    │ • 服务层        │
                    │ • 数据访问      │
                    │ • 业务规则      │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │    数据层       │
                    │                 │
                    │ • Prisma ORM    │
                    │ • 数据库        │
                    │ • 缓存          │
                    └─────────────────┘
```

### 认证和授权

#### 认证方式
- **JWT Token**: 基于JSON Web Token的无状态认证
- **Session Cookie**: 基于Cookie的会话认证
- **API Key**: 基于API密钥的认证

#### 权限级别
- **公开访问**: 无需认证的公开接口
- **用户权限**: 需要用户登录的接口
- **管理员权限**: 需要管理员角色的接口
- **系统权限**: 系统内部调用的接口

## API文档结构

### RESTful API
- [REST API文档](./REST_API.md)
  - 用户管理API
  - 节点管理API
  - 服务管理API
  - 地图服务API
  - 数据集管理API

### WebSocket API
- [WebSocket API文档](./WEBSOCKET_API.md)
  - 实时数据推送
  - 节点状态监控
  - 服务状态更新
  - 用户通知

### GraphQL API
- [GraphQL API文档](./GRAPHQL_API.md)
  - 查询语言
  - 类型定义
  - 查询示例
  - 订阅功能

## API特性

### 通用特性
- **统一响应格式**: 标准化的JSON响应结构
- **错误处理**: 完善的错误码和错误信息
- **数据验证**: 请求参数的严格验证
- **性能优化**: 响应缓存和分页支持
- **安全防护**: 防止SQL注入、XSS攻击

### RESTful API特性
- **RESTful设计**: 遵循REST架构风格
- **HTTP方法**: GET、POST、PUT、DELETE、PATCH
- **状态码**: 标准HTTP状态码
- **版本控制**: API版本管理
- **文档化**: 自动生成API文档

### WebSocket API特性
- **实时通信**: 支持实时数据推送
- **事件驱动**: 基于事件的消息机制
- **连接管理**: 连接状态监控和重连
- **消息队列**: 消息持久化和重试

### GraphQL API特性
- **灵活查询**: 客户端定义查询结构
- **类型安全**: 强类型系统
- **单一端点**: 统一的API端点
- **订阅功能**: 实时数据订阅

## API使用指南

### 基础使用

#### 1. 获取访问令牌
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'
```

#### 2. 使用令牌访问API
```bash
curl -X GET "http://localhost:3000/api/users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### 3. WebSocket连接
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('node-status', (data) => {
  console.log('Node status update:', data);
});
```

### 错误处理

#### 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {
      "field": "具体错误信息"
    }
  }
}
```

#### 常见错误码
| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| UNAUTHORIZED | 未授权 | 401 |
| FORBIDDEN | 权限不足 | 403 |
| NOT_FOUND | 资源不存在 | 404 |
| VALIDATION_ERROR | 参数验证失败 | 400 |
| INTERNAL_ERROR | 服务器内部错误 | 500 |

### 性能优化

#### 缓存策略
- **响应缓存**: 对GET请求进行缓存
- **数据库缓存**: 查询结果缓存
- **CDN缓存**: 静态资源缓存

#### 分页支持
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10&sort=name&order=asc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 批量操作
```bash
curl -X POST "http://localhost:3000/api/users/batch" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "users": [
      {"name": "User1", "email": "user1@example.com"},
      {"name": "User2", "email": "user2@example.com"}
    ]
  }'
```

## API测试

### 自动化测试

#### 单元测试
```typescript
// 测试用户API
describe('User API', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test User',
        email: 'test@example.com'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

#### 集成测试
```typescript
// 测试完整的用户流程
describe('User Flow', () => {
  it('should complete user registration to login flow', async () => {
    // 注册用户
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password'
      });
    
    // 登录用户
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password'
      });
    
    // 获取用户信息
    const userResponse = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${loginResponse.body.data.token}`);
    
    expect(userResponse.status).toBe(200);
  });
});
```

### 手动测试工具

#### Postman集合
- 导入Postman集合进行API测试
- 支持环境变量和预请求脚本
- 自动化测试套件

#### cURL命令
```bash
# 创建用户
curl -X POST "http://localhost:3000/api/users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }'

# 获取用户列表
curl -X GET "http://localhost:3000/api/users" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 更新用户
curl -X PUT "http://localhost:3000/api/users/123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated"
  }'

# 删除用户
curl -X DELETE "http://localhost:3000/api/users/123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API监控和日志

### 监控指标
- **请求量**: API调用次数统计
- **响应时间**: API响应时间分布
- **错误率**: API错误率统计
- **并发数**: 并发请求数量

### 日志记录
```typescript
// API请求日志
logger.info('API Request', {
  method: req.method,
  url: req.url,
  userAgent: req.get('User-Agent'),
  ip: req.ip,
  timestamp: new Date()
});

// API响应日志
logger.info('API Response', {
  statusCode: res.statusCode,
  responseTime: Date.now() - startTime,
  timestamp: new Date()
});
```

### 性能分析
```typescript
// 中间件：性能监控
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: duration
    });
  });
  
  next();
});
```

## API版本管理

### 版本策略
- **URL版本**: `/api/v1/users`
- **Header版本**: `Accept: application/vnd.api.v1+json`
- **查询参数**: `?version=1`

### 版本兼容性
- **向后兼容**: 新版本保持向后兼容
- **弃用通知**: 提前通知API弃用
- **迁移指南**: 提供版本迁移指南

### 版本示例
```bash
# v1版本
curl -X GET "http://localhost:3000/api/v1/users" \
  -H "Authorization: Bearer YOUR_TOKEN"

# v2版本
curl -X GET "http://localhost:3000/api/v2/users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/vnd.api.v2+json"
```

## 安全最佳实践

### 认证安全
- 使用HTTPS协议
- 令牌过期时间设置
- 密码强度要求
- 登录失败限制

### 数据安全
- 敏感数据加密
- SQL注入防护
- XSS攻击防护
- CSRF防护

### 访问控制
- 基于角色的访问控制
- IP白名单限制
- 请求频率限制
- 数据权限控制

## 相关资源

### 官方文档
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org/)

### 工具和库
- [Postman](https://www.postman.com/) - API测试工具
- [Swagger](https://swagger.io/) - API文档生成
- [GraphQL Playground](https://www.graphql-python.com/docs/playground/) - GraphQL测试工具

### 社区资源
- [Stack Overflow](https://stackoverflow.com/) - 技术问答
- [GitHub Issues](https://github.com/) - 问题反馈
- [Discord Community](https://discord.gg/) - 社区讨论

---

*最后更新: 2024-01-01*