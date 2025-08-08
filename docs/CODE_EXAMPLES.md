---
title: 代码示例和最佳实践
description: S100海事服务系统代码示例和最佳实践指南
author: 开发团队
date: 2024-01-01
version: 1.0.0
category: 开发指南
tags: [代码示例, 最佳实践, 指南]
---

# 代码示例和最佳实践

## 概述

本文档提供了S100海事服务系统的代码示例和最佳实践，帮助开发者编写高质量、可维护的代码。

## 目录

- [React组件最佳实践](#react组件最佳实践)
- [TypeScript最佳实践](#typescript最佳实践)
- [API开发最佳实践](#api开发最佳实践)
- [数据库操作最佳实践](#数据库操作最佳实践)
- [状态管理最佳实践](#状态管理最佳实践)
- [测试最佳实践](#测试最佳实践)
- [性能优化最佳实践](#性能优化最佳实践)
- [安全最佳实践](#安全最佳实践)

## React组件最佳实践

### 1. 函数组件

#### 基础组件示例
```typescript
import React, { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  onEdit?: (user: UserProfileProps['user']) => void;
  onDelete?: (userId: string) => void;
}

export const UserProfile = memo(({ user, onEdit, onDelete }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);

  const handleEdit = useCallback(() => {
    if (isEditing) {
      onEdit?.({ ...user, name: editName });
    }
    setIsEditing(!isEditing);
  }, [isEditing, editName, user, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete?.(user.id);
  }, [user.id, onDelete]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {user.avatar && (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1"
            />
          ) : (
            <span>{user.name}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{user.email}</p>
        <div className="flex gap-2">
          <Button onClick={handleEdit} variant="outline" size="sm">
            {isEditing ? '保存' : '编辑'}
          </Button>
          {onDelete && (
            <Button onClick={handleDelete} variant="destructive" size="sm">
              删除
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

UserProfile.displayName = 'UserProfile';
```

#### 复杂组件示例
```typescript
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useUserService } from '@/lib/services/userService';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';

interface UserManagementProps {
  onUserSelect?: (user: User) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onUserSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { users, loading, error, totalCount } = useUserService({
    search: debouncedSearchTerm,
    page: currentPage,
    limit: 10
  });

  // 表格列定义
  const columns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      accessorKey: 'name',
      header: '姓名',
      cell: ({ row }) => (
        <button
          onClick={() => onUserSelect?.(row.original)}
          className="text-blue-600 hover:text-blue-800"
        >
          {row.getValue('name')}
        </button>
      ),
    },
    {
      accessorKey: 'email',
      header: '邮箱',
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.getValue('status');
        return (
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status === 'active' ? '活跃' : '禁用'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: '创建时间',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
  ], [onUserSelect]);

  // 处理搜索
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  // 处理分页
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 处理用户选择
  const handleUserSelect = useCallback((userId: string, selected: boolean) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  }, []);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">加载用户数据失败: {error.message}</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-blue-600">
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">用户管理</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <span className="text-sm text-gray-600">
            已选择 {selectedUsers.size} 个用户
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users || []}
        loading={loading}
        pagination={{
          currentPage,
          totalPages: Math.ceil((totalCount || 0) / 10),
          onPageChange: handlePageChange,
        }}
        onRowSelect={handleUserSelect}
      />
    </div>
  );
};
```

### 2. 自定义Hook

#### API调用Hook
```typescript
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseApiOptions {
  enabled?: boolean;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const {
    enabled = true,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    let attempt = 0;
    const executeWithRetry = async (): Promise<T> => {
      try {
        const result = await apiCall();
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        attempt++;
        if (attempt <= retry) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return executeWithRetry();
        }
        throw err;
      }
    };

    try {
      await executeWithRetry();
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      toast({
        title: '请求失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [apiCall, enabled, retry, retryDelay, onSuccess, onError, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return { data, loading, error, refetch: fetchData, mutate };
}
```

#### 表单处理Hook
```typescript
import { useState, useCallback, ChangeEvent } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void> | void;
}

interface UseFormResult<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  loading: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
  setFieldValue: (field: keyof T, value: any) => void;
}

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormResult<T> {
  const { initialValues, validate, onSubmit } = options;
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[field]) {
        setErrors(prev => ({ ...prev, [field]: validationErrors[field] }));
      }
    }
  }, [validate, values]);

  const handleSubmit = useCallback(async () => {
    // 验证所有字段
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  }, [validate, values, onSubmit]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setLoading(false);
  }, [initialValues]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    values,
    errors,
    touched,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
  };
}
```

## TypeScript最佳实践

### 1. 类型定义

#### 基础类型
```typescript
// 用户类型
interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 用户状态
type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

// 用户角色
type UserRole = 'admin' | 'user' | 'moderator';

// 用户权限
type UserPermission = 
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'nodes:read'
  | 'nodes:write'
  | 'nodes:delete';
```

#### 复杂类型
```typescript
// API响应类型
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

// 分页参数
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 查询参数
interface UserQueryParams extends PaginationParams {
  search?: string;
  status?: UserStatus;
  role?: UserRole;
}

// 服务配置
interface ServiceConfig {
  id: string;
  name: string;
  type: 'wms' | 'wfs' | 'wcs' | 'sos';
  endpoint: string;
  version: string;
  capabilities: {
    layers: string[];
    formats: string[];
    crs: string[];
  };
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'api-key';
    credentials?: {
      username?: string;
      password?: string;
      token?: string;
      apiKey?: string;
    };
  };
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}
```

#### 工具类型
```typescript
// 部分更新类型
type PartialUpdate<T> = Partial<Pick<T, keyof T>>;

// 只读类型
type ReadonlyUser = Readonly<User>;

// 可选类型
type OptionalUser = Partial<User>;

// 必需类型
type RequiredUser = Required<User>;

// 选择类型
type UserKeys = keyof User;

// 提取类型
type UserCreatedAt = User['createdAt'];

// 条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

// 映射类型
type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 模板字面量类型
type ApiEndpoint<T extends string> = `/api/${T}`;
type UserEndpoint = ApiEndpoint<'users'>;
type NodeEndpoint = ApiEndpoint<'nodes'>;
```

### 2. 类型守卫

#### 基本类型守卫
```typescript
// 字符串类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// 数字类型守卫
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

// 布尔类型守卫
function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

// 对象类型守卫
function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// 数组类型守卫
function isArray<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}
```

#### 自定义类型守卫
```typescript
// 用户类型守卫
function isUser(value: unknown): value is User {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.username === 'string' &&
    typeof value.email === 'string' &&
    typeof value.isActive === 'boolean' &&
    value.createdAt instanceof Date &&
    value.updatedAt instanceof Date
  );
}

// API响应类型守卫
function isApiResponse<T>(
  response: unknown,
  dataGuard: (data: unknown) => data is T
): response is ApiResponse<T> {
  return (
    isObject(response) &&
    typeof response.success === 'boolean' &&
    (response.data === undefined || dataGuard(response.data)) &&
    (response.error === undefined || (
      isObject(response.error) &&
      typeof response.error.code === 'string' &&
      typeof response.error.message === 'string'
    ))
  );
}

// 分页参数类型守卫
function isPaginationParams(value: unknown): value is PaginationParams {
  return (
    isObject(value) &&
    isNumber(value.page) &&
    isNumber(value.limit) &&
    (value.sortBy === undefined || isString(value.sortBy)) &&
    (value.sortOrder === undefined || ['asc', 'desc'].includes(value.sortOrder))
  );
}
```

### 3. 泛型工具

#### API服务基类
```typescript
abstract class ApiService<T, ID = string> {
  protected baseUrl: string;
  protected headers: Record<string, string>;

  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers,
    };
  }

  protected async request<R>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<R> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAll(params?: Record<string, any>): Promise<T[]> {
    const searchParams = new URLSearchParams(params).toString();
    const endpoint = searchParams ? `?${searchParams}` : '';
    return this.request<T[]>(endpoint);
  }

  async getById(id: ID): Promise<T> {
    return this.request<T>(`/${id}`);
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    return this.request<T>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: ID, data: Partial<T>): Promise<T> {
    return this.request<T>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: ID): Promise<void> {
    return this.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }
}
```

#### 具体服务实现
```typescript
interface UserService extends ApiService<User, string> {
  searchUsers(query: string): Promise<User[]>;
  getUserPermissions(userId: string): Promise<UserPermission[]>;
  updateUserStatus(userId: string, status: UserStatus): Promise<User>;
}

class UserServiceImpl extends ApiService<User, string> implements UserService {
  constructor() {
    super('/api/users');
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.request<User[]>('/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return this.request<UserPermission[]>(`/${userId}/permissions`);
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    return this.request<User>(`/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}
```

## API开发最佳实践

### 1. API路由结构

#### 标准API路由
```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/userService';
import { validateUserQuery } from '@/lib/validators/userValidator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // 验证查询参数
    const validatedQuery = validateUserQuery(queryParams);
    
    // 获取用户列表
    const users = await userService.getUsers(validatedQuery);
    
    return NextResponse.json({
      success: true,
      data: users,
      meta: {
        total: users.length,
        page: validatedQuery.page || 1,
        limit: validatedQuery.limit || 10,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取用户列表失败',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = validateUserData(body);
    
    // 创建用户
    const user = await userService.createUser(validatedData);
    
    return NextResponse.json({
      success: true,
      data: user,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: error.details,
          },
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '创建用户失败',
        },
      },
      { status: 500 }
    );
  }
}
```

#### 动态路由
```typescript
// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/userService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // 获取用户详情
    const user = await userService.getUserById(id);
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用户不存在',
          },
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取用户详情失败',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // 验证更新数据
    const validatedData = validateUserUpdate(body);
    
    // 更新用户
    const user = await userService.updateUser(id, validatedData);
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用户不存在',
          },
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: error.details,
          },
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '更新用户失败',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // 删除用户
    const success = await userService.deleteUser(id);
    
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用户不存在',
          },
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '用户删除成功',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '删除用户失败',
        },
      },
      { status: 500 }
    );
  }
}
```

### 2. 中间件使用

#### 认证中间件
```typescript
// src/lib/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function authMiddleware(request: NextRequest) {
  try {
    // 获取Authorization头
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '缺少认证令牌',
          },
        },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    
    // 验证JWT令牌
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    
    // 将用户信息添加到请求头中
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('user-id', payload.sub as string);
    requestHeaders.set('user-roles', JSON.stringify(payload.roles || []));
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '无效的认证令牌',
        },
      },
      { status: 401 }
    );
  }
}
```

#### 权限中间件
```typescript
// src/lib/middleware/permission.ts
import { NextRequest, NextResponse } from 'next/server';

