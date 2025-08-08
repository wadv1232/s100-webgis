import { PrismaClient, S100Product, ServiceType } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedServiceDirectory(nodes: any[]) {
  console.log('创建服务目录条目...')
  
  const [shanghaiPort, ningboPort] = nodes.slice(-2) // 获取最后两个叶子节点
  
  const serviceDirectoryEntries = [
    // 上海港服务目录条目
    {
      nodeId: shanghaiPort.id,
      productType: S100Product.S101,
      serviceType: ServiceType.WMS,
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.0, 31.0], [121.5, 31.0], [121.5, 31.5], [121.0, 31.5], [121.0, 31.0]]]
      }),
      endpoint: 'https://shanghai-port.msa.gov.cn/api/v1/s101/wms',
      version: '1.0.0',
      isEnabled: true,
      lastSyncedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
      confidence: 1.0
    },
    {
      nodeId: shanghaiPort.id,
      productType: S100Product.S101,
      serviceType: ServiceType.WFS,
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.0, 31.0], [121.5, 31.0], [121.5, 31.5], [121.0, 31.5], [121.0, 31.0]]]
      }),
      endpoint: 'https://shanghai-port.msa.gov.cn/api/v1/s101/wfs',
      version: '1.0.0',
      isEnabled: true,
      lastSyncedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      confidence: 1.0
    },
    {
      nodeId: shanghaiPort.id,
      productType: S100Product.S102,
      serviceType: ServiceType.WMS,
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.0, 31.0], [121.5, 31.0], [121.5, 31.5], [121.0, 31.5], [121.0, 31.0]]]
      }),
      endpoint: 'https://shanghai-port.msa.gov.cn/api/v1/s102/wms',
      version: '1.0.0',
      isEnabled: true,
      lastSyncedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      confidence: 1.0
    },
    {
      nodeId: shanghaiPort.id,
      productType: S100Product.S102,
      serviceType: ServiceType.WCS,
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.0, 31.0], [121.5, 31.0], [121.5, 31.5], [121.0, 31.5], [121.0, 31.0]]]
      }),
      endpoint: 'https://shanghai-port.msa.gov.cn/api/v1/s102/wcs',
      version: '1.0.0',
      isEnabled: true,
      lastSyncedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      confidence: 1.0
    },
    {
      nodeId: shanghaiPort.id,
      productType: S100Product.S111,
      serviceType: ServiceType.WFS,
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.0, 31.0], [121.5, 31.0], [121.5, 31.5], [121.0, 31.5], [121.0, 31.0]]]
      }),
      endpoint: 'https://shanghai-port.msa.gov.cn/api/v1/s111/wfs',
      version: '1.0.0',
      isEnabled: true,
      lastSyncedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      confidence: 1.0
    },
    // 宁波港服务目录条目
    {
      nodeId: ningboPort.id,
      productType: S100Product.S101,
      serviceType: ServiceType.WMS,
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.3, 29.8], [121.8, 29.8], [121.8, 30.2], [121.3, 30.2], [121.3, 29.8]]]
      }),
      endpoint: 'https://ningbo-port.msa.gov.cn/api/v1/s101/wms',
      version: '1.0.0',
      isEnabled: true,
      lastSyncedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      confidence: 1.0
    },
    {
      nodeId: ningboPort.id,
      productType: S100Product.S104,
      serviceType: ServiceType.WMS,
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.3, 29.8], [121.8, 29.8], [121.8, 30.2], [121.3, 30.2], [121.3, 29.8]]]
      }),
      endpoint: 'https://ningbo-port.msa.gov.cn/api/v1/s104/wms',
      version: '1.0.0',
      isEnabled: true,
      lastSyncedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      confidence: 1.0
    }
  ]

  const createdEntries = []
  for (const entry of serviceDirectoryEntries) {
    try {
      const createdEntry = await prisma.serviceDirectoryEntry.create({
        data: entry
      })
      createdEntries.push(createdEntry)
    } catch (error) {
      console.log(`服务目录条目已存在，跳过: ${entry.nodeId} - ${entry.productType} - ${entry.serviceType}`)
    }
  }

  console.log(`✅ 创建了 ${createdEntries.length} 个服务目录条目`)
  return createdEntries
}