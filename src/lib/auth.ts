import { NextRequest } from 'next/server'
import { UserRole, Permission } from '@prisma/client'
import { hasPermission } from './auth/permissions'
import { federatedJWTValidator, ValidatedToken } from './federated-jwt-validator'

// NextAuth.js 配置选项
export const authOptions = {
  providers: [
    // 在实际应用中，这里应该配置真实的认证提供者
    // 例如：GitHub, Google, 或者自定义的数据库认证
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.nodeId = user.nodeId
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.role = token.role
        session.user.nodeId = token.nodeId
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
}

// 模拟用户数据库 - 在实际应用中应该从数据库获取
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    username: 'admin',
    name: '系统管理员',
    role: UserRole.ADMIN,
    isActive: true,
  },
  {
    id: '2',
    email: 'node-admin@example.com',
    username: 'node_admin',
    name: '节点管理员',
    role: UserRole.NODE_ADMIN,
    nodeId: 'china-national',
    isActive: true,
  },
  {
    id: '3',
    email: 'data-manager@example.com',
    username: 'data_manager',
    name: '数据管理员',
    role: UserRole.DATA_MANAGER,
    nodeId: 'shanghai-port',
    isActive: true,
  },
  {
    id: '4',
    email: 'service-manager@example.com',
    username: 'service_manager',
    name: '服务管理员',
    role: UserRole.SERVICE_MANAGER,
    isActive: true,
  },
  {
    id: '5',
    email: 'user@example.com',
    username: 'user',
    name: '普通用户',
    role: UserRole.USER,
    isActive: true,
  },
  {
    id: '6',
    email: 'guest@example.com',
    username: 'guest',
    name: '游客',
    role: UserRole.GUEST,
    isActive: true,
  },
]

export interface AuthUser {
  id: string
  email: string
  username: string
  name?: string
  role: UserRole
  nodeId?: string
  isActive: boolean
  permissions: Permission[]
  federated?: boolean
  issuer?: string
  tokenPayload?: any
}

// 从请求头中获取认证信息
export async function auth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    
    // 尝试联邦JWT验证
    const validationResult: ValidatedToken = await federatedJWTValidator.validateToken(token)
    
    if (validationResult.isValid && validationResult.localUser) {
      // 联邦认证成功
      const localUser = validationResult.localUser
      const permissions = getUserPermissions(localUser.role)
      
      return {
        id: localUser.id,
        email: localUser.email,
        username: localUser.username,
        name: localUser.name,
        role: localUser.role,
        nodeId: localUser.nodeId,
        isActive: localUser.isActive,
        permissions,
        federated: true,
        issuer: validationResult.issuer,
        tokenPayload: validationResult.payload
      }
    }
    
    // 如果联邦认证失败，回退到传统认证
    const user = mockUsers.find(u => u.email === token)
    
    if (!user || !user.isActive) {
      return null
    }

    // 获取用户权限
    const permissions = getUserPermissions(user.role)

    return {
      ...user,
      permissions,
      federated: false
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// 根据用户角色获取权限
function getUserPermissions(role: UserRole): Permission[] {
  const rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: [
      // 节点管理权限
      Permission.NODE_CREATE,
      Permission.NODE_READ,
      Permission.NODE_UPDATE,
      Permission.NODE_DELETE,
      // 数据管理权限
      Permission.DATASET_CREATE,
      Permission.DATASET_READ,
      Permission.DATASET_UPDATE,
      Permission.DATASET_DELETE,
      Permission.DATASET_PUBLISH,
      // 服务管理权限
      Permission.SERVICE_CREATE,
      Permission.SERVICE_READ,
      Permission.SERVICE_UPDATE,
      Permission.SERVICE_DELETE,
      // 用户管理权限
      Permission.USER_CREATE,
      Permission.USER_READ,
      Permission.USER_UPDATE,
      Permission.USER_DELETE,
      // 系统管理权限
      Permission.SYSTEM_CONFIG,
      Permission.SYSTEM_MONITOR,
    ],
    [UserRole.NODE_ADMIN]: [
      Permission.NODE_READ,
      Permission.NODE_UPDATE,
      Permission.DATASET_CREATE,
      Permission.DATASET_READ,
      Permission.DATASET_UPDATE,
      Permission.DATASET_PUBLISH,
      Permission.SERVICE_CREATE,
      Permission.SERVICE_READ,
      Permission.SERVICE_UPDATE,
      Permission.USER_READ,
      Permission.USER_CREATE,
      Permission.USER_UPDATE,
      Permission.SYSTEM_MONITOR,
    ],
    [UserRole.DATA_MANAGER]: [
      Permission.NODE_READ,
      Permission.DATASET_CREATE,
      Permission.DATASET_READ,
      Permission.DATASET_UPDATE,
      Permission.DATASET_PUBLISH,
      Permission.SERVICE_READ,
      Permission.SYSTEM_MONITOR,
    ],
    [UserRole.SERVICE_MANAGER]: [
      Permission.NODE_READ,
      Permission.DATASET_READ,
      Permission.SERVICE_CREATE,
      Permission.SERVICE_READ,
      Permission.SERVICE_UPDATE,
      Permission.SERVICE_DELETE,
      Permission.SYSTEM_MONITOR,
    ],
    [UserRole.USER]: [
      Permission.NODE_READ,
      Permission.DATASET_READ,
      Permission.SERVICE_READ,
    ],
    [UserRole.GUEST]: [
      Permission.NODE_READ,
      Permission.DATASET_READ,
    ],
  }

  return rolePermissions[role] || []
}

// 检查用户是否有特定权限
export function hasUserPermission(user: AuthUser, permission: Permission): boolean {
  return user.permissions.includes(permission)
}

// 检查用户是否有任一权限
export function hasAnyUserPermission(user: AuthUser, permissions: Permission[]): boolean {
  return permissions.some(permission => hasUserPermission(user, permission))
}

// 检查用户是否有所有权限
export function hasAllUserPermissions(user: AuthUser, permissions: Permission[]): boolean {
  return permissions.every(permission => hasUserPermission(user, permission))
}

// 中间件：要求用户已认证
export function requireAuth(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const user = await auth(request)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    return handler(request, user)
  }
}

// 中间件：要求特定权限
export function requirePermission(permission: Permission) {
  return function(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
    return requireAuth(async (request: user) => {
      if (!hasUserPermission(user, permission)) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      return handler(request, user)
    })
  }
}

// 中间件：要求任一权限
export function requireAnyPermission(permissions: Permission[]) {
  return function(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
    return requireAuth(async (request, user) => {
      if (!hasAnyUserPermission(user, permissions)) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      return handler(request, user)
    })
  }
}