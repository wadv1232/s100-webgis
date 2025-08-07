import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedUserScenarios() {
  console.log('创建用户场景...')
  
  const scenarios = await Promise.all([
    prisma.userScenario.create({
      data: {
        name: '终端用户',
        description: '船长、船员等终端用户，需要获取全球海事数据',
        icon: 'Anchor',
        color: 'blue',
        isActive: true
      }
    }),
    prisma.userScenario.create({
      data: {
        name: '数据管理员',
        description: '港口、海事局数据管理员，负责本地数据发布和管理',
        icon: 'Database',
        color: 'green',
        isActive: true
      }
    }),
    prisma.userScenario.create({
      data: {
        name: '区域管理者',
        description: '区域海事分局管理者，协调区域数据服务和质量监控',
        icon: 'Map',
        color: 'orange',
        isActive: true
      }
    }),
    prisma.userScenario.create({
      data: {
        name: '系统管理员',
        description: 'IHO协调员、系统管理员，负责全球网络治理',
        icon: 'Settings',
        color: 'purple',
        isActive: true
      }
    }),
    prisma.userScenario.create({
      data: {
        name: '服务提供商',
        description: 'S-100服务提供商，管理和维护服务',
        icon: 'Activity',
        color: 'teal',
        isActive: true
      }
    })
  ])

  console.log(`✅ 创建了 ${scenarios.length} 个用户场景`)
  return scenarios
}