export function permissionMiddleware(requiredPermissions: string[]) {
  return async (request: NextRequest) => {
    try {
      // 获取用户角色
      const userRolesHeader = request.headers.get('user-roles');
      const userRoles = userRolesHeader ? JSON.parse(userRolesHeader) : [];
      
      // 检查用户是否有所需权限
      const hasPermission = requiredPermissions.some(permission =>
        userRoles.includes(permission)
      );
      
      if (!hasPermission) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: '权限不足',
            },
          },
          { status: 403 }
        );
      }
      
      return NextResponse.next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: '权限检查失败',
          },
        },
        { status: 500 }
      );
    }
  };
}
```

#### 速率限制中间件
```typescript
// src/lib/middleware/rateLimit.ts
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitData {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitData>();

export function rateLimitMiddleware(
  windowMs: number = 60000, // 1分钟
  maxRequests: number = 100
) {
  return async (request: NextRequest) => {
    try {
      // 获取客户端IP
      const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
      
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // 清理过期的记录
      for (const [key, data] of rateLimitStore.entries()) {
        if (data.resetTime < now) {
          rateLimitStore.delete(key);
        }
      }
      
      // 获取或创建速率限制数据
      let rateLimitData = rateLimitStore.get(clientIP);
      
      if (!rateLimitData || rateLimitData.resetTime < windowStart) {
        rateLimitData = {
          count: 1,
          resetTime: now + windowMs,
        };
        rateLimitStore.set(clientIP, rateLimitData);
      } else {
        rateLimitData.count++;
      }
      
      // 检查是否超过限制
      if (rateLimitData.count > maxRequests) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: '请求过于频繁，请稍后再试',
            },
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitData.resetTime.toString(),
              'Retry-After': Math.ceil((rateLimitData.resetTime - now) / 1000).toString(),
            },
          }
        );
      }
      
      // 添加速率限制头
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', (maxRequests - rateLimitData.count).toString());
      response.headers.set('X-RateLimit-Reset', rateLimitData.resetTime.toString());
      
      return response;
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      return NextResponse.next();
    }
  };
}
```

### 3. 错误处理

#### 统一错误处理
```typescript
// src/lib/errors/ApiError.ts
export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends ApiError {
  constructor(details: Record<string, any>) {
    super(
      'VALIDATION_ERROR',
      '数据验证失败',
      400,
      details
    );
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(
      'NOT_FOUND',
      `${resource}不存在`,
      404
    );
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = '未授权访问') {
    super(
      'UNAUTHORIZED',
      message,
      401
    );
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = '权限不足') {
    super(
      'FORBIDDEN',
      message,
      403
    );
  }
}
```

#### 错误处理中间件
```typescript
// src/lib/middleware/errorHandler.ts
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/errors/ApiError';

