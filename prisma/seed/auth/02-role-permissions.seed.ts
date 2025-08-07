import { PrismaClient, UserRole, Permission } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedRolePermissions() {
  console.log('创建角色权限...')
  
  const rolePermissions = [
    // 系统管理员权限
    ...Object.values(Permission).map(permission => ({
      role: UserRole.ADMIN,
      permission
    })),
    // 节点管理员权限
    ...[
      Permission.NODE_CREATE,
      Permission.NODE_READ,
      Permission.NODE_UPDATE,
      Permission.DATASET_CREATE,
      Permission.DATASET_READ,
      Permission.DATASET_UPDATE,
      Permission.DATASET_PUBLISH,
      Permission.SERVICE_CREATE,
      Permission.SERVICE_READ,
      Permission.SERVICE_UPDATE,
      Permission.USER_CREATE,
      Permission.USER_READ,
      Permission.USER_UPDATE,
      Permission.SYSTEM_MONITOR
    ].map(permission => ({
      role: UserRole.NODE_ADMIN,
      permission
    })),
    // 数据管理员权限
    ...[
      Permission.NODE_READ,
      Permission.DATASET_CREATE,
      Permission.DATASET_READ,
      Permission.DATASET_UPDATE,
      Permission.DATASET_PUBLISH,
      Permission.SERVICE_READ,
      Permission.SYSTEM_MONITOR
    ].map(permission => ({
      role: UserRole.DATA_MANAGER,
      permission
    })),
    // 服务管理员权限
    ...[
      Permission.NODE_READ,
      Permission.DATASET_READ,
      Permission.SERVICE_CREATE,
      Permission.SERVICE_READ,
      Permission.SERVICE_UPDATE,
      Permission.SYSTEM_MONITOR
    ].map(permission => ({
      role: UserRole.SERVICE_MANAGER,
      permission
    })),
    // 普通用户权限
    ...[
      Permission.NODE_READ,
      Permission.DATASET_READ,
      Permission.SERVICE_READ
    ].map(permission => ({
      role: UserRole.USER,
      permission
    })),
    // 游客权限
    ...[
      Permission.NODE_READ,
      Permission.DATASET_READ
    ].map(permission => ({
      role: UserRole.GUEST,
      permission
    }))
  ]

  try {
    await prisma.rolePermission.createMany({
      data: rolePermissions,
      skipDuplicates: true
    })
    console.log(`✅ 创建了 ${rolePermissions.length} 个角色权限`)
  } catch (error) {
    console.log('角色权限已存在，跳过创建...')
  }
}