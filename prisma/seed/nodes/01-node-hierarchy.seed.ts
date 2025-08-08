import { PrismaClient, NodeType, NodeHealth } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedNodeHierarchy() {
  console.log('创建节点层级结构...')
  
  // 全球根节点
  const globalRoot = await prisma.node.create({
    data: {
      code: 'IHO_GLOBAL_ROOT',
      name: 'IHO全球根节点',
      type: NodeType.GLOBAL_ROOT,
      level: 0,
      description: '国际海道测量组织全球根节点',
      apiUrl: 'https://global.iho.org/api',
      adminUrl: 'https://admin.global.iho.org/api',
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]]
      }),
      isActive: true,
      healthStatus: NodeHealth.HEALTHY,
      lastHealthCheck: new Date(),
      latitude: 0,
      longitude: 0
    }
  })

  // 国家级节点 - 中国
  const chinaNational = await prisma.node.create({
    data: {
      code: 'CHINA_NATIONAL',
      name: '中国海事局国家级节点',
      type: NodeType.NATIONAL,
      level: 1,
      description: '中国海事局国家级节点',
      apiUrl: 'https://msa.gov.cn/api',
      adminUrl: 'https://admin.msa.gov.cn/api',
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[73, 18], [135, 18], [135, 54], [73, 54], [73, 18]]]
      }),
      isActive: true,
      healthStatus: NodeHealth.HEALTHY,
      lastHealthCheck: new Date(),
      parentId: globalRoot.id,
      latitude: 35,
      longitude: 105
    }
  })

  // 区域节点 - 东海分局
  const eastChinaBureau = await prisma.node.create({
    data: {
      code: 'EAST_CHINA_BUREAU',
      name: '东海分局',
      type: NodeType.REGIONAL,
      level: 2,
      description: '中国海事局东海分局',
      apiUrl: 'https://east.msa.gov.cn/api',
      adminUrl: 'https://admin.east.msa.gov.cn/api',
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[117, 27], [123, 27], [123, 34], [117, 34], [117, 27]]]
      }),
      isActive: true,
      healthStatus: NodeHealth.HEALTHY,
      lastHealthCheck: new Date(),
      parentId: chinaNational.id,
      latitude: 30,
      longitude: 120
    }
  })

  // 叶子节点 - 上海港
  const shanghaiPort = await prisma.node.create({
    data: {
      code: 'SHANGHAI_PORT',
      name: '上海港',
      type: NodeType.LEAF,
      level: 3,
      description: '上海港务局数据节点',
      apiUrl: 'https://shanghai-port.msa.gov.cn/api',
      adminUrl: 'https://admin.shanghai-port.msa.gov.cn/api',
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.0, 31.0], [121.5, 31.0], [121.5, 31.5], [121.0, 31.5], [121.0, 31.0]]]
      }),
      isActive: true,
      healthStatus: NodeHealth.HEALTHY,
      lastHealthCheck: new Date(),
      parentId: eastChinaBureau.id,
      latitude: 31.23,
      longitude: 121.47
    }
  })

  // 叶子节点 - 宁波港
  const ningboPort = await prisma.node.create({
    data: {
      code: 'NINGBO_PORT',
      name: '宁波港',
      type: NodeType.LEAF,
      level: 3,
      description: '宁波港务局数据节点',
      apiUrl: 'https://ningbo-port.msa.gov.cn/api',
      adminUrl: 'https://admin.ningbo-port.msa.gov.cn/api',
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.3, 29.8], [121.8, 29.8], [121.8, 30.2], [121.3, 30.2], [121.3, 29.8]]]
      }),
      isActive: true,
      healthStatus: NodeHealth.HEALTHY,
      lastHealthCheck: new Date(),
      parentId: eastChinaBureau.id,
      latitude: 29.87,
      longitude: 121.54
    }
  })

  console.log(`✅ 创建了 5 个节点层级结构`)
  return [globalRoot, chinaNational, eastChinaBureau, shanghaiPort, ningboPort]
}