export function errorHandler(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message,
        },
      },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误',
      },
    },
    { status: 500 }
  );
}
```

## 数据库操作最佳实践

### 1. Prisma模型定义

#### 用户模型
```prisma
// prisma/schema.prisma
model User {
  id          String   @id @default(cuid())
  username    String   @unique
  email       String   @unique
  fullName    String?
  avatar      String?
  isActive    Boolean  @default(true)
  emailVerified Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 关系
  roles       UserRole[]
  createdNodes Node[]
  auditLogs   AuditLog[]

  @@map("users")
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  permissions Json     // 存储权限数组
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 关系
  users       UserRole[]

  @@map("roles")
}

model UserRole {
  userId      String
  roleId      String
  assignedAt  DateTime @default(now())
  assignedBy  String?

  // 关系
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role        Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@map("user_roles")
}
```

#### 节点模型
```prisma
model Node {
  id          String   @id @default(cuid())
  name        String
  description String?
  type        String   // 'server', 'sensor', 'gateway', etc.
  status      String   @default('active') // 'active', 'inactive', 'maintenance', 'error'
  location    String?  // GeoJSON Point
  coverage    String?  // GeoJSON Polygon
  config      Json?    // 节点配置
  metadata    Json?    // 元数据
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 关系
  capabilities NodeCapability[]
  healthChecks NodeHealth[]
  services     ServiceNode[]
  createdBy    User?    @relation(fields: [createdById], references: [id])
  createdById  String?

  @@map("nodes")
}

