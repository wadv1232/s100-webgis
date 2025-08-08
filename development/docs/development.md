# 开发指南

## 概述

S-100海事服务平台采用现代化的开发流程和工具链，确保代码质量和开发效率。本文档详细介绍了开发环境搭建、代码规范、模块化设计原则和最佳实践。

## 开发环境搭建

### 1. 基础环境

#### 系统要求
- **操作系统**: macOS, Linux, Windows (WSL2)
- **Node.js**: 18.x 或更高版本
- **npm**: 8.x 或更高版本
- **Git**: 2.x 或更高版本
- **VS Code**: 推荐的IDE

#### 安装步骤

**macOS/Linux**
```bash
# 安装Node.js (使用nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 安装Git
# Ubuntu/Debian
sudo apt install git

# macOS (使用Homebrew)
brew install git

# 验证安装
node --version
npm --version
git --version
```

**Windows (WSL2)**
```bash
# 安装WSL2
wsl --install

# 在WSL2中安装Ubuntu
sudo apt update
sudo apt install nodejs npm git

# 验证安装
node --version
npm --version
git --version
```

### 2. 项目初始化

#### 克隆项目
```bash
git clone <repository-url>
cd s100-federal-maritime-platform
```

#### 安装依赖
```bash
npm install
```

#### 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

**开发环境变量配置**：
```env
# 开发环境配置
NODE_ENV=development
PORT=3000
HOST=localhost

# 数据库配置
DATABASE_URL="file:./dev.db"

# JWT配置
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN=3600

# 开发工具配置
ENABLE_DEV_TOOLS=true
LOG_LEVEL=debug
```

#### 初始化数据库
```bash
# 生成Prisma客户端
npm run db:generate

# 推送数据库schema
npm run db:push

# 运行数据库迁移（如果需要）
npm run db:migrate
```

#### 启动开发服务器
```bash
npm run dev
```

### 4. 开发环境优化

#### 性能优化配置

项目已配置了多项开发环境优化，以提供更好的开发体验：

**Next.js 配置优化** (`next.config.ts`):
- 启用了 React 严格模式以获得更好的开发体验
- 配置了包导入优化以减少构建时间
- 优化了 webpack 配置，使用轮询机制监听文件变化
- 添加了适当的延迟以避免频繁重载

**开发脚本优化** (`package.json`):
- 添加了 1 秒延迟到 nodemon 监听，避免频繁重启
- 配置了详细的日志输出到 `dev.log` 文件
- 优化了文件监听的扩展名和路径

#### 常见问题解决

**路由状态头解析错误**:
如果遇到 "The router state header was sent but could not be parsed" 错误，通常是由于开发环境配置问题。项目已通过以下方式解决：

1. 启用 React 严格模式
2. 优化 webpack 配置
3. 添加适当的文件监听延迟
4. 配置包导入优化

**热重载问题**:
如果热重载不工作，可以尝试：
1. 重启开发服务器
2. 清除浏览器缓存
3. 检查文件监听配置

#### 代码质量检查

项目配置了完整的代码质量检查流程：

```bash
# 运行 ESLint 检查
npm run lint

# 检查 TypeScript 类型
npx tsc --noEmit

# 运行所有检查
npm run lint && npx tsc --noEmit
```

### 5. IDE配置

#### VS Code配置

