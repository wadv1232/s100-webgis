---
title: S-100 WebGIS Coding Standards
description: Comprehensive coding standards for the S-100 WebGIS project
author: Development Team
date: 2024-01-01
version: 1.0.0
category: Development
tags: [coding, standards, best-practices]
language: zh-CN
---

# S-100 WebGIS 编码规范

## 概述

本文档定义了 S-100 WebGIS 项目的编码规范，确保代码质量和一致性。所有开发者必须遵循这些规范来维护代码库的可读性和可维护性。

## 1. 通用规范

### 1.1 代码风格
- **缩进**: 使用2个空格，不使用制表符
- **行长度**: 每行不超过120个字符
- **文件结尾**: 每个文件以换行符结尾
- **编码**: 使用UTF-8编码

### 1.2 命名规范

#### 文件命名
- **组件文件**: 使用PascalCase，例如 `UserProfile.tsx`
- **工具文件**: 使用kebab-case，例如 `user-utils.ts`
- **常量文件**: 使用kebab-case，例如 `app-constants.ts`
- **类型定义**: 使用kebab-case，例如 `user-types.ts`

#### 变量和函数命名
- **变量**: 使用camelCase，例如 `userName`, `isLoading`
- **常量**: 使用SCREAMING_SNAKE_CASE，例如 `API_BASE_URL`
- **函数**: 使用camelCase，例如 `getUserData`, `fetchData`
- **布尔值**: 使用is/has/should前缀，例如 `isLoading`, `hasPermission`
- **异步函数**: 使用动词+名词形式，例如 `fetchUsers`, `createOrder`

#### 组件命名
- **React组件**: 使用PascalCase，例如 `UserProfile`, `DataTable`
- **Hook**: 使用camelCase并以use开头，例如 `useUserData`, `useApiCall`

#### 类型命名
- **TypeScript类型**: 使用PascalCase，例如 `User`, `ApiResponse`
- **接口**: 使用PascalCase，例如 `IUserService`, `IDataRepository`
- **枚举**: 使用PascalCase，例如 `UserStatus`, `ApiMethod`

### 1.3 注释规范

#### 文件注释
```typescript
/**
 * 用户服务模块
 * 提供用户相关的业务逻辑和数据操作
 * @author 开发者姓名
 * @since 2024-01-01
 */
```

#### 函数注释
```typescript
/**
 * 获取用户信息
 * @param userId - 用户ID
 * @returns 用户信息对象
 * @throws 当用户不存在时抛出错误
 */
export const getUserInfo = async (userId: string): Promise<User> => {
  // 实现
}
```

#### 行内注释
```typescript
// 计算总价（包含税费）
const totalPrice = basePrice * taxRate;
```

#### TODO注释
```typescript
// TODO: 优化这个算法的性能
// FIXME: 修复这个边界情况
// NOTE: 这个函数需要在下一个版本中重构
```

## 2. TypeScript规范

### 2.1 类型定义
```typescript
// 基本类型
interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 泛型类型
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// 联合类型
type Status = 'active' | 'inactive' | 'pending';

// 工具类型
type RequiredUser = Required<User>;
type PartialUser = Partial<User>;
```

### 2.2 函数类型
```typescript
// 接口定义函数类型
interface UserService {
  getUser: (id: string) => Promise<User>;
  createUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<User>;
}

// 类型别名
type GetUser = (id: string) => Promise<User>;
```

### 2.3 类型断言
```typescript
// 推荐：使用as语法
const user = response.data as User;

// 不推荐：使用尖括号语法
const user = <User>response.data;
```

### 2.4 类型守卫
```typescript
// typeof守卫
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// instanceof守卫
function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

// 自定义类型守卫
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  );
}
```

## 3. React规范

### 3.1 组件规范

#### 函数组件
```typescript
interface UserProfileProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onEdit,
  onDelete
}) => {
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <div className="actions">
        {onEdit && <button onClick={() => onEdit(user)}>编辑</button>}
        {onDelete && <button onClick={() => onDelete(user.id)}>删除</button>}
      </div>
    </div>
  );
};
```

#### 组件属性
```typescript
// 必需属性
interface RequiredProps {
  id: string;
  name: string;
}

// 可选属性
interface OptionalProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// 默认属性
const defaultProps: Partial<OptionalProps> = {
  className: '',
  style: {},
};

const MyComponent: React.FC<RequiredProps & OptionalProps> = (props) => {
  const { id, name, className = '', style = {}, children } = props;
  // 实现
};

MyComponent.defaultProps = defaultProps;
```

