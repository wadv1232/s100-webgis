// Mock data for the S-100 Maritime Service Platform

export const homeMockNodes = [
  {
    id: 'node-1',
    name: '全球根节点',
    type: 'GLOBAL_ROOT',
    status: 'HEALTHY',
    location: 'Global',
    capabilities: ['WMS', 'WFS', 'WCS'],
    healthScore: 98,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'node-2', 
    name: '中国区域节点',
    type: 'REGIONAL',
    status: 'HEALTHY',
    location: 'China',
    capabilities: ['WMS', 'WFS'],
    healthScore: 95,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'node-3',
    name: '上海节点',
    type: 'LEAF',
    status: 'WARNING',
    location: 'Shanghai',
    capabilities: ['WMS'],
    healthScore: 78,
    lastUpdated: new Date().toISOString()
  }
]

export const s100Products = [
  {
    id: 'S101',
    name: 'S-101 电子海图',
    description: '标准电子海图数据服务',
    status: 'ACTIVE',
    version: '1.0.0',
    services: ['WMS', 'WFS']
  },
  {
    id: 'S102',
    name: 'S-102 水深测量数据',
    description: '水深测量和海底地形数据服务',
    status: 'ACTIVE',
    version: '1.0.0',
    services: ['WMS', 'WCS']
  },
  {
    id: 'S104',
    name: 'S-104 航行信息',
    description: '实时航行信息和动态数据',
    status: 'DEVELOPMENT',
    version: '0.9.0',
    services: ['WMS']
  }
]

// 地图服务页面需要的节点数据
export const mapServiceNodes = [
  {
    id: 'global-root',
    name: 'IHO全球根节点',
    type: 'GLOBAL_ROOT',
    level: 0,
    description: '国际海道测量组织全球协调节点',
    healthStatus: 'HEALTHY',
    services: ['S101-WMS', 'S102-WMS', 'S104-WMS', 'S111-WMS'],
    location: { lat: 0, lng: 0 }
  },
  {
    id: 'china-national',
    name: '中国海事局国家级节点',
    type: 'NATIONAL',
    level: 1,
    description: '中国海事局总部的技术负责人',
    healthStatus: 'HEALTHY',
    services: ['S101-WMS', 'S102-WMS'],
    location: { lat: 35.8617, lng: 104.1954 }
  },
  {
    id: 'east-china-sea',
    name: '东海分局区域节点',
    type: 'REGIONAL',
    level: 2,
    description: '中国海事局东海分局',
    healthStatus: 'HEALTHY',
    services: ['S102-WMS', 'S102-WCS', 'S111-WMS'],
    location: { lat: 31.2304, lng: 121.4737 }
  },
  {
    id: 'shanghai-port',
    name: '上海港叶子节点',
    type: 'LEAF',
    level: 3,
    description: '上海港务局数据管理中心',
    healthStatus: 'HEALTHY',
    services: ['S101-WMS', 'S102-WCS'],
    location: { lat: 31.2000, lng: 121.5000 }
  },
  {
    id: 'ningbo-port',
    name: '宁波港叶子节点',
    type: 'LEAF',
    level: 3,
    description: '宁波港务局数据管理中心',
    healthStatus: 'WARNING',
    services: ['S101-WMS'],
    location: { lat: 29.8683, lng: 121.5440 }
  }
]

// 地图服务页面需要的S100服务数据
export const mockS100Services = [
  {
    id: 's101-001',
    name: 'S-101 电子海图服务',
    product: 'S101',
    type: 'WMS',
    status: 'ACTIVE',
    endpoint: '/api/s101/wms',
    version: '1.3.0',
    layers: ['S101_Electronic_Navigational_Chart'],
    formats: ['image/png', 'image/jpeg'],
    nodeId: 'shanghai-port'
  },
  {
    id: 's102-001',
    name: 'S-102 水深测量服务',
    product: 'S102',
    type: 'WMS',
    status: 'ACTIVE',
    endpoint: '/api/s102/wms',
    version: '1.3.0',
    layers: ['S102_Bathymetric_Data'],
    formats: ['image/png', 'image/jpeg'],
    nodeId: 'shanghai-port'
  },
  {
    id: 's102-002',
    name: 'S-102 水深覆盖服务',
    product: 'S102',
    type: 'WCS',
    status: 'ACTIVE',
    endpoint: '/api/s102/wcs',
    version: '1.1.1',
    layers: ['S102_Bathymetric_Coverage'],
    formats: ['image/tiff', 'application/netcdf'],
    nodeId: 'shanghai-port'
  },
  {
    id: 's111-001',
    name: 'S-111 海流服务',
    product: 'S111',
    type: 'WMS',
    status: 'ACTIVE',
    endpoint: '/api/s111/wms',
    version: '1.3.0',
    layers: ['S111_Surface_Currents'],
    formats: ['image/png', 'image/jpeg'],
    nodeId: 'east-china-sea'
  }
]

export const systemStatus = {
  onlineNodes: 12,
  activeServices: 8,
  datasets: 24,
  systemHealth: '98%'
}