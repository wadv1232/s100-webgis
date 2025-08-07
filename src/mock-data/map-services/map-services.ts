// 地图服务页面专用模拟数据
import { mockNodes } from '../nodes/nodes'

// 简化的节点数据（适配地图服务页面需求）
export const mapServiceNodes = mockNodes.map(node => ({
  id: node.id,
  name: node.name,
  type: node.type,
  level: node.level,
  description: node.description,
  healthStatus: node.healthStatus,
  services: node.capabilities?.map(cap => `${cap.productType}-${cap.serviceType}`) || [],
  location: node.location
}))

// S-100服务数据（适配地图服务页面需求）
export const mockS100Services = [
  {
    id: 's101-wms',
    name: 'S-101电子海图WMS服务',
    type: 'WMS' as const,
    product: 'S101' as const,
    endpoint: '/api/s101/wms',
    version: '1.3.0',
    layers: ['navigation', 'depth', 'landmark', 'restricted'],
    formats: ['image/png', 'image/jpeg', 'application/json'],
    status: 'ACTIVE' as const,
    nodeId: 'global-root',
    opacity: 0.7,
    visible: false,
    color: '#2563eb'
  },
  {
    id: 's102-wms',
    name: 'S-102高精度水深WMS服务',
    type: 'WMS' as const,
    product: 'S102' as const,
    endpoint: '/api/s102/wms',
    version: '1.3.0',
    layers: ['bathymetry', 'contour', 'soundings', 'quality'],
    formats: ['image/png', 'image/jpeg', 'application/json'],
    status: 'ACTIVE' as const,
    nodeId: 'global-root',
    opacity: 0.7,
    visible: false,
    color: '#059669'
  },
  {
    id: 's104-wms',
    name: 'S-104动态水位WMS服务',
    type: 'WMS' as const,
    product: 'S104' as const,
    endpoint: '/api/s104/wms',
    version: '1.3.0',
    layers: ['water_level', 'tidal', 'current', 'prediction'],
    formats: ['image/png', 'image/jpeg'],
    status: 'ACTIVE' as const,
    nodeId: 'shanghai-port',
    opacity: 0.6,
    visible: false,
    color: '#7c3aed'
  },
  {
    id: 's111-wms',
    name: 'S-111实时海流WMS服务',
    type: 'WMS' as const,
    product: 'S111' as const,
    endpoint: '/api/s111/wms',
    version: '1.3.0',
    layers: ['current', 'direction', 'speed', 'forecast'],
    formats: ['image/png', 'image/jpeg'],
    status: 'ACTIVE' as const,
    nodeId: 'east-china-sea',
    opacity: 0.8,
    visible: false,
    color: '#ea580c'
  },
  {
    id: 's101-wfs',
    name: 'S-101电子海图WFS服务',
    type: 'WFS' as const,
    product: 'S101' as const,
    endpoint: '/api/s101/wfs',
    version: '1.1.0',
    features: ['depth_areas', 'navigation_lines', 'anchors', 'obstructions'],
    formats: ['application/json', 'application/gml', 'text/xml'],
    status: 'ACTIVE' as const,
    nodeId: 'shanghai-port',
    opacity: 1.0,
    visible: false,
    color: '#2563eb'
  },
  {
    id: 's102-wcs',
    name: 'S-102高精度水深WCS服务',
    type: 'WCS' as const,
    product: 'S102' as const,
    endpoint: '/api/s102/wcs',
    version: '1.1.1',
    coverages: ['bathymetry', 'uncertainty', 'quality'],
    formats: ['image/tiff', 'application/netcdf'],
    status: 'ACTIVE' as const,
    nodeId: 'east-china-sea',
    opacity: 0.9,
    visible: false,
    color: '#059669'
  }
]

// 服务配置默认值
export const defaultServiceConfig = {
  autoRefresh: true,
  refreshInterval: 30,
  showLayers: true,
  showLegend: true,
  defaultFormat: 'image/png'
}

// 地图服务统计
export const mapServiceStats = {
  totalNodes: mapServiceNodes.length,
  healthyNodes: mapServiceNodes.filter(n => n.healthStatus === 'HEALTHY').length,
  totalServices: mockS100Services.length,
  activeServices: mockS100Services.filter(s => s.status === 'ACTIVE').length,
  servicesByType: {
    WMS: mockS100Services.filter(s => s.type === 'WMS').length,
    WFS: mockS100Services.filter(s => s.type === 'WFS').length,
    WCS: mockS100Services.filter(s => s.type === 'WCS').length
  },
  servicesByProduct: {
    S101: mockS100Services.filter(s => s.product === 'S101').length,
    S102: mockS100Services.filter(s => s.product === 'S102').length,
    S104: mockS100Services.filter(s => s.product === 'S104').length,
    S111: mockS100Services.filter(s => s.product === 'S111').length
  }
}