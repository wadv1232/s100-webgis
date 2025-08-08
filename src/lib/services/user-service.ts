import { BaseService } from './base-service'
import { UserRole, Permission } from '@prisma/client'
import { hasPermission } from '@/lib/auth/permissions'

// 用户相关类型定义
export interface CreateUserParams {
  email: string
  username: string
  name?: string
  role: UserRole
  nodeId?: string
  isActive?: boolean
  permissions?: string[]
}

export interface UpdateUserParams {
  email?: string
  username?: string
  name?: string
  role?: UserRole
  nodeId?: string
  isActive?: boolean
  permissions?: string[]
}

export interface UserQueryParams {
  page?: number
  limit?: number
  role?: UserRole
  search?: string
  isActive?: boolean
}

export interface UserResult {
  id: string
  email: string
  username: string
  name?: string
  role: UserRole
  nodeId?: string
  nodeName?: string
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  permissions: string[]
}

// 用户服务类
export class UserService extends BaseService {
  constructor() {
    super('user')
  }

  // 创建用户
  async createUser(params: CreateUserParams): Promise<UserResult> {
    const { email, username, name, role, nodeId, isActive = true, permissions = [] } = params

    // 验证必填字段
    if (!email || !username || !role) {
      throw new Error('Email, username, and role are required')
    }

    // 检查用户是否已存在
    const existingUser = await this.findExistingUser(email, username)
    if (existingUser) {
      throw new Error('User with this email or username already exists')
    }

    // 验证角色
    if (!Object.values(UserRole).includes(role)) {
      throw new Error('Invalid role')
    }

    // 创建用户
    const newUser = await this.create({
      email,
      username,
      name,
      role,
      nodeId,
      isActive,
      userPermissions: permissions.length > 0 ? {
        create: permissions.map(permissionName => ({
          permission: permissionName as Permission,
          isGranted: true
        }))
      } : undefined
    }, {
      node: {
        select: {
          id: true,
          name: true,
          type: true
        }
      },
      userPermissions: true
    })

    return this.transformUser(newUser)
  }

  // 获取用户列表
  async getUsers(params: UserQueryParams = {}): Promise<{
    users: UserResult[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    const { page = 1, limit = 10, role, search, isActive } = params

    // 构建查询条件
    const where: any = {}
    
    if (role) {
      where.role = role
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive
    }
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 分页查询
    const result = await this.findWithPagination({
      page,
      limit,
      where,
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        userPermissions: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // 转换用户数据
    const users = result.data.map(user => this.transformUser(user))

    return {
      users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      }
    }
  }

  // 获取单个用户
  async getUserById(id: string): Promise<UserResult | null> {
    const user = await this.findById(id, {
      node: {
        select: {
          id: true,
          name: true,
          type: true
        }
      },
      userPermissions: true
    })

    return user ? this.transformUser(user) : null
  }

  // 更新用户
  async updateUser(id: string, params: UpdateUserParams): Promise<UserResult> {
    const { email, username, name, role, nodeId, isActive, permissions } = params

    // 检查用户是否存在
    const existingUser = await this.findById(id)
    if (!existingUser) {
      throw new Error('User not found')
    }

    // 检查邮箱和用户名冲突
    if (email || username) {
      const conflictUser = await this.findExistingUser(
        email || existingUser.email,
        username || existingUser.username,
        id
      )
      if (conflictUser) {
        throw new Error('User with this email or username already exists')
      }
    }

    // 验证角色
    if (role && !Object.values(UserRole).includes(role)) {
      throw new Error('Invalid role')
    }

    // 构建更新数据
    const updateData: any = {}
    if (email !== undefined) updateData.email = email
    if (username !== undefined) updateData.username = username
    if (name !== undefined) updateData.name = name
    if (role !== undefined) updateData.role = role
    if (nodeId !== undefined) updateData.nodeId = nodeId
    if (isActive !== undefined) updateData.isActive = isActive

    // 更新用户
    const updatedUser = await this.update(id, updateData, {
      node: {
        select: {
          id: true,
          name: true,
          type: true
        }
      },
      userPermissions: true
    })

    // 更新权限（如果提供了）
    if (permissions) {
      await this.updateUserPermissions(id, permissions)
      // 重新获取用户数据以包含更新后的权限
      const userWithPermissions = await this.findById(id, {
        node: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        userPermissions: true
      })
      return this.transformUser(userWithPermissions)
    }

    return this.transformUser(updatedUser)
  }

  // 删除用户
  async deleteUser(id: string): Promise<boolean> {
    const user = await this.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    return await this.delete(id)
  }

  // 检查用户权限
  async checkUserPermission(userId: string, permission: Permission): Promise<boolean> {
    const user = await this.findById(userId, {
      userPermissions: true
    })

    if (!user) {
      return false
    }

    const userPermissions = user.userPermissions.map((up: any) => up.permission)
    return hasPermission(user.role, permission, userPermissions as Permission[])
  }

  // 获取用户权限
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.findById(userId, {
      userPermissions: true
    })

    if (!user) {
      return []
    }

    return user.userPermissions.map((up: any) => up.permission)
  }

  // 私有方法：检查现有用户
  private async findExistingUser(email: string, username: string, excludeId?: string): Promise<any> {
    const where: any = {
      OR: [
        { email },
        { username }
      ]
    }

    if (excludeId) {
      where.NOT = { id: excludeId }
    }

    return await this.model.findFirst({ where })
  }

  // 私有方法：更新用户权限
  private async updateUserPermissions(userId: string, permissions: string[]): Promise<void> {
    // 删除现有权限
    await this.db.userPermission.deleteMany({
      where: { userId }
    })

    // 添加新权限
    if (permissions.length > 0) {
      await this.db.userPermission.createMany({
        data: permissions.map(permissionName => ({
          userId,
          permission: permissionName as Permission,
          isGranted: true
        }))
      })
    }
  }

  // 私有方法：转换用户数据
  private transformUser(user: any): UserResult {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      nodeId: user.nodeId,
      nodeName: user.node?.name,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      permissions: user.userPermissions.map((up: any) => up.permission)
    }
  }
}

// 导出服务实例
export const userService = new UserService()