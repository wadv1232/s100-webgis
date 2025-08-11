import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiErrorHandler } from '@/lib/api-error'

interface RoleAssignmentRequest {
  roles: string[]
}

interface RoleAssignmentResponse {
  user_id: string
  previous_role?: string
  new_role: string
  assigned_permissions: string[]
  removed_permissions: string[]
  message: string
  timestamp: string
}

// PUT /admin/users/{id}/roles - 分配或修改用户角色
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body: RoleAssignmentRequest = await request.json()

    // 验证用户是否存在
    const user = await db.user.findUnique({
      where: { id },
      include: {
        userPermissions: {
          select: {
            permission: true,
            isGranted: true
          }
        }
      }
    })

    if (!user) {
      return ApiErrorHandler.createErrorResponse('USER_NOT_FOUND', { user_id: id })
    }

    // 验证角色
    const validRoles = ['ADMIN', 'NODE_ADMIN', 'DATA_MANAGER', 'SERVICE_MANAGER', 'DEVELOPER', 'USER', 'GUEST']
    const invalidRoles = body.roles.filter(role => !validRoles.includes(role.toUpperCase()))
    
    if (invalidRoles.length > 0) {
      return ApiErrorHandler.createErrorResponse('INVALID_ROLES', {
        roles: invalidRoles,
        valid_roles: validRoles
      })
    }

    // 确定新角色（取最高权限角色）
    const roleHierarchy = {
      'ADMIN': 6,
      'NODE_ADMIN': 5,
      'DATA_MANAGER': 4,
      'SERVICE_MANAGER': 3,
      'DEVELOPER': 2,
      'USER': 1,
      'GUEST': 0
    }

    const newRole = body.roles
      .map(r => r.toUpperCase())
      .reduce((highest, current) => 
        roleHierarchy[current] > roleHierarchy[highest] ? current : highest
      )

    const previousRole = user.role
    const previousPermissions = user.userPermissions
      .filter(up => up.isGranted)
      .map(up => up.permission)

    // 获取新角色的默认权限
    const rolePermissions = await db.rolePermission.findMany({
      where: { role: newRole as any },
      select: { permission: true }
    })

    const newDefaultPermissions = rolePermissions.map(rp => rp.permission)

    // 确定需要添加和删除的权限
    const permissionsToAdd = newDefaultPermissions.filter(p => !previousPermissions.includes(p))
    const permissionsToRemove = previousPermissions.filter(p => !newDefaultPermissions.includes(p))

    // 更新用户角色
    await db.user.update({
      where: { id },
      data: { role: newRole as any }
    })

    // 删除不再需要的权限
    if (permissionsToRemove.length > 0) {
      await db.userPermission.deleteMany({
        where: {
          userId: id,
          permission: { in: permissionsToRemove as any[] },
          isGranted: true
        }
      })
    }

    // 添加新权限
    if (permissionsToAdd.length > 0) {
      await db.userPermission.createMany({
        data: permissionsToAdd.map(permission => ({
          userId: id,
          permission: permission as any,
          isGranted: true
        })),
        skipDuplicates: true
      })
    }

    const response: RoleAssignmentResponse = {
      user_id: id,
      previous_role: previousRole,
      new_role: newRole,
      assigned_permissions: permissionsToAdd,
      removed_permissions: permissionsToRemove,
      message: `User role updated successfully from ${previousRole} to ${newRole}`,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error updating user roles:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'update_user_roles' })
  }
}

// GET /admin/users/{id}/roles - 获取用户角色和权限
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // 验证用户是否存在
    const user = await db.user.findUnique({
      where: { id },
      include: {
        userPermissions: {
          select: {
            permission: true,
            isGranted: true
          }
        },
        node: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    })

    if (!user) {
      return ApiErrorHandler.createErrorResponse('USER_NOT_FOUND', { user_id: id })
    }

    // 获取角色默认权限
    const rolePermissions = await db.rolePermission.findMany({
      where: { role: user.role },
      select: { permission: true }
    })

    const defaultPermissions = rolePermissions.map(rp => rp.permission)

    // 获取用户特定权限
    const userPermissions = user.userPermissions
      .filter(up => up.isGranted)
      .map(up => up.permission)

    // 获取被拒绝的权限
    const deniedPermissions = user.userPermissions
      .filter(up => !up.isGranted)
      .map(up => up.permission)

    // 计算最终权限（默认权限 + 用户特定权限 - 被拒绝的权限）
    const effectivePermissions = [
      ...defaultPermissions.filter(p => !deniedPermissions.includes(p)),
      ...userPermissions.filter(p => !deniedPermissions.includes(p))
    ]

    // 权限分类
    const permissionCategories = {
      node_management: effectivePermissions.filter(p => p.startsWith('NODE_')),
      data_management: effectivePermissions.filter(p => p.startsWith('DATASET_')),
      service_management: effectivePermissions.filter(p => p.startsWith('SERVICE_')),
      user_management: effectivePermissions.filter(p => p.startsWith('USER_')),
      system_management: effectivePermissions.filter(p => p.startsWith('SYSTEM_')),
      api_management: effectivePermissions.filter(p => p.startsWith('API_'))
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        current_role: user.role,
        node: user.node ? {
          id: user.node.id,
          name: user.node.name,
          type: user.node.type
        } : null
      },
      role_info: {
        current_role: user.role,
        default_permissions: defaultPermissions,
        user_specific_permissions: userPermissions,
        denied_permissions: deniedPermissions
      },
      effective_permissions: {
        all: effectivePermissions,
        by_category: permissionCategories
      },
      permission_summary: {
        total_permissions: effectivePermissions.length,
        can_manage_nodes: permissionCategories.node_management.length > 0,
        can_manage_data: permissionCategories.data_management.length > 0,
        can_manage_services: permissionCategories.service_management.length > 0,
        can_manage_users: permissionCategories.user_management.length > 0,
        can_manage_system: permissionCategories.system_management.length > 0,
        can_manage_apis: permissionCategories.api_management.length > 0
      }
    })

  } catch (error) {
    console.error('Error fetching user roles:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'get_user_roles' })
  }
}