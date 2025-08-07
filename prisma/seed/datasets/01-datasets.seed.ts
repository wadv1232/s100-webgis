import { PrismaClient, S100Product, DatasetStatus } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedDatasets(nodes: any[]) {
  console.log('创建数据集...')
  
  const [shanghaiPort, ningboPort] = nodes.slice(-2) // 获取最后两个叶子节点
  
  const datasets = [
    // 上海港数据集
    {
      name: '上海港电子海图 S101',
      description: '上海港S-101电子海图数据集',
      productType: S100Product.S101,
      version: '1.0.0',
      status: DatasetStatus.PUBLISHED,
      fileName: 'shanghai-port-s101-v1.0.0.zip',
      filePath: '/data/shanghai-port-s101-v1.0.0.zip',
      fileSize: 1024000,
      mimeType: 'application/zip',
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.0, 31.0], [121.5, 31.0], [121.5, 31.5], [121.0, 31.5], [121.0, 31.0]]]
      }),
      metadata: JSON.stringify({
        scale: '1:50000',
        projection: 'WGS84',
        updateFrequency: 'Monthly'
      }),
      publishedAt: new Date(),
      nodeId: shanghaiPort.id
    },
    {
      name: '上海港高精度水深 S102',
      description: '上海港S-102高精度水深数据集',
      productType: S100Product.S102,
      version: '1.0.0',
      status: DatasetStatus.PUBLISHED,
      fileName: 'shanghai-port-s102-v1.0.0.tiff',
      filePath: '/data/shanghai-port-s102-v1.0.0.tiff',
      fileSize: 2048000,
      mimeType: 'image/tiff',
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.0, 31.0], [121.5, 31.0], [121.5, 31.5], [121.0, 31.5], [121.0, 31.0]]]
      }),
      metadata: JSON.stringify({
        resolution: '1m',
        verticalDatum: 'MSL',
        accuracy: '0.1m'
      }),
      publishedAt: new Date(),
      nodeId: shanghaiPort.id
    },
    {
      name: '上海港实时海流 S111',
      description: '上海港S-111实时海流数据集',
      productType: S100Product.S111,
      version: '1.0.0',
      status: DatasetStatus.PUBLISHED,
      fileName: 'shanghai-port-s111-v1.0.0.json',
      filePath: '/data/shanghai-port-s111-v1.0.0.json',
      fileSize: 512000,
      mimeType: 'application/json',
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.0, 31.0], [121.5, 31.0], [121.5, 31.5], [121.0, 31.5], [121.0, 31.0]]]
      }),
      metadata: JSON.stringify({
        timeStep: '1h',
        forecastHours: 24,
        variables: ['u', 'v']
      }),
      publishedAt: new Date(),
      nodeId: shanghaiPort.id
    },
    // 宁波港数据集
    {
      name: '宁波港电子海图 S101',
      description: '宁波港S-101电子海图数据集',
      productType: S100Product.S101,
      version: '1.0.0',
      status: DatasetStatus.PUBLISHED,
      fileName: 'ningbo-port-s101-v1.0.0.zip',
      filePath: '/data/ningbo-port-s101-v1.0.0.zip',
      fileSize: 819200,
      mimeType: 'application/zip',
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.3, 29.8], [121.8, 29.8], [121.8, 30.2], [121.3, 30.2], [121.3, 29.8]]]
      }),
      metadata: JSON.stringify({
        scale: '1:50000',
        projection: 'WGS84',
        updateFrequency: 'Monthly'
      }),
      publishedAt: new Date(),
      nodeId: ningboPort.id
    },
    {
      name: '宁波港动态水位 S104',
      description: '宁波港S-104动态水位数据集',
      productType: S100Product.S104,
      version: '1.0.0',
      status: DatasetStatus.PUBLISHED,
      fileName: 'ningbo-port-s104-v1.0.0.json',
      filePath: '/data/ningbo-port-s104-v1.0.0.json',
      fileSize: 256000,
      mimeType: 'application/json',
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.3, 29.8], [121.8, 29.8], [121.8, 30.2], [121.3, 30.2], [121.3, 29.8]]]
      }),
      metadata: JSON.stringify({
        timeStep: '10min',
        forecastHours: 12,
        datum: 'MSL'
      }),
      publishedAt: new Date(),
      nodeId: ningboPort.id
    }
  ]

  const createdDatasets = []
  for (const dataset of datasets) {
    try {
      const createdDataset = await prisma.dataset.create({
        data: dataset
      })
      createdDatasets.push(createdDataset)
    } catch (error) {
      console.log(`数据集已存在，跳过: ${dataset.name}`)
    }
  }

  console.log(`✅ 创建了 ${createdDatasets.length} 个数据集`)
  return createdDatasets
}