model NodeCapability {
  id          String   @id @default(cuid())
  nodeId      String
  serviceType String   // 'wms', 'wfs', 'wcs', etc.
  capability  Json     // 能力详情
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 关系
  node        Node     @relation(fields: [nodeId], references: [id], onDelete: Cascade)

  @@map("node_capabilities")
}

model NodeHealth {
  id          String   @id @default(cuid())
  nodeId      String
  status      String   // 'healthy', 'warning', 'error', 'unknown'
  metrics     Json?    // 健康指标
  lastCheck   DateTime @default(now())
  createdAt   DateTime @default(now())

  // 关系
  node        Node     @relation(fields: [nodeId], references: [id], onDelete: Cascade)

  @@map("node_health")
}
```

### 2. 数据库服务

#### 基础服务类
```typescript
// src/lib/services/baseService.ts
import { PrismaClient } from '@prisma/client';
import { ApiError, NotFoundError } from '@/lib/errors/ApiError';

export abstract class BaseService<T, ID = string> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  protected get model() {
    return (this.prisma as any)[this.modelName];
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    include?: any;
  }): Promise<T[]> {
    const { skip, take, where, orderBy, include } = params || {};
    
    return this.model.findMany({
      skip,
      take,
      where,
      orderBy,
      include,
    });
  }

  async findById(
    id: ID,
    options?: {
      include?: any;
      select?: any;
    }
  ): Promise<T | null> {
    const { include, select } = options || {};
    
    return this.model.findUnique({
      where: { id },
      include,
      select,
    });
  }

  async findByIdOrFail(
    id: ID,
    options?: {
      include?: any;
      select?: any;
    }
  ): Promise<T> {
    const entity = await this.findById(id, options);
    
    if (!entity) {
      throw new NotFoundError(this.modelName);
    }
    
    return entity;
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    return this.model.create({
      data,
    });
  }

  async update(
    id: ID,
    data: Partial<T>
  ): Promise<T> {
    const entity = await this.model.update({
      where: { id },
      data,
    });
    
    return entity;
  }

  async delete(id: ID): Promise<boolean> {
    try {
      await this.model.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }

  async exists(id: ID): Promise<boolean> {
    const count = await this.count({ id });
    return count > 0;
  }
}
```

#### 用户服务实现
```typescript
// src/lib/services/userService.ts
import { PrismaClient } from '@prisma/client';
import { BaseService } from './baseService';
import { User, UserRole } from '@prisma/client';
import { hashPassword, verifyPassword } from '@/lib/utils/crypto';
import { ValidationError } from '@/lib/errors/ApiError';

interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  avatar?: string;
}

interface UpdateUserInput {
  username?: string;
  email?: string;
  fullName?: string;
  avatar?: string;
  isActive?: boolean;
}

interface UserQueryParams {
  search?: string;
  status?: 'active' | 'inactive';
  role?: string;
  skip?: number;
  take?: number;
}

