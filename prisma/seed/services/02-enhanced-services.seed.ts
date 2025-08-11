import { PrismaClient } from '@prisma/client'

const ServiceType = {
  WMS: 'WMS',
  WFS: 'WFS',
  WCS: 'WCS'
}

const ServiceStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  EXPERIMENTAL: 'EXPERIMENTAL'
}

const prisma = new PrismaClient()

export async function seedEnhancedServices(datasets: any[]) {
  console.log('创建增强服务数据...')
  
  // 基于用户故事的服务配置
  const services = [
    // 上海港S-101服务 - 用户故事1：一键发布WMS/WFS服务
    {
      name: '上海港电子海图 WMS服务',
      description: '上海港S-101电子海图WMS服务（用户故事1：一键发布）',
      serviceType: ServiceType.WMS,
      status: ServiceStatus.ACTIVE,
      endpointUrl: 'http://shanghai-port.msa.gov.cn/services/s101/wms',
      capabilities: JSON.stringify({
        layers: ['S101_Electronic_Navigation_Chart'],
        formats: ['image/png', 'image/jpeg'],
        crs: ['EPSG:4326', 'EPSG:3857'],
        version: '1.3.0'
      }),
      metadata: JSON.stringify({
        serviceType: 'WMS',
        productType: 'S101',
        version: '1.0.0',
        updateFrequency: 'Monthly',
        complianceLevel: 'IHO_S-64_2.0'
      }),
      lastHealthCheck: new Date(),
      isActive: true,
      datasetId: datasets[0].id // 上海港S-101数据集
    },
    {
      name: '上海港电子海图 WFS服务',
      description: '上海港S-101电子海图WFS服务（用户故事1：一键发布）',
      serviceType: ServiceType.WFS,
      status: ServiceStatus.ACTIVE,
      endpointUrl: 'http://shanghai-port.msa.gov.cn/services/s101/wfs',
      capabilities: JSON.stringify({
        featureTypes: ['S101_Electronic_Navigation_Chart'],
        formats: ['application/gml+xml', 'application/json'],
        crs: ['EPSG:4326', 'EPSG:3857'],
        version: '2.0.0'
      }),
      metadata: JSON.stringify({
        serviceType: 'WFS',
        productType: 'S101',
        version: '1.0.0',
        updateFrequency: 'Monthly'
      }),
      lastHealthCheck: new Date(),
      isActive: true,
      datasetId: datasets[0].id // 上海港S-101数据集
    },
    // 上海港S-102服务 - 用户故事1：支持.h5格式的WCS服务
    {
      name: '上海港高精度水深 WCS服务',
      description: '上海港S-102高精度水深WCS服务（用户故事1：支持.h5格式）',
      serviceType: ServiceType.WCS,
      status: ServiceStatus.ACTIVE,
      endpointUrl: 'http://shanghai-port.msa.gov.cn/services/s102/wcs',
      capabilities: JSON.stringify({
        coverages: ['S102_High Precision_Bathymetry'],
        formats: ['image/tiff', 'application/x-hdf5'],
        crs: ['EPSG:4326', 'EPSG:3857'],
        version: '2.0.1'
      }),
      metadata: JSON.stringify({
        serviceType: 'WCS',
        productType: 'S102',
        version: '1.0.0',
        resolution: '1m',
        verticalDatum: 'MSL'
      }),
      lastHealthCheck: new Date(),
      isActive: true,
      datasetId: datasets[1].id // 上海港S-102数据集
    },
    // 上海港S-124服务 - 用户故事3：归档服务
    {
      name: '上海港航行警告 WMS服务',
      description: '上海港S-124航行警告WMS服务（用户故事3：已归档）',
      serviceType: ServiceType.WMS,
      status: ServiceStatus.ARCHIVED,
      endpointUrl: 'http://shanghai-port.msa.gov.cn/services/s124/wms',
      capabilities: JSON.stringify({
        layers: ['S124_Navigational_Warnings'],
        formats: ['image/png'],
        crs: ['EPSG:4326'],
        version: '1.3.0'
      }),
      metadata: JSON.stringify({
        serviceType: 'WMS',
        productType: 'S124',
        version: '1.0.0',
        archived: true,
        archiveDate: '2024-01-01'
      }),
      lastHealthCheck: new Date('2024-01-01'),
      isActive: false,
      datasetId: datasets[3].id // 上海港S-124数据集
    },
    // 宁波港S-104服务 - 用户故事2：原子化更新
    {
      name: '宁波港动态水位 WMS服务',
      description: '宁波港S-104动态水位WMS服务（用户故事2：支持原子化更新）',
      serviceType: ServiceType.WMS,
      status: ServiceStatus.ACTIVE,
      endpointUrl: 'http://ningbo-port.msa.gov.cn/services/s104/wms',
      capabilities: JSON.stringify({
        layers: ['S104_Dynamic_Water_Level'],
        formats: ['image/png'],
        crs: ['EPSG:4326'],
        version: '1.3.0',
        timeDimension: true
      }),
      metadata: JSON.stringify({
        serviceType: 'WMS',
        productType: 'S104',
        version: '1.0.0',
        timeStep: '10min',
        forecastHours: 12,
        supportsAtomicUpdate: true
      }),
      lastHealthCheck: new Date(),
      isActive: true,
      datasetId: datasets[5].id // 宁波港S-104数据集
    },
    // 实验性服务 - 用户故事19-22
    {
      name: '上海港水下噪声预报 WMS服务',
      description: '上海港S-412水下噪声预报WMS服务（用户故事19：实验性服务）',
      serviceType: ServiceType.WMS,
      status: ServiceStatus.EXPERIMENTAL,
      endpointUrl: 'http://shanghai-port.msa.gov.cn/services/s412/wms',
      capabilities: JSON.stringify({
        layers: ['S412_Underwater_Noise_Forecast'],
        formats: ['image/png'],
        crs: ['EPSG:4326'],
        version: '1.3.0',
        accessControl: 'restricted'
      }),
      metadata: JSON.stringify({
        serviceType: 'WMS',
        productType: 'S412',
        version: '0.1.0',
        experimental: true,
        accessControl: 'restricted',
        frequencyRange: '10Hz-10kHz'
      }),
      lastHealthCheck: new Date(),
      isActive: true,
      datasetId: datasets.length > 6 ? datasets[6].id : null // 上海港S-412数据集
    },
    // 远程S102 WCS服务 - 陈工（叶子节点操作员）异地部署服务
    {
      name: '异地部署S-102高精度水深 WCS服务',
      description: '陈工配置的异地部署S-102高精度水深WCS服务，满足S-100规范要求',
      serviceType: ServiceType.WCS,
      status: ServiceStatus.ACTIVE,
      endpointUrl: 'http://remote-bathymetry-service.cn:8080/wcs',
      capabilities: JSON.stringify({
        coverages: ['S102_High_Precision_Bathymetry_Remote'],
        formats: ['image/tiff', 'application/x-hdf5', 'application/netcdf'],
        crs: ['EPSG:4326', 'EPSG:3857', 'EPSG:4978'],
        version: '2.0.1',
        supportedInterpolations: ['nearest', 'bilinear', 'cubic'],
        timeSeriesSupport: true
      }),
      metadata: JSON.stringify({
        serviceType: 'WCS',
        productType: 'S102',
        version: '1.0.0',
        s100Compliance: true,
        s100Specification: 'S-100 Edition 1.0.0',
        resolution: '0.5m',
        verticalDatum: 'MSL',
        horizontalDatum: 'WGS84',
        depthReference: 'LAT',
        updateFrequency: 'Weekly',
        coverageExtent: {
          minLon: 120.5,
          maxLon: 122.5,
          minLat: 30.0,
          maxLat: 32.0
        },
        remoteDeployment: {
          location: '异地数据中心',
          networkLatency: '<50ms',
          bandwidth: '1Gbps',
          redundancy: '多活部署'
        },
        dataQuality: {
          accuracy: '±0.3m',
          completeness: '99.5%',
          currency: '2024年8月'
        }
      }),
      lastHealthCheck: new Date(),
      isActive: true,
      datasetId: datasets[1].id // 上海港S-102数据集
    }
  ]

  const createdServices = []
  for (const service of services) {
    try {
      const createdService = await prisma.service.create({
        data: service
      })
      createdServices.push(createdService)
    } catch (error) {
      console.log(`服务已存在，跳过: ${service.name}`)
    }
  }

  console.log(`✅ 创建了 ${createdServices.length} 个增强服务`)
  return createdServices
}