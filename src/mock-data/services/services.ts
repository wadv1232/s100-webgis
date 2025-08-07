// 服务相关模拟数据
import { ServiceType } from '@prisma/client';

// 服务类型枚举
export const ServiceTypeEnum = {
  WMS: 'WMS',
  WFS: 'WFS',
  WCS: 'WCS',
  WMTS: 'WMTS',
  SOS: 'SOS'
} as const;

// 服务状态枚举
export const ServiceStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ERROR: 'ERROR',
  MAINTENANCE: 'MAINTENANCE'
} as const;

// 服务类型配置
export const SERVICE_SERVICE_TYPES = [
  { value: ServiceTypeEnum.WMS, name: 'Web地图服务', description: '地图渲染和显示服务' },
  { value: ServiceTypeEnum.WFS, name: 'Web要素服务', description: '矢量数据查询服务' },
  { value: ServiceTypeEnum.WCS, name: 'Web覆盖服务', description: '栅格数据访问服务' },
  { value: ServiceTypeEnum.WMTS, name: 'Web地图切片服务', description: '地图切片服务' },
  { value: ServiceTypeEnum.SOS, name: '传感器观测服务', description: '传感器数据服务' }
];

// S-100产品配置
export const SERVICE_S100_PRODUCTS = [
  { value: 'S101', name: 'S-101 电子海图', description: '电子海图产品' },
  { value: 'S102', name: 'S-102 高精度水深', description: '高精度水深数据' },
  { value: 'S104', name: 'S-104 动态水位', description: '动态水位数据' },
  { value: 'S111', name: 'S-111 实时海流', description: '实时海流数据' },
  { value: 'S124', name: 'S-124 航行警告', description: '航行警告信息' },
  { value: 'S131', name: 'S-131 海洋保护区', description: '海洋保护区数据' }
];

// 服务模拟数据
export const mockServices = [
  {
    id: 'svc-1',
    name: '上海港S101-WMS服务',
    productType: 'S101',
    serviceType: ServiceTypeEnum.WMS,
    version: '1.3.0',
    description: '上海港区域电子海图WMS服务',
    endpoint: 'https://api.shanghai-port.gov.cn/wms/s101',
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    status: ServiceStatus.ACTIVE,
    isEnabled: true,
    lastChecked: new Date().toISOString(),
    responseTime: 120,
    uptime: 99.5,
    requestCount: 15420,
    errorCount: 77,
    capabilities: [
      'GetCapabilities',
      'GetMap',
      'GetFeatureInfo'
    ],
    layers: [
      { name: 'depth', title: '水深', visible: true },
      { name: 'coastline', title: '岸线', visible: true },
      { name: 'navigation_aids', title: '航标', visible: true },
      { name: 'obstructions', title: '碍航物', visible: true }
    ],
    metadata: {
      coordinateSystem: 'WGS84',
      boundingBox: {
        minLat: 30.5,
        maxLat: 32.0,
        minLon: 120.5,
        maxLon: 122.5
      },
      updateFrequency: '月度',
      dataQuality: '高'
    }
  },
  {
    id: 'svc-2',
    name: '上海港S101-WFS服务',
    productType: 'S101',
    serviceType: ServiceTypeEnum.WFS,
    version: '1.1.0',
    description: '上海港区域电子海图WFS服务',
    endpoint: 'https://api.shanghai-port.gov.cn/wfs/s101',
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    status: ServiceStatus.ACTIVE,
    isEnabled: true,
    lastChecked: new Date().toISOString(),
    responseTime: 95,
    uptime: 99.2,
    requestCount: 8765,
    errorCount: 88,
    capabilities: [
      'GetCapabilities',
      'DescribeFeatureType',
      'GetFeature'
    ],
    layers: [
      { name: 'depth_areas', title: '水深区域', visible: true },
      { name: 'navigation_lines', title: '航道线', visible: true },
      { name: 'anchors', title: '锚地', visible: true }
    ],
    metadata: {
      coordinateSystem: 'WGS84',
      boundingBox: {
        minLat: 30.5,
        maxLat: 32.0,
        minLon: 120.5,
        maxLon: 122.5
      },
      updateFrequency: '月度',
      dataQuality: '高'
    }
  },
  {
    id: 'svc-3',
    name: '东海分局S102-WCS服务',
    productType: 'S102',
    serviceType: ServiceTypeEnum.WCS,
    version: '1.1.1',
    description: '东海区域高精度水深WCS服务',
    endpoint: 'https://api.east.msa.gov.cn/wcs/s102',
    nodeId: 'east-china-sea',
    nodeName: '东海分局区域节点',
    status: ServiceStatus.ACTIVE,
    isEnabled: true,
    lastChecked: new Date().toISOString(),
    responseTime: 180,
    uptime: 98.8,
    requestCount: 4321,
    errorCount: 52,
    capabilities: [
      'GetCapabilities',
      'DescribeCoverage',
      'GetCoverage'
    ],
    layers: [
      { name: 'bathymetry', title: '水深数据', visible: true },
      { name: 'uncertainty', title: '不确定度', visible: false }
    ],
    metadata: {
      coordinateSystem: 'WGS84',
      boundingBox: {
        minLat: 28.0,
        maxLat: 34.0,
        minLon: 118.0,
        maxLon: 124.0
      },
      updateFrequency: '季度',
      dataQuality: '高'
    }
  },
  {
    id: 'svc-4',
    name: '上海港S104-WMS服务',
    productType: 'S104',
    serviceType: ServiceTypeEnum.WMS,
    version: '1.3.0',
    description: '长江口区域动态水位WMS服务',
    endpoint: 'https://api.shanghai-port.gov.cn/wms/s104',
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    status: ServiceStatus.ACTIVE,
    isEnabled: true,
    lastChecked: new Date().toISOString(),
    responseTime: 85,
    uptime: 99.1,
    requestCount: 12350,
    errorCount: 111,
    capabilities: [
      'GetCapabilities',
      'GetMap',
      'GetFeatureInfo'
    ],
    layers: [
      { name: 'water_level', title: '水位', visible: true },
      { name: 'tidal_prediction', title: '潮汐预测', visible: true },
      { name: 'currents', title: '水流', visible: false }
    ],
    metadata: {
      coordinateSystem: 'WGS84',
      boundingBox: {
        minLat: 31.0,
        maxLat: 31.5,
        minLon: 121.0,
        maxLon: 122.0
      },
      updateFrequency: '每小时',
      dataQuality: '高'
    }
  },
  {
    id: 'svc-5',
    name: '东海分局S111-WMS服务',
    productType: 'S111',
    serviceType: ServiceTypeEnum.WMS,
    version: '1.3.0',
    description: '东海区域实时海流WMS服务',
    endpoint: 'https://api.east.msa.gov.cn/wms/s111',
    nodeId: 'east-china-sea',
    nodeName: '东海分局区域节点',
    status: ServiceStatus.WARNING,
    isEnabled: true,
    lastChecked: new Date(Date.now() - 300000).toISOString(),
    responseTime: 350,
    uptime: 97.5,
    requestCount: 6543,
    errorCount: 164,
    capabilities: [
      'GetCapabilities',
      'GetMap',
      'GetFeatureInfo'
    ],
    layers: [
      { name: 'current_speed', title: '流速', visible: true },
      { name: 'current_direction', title: '流向', visible: true },
      { name: 'current_arrows', title: '流向箭头', visible: true }
    ],
    metadata: {
      coordinateSystem: 'WGS84',
      boundingBox: {
        minLat: 28.0,
        maxLat: 34.0,
        minLon: 118.0,
        maxLon: 124.0
      },
      updateFrequency: '每小时',
      dataQuality: '中'
    }
  },
  {
    id: 'svc-6',
    name: '中国海事局S124-WFS服务',
    productType: 'S124',
    serviceType: ServiceTypeEnum.WFS,
    version: '1.1.0',
    description: '中国沿海航行警告WFS服务',
    endpoint: 'https://api.msa.gov.cn/wfs/s124',
    nodeId: 'china-national',
    nodeName: '中国海事局国家级节点',
    status: ServiceStatus.ACTIVE,
    isEnabled: true,
    lastChecked: new Date().toISOString(),
    responseTime: 110,
    uptime: 99.8,
    requestCount: 9876,
    errorCount: 20,
    capabilities: [
      'GetCapabilities',
      'DescribeFeatureType',
      'GetFeature'
    ],
    layers: [
      { name: 'navigational_warnings', title: '航行警告', visible: true },
      { name: 'temporary_notices', title: '临时通告', visible: true },
      { name: 'restricted_areas', title: '限制区域', visible: true }
    ],
    metadata: {
      coordinateSystem: 'WGS84',
      boundingBox: {
        minLat: 18.0,
        maxLat: 42.0,
        minLon: 110.0,
        maxLon: 130.0
      },
      updateFrequency: '实时',
      dataQuality: '高'
    }
  }
];

// 服务统计模拟数据
export const serviceStats = {
  totalServices: 6,
  activeServices: 5,
  warningServices: 1,
  inactiveServices: 0,
  servicesByType: {
    [ServiceTypeEnum.WMS]: 4,
    [ServiceTypeEnum.WFS]: 2,
    [ServiceTypeEnum.WCS]: 1,
    [ServiceTypeEnum.WMTS]: 0,
    [ServiceTypeEnum.SOS]: 0
  },
  servicesByProduct: {
    'S101': 2,
    'S102': 1,
    'S104': 1,
    'S111': 1,
    'S124': 1,
    'S131': 0
  },
  servicesByNode: {
    'shanghai-port': 3,
    'east-china-sea': 2,
    'china-national': 1
  },
  totalRequests: 57275,
  totalErrors: 512,
  averageResponseTime: 157,
  averageUptime: 98.8,
  popularServices: [
    { id: 'svc-1', name: '上海港S101-WMS服务', requests: 15420 },
    { id: 'svc-6', name: '中国海事局S124-WFS服务', requests: 9876 },
    { id: 'svc-4', name: '上海港S104-WMS服务', requests: 12350 }
  ]
};

// 获取服务状态信息
export const getServiceStatusInfo = (status: string) => {
  switch (status) {
    case ServiceStatus.ACTIVE:
      return { label: '正常', color: 'green', icon: 'CheckCircle' };
    case ServiceStatus.INACTIVE:
      return { label: '未激活', color: 'gray', icon: 'PauseCircle' };
    case ServiceStatus.ERROR:
      return { label: '错误', color: 'red', icon: 'XCircle' };
    case ServiceStatus.MAINTENANCE:
      return { label: '维护中', color: 'yellow', icon: 'Wrench' };
    default:
      return { label: '未知', color: 'gray', icon: 'HelpCircle' };
  }
};