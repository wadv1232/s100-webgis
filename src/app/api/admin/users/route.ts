import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiErrorHandler } from '@/lib/api-error'
import bcrypt from 'bcryptjs'

interface User {
  id: string
  email: string
  username: string
  name?: string
  role: string
  node_id?: string
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
  node?: {
    id: string
    name: string
    type: string
  }
  permissions?: string[]
}

interface CreateUserRequest {
  email: string
  username: string
  name?: string
  role?: string
  node_id?: string
  password?: string
  permissions?: string[]
}

// GET /admin/users - 列出有权访问本节点管理后台的用户
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const nodeId = searchParams.get('node_id')
    const isActive = searchParams.get('is_active')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const whereClause: any = {}
    if (role) whereClause.role = role
    if (nodeId) whereClause.nodeId = nodeId
    if (isActive !== null) whereClause.isActive = isActive === 'true'
    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: whereClause,
        include: {
          node: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          userPermissions: {
            select: {
              permission: true,
              isGranted: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: [
          { role: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      db.user.count({ where: whereClause })
    ])

    const response: User[] = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      node_id: user.nodeId,
      is_active: user.isActive,
      last_login_at: user.lastLoginAt?.toISOString(),
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
      node: user.node ? {
        id: user.node.id,
        name: user.node.name,
        type: user.node.type
      } : undefined,
      permissions: user.userPermissions
        .filter(up => up.isGranted)
        .map(up => up.permission)
    }))

    return NextResponse.json({
      users: response,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'list_users' })
  }
}

// POST /admin/users - 创建一个新用户
export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json()
    const {
      email,
      username,
      name,
      role = 'USER',
      node_id,
      password,
      permissions = []
    } = body

    // 验证必填字段
    if (!email || !username) {
      return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
        required: ['email', 'username'],
        provided: Object.keys(body)
      })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return ApiErrorHandler.createErrorResponse('INVALID_EMAIL', { email })
    }

    // 验证用户名格式
    if (username.length < 3) {
      return ApiErrorHandler.createErrorResponse('INVALID_USERNAME', {
        username,
        message: 'Username must be at least 3 characters long'
      })
    }

    // 验证角色
    const validRoles = ['ADMIN', 'NODE_ADMIN', 'DATA_MANAGER', 'SERVICE_MANAGER', 'DEVELOPER', 'USER', 'GUEST']
    if (!validRoles.includes(role)) {
      return ApiErrorHandler.createErrorResponse('INVALID_ROLE', {
        role,
        valid_roles: validRoles
      })
    }

    // 如果指定了节点，验证节点是否存在
    if (node_id) {
      const node = await db.node.findUnique({
        where: { id: node_id }
      })

      if (!node) {
        return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { node_id })
      }
    }

    // 检查邮箱是否已存在
    const existingEmail = await db.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return ApiErrorHandler.createErrorResponse('EMAIL_ALREADY_EXISTS', { email })
    }

    // 检查用户名是否已存在
    const existingUsername = await db.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return ApiErrorHandler.createErrorResponse('USERNAME_ALREADY_EXISTS', { username })
    }

    // 生成默认密码（如果未提供）
    const defaultPassword = password || `Temp${Math.random().toString(36).slice(-8)}`
    const hashedPassword = await bcrypt.hash(defaultPassword, 12)

    // 创建用户
    const newUser = await db.user.create({
      data: {
        email,
        username,
        name,
        role: role as any,
        nodeId: node_id,
        isActive: true
      },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    })

    // 添加用户权限
    if (permissions.length > 0) {
      const validPermissions = [
        'NODE_CREATE', 'NODE_READ', 'NODE_UPDATE', 'NODE_DELETE',
        'DATASET_CREATE', 'DATASET_READ', 'DATASET_UPDATE', 'DATASET_DELETE', 'DATASET_PUBLISH',
        'SERVICE_CREATE', 'SERVICE_READ', 'SERVICE_UPDATE', 'SERVICE_DELETE',
        'USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE',
        'SYSTEM_CONFIG', 'SYSTEM_MONITOR',
        'API_READ', 'API_TEST', 'API_KEY_CREATE', 'API_KEY_MANAGE'
      ]

      const validUserPermissions = permissions.filter(p => validPermissions.includes(p))

      if (validUserPermissions.length > 0) {
        await db.userPermission.createMany({
          data: validUserPermissions.map(permission => ({
            userId: newUser.id,
            permission: permission as any,
            isGranted: true
          }))
        })
      }
    }

    const response: User = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      node_id: newUser.nodeId,
      is_active: newUser.isActive,
      created_at: newUser.createdAt.toISOString(),
      updated_at: newUser.updatedAt.toISOString(),
      node: newUser.node ? {
        id: newUser.node.id,
        name: newUser.node.name,
        type: newUser.node.type
      } : undefined,
      permissions
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: response,
      temporary_password: password ? undefined : defaultPassword
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'create_user' })
  }
}