**推荐插件**：
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-eslint"
  ]
}
```

**VS Code设置** (`.vscode/settings.json`)：
```json
{
  "typescript.preferences.preferTypeOnlyAutoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

**调试配置** (`.vscode/launch.json`)：
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Next.js",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    },
    {
      "name": "Debug API Route",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s/api/your-endpoint",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

## 代码规范

### 1. TypeScript规范

#### 基本类型
```typescript
// 使用明确的类型
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 使用枚举而不是魔术字符串
enum UserRole {
  ADMIN = 'ADMIN',
  NODE_ADMIN = 'NODE_ADMIN',
  DATA_MANAGER = 'DATA_MANAGER',
  SERVICE_MANAGER = 'SERVICE_MANAGER',
  USER = 'USER',
  GUEST = 'GUEST'
}

// 使用类型别名提高可读性
type UserId = string;
type NodeId = string;
```

#### 函数规范
```typescript
// 使用明确的参数和返回类型
interface CreateUserParams {
  email: string;
  username: string;
  name?: string;
  role: UserRole;
  nodeId?: string;
}

interface CreateUserResult {
  success: boolean;
  user?: User;
  error?: string;
}

async function createUser(
  params: CreateUserParams
): Promise<CreateUserResult> {
  try {
    // 验证输入
    if (!params.email || !params.username) {
      return {
        success: false,
        error: 'Email and username are required'
      };
    }

    // 创建用户
    const user = await db.user.create({
      data: {
        email: params.email,
        username: params.username,
        name: params.name,
        role: params.role,
        nodeId: params.nodeId
      }
    });

    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: 'Failed to create user'
    };
  }
}
```

#### 组件规范
```typescript
// 使用React.FC和明确的props类型
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  className?: string;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  className = ''
}) => {
  return (
    <div className={`user-card ${className}`}>
      <div className="user-info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <span className="role-badge">{user.role}</span>
      </div>
      <div className="user-actions">
        {onEdit && (
          <button onClick={() => onEdit(user)}>编辑</button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(user.id)}>删除</button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
```

### 2. 命名规范

#### 文件命名
```typescript
// 组件文件：PascalCase
UserProfile.tsx
NodeManagement.tsx
ServiceRegistry.tsx

// 工具文件：camelCase
userUtils.ts
nodeHelpers.ts
serviceValidators.ts

// 类型文件：camelCase
userTypes.ts
nodeTypes.ts
serviceTypes.ts

// 页面文件：camelCase
userManagement.tsx
nodeConfiguration.tsx
serviceMonitoring.tsx
```

#### 变量命名
```typescript
// 使用有意义的名称
const userCount = users.length; // ✅
const cnt = users.length;        // ❌

// 使用驼峰命名
const maxFileSize = 1024 * 1024; // ✅
const MAX_FILE_SIZE = 1024 * 1024; // ❌ (常量除外)

// 布尔值使用is/has/should前缀
const isActive = true;        // ✅
const hasPermission = false;  // ✅
const shouldUpdate = true;    // ✅
const active = true;          // ❌
```

#### 函数命名
```typescript
// 使用动词开头
function createUser(userData: UserData): Promise<User> { // ✅
function user(userData: UserData): Promise<User> {       // ❌

// 使用明确的动作
function validateEmail(email: string): boolean {     // ✅
function emailValid(email: string): boolean {        // ❌

// 异步函数使用async/await
async function fetchUsers(): Promise<User[]> {       // ✅
function getUsers(): Promise<User[]> {               // ❌
```

### 3. 代码结构

#### 目录结构
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── users/         # 用户相关API
│   │   ├── nodes/         # 节点相关API
│   │   ├── datasets/      # 数据集相关API
│   │   └── ...            # 其他API
│   ├── users/             # 用户页面
│   ├── nodes/             # 节点页面
│   ├── datasets/          # 数据集页面
│   └── ...                # 其他页面
├── components/            # React组件
│   ├── ui/               # shadcn/ui组件
│   ├── layout/           # 布局组件
│   ├── forms/            # 表单组件
│   └── ...               # 其他组件
├── lib/                  # 工具库
│   ├── db/               # 数据库相关
│   ├── auth/             # 认证相关
│   ├── services/         # 服务相关
│   ├── utils/            # 工具函数
│   └── ...               # 其他库
├── hooks/                # React Hooks
├── types/                # TypeScript类型定义
└── styles/               # 样式文件
```

#### 组件结构
```typescript
// 组件文件结构
import React from 'react';
import { cn } from '@/lib/utils';

// 类型定义
interface ComponentProps {
  // props定义
}

// 主组件
const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // 状态管理
  // 副作用处理
  // 事件处理
  
  return (
    <div className={cn('component-base', props.className)}>
      {/* JSX内容 */}
    </div>
  );
};

// 子组件
const ComponentChild: React.FC<ChildProps> = ({ ...props }) => {
  return (
    <div className="component-child">
      {/* 子组件内容 */}
    </div>
  );
};

export default Component;
export { ComponentChild };
```

#### API路由结构
```typescript
// API路由文件结构
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// 请求验证schema
const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'USER', 'GUEST'])
});

