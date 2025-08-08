import { PrismaClient, UserRole, Permission } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedScenarioRoles(scenarios: any[]) {
  console.log('创建场景角色关联...')
  
  const scenarioRoles = [
    // 终端用户场景
    {
      scenarioId: scenarios[0].id,
      role: UserRole.USER,
      permissions: JSON.stringify([
        Permission.NODE_READ,
        Permission.DATASET_READ,
        Permission.SERVICE_READ
      ])
    },
    // 数据管理员场景
    {
      scenarioId: scenarios[1].id,
      role: UserRole.DATA_MANAGER,
      permissions: JSON.stringify([
        Permission.NODE_READ,
        Permission.DATASET_CREATE,
        Permission.DATASET_READ,
        Permission.DATASET_UPDATE,
        Permission.DATASET_PUBLISH,
        Permission.SERVICE_READ,
        Permission.SYSTEM_MONITOR
      ])
    },
    // 区域管理者场景
    {
      scenarioId: scenarios[2].id,
      role: UserRole.NODE_ADMIN,
      permissions: JSON.stringify([
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
      ])
    },
    // 系统管理员场景
    {
      scenarioId: scenarios[3].id,
      role: UserRole.ADMIN,
      permissions: JSON.stringify(Object.values(Permission))
    },
    // 服务提供商场景
    {
      scenarioId: scenarios[4].id,
      role: UserRole.SERVICE_MANAGER,
      permissions: JSON.stringify([
        Permission.NODE_READ,
        Permission.DATASET_READ,
        Permission.SERVICE_CREATE,
        Permission.SERVICE_READ,
        Permission.SERVICE_UPDATE,
        Permission.SYSTEM_MONITOR
      ])
    }
  ]

  let createdCount = 0
  for (const scenarioRole of scenarioRoles) {
    try {
      await prisma.scenarioRole.create({
        data: scenarioRole
      })
      createdCount++
    } catch (error) {
      console.log(`场景角色关联已存在，跳过: ${scenarioRole.role} - ${scenarioRole.scenarioId}`)
    }
  }

  console.log(`✅ 创建了 ${createdCount} 个场景角色关联`)
}