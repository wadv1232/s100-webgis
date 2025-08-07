import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiErrorHandler } from '@/lib/api-error'

interface ApiKey {
  id: string
  key: string
  name: string
  description?: string
  user_id: string
  user_email: string
  user_name?: string
  permissions: string[]
  quota?: number
  quota_used: number
  quota_reset_at?: string
  expires_at?: string
  last_used_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CreateApiKeyRequest {
  name: string
  description?: string
  user_id: string
  permissions?: string[]
  quota?: number
  expires_at?: string
}

// 生成随机API密钥
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'sk-'
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// GET /admin/apikeys - 列出所有已生成的API密钥
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const isActive = searchParams.get('is_active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const whereClause: any = {}
    if (userId) whereClause.userId = userId
    if (isActive !== null) whereClause.isActive = isActive === 'true'

    const skip = (page - 1) * limit

    const [apiKeys, total] = await Promise.all([
      db.apiKey.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.apiKey.count({ where: whereClause })
    ])

    const response: ApiKey[] = apiKeys.map(apiKey => ({
      id: apiKey.id,
      key: apiKey.key,
      name: apiKey.name,
      description: apiKey.description,
      user_id: apiKey.userId,
      user_email: apiKey.user.email,
      user_name: apiKey.user.name,
      permissions: apiKey.permissions ? JSON.parse(apiKey.permissions) : [],
      quota: apiKey.quota,
      quota_used: apiKey.quotaUsed,
      quota_reset_at: apiKey.quotaResetAt?.toISOString(),
      expires_at: apiKey.expiresAt?.toISOString(),
      last_used_at: apiKey.lastUsedAt?.toISOString(),
      is_active: apiKey.isActive,
      created_at: apiKey.createdAt.toISOString(),
      updated_at: apiKey.updatedAt.toISOString()
    }))

    return NextResponse.json({
      api_keys: response,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching API keys:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'list_apikeys' })
  }
}

// POST /admin/apikeys - 为特定用户或应用生成一个新的API密钥
export async function POST(request: NextRequest) {
  try {
    const body: CreateApiKeyRequest = await request.json()
    const {
      name,
      description,
      user_id,
      permissions = [],
      quota,
      expires_at
    } = body

    // 验证必填字段
    if (!name || !user_id) {
      return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
        required: ['name', 'user_id'],
        provided: Object.keys(body)
      })
    }

    // 验证用户是否存在
    const user = await db.user.findUnique({
      where: { id: user_id }
    })

    if (!user) {
      return ApiErrorHandler.createErrorResponse('USER_NOT_FOUND', { user_id })
    }

    // 验证权限
    const validPermissions = [
      'NODE_CREATE', 'NODE_READ', 'NODE_UPDATE', 'NODE_DELETE',
      'DATASET_CREATE', 'DATASET_READ', 'DATASET_UPDATE', 'DATASET_DELETE', 'DATASET_PUBLISH',
      'SERVICE_CREATE', 'SERVICE_READ', 'SERVICE_UPDATE', 'SERVICE_DELETE',
      'USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE',
      'SYSTEM_CONFIG', 'SYSTEM_MONITOR',
      'API_READ', 'API_TEST', 'API_KEY_CREATE', 'API_KEY_MANAGE'
    ]

    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p))
    if (invalidPermissions.length > 0) {
      return ApiErrorHandler.createErrorResponse('INVALID_PERMISSIONS', {
        permissions: invalidPermissions,
        valid_permissions: validPermissions
      })
    }

    // 验证过期时间格式
    let expiresAtDate = null
    if (expires_at) {
      expiresAtDate = new Date(expires_at)
      if (isNaN(expiresAtDate.getTime())) {
        return ApiErrorHandler.createErrorResponse('INVALID_EXPIRES_AT', {
          expires_at,
          message: 'Invalid date format. Use ISO 8601 format.'
        })
      }

      if (expiresAtDate <= new Date()) {
        return ApiErrorHandler.createErrorResponse('INVALID_EXPIRES_AT', {
          expires_at,
          message: 'Expiration date must be in the future.'
        })
      }
    }

    // 验证配额
    if (quota !== undefined && quota < 0) {
      return ApiErrorHandler.createErrorResponse('INVALID_QUOTA', {
        quota,
        message: 'Quota must be a positive number.'
      })
    }

    // 生成API密钥
    const apiKey = generateApiKey()

    // 创建API密钥记录
    const newApiKey = await db.apiKey.create({
      data: {
        key: apiKey,
        name,
        description,
        userId: user_id,
        permissions: JSON.stringify(permissions),
        quota,
        quotaUsed: 0,
        expiresAt: expiresAtDate,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    const response: ApiKey = {
      id: newApiKey.id,
      key: newApiKey.key,
      name: newApiKey.name,
      description: newApiKey.description,
      user_id: newApiKey.userId,
      user_email: newApiKey.user.email,
      user_name: newApiKey.user.name,
      permissions: permissions,
      quota: newApiKey.quota,
      quota_used: newApiKey.quotaUsed,
      quota_reset_at: newApiKey.quotaResetAt?.toISOString(),
      expires_at: newApiKey.expiresAt?.toISOString(),
      last_used_at: newApiKey.lastUsedAt?.toISOString(),
      is_active: newApiKey.isActive,
      created_at: newApiKey.createdAt.toISOString(),
      updated_at: newApiKey.updatedAt.toISOString()
    }

    return NextResponse.json({
      message: 'API key created successfully',
      api_key: response,
      warning: 'Please store the API key securely. It will not be shown again.'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating API key:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'create_apikey' })
  }
}