// GET处理
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // 查询数据
    const data = await db.user.findMany({
      skip: (page - 1) * limit,
      take: limit
    });
    
    // 返回响应
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST处理
export async function POST(request: NextRequest) {
  try {
    // 解析和验证请求体
    const body = await request.json();
    const validatedData = createSchema.parse(body);
    
    // 创建数据
    const data = await db.user.create({
      data: validatedData
    });
    
    // 返回响应
    return NextResponse.json({
      success: true,
      data
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
```

## 模块化设计原则

### 1. KISS原则 (Keep It Simple, Stupid)

#### 简单性原则
```typescript
// ❌ 复杂的实现
function processUserData(userData: any[]) {
  const result = [];
  for (let i = 0; i < userData.length; i++) {
    if (userData[i].isActive && userData[i].role !== 'GUEST') {
      const processed = {
        ...userData[i],
        fullName: `${userData[i].firstName} ${userData[i].lastName}`,
        lastActive: new Date(userData[i].lastLoginAt).toLocaleDateString(),
        permissions: calculatePermissions(userData[i].role)
      };
      result.push(processed);
    }
  }
  return result;
}

// ✅ 简单的实现
function processUserData(users: User[]): ProcessedUser[] {
  return users
    .filter(user => user.isActive && user.role !== UserRole.GUEST)
    .map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastActive: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'
    }));
}
```

#### 单一职责原则
```typescript
// ❌ 违反单一职责
class UserService {
  async createUser(userData: any) {
    // 验证用户数据
    if (!userData.email || !userData.password) {
      throw new Error('Invalid user data');
    }
    
    // 创建用户
    const user = await db.user.create({
      data: userData
    });
    
    // 发送欢迎邮件
    await sendEmail(user.email, 'Welcome!', 'Thank you for registering');
    
    // 记录日志
    await logActivity('user_created', user.id);
    
    return user;
  }
}

// ✅ 遵循单一职责
class UserValidator {
  static validateUserData(userData: any): void {
    if (!userData.email || !userData.password) {
      throw new Error('Invalid user data');
    }
  }
}

class UserRepository {
  async create(userData: any): Promise<User> {
    return await db.user.create({
      data: userData
    });
  }
}

class EmailService {
  async sendWelcomeEmail(email: string): Promise<void> {
    await sendEmail(email, 'Welcome!', 'Thank you for registering');
  }
}

class ActivityLogger {
  async logUserActivity(userId: string, activity: string): Promise<void> {
    await logActivity(activity, userId);
  }
}

class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private activityLogger: ActivityLogger
  ) {}
  
  async createUser(userData: any): Promise<User> {
    UserValidator.validateUserData(userData);
    
    const user = await this.userRepository.create(userData);
    await this.emailService.sendWelcomeEmail(user.email);
    await this.activityLogger.logUserActivity(user.id, 'user_created');
    
    return user;
  }
}
```

### 2. 依赖注入

#### 服务层依赖注入
```typescript
// 服务接口定义
interface IAuthService {
  authenticate(email: string, password: string): Promise<User>;
  generateToken(user: User): string;
  validateToken(token: string): User;
}

interface IUserService {
  createUser(userData: CreateUserParams): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, userData: UpdateUserParams): Promise<User>;
}

// 服务实现
class AuthService implements IAuthService {
  async authenticate(email: string, password: string): Promise<User> {
    // 认证逻辑
  }
  
  generateToken(user: User): string {
    // 生成JWT token
  }
  
  validateToken(token: string): User {
    // 验证token
  }
}

class UserService implements IUserService {
  constructor(
    private authService: IAuthService
  ) {}
  
  async createUser(userData: CreateUserParams): Promise<User> {
    // 创建用户逻辑
  }
  
  async getUserById(id: string): Promise<User | null> {
    // 获取用户逻辑
  }
  
  async updateUser(id: string, userData: UpdateUserParams): Promise<User> {
    // 更新用户逻辑
  }
}

// 依赖注入容器
class ServiceContainer {
  private services: Map<string, any> = new Map();
  
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }
  
  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service;
  }
}

// 初始化服务容器
const container = new ServiceContainer();
container.register('authService', new AuthService());
container.register('userService', new UserService(container.get('authService')));
```

### 3. 配置管理

#### 环境配置
```typescript
// 配置类型定义
interface AppConfig {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  host: string;
  database: {
    url: string;
    maxConnections: number;
  };
  jwt: {
    secret: string;
    expiresIn: number;
  };
  redis?: {
    url: string;
  };
}

// 配置验证
const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.string().transform(Number),
  HOST: z.string(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  REDIS_URL: z.string().optional()
});

// 配置加载
function loadConfig(): AppConfig {
  const env = configSchema.parse(process.env);
  
  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    database: {
      url: env.DATABASE_URL,
      maxConnections: env.NODE_ENV === 'production' ? 20 : 5
    },
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: parseInt(env.JWT_EXPIRES_IN)
    },
    redis: env.REDIS_URL ? {
      url: env.REDIS_URL
    } : undefined
  };
}

// 导出配置
export const config = loadConfig();
```

### 4. 错误处理

#### 统一错误处理
```typescript
// 错误类型定义
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 常见错误
class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
  }
}