export class UserService extends BaseService<User, string> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
  }

  async createUser(input: CreateUserInput): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: input.username },
          { email: input.email },
        ],
      },
    });

    if (existingUser) {
      throw new ValidationError({
        field: existingUser.username === input.username ? 'username' : 'email',
        message: '用户名或邮箱已存在',
      });
    }

    // 加密密码
    const hashedPassword = await hashPassword(input.password);

    // 创建用户
    const user = await this.create({
      username: input.username,
      email: input.email,
      fullName: input.fullName,
      avatar: input.avatar,
      isActive: true,
      emailVerified: false,
      passwordHash: hashedPassword,
    });

    return user;
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    // 检查用户是否存在
    const user = await this.findByIdOrFail(id);

    // 检查用户名和邮箱唯一性
    if (input.username && input.username !== user.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: input.username },
      });

      if (existingUser) {
        throw new ValidationError({
          field: 'username',
          message: '用户名已存在',
        });
      }
    }

    if (input.email && input.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new ValidationError({
          field: 'email',
          message: '邮箱已存在',
        });
      }
    }

    // 更新用户
    return this.update(id, input);
  }

  async authenticateUser(
    username: string,
    password: string
  ): Promise<User | null> {
    // 查找用户
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username },
        ],
        isActive: true,
      },
    });

    if (!user) {
      return null;
    }

    // 验证密码
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  async getUsersWithRoles(params: UserQueryParams = {}): Promise<User[]> {
    const { search, status, role, skip = 0, take = 10 } = params;

    const where: any = {};

    // 搜索条件
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 状态过滤
    if (status) {
      where.isActive = status === 'active';
    }

    // 角色过滤
    if (role) {
      where.roles = {
        some: {
          role: {
            name: role,
          },
        },
      };
    }

    return this.findAll({
      skip,
      take,
      where,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });

    return userRoles.map(ur => ur.role.name);
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    // 检查用户是否存在
    await this.findByIdOrFail(userId);

    // 检查角色是否存在
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new ValidationError({
        field: 'role',
        message: '角色不存在',
      });
    }

    // 检查是否已分配该角色
    const existingAssignment = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
    });

    if (!existingAssignment) {
      await this.prisma.userRole.create({
        data: {
          userId,
          roleId: role.id,
        },
      });
    }
  }

  async removeRole(userId: string, roleName: string): Promise<void> {
    // 检查用户是否存在
    await this.findByIdOrFail(userId);

    // 检查角色是否存在
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new ValidationError({
        field: 'role',
        message: '角色不存在',
      });
    }

    // 删除角色分配
    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
    });
  }
}
```

## 状态管理最佳实践

### 1. Zustand Store

#### 用户状态管理
```typescript
// src/stores/userStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '@prisma/client';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        setUser: (user) => {
          set({ user, isAuthenticated: true, error: null });
        },

        clearUser: () => {
          set({ user: null, isAuthenticated: false, error: null });
        },

        setLoading: (isLoading) => {
          set({ isLoading });
        },

        setError: (error) => {
          set({ error });
        },

        updateUser: (updates) => {
          const { user } = get();
          if (user) {
            set({ user: { ...user, ...updates } });
          }
        },
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'user-store' }
  )
);
```

#### 应用状态管理
```typescript
// src/stores/appStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppState {
  // 主题
  theme: 'light' | 'dark';
  
  // 侧边栏
  sidebarOpen: boolean;
  
  // 通知
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
  
  // 模态框
  modals: Record<string, boolean>;
  
  // 加载状态
  loadingStates: Record<string, boolean>;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
  
  setLoading: (key: string, loading: boolean) => void;
  clearLoading: (key: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      theme: 'light',
      sidebarOpen: true,
      notifications: [],
      modals: {},
      loadingStates: {},

      setTheme: (theme) => {
        set({ theme });
        // 应用主题到DOM
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (sidebarOpen) => {
        set({ sidebarOpen });
      },

      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false,
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // 限制最多50条
        }));
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      openModal: (modalName) => {
        set((state) => ({
          modals: { ...state.modals, [modalName]: true },
        }));
      },

      closeModal: (modalName) => {
        set((state) => ({
          modals: { ...state.modals, [modalName]: false },
        }));
      },

      setLoading: (key, loading) => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, [key]: loading },
        }));
      },

      clearLoading: (key) => {
        set((state) => {
          const newLoadingStates = { ...state.loadingStates };
          delete newLoadingStates[key];
          return { loadingStates: newLoadingStates };
        });
      },
    }),
    { name: 'app-store' }
  )
);
```

### 2. 状态管理Hook

#### API状态Hook
```typescript
// src/hooks/useApiState.ts
import { useState, useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';

interface UseApiStateOptions<T> {
  key: string;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApiState<T>({
  key,
  initialData,
  onSuccess,
  onError,
}: UseApiStateOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const { setLoading, clearLoading } = useAppStore();

  const execute = useCallback(async (
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setLoading(key, true);
      setError(null);
      
      const result = await apiCall();
      setData(result);
      onSuccess?.(result);
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      return null;
    } finally {
      clearLoading(key);
    }
  }, [key, setLoading, clearLoading, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
  }, [initialData]);

  return {
    data,
    error,
    loading: useAppStore.getState().loadingStates[key] || false,
    execute,
    reset,
  };
}
```

#### 表单状态Hook
```typescript
// src/hooks/useFormState.ts
import { useState, useCallback, ChangeEvent } from 'react';

interface FormField {
  value: any;
  error: string | null;
  touched: boolean;
}

interface UseFormStateOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit: (values: T) => Promise<void> | void;
}

interface UseFormStateResult<T> {
  values: T;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isValid: boolean;
  
  // Actions
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string | null) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  handleChange: (field: keyof T) => (e: ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
}

