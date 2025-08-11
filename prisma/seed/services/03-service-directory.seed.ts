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
    },
    // 异地部署S102 WCS服务 - 陈工配置的远程服务
    {
      nodeId: shanghaiPort.id,
      productType: S100Product.S102,
      serviceType: ServiceType.WCS,
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[120.5, 30.0], [122.5, 30.0], [122.5, 32.0], [120.5, 32.0], [120.5, 30.0]]],
        properties: {
          name: '异地部署高精度水深服务覆盖范围',
          description: '陈工配置的异地部署S-102 WCS服务覆盖区域',
          accuracy: '±0.3m',
          resolution: '0.5m'
        }
      }),
      endpoint: 'http://remote-bathymetry-service.cn:8080/wcs',
      version: '2.0.1',
      isEnabled: true,
      lastSyncedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
      confidence: 0.95 // 远程服务置信度稍低
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