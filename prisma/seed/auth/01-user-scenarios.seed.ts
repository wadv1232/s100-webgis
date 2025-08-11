import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedUserScenarios() {
  console.log('创建用户场景...')
  
  const scenarios = await Promise.all([
    // 基于用户故事的核心角色
    prisma.userScenario.create({
      data: {
        name: '叶子节点操作员',
        description: '港口数据发布专员，负责本地数据发布和管理（用户故事1-5）',
        icon: 'Anchor',
        color: 'blue',
        isActive: true
      }
    }),
    prisma.userScenario.create({
      data: {
        name: '区域节点管理员',
        description: '区域海事分局管理者，协调区域数据服务和质量监控（用户故事6-10）',
        icon: 'Map',
        color: 'orange',
        isActive: true
      }
    }),
    prisma.userScenario.create({
      data: {
        name: '全球根节点管理员',
        description: 'IHO协调员，负责全球网络治理和标准管理（用户故事11-15）',
        icon: 'Globe',
        color: 'purple',
        isActive: true
      }
    }),
    prisma.userScenario.create({
      data: {
        name: '数据服务商',
        description: '国家级技术负责人，负责新产品服务实施（用户故事16-18）',
        icon: 'Server',
        color: 'green',
        isActive: true
      }
    }),
    prisma.userScenario.create({
      data: {
        name: '创新负责人',
        description: '数字化转型负责人，负责实验性服务创新（用户故事19-20）',
        icon: 'Lightbulb',
        color: 'yellow',
        isActive: true
      }
    }),
    prisma.userScenario.create({
      data: {
        name: '应用开发者',
        description: '航运公司软件开发者，负责服务集成和测试（用户故事21-22）',
        icon: 'Code',
        color: 'teal',
        isActive: true
      }
    }),
    prisma.userScenario.create({
      data: {
        name: '终端用户',
        description: '船长、船员等终端用户，需要获取全球海事数据',
        icon: 'Ship',
        color: 'indigo',
        isActive: true
      }
    })
  ])

  console.log(`✅ 创建了 ${scenarios.length} 个用户场景`)
  return scenarios
}