export function useFormState<T extends Record<string, any>>(
  options: UseFormStateOptions<T>
): UseFormStateResult<T> {
  const { initialValues, validate, onSubmit } = options;
  
  const [fields, setFields] = useState<Record<keyof T, FormField>>(
    Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = {
        value: initialValues[key as keyof T],
        error: null,
        touched: false,
      };
      return acc;
    }, {} as Record<keyof T, FormField>)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const values = Object.keys(fields).reduce((acc, key) => {
    acc[key as keyof T] = fields[key as keyof T].value;
    return acc;
  }, {} as T);

  const errors = Object.keys(fields).reduce((acc, key) => {
    acc[key] = fields[key as keyof T].error;
    return acc;
  }, {} as Record<string, string | null>);

  const touched = Object.keys(fields).reduce((acc, key) => {
    acc[key] = fields[key as keyof T].touched;
    return acc;
  }, {} as Record<string, boolean>);

  const isDirty = Object.keys(fields).some(
    key => fields[key as keyof T].value !== initialValues[key as keyof T]
  );

  const isValid = Object.values(errors).every(error => error === null);

  const setValue = useCallback((field: keyof T, value: any) => {
    setFields(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        error: null, // 清除错误
      },
    }));
  }, []);

  const setError = useCallback((field: keyof T, error: string | null) => {
    setFields(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
      },
    }));
  }, []);

  const setTouched = useCallback((field: keyof T, touched: boolean) => {
    setFields(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched,
      },
    }));
  }, []);

  const handleChange = useCallback((field: keyof T) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValue(field, value);
  }, [setValue]);

  const handleBlur = useCallback((field: keyof T) => () => {
    setTouched(field, true);
    
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[field as string]) {
        setError(field, validationErrors[field as string]);
      }
    }
  }, [validate, values, setError]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    // 验证所有字段
    let validationErrors: Record<string, string> = {};
    if (validate) {
      validationErrors = validate(values);
    }

    // 设置错误状态
    Object.keys(validationErrors).forEach(field => {
      setError(field as keyof T, validationErrors[field]);
    });

    // 如果有错误，不提交
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, setError, onSubmit, isSubmitting]);

  const resetForm = useCallback(() => {
    setFields(
      Object.keys(initialValues).reduce((acc, key) => {
        acc[key as keyof T] = {
          value: initialValues[key as keyof T],
          error: null,
          touched: false,
        };
        return acc;
      }, {} as Record<keyof T, FormField>)
    );
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isDirty,
    isValid,
    setValue,
    setError,
    setTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
}
```

## 测试最佳实践

### 1. 单元测试

#### 组件测试
```typescript
// src/components/__tests__/UserProfile.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfile } from '../UserProfile';
import { useUserStore } from '@/stores/userStore';

// Mock the store
jest.mock('@/stores/userStore');

const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  fullName: 'Test User',
  isActive: true,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UserProfile', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('renders user information correctly', () => {
    render(<UserProfile user={mockUser} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<UserProfile user={mockUser} onEdit={mockOnEdit} />);

    fireEvent.click(screen.getByText('编辑'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });

  it('calls onDelete when delete button is clicked', () => {
    const mockOnDelete = jest.fn();
    render(<UserProfile user={mockUser} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByText('删除'));
    expect(mockOnDelete).toHaveBeenCalledWith(mockUser.id);
  });

  it('enters edit mode when edit button is clicked', () => {
    render(<UserProfile user={mockUser} />);

    fireEvent.click(screen.getByText('编辑'));
    
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByText('保存')).toBeInTheDocument();
  });

  it('updates user name when in edit mode', async () => {
    const mockOnEdit = jest.fn();
    render(<UserProfile user={mockUser} onEdit={mockOnEdit} />);

    // Enter edit mode
    fireEvent.click(screen.getByText('编辑'));

    // Update name
    const input = screen.getByDisplayValue('Test User');
    fireEvent.change(input, { target: { value: 'Updated User' } });

    // Save changes
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith({
        ...mockUser,
        name: 'Updated User',
      });
    });
  });

  it('does not show delete button when onDelete is not provided', () => {
    render(<UserProfile user={mockUser} />);

    expect(screen.queryByText('删除')).not.toBeInTheDocument();
  });
});
```

#### Hook测试
```typescript
// src/hooks/__tests__/useApiState.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiState } from '../useApiState';
import { useAppStore } from '@/stores/appStore';

// Mock the store
jest.mock('@/stores/appStore');

const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