// 错误处理中间件
function errorHandler(error: Error, req: NextRequest, res: NextResponse) {
  if (error instanceof AppError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.details
    }, { status: error.statusCode });
  }
  
  // 处理未知错误
  console.error('Unhandled error:', error);
  return NextResponse.json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  }, { status: 500 });
}
```

## 测试策略

### 1. 单元测试

#### 测试工具配置
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

#### 单元测试示例
```typescript
// user.service.test.ts
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { UserValidator } from '../user.validator';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  
  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as any;
    
    userService = new UserService(mockUserRepository);
  });
  
  describe('createUser', () => {
    it('should create a valid user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER'
      };
      
      const expectedUser = {
        id: '1',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockUserRepository.create.mockResolvedValue(expectedUser);
      
      const result = await userService.createUser(userData);
      
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });
    
    it('should throw validation error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        name: 'Test User',
        role: 'USER'
      };
      
      await expect(userService.createUser(userData))
        .rejects.toThrow('Invalid email format');
    });
  });
});
```

### 2. 集成测试

#### API路由测试
```typescript
// users.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '../app/api/users/route';

describe('Users API', () => {
  describe('GET /api/users', () => {
    it('should return users list', async () => {
      const { req } = createMocks({
        method: 'GET',
        query: {
          page: '1',
          limit: '10'
        }
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
  
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'newuser@example.com',
          name: 'New User',
          role: 'USER'
        }
      });
      
      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe('newuser@example.com');
    });
    
    it('should return validation error for invalid data', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'invalid-email',
          name: 'Invalid User'
        }
      });
      
      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation error');
    });
  });
});
```

### 3. 端到端测试

#### Playwright配置
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### E2E测试示例
```typescript
// auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'admin@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
  
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toHaveText('Invalid credentials');
  });
});
```

## 部署策略

### 1. 构建优化

#### 优化构建配置
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // 生产环境优化
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // 图片优化
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*'],
  },
  
  // 环境特定配置
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: true,
    },
  }),
};
```

### 2. Docker部署

#### Dockerfile
```dockerfile
# 多阶段构建
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/s100
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=s100
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 3. CI/CD配置

#### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run database setup
      run: npm run db:setup
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/s100_test
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npx tsc --noEmit
    
    - name: Run tests
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/s100_test
    
    - name: Build application
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        # 部署脚本
        echo "Deploying to production..."
```

## 监控与日志

### 1. 日志配置

#### 日志工具配置
```typescript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 's100-platform' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### 2. 性能监控

#### 性能监控中间件
```typescript
// lib/middleware/performance.ts
import { NextRequest, NextResponse } from 'next/server';

export function performanceMiddleware(request: NextRequest) {
  const startTime = Date.now();
  
  const response = NextResponse.next();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // 记录性能指标
  console.log(`${request.method} ${request.pathname} - ${duration}ms`);
  
  // 添加性能头
  response.headers.set('X-Response-Time', duration.toString());
  
  return response;
}
```

### 3. 错误监控

#### 错误边界组件
```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // 发送错误到监控服务
    if (process.env.NODE_ENV === 'production') {
      // sendErrorToMonitoringService(error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details>
            <summary>Error details</summary>
            <p>{this.state.error?.message}</p>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 最佳实践

### 1. 安全实践

#### 输入验证
```typescript
// lib/validators.ts
import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'USER', 'GUEST']).default('USER')
});

export const validateInput = <T>(schema: z.ZodSchema<T>, data: any): T => {
  return schema.parse(data);
};
```

#### 权限控制
```typescript
// lib/auth.ts
import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';

export async function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.substring(7);
  const user = verifyToken(token);
  
  if (!user) {
    throw new Error('Invalid token');
  }
  
  return user;
}

export function requireRole(user: User, requiredRoles: UserRole[]) {
  if (!requiredRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
}
```

### 2. 性能优化

#### 数据缓存
```typescript
// lib/cache.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 300, // 5分钟
  checkperiod: 60,
  useClones: false
});

export const cacheService = {
  get: <T>(key: string): T | undefined => {
    return cache.get<T>(key);
  },
  
  set: <T>(key: string, value: T, ttl?: number): boolean => {
    return cache.set(key, value, ttl);
  },
  
  del: (key: string): number => {
    return cache.del(key);
  },
  
  clear: (): void => {
    cache.flushAll();
  }
};
```

#### 数据库查询优化
```typescript
// lib/db/utils.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

export const db = prisma;

// 查询优化工具
export const queryUtils = {
  // 分页查询
  paginate: async <T>(
    query: any,
    page: number = 1,
    limit: number = 10
  ) => {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      query.skip(skip).take(limit),
      query.count()
    ]);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },
  
  // 缓存查询
  cachedQuery: async <T>(
    key: string,
    query: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> => {
    const cached = cacheService.get<T>(key);
    if (cached) {
      return cached;
    }
    
    const result = await query();
    cacheService.set(key, result, ttl);
    
    return result;
  }
};
```

### 3. 代码质量

#### 代码检查配置
```typescript
// eslint.config.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
};
```

#### 代码格式化
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

---

这份开发指南为S-100海事服务平台提供了完整的开发规范和最佳实践。遵循这些指导原则，可以确保代码质量、开发效率和系统可维护性。