### 3.2 Hook规范

#### 自定义Hook
```typescript
interface UseApiOptions {
  enabled?: boolean;
  retry?: number;
  retryDelay?: number;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useApi = <T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiResult<T> => {
  const { enabled = true, retry = 3, retryDelay = 1000 } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [apiCall, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
```

#### Hook使用规则
- **只在顶层调用Hook**: 不要在循环、条件或嵌套函数中调用Hook
- **只在React函数中调用Hook**: 在React函数组件或自定义Hook中调用
- **使用useCallback和useMemo**: 优化性能，避免不必要的重新计算

### 3.3 状态管理

#### useState
```typescript
// 简单状态
const [count, setCount] = useState(0);

// 对象状态
const [user, setUser] = useState<User | null>(null);

// 函数更新
const increment = () => {
  setCount(prevCount => prevCount + 1);
};

// 对象更新
const updateUser = (updates: Partial<User>) => {
  setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
};
```

#### useReducer
```typescript
interface State {
  count: number;
  loading: boolean;
  error: Error | null;
}

type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null };

const initialState: State = {
  count: 0,
  loading: false,
  error: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, initialState);
```

## 4. 样式规范

### 4.1 Tailwind CSS
```typescript
// 优先使用Tailwind类名
<div className="flex items-center justify-center p-4 bg-blue-500 text-white">
  <span className="text-lg font-semibold">Hello World</span>
</div>

// 避免内联样式
<div style={{ display: 'flex', alignItems: 'center' }}> // 不推荐
```

### 4.2 CSS模块
```typescript
// CSS文件
.container {
  @apply flex items-center justify-center p-4;
}

.title {
  @apply text-lg font-semibold;
}

// TypeScript文件
import styles from './MyComponent.module.css';

<div className={styles.container}>
  <h1 className={styles.title}>Hello World</h1>
</div>
```

### 4.3 响应式设计
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="p-4 bg-white rounded-lg shadow">Item 1</div>
  <div className="p-4 bg-white rounded-lg shadow">Item 2</div>
  <div className="p-4 bg-white rounded-lg shadow">Item 3</div>
</div>
```

## 5. 测试规范

### 5.1 单元测试
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user information correctly', () => {
    render(
      <UserProfile 
        user={mockUser} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <UserProfile 
        user={mockUser} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    fireEvent.click(screen.getByText('编辑'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

### 5.2 集成测试
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserManagement } from './UserManagement';
import * as userService from '../services/userService';

jest.mock('../services/userService');

describe('UserManagement Integration', () => {
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and displays users', async () => {
    (userService.getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(<UserManagement />);

    expect(screen.getByText('加载中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });
});
```

## 6. 性能规范

### 6.1 代码分割
```typescript
// 动态导入组件
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// 使用Suspense包装
<Suspense fallback={<div>加载中...</div>}>
  <LazyComponent />
</Suspense>
```

### 6.2 记忆化
```typescript
// 使用useMemo缓存计算结果
const filteredUsers = useMemo(() => {
  return users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [users, searchTerm]);

// 使用useCallback缓存函数
const handleSearch = useCallback((term: string) => {
  setSearchTerm(term);
}, []);
```

### 6.3 虚拟化长列表
```typescript
import { FixedSizeList as List } from 'react-window';

const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
  <div style={style}>
    {items[index].name}
  </div>
);

<List
  height={400}
  itemCount={items.length}
  itemSize={35}
  width="100%"
>
  {Row}
</List>
```

## 7. 错误处理

### 7.1 错误边界
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>出现错误</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 7.2 异步错误处理
```typescript
export const fetchUserData = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw new Error('获取用户数据失败');
  }
};
```

## 8. 工具和配置

### 8.1 ESLint配置
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### 8.2 Prettier配置
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false
}
```

## 9. Git规范

### 9.1 提交信息格式
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### 9.2 提交类型
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 9.3 提交示例
```
feat(auth): add user login functionality

- Add login form component
- Implement authentication API
- Add user session management

Closes #123
```

## 10. 安全规范

### 10.1 敏感信息
- 不要在代码中硬编码敏感信息
- 使用环境变量存储API密钥、数据库连接等
- 定期轮换密钥和令牌

### 10.2 输入验证
```typescript
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

### 10.3 XSS防护
```typescript
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
```

## 遵循这些规范将确保代码质量、可维护性和团队协作效率。