describe('useApiState', () => {
  const mockSetLoading = jest.fn();
  const mockClearLoading = jest.fn();

  beforeEach(() => {
    mockSetLoading.mockClear();
    mockClearLoading.mockClear();
    
    mockUseAppStore.mockReturnValue({
      setLoading: mockSetLoading,
      clearLoading: mockClearLoading,
      loadingStates: {},
    } as any);
  });

  it('initializes with initial data', () => {
    const { result } = renderHook(() =>
      useApiState({
        key: 'test-key',
        initialData: { message: 'initial' },
      })
    );

    expect(result.current.data).toEqual({ message: 'initial' });
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('handles successful API call', async () => {
    const mockSuccessData = { message: 'success' };
    const mockApiCall = jest.fn().mockResolvedValue(mockSuccessData);
    const mockOnSuccess = jest.fn();

    const { result } = renderHook(() =>
      useApiState({
        key: 'test-key',
        onSuccess: mockOnSuccess,
      })
    );

    await act(async () => {
      const response = await result.current.execute(mockApiCall);
      expect(response).toEqual(mockSuccessData);
    });

    expect(mockSetLoading).toHaveBeenCalledWith('test-key', true);
    expect(mockClearLoading).toHaveBeenCalledWith('test-key');
    expect(mockOnSuccess).toHaveBeenCalledWith(mockSuccessData);
    expect(result.current.data).toEqual(mockSuccessData);
    expect(result.current.error).toBeNull();
  });

  it('handles failed API call', async () => {
    const mockError = new Error('API Error');
    const mockApiCall = jest.fn().mockRejectedValue(mockError);
    const mockOnError = jest.fn();

    const { result } = renderHook(() =>
      useApiState({
        key: 'test-key',
        onError: mockOnError,
      })
    );

    await act(async () => {
      const response = await result.current.execute(mockApiCall);
      expect(response).toBeNull();
    });

    expect(mockSetLoading).toHaveBeenCalledWith('test-key', true);
    expect(mockClearLoading).toHaveBeenCalledWith('test-key');
    expect(mockOnError).toHaveBeenCalledWith(mockError);
    expect(result.current.error).toEqual(mockError);
  });

  it('resets state', () => {
    const { result } = renderHook(() =>
      useApiState({
        key: 'test-key',
        initialData: { message: 'initial' },
      })
    );

    // Simulate some state change
    act(() => {
      result.current.setData({ message: 'changed' });
    });

    expect(result.current.data).toEqual({ message: 'changed' });

    // Reset state
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toEqual({ message: 'initial' });
    expect(result.current.error).toBeNull();
  });
});
```

### 2. 集成测试

#### API集成测试
```typescript
// src/tests/integration/api/users.test.ts
import request from 'supertest';
import { app } from '@/app';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/utils/crypto';

describe('Users API Integration', () => {
  beforeAll(async () => {
    // Clean up database
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
  });

  afterAll(async () => {
    // Clean up database
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        isActive: true,
      });
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return validation error for duplicate username', async () => {
      const userData = {
        username: 'testuser',
        email: 'another@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        username: 'newuser',
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Create test users
      await prisma.user.createMany({
        data: [
          {
            username: 'user1',
            email: 'user1@example.com',
            passwordHash: await hashPassword('password123'),
            fullName: 'User One',
            isActive: true,
          },
          {
            username: 'user2',
            email: 'user2@example.com',
            passwordHash: await hashPassword('password123'),
            fullName: 'User Two',
            isActive: false,
          },
        ],
      });
    });

    it('should return list of users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
    });

    it('should filter users by search term', async () => {
      const response = await request(app)
        .get('/api/users?search=user1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].username).toBe('user1');
    });

    it('should filter users by status', async () => {
      const response = await request(app)
        .get('/api/users?status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every((user: any) => user.isActive)).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(1);
    });
  });

  describe('GET /api/users/:id', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          username: 'getuser',
          email: 'getuser@example.com',
          passwordHash: await hashPassword('password123'),
          fullName: 'Get User',
          isActive: true,
        },
      });
    });

    it('should return user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
      });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });
  });
});
```

## 性能优化最佳实践

### 1. React性能优化

#### 组件优化
```typescript
import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

// 使用memo避免不必要的重新渲染
const OptimizedItem = memo(({ item, onItemClick }: { 
  item: any; 
  onItemClick: (item: any) => void; 
}) => {
  return (
    <div onClick={() => onItemClick(item)}>
      {item.name}
    </div>
  );
});

OptimizedItem.displayName = 'OptimizedItem';

interface LargeListProps {
  items: any[];
  onItemClick: (item: any) => void;
}

