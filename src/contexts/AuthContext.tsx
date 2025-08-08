'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserRole, Permission } from '@prisma/client'
import { hasPermission, getAccessibleMenuItems } from '@/lib/auth/permissions'

interface User {
  id: string
  email: string
  username: string
  name?: string
  role: UserRole
  nodeId?: string
  isActive: boolean
  lastLoginAt?: Date
  permissions?: Permission[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  getAccessibleMenuItems: () => Array<{
    name: string
    href: string
    icon: string
    requiredPermissions: Permission[]
  }>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 模拟用户数据 - 在实际应用中应该从API获取
  const mockUsers: User[] = [
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
    {
      id: '7',
      email: 'developer@ecdis-company.com',
      username: 'developer',
      name: '开发者',
      role: UserRole.DEVELOPER,
      isActive: true,
    },
  ]

  useEffect(() => {
    // 检查本地存储中的用户信息
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error('Failed to parse user data:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    // 模拟API调用 - 在实际应用中应该调用真实的登录API
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(u => u.email === email)
        
        if (foundUser && password === 'password') {
          const userData = {
            ...foundUser,
            lastLoginAt: new Date(),
          }
          
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          setIsLoading(false)
          resolve(true)
        } else {
          setIsLoading(false)
          resolve(false)
        }
      }, 1000)
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false
    return hasPermission(user.role, permission, user.permissions)
  }

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false
    return permissions.some(permission => checkPermission(permission))
  }

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false
    return permissions.every(permission => checkPermission(permission))
  }

  const getAccessibleMenu = () => {
    if (!user) return []
    return getAccessibleMenuItems(user.role)
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    getAccessibleMenuItems: getAccessibleMenu,
    isLoading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function ProtectedComponent({ 
  permissions, 
  requireAll = false, 
  fallback = null, 
  children 
}: { 
  permissions: Permission[]
  requireAll?: boolean
  fallback?: ReactNode
  children: ReactNode 
}) {
  const { hasAnyPermission, hasAllPermissions } = useAuth()
  
  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions)
  
  if (!hasAccess) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}