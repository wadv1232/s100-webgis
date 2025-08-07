import { PrismaClient, ServiceType } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedServices(datasets: any[]) {
  console.log('创建服务实例...')
  
  const services = []
  
  // 为每个数据集创建WMS服务
  for (const dataset of datasets) {
    services.push({
      datasetId: dataset.id,
      serviceType: ServiceType.WMS,
      endpoint: `/api/services/wms/${dataset.id}`,
      configuration: JSON.stringify({
        title: `${dataset.name} - WMS服务`,
        abstract: dataset.description,
        keywords: ['S-100', 'WMS', dataset.productType]
      }),
      isActive: true
    })
  }
  
  // 为S101和S102数据集创建WFS服务
  const wfsDatasets = datasets.filter(d => 
    d.productType === 'S101' || d.productType === 'S102'
  )
  
  for (const dataset of wfsDatasets) {
    services.push({
      datasetId: dataset.id,
      serviceType: ServiceType.WFS,
      endpoint: `/api/services/wfs/${dataset.id}`,
      configuration: JSON.stringify({
        title: `${dataset.name} - WFS服务`,
        abstract: dataset.description,
        keywords: ['S-100', 'WFS', dataset.productType]
      }),
      isActive: true
    })
  }
  
  // 为S102数据集创建WCS服务
  const wcsDatasets = datasets.filter(d => d.productType === 'S102')
  
  for (const dataset of wcsDatasets) {
    services.push({
      datasetId: dataset.id,
      serviceType: ServiceType.WCS,
      endpoint: `/api/services/wcs/${dataset.id}`,
      configuration: JSON.stringify({
        title: `${dataset.name} - WCS服务`,
        abstract: dataset.description,
        keywords: ['S-100', 'WCS', dataset.productType]
      }),
      isActive: true
    })
  }

  const createdServices = []
  for (const service of services) {
    try {
      const createdService = await prisma.service.create({
        data: service
      })
      createdServices.push(createdService)
    } catch (error) {
      console.log(`服务已存在，跳过: ${service.endpoint}`)
    }
  }

  console.log(`✅ 创建了 ${createdServices.length} 个服务实例`)
  return createdServices
}