export const LargeList: React.FC<LargeListProps> = ({ items, onItemClick }) => {
  // 使用useMemo缓存计算结果
  const processedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      displayName: `${item.firstName} ${item.lastName}`,
    }));
  }, [items]);

  // 使用useCallback缓存函数
  const handleItemClick = useCallback((item: any) => {
    onItemClick(item);
  }, [onItemClick]);

  // 虚拟化长列表
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <OptimizedItem 
        item={processedItems[index]} 
        onItemClick={handleItemClick} 
      />
    </div>
  );

  return (
    <List
      height={400}
      itemCount={processedItems.length}
      itemSize={35}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

#### 图片优化
```typescript
import React from 'react';
import Image from 'next/image';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  placeholder = 'blur',
  blurDataURL,
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [imageRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleLoad = () => {
    setIsLoaded(true);
  };

  if (!isIntersecting) {
    return (
      <div
        ref={imageRef}
        className={className}
        style={{
          width,
          height,
          backgroundColor: '#f3f4f6',
        }}
      />
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};
```

### 2. API性能优化

#### 缓存策略
```typescript
// src/lib/cache/ApiCache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanup(): void {
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }

    // Remove oldest entries if cache is too large
    if (this.cache.size > this.maxSize) {
      const keys = Array.from(this.cache.keys());
      const keysToDelete = keys.slice(0, keys.length - this.maxSize);
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cleanup();
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance
export const apiCache = new ApiCache();
```

#### 缓存装饰器
```typescript
// src/lib/decorators/cache.ts
import { apiCache } from '@/lib/cache/ApiCache';

export function cache(ttl: number = 60000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}.${propertyKey}.${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = apiCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Call original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      apiCache.set(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

export function invalidateCache(pattern: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      // Invalidate cache
      apiCache.invalidate(pattern);
      
      return result;
    };

    return descriptor;
  };
}
```

### 3. 数据库性能优化

#### 查询优化
```typescript
// src/lib/services/optimizedUserService.ts
import { PrismaClient } from '@prisma/client';
import { cache, invalidateCache } from '@/lib/decorators/cache';

export class OptimizedUserService {
  constructor(private prisma: PrismaClient) {}

  @cache(300000) // 5 minutes cache
  async getUsersWithRoles(params: {
    skip?: number;
    take?: number;
    search?: string;
    status?: string;
  } = {}) {
    const { skip = 0, take = 10, search, status } = params;

    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.isActive = status === 'active';
    }

    // Use include for better performance than separate queries
    return this.prisma.user.findMany({
      skip,
      take,
      where,
      include: {
        roles: {
          include: {
            role: {
              select: {
                name: true,
                permissions: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @invalidateCache('users.*')
  async createUser(data: any) {
    return this.prisma.user.create({
      data,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  @invalidateCache('users.*')
  async updateUser(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  // Batch operations for better performance
  async createManyUsers(usersData: any[]) {
    return this.prisma.user.createMany({
      data: usersData,
      skipDuplicates: true,
    });
  }

  async updateManyUsers(updates: Array<{ id: string; data: any }>) {
    return this.prisma.$transaction(
      updates.map(({ id, data }) =>
        this.prisma.user.update({
          where: { id },
          data,
        })
      )
    );
  }
}
```

#### 连接池优化
```typescript
// src/lib/database/connectionPool.ts
import { PrismaClient } from '@prisma/client';

class ConnectionPool {
  private static instance: ConnectionPool;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
      // Connection pool settings
      connectionLimit: 10,
      poolTimeout: 30000,
      queueLimit: 0,
    });
  }

  public static getInstance(): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool();
    }
    return ConnectionPool.instance;
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('Database disconnected successfully');
    } catch (error) {
      console.error('Database disconnection failed:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export const connectionPool = ConnectionPool.getInstance();
```

## 安全最佳实践

### 1. 输入验证

#### 验证器
```typescript
// src/lib/validators/userValidator.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(50, '用户名最多50个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  email: z.string()
    .email('邮箱格式不正确'),
  password: z.string()
    .min(8, '密码至少8个字符')
    .regex(/[A-Z]/, '密码必须包含大写字母')
    .regex(/[a-z]/, '密码必须包含小写字母')
    .regex(/[0-9]/, '密码必须包含数字')
    .regex(/[^A-Za-z0-9]/, '密码必须包含特殊字符'),
  fullName: z.string()
    .min(2, '姓名至少2个字符')
    .max(100, '姓名最多100个字符')
    .optional(),
  avatar: z.string()
    .url('头像URL格式不正确')
    .optional(),
});

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string().cuid(),
});

export const userQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  role: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['username', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryParams = z.infer<typeof userQuerySchema>;

export function validateUserInput(data: unknown): CreateUserInput {
  return createUserSchema.parse(data);
}

export function validateUserUpdate(data: unknown): UpdateUserInput {
  return updateUserSchema.parse(data);
}

export function validateUserQuery(data: unknown): UserQueryParams {
  return userQuerySchema.parse(data);
}
```

#### 输入清理
```typescript
// src/lib/utils/sanitizer.ts
import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove JavaScript protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
```

### 2. 密码安全

#### 密码加密
```typescript
// src/lib/utils/crypto.ts
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function generateApiKey(): string {
  return `sk_${generateSecureToken(32)}`;
}

export function encryptData(data: string, key: string): string {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptData(encryptedData: string, key: string): string {
  const algorithm = 'aes-256-gcm';
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipher(algorithm, key);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### 3. JWT安全

#### JWT工具
```typescript
// src/lib/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;
const JWT_EXPIRES_IN = '7d';
const JWT_REFRESH_EXPIRES_IN = '30d';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return true;
    
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
}
```

## 总结

本文档提供了S100海事服务系统的完整代码示例和最佳实践，涵盖了：

1. **React组件最佳实践**: 函数组件、自定义Hook、性能优化
2. **TypeScript最佳实践**: 类型定义、类型守卫、泛型工具
3. **API开发最佳实践**: 路由结构、中间件、错误处理
4. **数据库操作最佳实践**: Prisma模型、服务类、性能优化
5. **状态管理最佳实践**: Zustand store、状态管理Hook
6. **测试最佳实践**: 单元测试、集成测试
7. **性能优化最佳实践**: React优化、API缓存、数据库优化
8. **安全最佳实践**: 输入验证、密码安全、JWT安全

遵循这些最佳实践将帮助您构建高质量、可维护、安全和高性能的应用程序。

---

*最后更新: 2024-01-01*