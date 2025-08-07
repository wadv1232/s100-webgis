import { PrismaClient } from '@prisma/client'

// 导入功能模块种子函数
import { seedUserScenarios } from './auth/01-user-scenarios.seed'
import { seedRolePermissions } from './auth/02-role-permissions.seed'
import { seedScenarioRoles } from './auth/03-scenario-roles.seed'
import { seedUsers } from './auth/04-users.seed'
import { seedNodeHierarchy } from './nodes/01-node-hierarchy.seed'
import { seedNodeCapabilities } from './nodes/02-node-capabilities.seed'
import { seedDatasets } from './datasets/01-datasets.seed'
import { seedServices } from './services/01-services.seed'
import { seedServiceDirectory } from './services/02-service-directory.seed'
import { seedSystemConfig } from './system/01-system-config.seed'
import { seedSamplePosts } from './system/02-sample-posts.seed'

const prisma = new PrismaClient()

async function main() {
  console.log('🌊 开始S-100海事服务平台数据库种子数据初始化...')

  // 清理现有数据（开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 清理现有数据...')
    await prisma.userPermission.deleteMany()
    await prisma.user.deleteMany()
    await prisma.post.deleteMany()
    await prisma.service.deleteMany()
    await prisma.dataset.deleteMany()
    await prisma.capability.deleteMany()
    await prisma.childNode.deleteMany()
    await prisma.node.deleteMany()
    await prisma.scenarioRole.deleteMany()
    await prisma.userScenario.deleteMany()
    await prisma.rolePermission.deleteMany()
    await prisma.serviceDirectoryEntry.deleteMany()
    await prisma.syncTask.deleteMany()
    await prisma.systemConfig.deleteMany()
  }

  // 按功能模块顺序创建数据
  console.log('📋 开始按功能模块创建数据...')

  // 1. 认证和权限模块
  console.log('\n🔐 认证和权限模块')
  const scenarios = await seedUserScenarios()
  await seedRolePermissions()
  await seedScenarioRoles(scenarios)

  // 2. 节点管理模块
  console.log('\n🌐 节点管理模块')
  const nodes = await seedNodeHierarchy()
  await seedNodeCapabilities(nodes)

  // 3. 数据集管理模块
  console.log('\n📊 数据集管理模块')
  const datasets = await seedDatasets(nodes)

  // 4. 服务管理模块
  console.log('\n🚀 服务管理模块')
  await seedServices(datasets)
  await seedServiceDirectory(nodes)

  // 5. 系统配置模块
  console.log('\n⚙️ 系统配置模块')
  await seedSystemConfig()
  
  // 6. 创建用户（需要在节点创建之后）
  console.log('\n👥 用户管理模块')
  const users = await seedUsers(nodes)
  
  // 7. 创建示例内容
  console.log('\n📝 示例内容模块')
  await seedSamplePosts(users)

  console.log('\n✅ S-100海事服务平台数据库种子数据初始化完成！')
  console.log('\n📊 数据统计:')
  console.log(`  - 用户场景: ${scenarios.length} 个`)
  console.log(`  - 节点: ${nodes.length} 个`)
  console.log(`  - 数据集: ${datasets.length} 个`)
  console.log(`  - 用户: ${users.length} 个`)
  console.log('\n🚀 平台已就绪，可以开始使用！')
}

main()
  .catch((e) => {
    console.error('❌ 数据库种子数据初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })