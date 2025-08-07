// S-100相关模拟数据

// S-100产品系列
export const S100_PRODUCTS = [
  {
    id: 'S101',
    name: 'S-101 电子海图',
    description: '电子海图产品，提供水深、岸线、航标等基础航海信息',
    version: '1.0.0',
    status: 'ACTIVE',
    icon: 'Map',
    color: 'blue',
    services: ['WMS', 'WFS'],
    lastUpdated: new Date('2024-11-01').toISOString(),
    metadata: {
      specification: 'IHO S-101 Edition 1.0.0',
      coordinateSystem: 'WGS84',
      updateFrequency: '月度',
      coverage: '全球'
    }
  },
  {
    id: 'S102',
    name: 'S-102 高精度水深',
    description: '高精度水深测量数据，提供精确的水深信息',
    version: '2.0.0',
    status: 'ACTIVE',
    icon: 'Waves',
    color: 'cyan',
    services: ['WCS', 'WMS'],
    lastUpdated: new Date('2024-10-15').toISOString(),
    metadata: {
      specification: 'IHO S-102 Edition 2.0.0',
      coordinateSystem: 'WGS84',
      updateFrequency: '季度',
      coverage: '沿海区域'
    }
  },
  {
    id: 'S104',
    name: 'S-104 动态水位',
    description: '实时动态水位数据，提供潮汐和水位变化信息',
    version: '1.1.0',
    status: 'ACTIVE',
    icon: 'Anchor',
    color: 'green',
    services: ['WMS', 'WFS'],
    lastUpdated: new Date('2024-11-10').toISOString(),
    metadata: {
      specification: 'IHO S-104 Edition 1.1.0',
      coordinateSystem: 'WGS84',
      updateFrequency: '实时',
      coverage: '港口区域'
    }
  },
  {
    id: 'S111',
    name: 'S-111 实时海流',
    description: '实时海流监测数据，提供流速和流向信息',
    version: '1.0.0',
    status: 'ACTIVE',
    icon: 'Waves',
    color: 'teal',
    services: ['WMS'],
    lastUpdated: new Date('2024-10-20').toISOString(),
    metadata: {
      specification: 'IHO S-111 Edition 1.0.0',
      coordinateSystem: 'WGS84',
      updateFrequency: '每小时',
      coverage: '海域'
    }
  },
  {
    id: 'S124',
    name: 'S-124 航行警告',
    description: '航行警告信息，包含临时航行通告和危险信息',
    version: '2.0.0',
    status: 'ACTIVE',
    icon: 'AlertTriangle',
    color: 'red',
    services: ['WFS'],
    lastUpdated: new Date('2024-11-01').toISOString(),
    metadata: {
      specification: 'IHO S-124 Edition 2.0.0',
      coordinateSystem: 'WGS84',
      updateFrequency: '实时',
      coverage: '全球'
    }
  },
  {
    id: 'S131',
    name: 'S-131 海洋保护区',
    description: '海洋保护区边界和管理信息',
    version: '0.8.0',
    status: 'DEVELOPMENT',
    icon: 'Shield',
    color: 'purple',
    services: ['WMS', 'WFS'],
    lastUpdated: new Date('2024-09-15').toISOString(),
    metadata: {
      specification: 'IHO S-131 Edition 0.8.0 (Draft)',
      coordinateSystem: 'WGS84',
      updateFrequency: '年度',
      coverage: '全球'
    }
  }
];

// 服务类型配置
export const SERVICE_TYPES = [
  { value: 'WMS', name: 'Web地图服务', description: '地图渲染和显示服务' },
  { value: 'WFS', name: 'Web要素服务', description: '矢量数据查询服务' },
  { value: 'WCS', name: 'Web覆盖服务', description: '栅格数据访问服务' },
  { value: 'WMTS', name: 'Web地图切片服务', description: '地图切片服务' },
  { value: 'SOS', name: '传感器观测服务', description: '传感器数据服务' }
];

// 产品服务实例
export const productServices = [
  {
    id: 's101-shanghai-wms',
    productId: 'S101',
    productName: 'S-101 电子海图',
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    serviceType: 'WMS',
    endpoint: 'https://api.shanghai-port.gov.cn/wms/s101',
    version: '1.3.0',
    status: 'ACTIVE',
    lastChecked: new Date().toISOString(),
    responseTime: 120,
    uptime: 99.5
  },
  {
    id: 's101-shanghai-wfs',
    productId: 'S101',
    productName: 'S-101 电子海图',
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    serviceType: 'WFS',
    endpoint: 'https://api.shanghai-port.gov.cn/wfs/s101',
    version: '1.1.0',
    status: 'ACTIVE',
    lastChecked: new Date().toISOString(),
    responseTime: 95,
    uptime: 99.2
  },
  {
    id: 's102-east-wcs',
    productId: 'S102',
    productName: 'S-102 高精度水深',
    nodeId: 'east-china-sea',
    nodeName: '东海分局区域节点',
    serviceType: 'WCS',
    endpoint: 'https://api.east.msa.gov.cn/wcs/s102',
    version: '1.1.1',
    status: 'ACTIVE',
    lastChecked: new Date().toISOString(),
    responseTime: 180,
    uptime: 98.8
  },
  {
    id: 's104-shanghai-wms',
    productId: 'S104',
    productName: 'S-104 动态水位',
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    serviceType: 'WMS',
    endpoint: 'https://api.shanghai-port.gov.cn/wms/s104',
    version: '1.3.0',
    status: 'ACTIVE',
    lastChecked: new Date().toISOString(),
    responseTime: 85,
    uptime: 99.1
  },
  {
    id: 's111-east-wms',
    productId: 'S111',
    productName: 'S-111 实时海流',
    nodeId: 'east-china-sea',
    nodeName: '东海分局区域节点',
    serviceType: 'WMS',
    endpoint: 'https://api.east.msa.gov.cn/wms/s111',
    version: '1.3.0',
    status: 'WARNING',
    lastChecked: new Date(Date.now() - 300000).toISOString(),
    responseTime: 350,
    uptime: 97.5
  },
  {
    id: 's124-national-wfs',
    productId: 'S124',
    productName: 'S-124 航行警告',
    nodeId: 'china-national',
    nodeName: '中国海事局国家级节点',
    serviceType: 'WFS',
    endpoint: 'https://api.msa.gov.cn/wfs/s124',
    version: '1.1.0',
    status: 'ACTIVE',
    lastChecked: new Date().toISOString(),
    responseTime: 110,
    uptime: 99.8
  }
];

// S-100统计信息
export const s100Stats = {
  totalProducts: 6,
  activeProducts: 5,
  developmentProducts: 1,
  totalServices: 6,
  activeServices: 5,
  warningServices: 1,
  productsByStatus: {
    ACTIVE: 5,
    DEVELOPMENT: 1,
    DEPRECATED: 0
  },
  servicesByType: {
    WMS: 4,
    WFS: 2,
    WCS: 1
  },
  averageResponseTime: 157,
  averageUptime: 98.8
};

// 产品兼容性信息
export const productCompatibility = [
  {
    product: 'S101',
    compatibleWith: ['S102', 'S104', 'S124'],
    description: '可与水深、水位、航行警告数据叠加显示'
  },
  {
    product: 'S102',
    compatibleWith: ['S101', 'S104'],
    description: '可与电子海图、动态水位数据叠加分析'
  },
  {
    product: 'S104',
    compatibleWith: ['S101', 'S102', 'S111'],
    description: '可与电子海图、水深、海流数据结合使用'
  },
  {
    product: 'S111',
    compatibleWith: ['S104', 'S124'],
    description: '可与动态水位、航行警告数据关联分析'
  },
  {
    product: 'S124',
    compatibleWith: ['S101', 'S111'],
    description: '可与电子海图、海流数据配合使用'
  },
  {
    product: 'S131',
    compatibleWith: ['S101', 'S124'],
    description: '可与电子海图、航行警告数据叠加'
  }
];

// 获取产品图标（返回图标名称）
export const getProductIcon = (productId: string) => {
  const product = S100_PRODUCTS.find(p => p.id === productId);
  return product ? product.icon : 'Map';
};

// 获取产品颜色
export const getProductColor = (productId: string) => {
  const product = S100_PRODUCTS.find(p => p.id === productId);
  return product ? product.color : 'blue';
};