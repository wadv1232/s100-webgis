import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSeedData() {
  console.log('🧪 开始测试种子数据完整性...')
  
  let allTestsPassed = true
  
  // 测试认证和权限模块
  console.log('\n🔐 测试认证和权限模块...')
  try {
    const scenarios = await prisma.userScenario.findMany()
    const rolePermissions = await prisma.rolePermission.findMany()
    const scenarioRoles = await prisma.scenarioRole.findMany()
    const users = await prisma.user.findMany()
    
    console.log(`  ✅ 用户场景: ${scenarios.length} 个`)
    console.log(`  ✅ 角色权限: ${rolePermissions.length} 个`)
    console.log(`  ✅ 场景角色关联: ${scenarioRoles.length} 个`)
    console.log(`  ✅ 用户: ${users.length} 个`)
    
    // 检查关键用户
    const adminUser = users.find(u => u.role === 'ADMIN')
    const dataManager = users.find(u => u.role === 'DATA_MANAGER')
    if (!adminUser || !dataManager) {
      console.log('  ❌ 缺少关键用户角色')
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`  ❌ 认证和权限模块测试失败: ${error}`)
    allTestsPassed = false
  }
  
  // 测试节点管理模块
  console.log('\n🌐 测试节点管理模块...')
  try {
    const nodes = await prisma.node.findMany({ orderBy: { level: 'asc' } })
    const capabilities = await prisma.capability.findMany()
    
    console.log(`  ✅ 节点: ${nodes.length} 个`)
    console.log(`  ✅ 节点能力: ${capabilities.length} 个`)
    
    // 检查节点层级
    const globalRoot = nodes.find(n => n.type === 'GLOBAL_ROOT')
    const leafNodes = nodes.filter(n => n.type === 'LEAF')
    if (!globalRoot || leafNodes.length === 0) {
      console.log('  ❌ 节点层级结构不完整')
      allTestsPassed = false
    }
    
    // 检查节点能力
    const shanghaiPort = nodes.find(n => n.name === '上海港')
    const shanghaiCapabilities = capabilities.filter(c => c.nodeId === shanghaiPort?.id)
    if (shanghaiPort && shanghaiCapabilities.length === 0) {
      console.log('  ❌ 上海港缺少节点能力')
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`  ❌ 节点管理模块测试失败: ${error}`)
    allTestsPassed = false
  }
  
  // 测试数据集管理模块
  console.log('\n📊 测试数据集管理模块...')
  try {
    const datasets = await prisma.dataset.findMany()
    
    console.log(`  ✅ 数据集: ${datasets.length} 个`)
    
    // 检查数据集类型
    const s101Datasets = datasets.filter(d => d.productType === 'S101')
    const s102Datasets = datasets.filter(d => d.productType === 'S102')
    if (s101Datasets.length === 0 || s102Datasets.length === 0) {
      console.log('  ❌ 缺少关键数据集类型')
      allTestsPassed = false
    }
    
    // 检查数据集状态
    const publishedDatasets = datasets.filter(d => d.status === 'PUBLISHED')
    if (publishedDatasets.length === 0) {
      console.log('  ❌ 没有已发布的数据集')
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`  ❌ 数据集管理模块测试失败: ${error}`)
    allTestsPassed = false
  }
  
  // 测试服务管理模块
  console.log('\n🚀 测试服务管理模块...')
  try {
    const services = await prisma.service.findMany()
    const serviceDirectoryEntries = await prisma.serviceDirectoryEntry.findMany()
    
    console.log(`  ✅ 服务实例: ${services.length} 个`)
    console.log(`  ✅ 服务目录条目: ${serviceDirectoryEntries.length} 个`)
    
    // 检查服务类型
    const wmsServices = services.filter(s => s.serviceType === 'WMS')
    const wfsServices = services.filter(s => s.serviceType === 'WFS')
    if (wmsServices.length === 0 || wfsServices.length === 0) {
      console.log('  ❌ 缺少关键服务类型')
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`  ❌ 服务管理模块测试失败: ${error}`)
    allTestsPassed = false
  }
  
  // 测试系统配置模块
  console.log('\n⚙️ 测试系统配置模块...')
  try {
    const systemConfigs = await prisma.systemConfig.findMany()
    const posts = await prisma.post.findMany()
    
    console.log(`  ✅ 系统配置: ${systemConfigs.length} 个`)
    console.log(`  ✅ 示例帖子: ${posts.length} 个`)
    
    // 检查关键配置
    const appName = systemConfigs.find(c => c.key === 'app.name')
    const jwtSecret = systemConfigs.find(c => c.key === 'security.jwt.secret')
    if (!appName || !jwtSecret) {
      console.log('  ❌ 缺少关键系统配置')
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`  ❌ 系统配置模块测试失败: ${error}`)
    allTestsPassed = false
  }
  
  // 测试数据关联性
  console.log('\n🔗 测试数据关联性...')
  try {
    // 检查用户与节点的关联
    const usersWithNodes = await prisma.user.findMany({
      where: { nodeId: { not: null } },
      include: { node: true }
    })
    
    // 检查数据集与节点的关联
    const datasetsWithNodes = await prisma.dataset.findMany({
      include: { node: true }
    })
    
    // 检查服务与数据集的关联
    const servicesWithDatasets = await prisma.service.findMany({
      where: { datasetId: { not: null } },
      include: { dataset: true }
    })
    
    console.log(`  ✅ 关联节点的用户: ${usersWithNodes.length} 个`)
    console.log(`  ✅ 关联节点的数据集: ${datasetsWithNodes.length} 个`)
    console.log(`  ✅ 关联数据集的服务: ${servicesWithDatasets.length} 个`)
    
    if (usersWithNodes.length === 0 || datasetsWithNodes.length === 0) {
      console.log('  ❌ 数据关联性不完整')
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`  ❌ 数据关联性测试失败: ${error}`)
    allTestsPassed = false
  }
  
  // 总结
  console.log('\n📋 测试结果:')
  if (allTestsPassed) {
    console.log('  ✅ 所有测试通过！种子数据完整性良好。')
    console.log('  🎉 S-100海事服务平台已准备就绪！')
  } else {
    console.log('  ❌ 部分测试失败，请检查种子数据。')
  }
  
  await prisma.$disconnect()
  return allTestsPassed
}

// 运行测试
testSeedData()
  .then((passed) => {
    process.exit(passed ? 0 : 1)
  })
  .catch((error) => {
    console.error('测试运行失败:', error)
    process.exit(1)
  })