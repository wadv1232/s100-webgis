import { PrismaClient, S100Product, ServiceType } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedNodeCapabilities(nodes: any[]) {
  console.log('创建节点能力...')
  
  const [shanghaiPort, ningboPort] = nodes.slice(-2) // 获取最后两个叶子节点
  
  const capabilities = [
    // 上海港能力
    {
      nodeId: shanghaiPort.id,
      productType: S100Product.S101,
      serviceType: ServiceType.WMS,
      isEnabled: true,
      endpoint: '/api/v1/s101/wms',
      version: '1.0.0'
    },
    {
      nodeId: shanghaiPort.id,
      productType: S100Product.S101,
      serviceType: ServiceType.WFS,
      isEnabled: true,
      endpoint: '/api/v1/s101/wfs',
      version: '1.0.0'
    },
    {
      nodeId: shanghaiPort.id,
      productType: S100Product.S102,
      serviceType: ServiceType.WMS,
      isEnabled: true,
      endpoint: '/api/v1/s102/wms',
      version: '1.0.0'
    },
    {
      nodeId: shanghaiPort.id,
      productType: S100Product.S102,
      serviceType: ServiceType.WCS,
      isEnabled: true,
      endpoint: '/api/v1/s102/wcs',
      version: '1.0.0'
    },
    {
      nodeId: shanghaiPort.id,
      productType: S100Product.S111,
      serviceType: ServiceType.WFS,
      isEnabled: true,
      endpoint: '/api/v1/s111/wfs',
      version: '1.0.0'
    },
    // 宁波港能力
    {
      nodeId: ningboPort.id,
      productType: S100Product.S101,
      serviceType: ServiceType.WMS,
      isEnabled: true,
      endpoint: '/api/v1/s101/wms',
      version: '1.0.0'
    },
    {
      nodeId: ningboPort.id,
      productType: S100Product.S104,
      serviceType: ServiceType.WMS,
      isEnabled: true,
      endpoint: '/api/v1/s104/wms',
      version: '1.0.0'
    }
  ]

  let createdCount = 0
  for (const capability of capabilities) {
    try {
      await prisma.capability.create({
        data: capability
      })
      createdCount++
    } catch (error) {
      console.log(`节点能力已存在，跳过: ${capability.nodeId} - ${capability.productType} - ${capability.serviceType}`)
    }
  }

  console.log(`✅ 创建了 ${createdCount} 个节点能力`)
}