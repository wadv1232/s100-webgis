// 服务能力相关模拟数据
import { ServiceType } from '@prisma/client';

// 服务类型枚举
export const CapabilitiesServiceTypeEnum = {
  WMS: 'WMS',
  WFS: 'WFS',
  WCS: 'WCS'
} as const;

// 服务类型配置
export const CAPABILITIES_SERVICE_TYPES = [
  { value: CapabilitiesServiceTypeEnum.WMS, label: 'Web地图服务 (WMS)' },
  { value: CapabilitiesServiceTypeEnum.WFS, label: 'Web要素服务 (WFS)' },
  { value: CapabilitiesServiceTypeEnum.WCS, label: 'Web覆盖服务 (WCS)' }
];

// S-100产品配置
export const CAPABILITIES_S100_PRODUCTS = [
  { value: 'S101', name: 'S-101 电子海图', icon: 'Map' },
  { value: 'S102', name: 'S-102 高精度水深', icon: 'Waves' },
  { value: 'S104', name: 'S-104 动态水位', icon: 'Anchor' },
  { value: 'S111', name: 'S-111 实时海流', icon: 'Waves' },
  { value: 'S124', name: 'S-124 航行警告', icon: 'AlertTriangle' },
  { value: 'S131', name: 'S-131 海洋保护区', icon: 'Map' }
];

// 服务能力模拟数据
export const mockCapabilities = [
  {
    id: 'cap-1',
    productType: 'S101',
    serviceType: CapabilitiesServiceTypeEnum.WMS,
    isEnabled: true,
    endpoint: '/wms/s101',
    version: '1.3.0',
    node: {
      id: 'shanghai-port',
      name: '上海港叶子节点',
      type: 'LEAF',
      apiUrl: 'https://api.shanghai-port.gov.cn'
    },
    lastChecked: new Date().toISOString(),
    status: 'ACTIVE',
    responseTime: 120,
    uptime: 99.5
  },
  {
    id: 'cap-2',
    productType: 'S101',
    serviceType: CapabilitiesServiceTypeEnum.WFS,
    isEnabled: true,
    endpoint: '/wfs/s101',
    version: '1.1.0',
    node: {
      id: 'shanghai-port',
      name: '上海港叶子节点',
      type: 'LEAF',
      apiUrl: 'https://api.shanghai-port.gov.cn'
    },
    lastChecked: new Date().toISOString(),
    status: 'ACTIVE',
    responseTime: 95,
    uptime: 99.2
  },
  {
    id: 'cap-3',
    productType: 'S102',
    serviceType: CapabilitiesServiceTypeEnum.WCS,
    isEnabled: true,
    endpoint: '/wcs/s102',
    version: '1.1.1',
    node: {
      id: 'east-china-sea',
      name: '东海分局区域节点',
      type: 'REGIONAL',
      apiUrl: 'https://api.east.msa.gov.cn'
    },
    lastChecked: new Date().toISOString(),
    status: 'ACTIVE',
    responseTime: 180,
    uptime: 98.8
  },
  {
    id: 'cap-4',
    productType: 'S104',
    serviceType: CapabilitiesServiceTypeEnum.WMS,
    isEnabled: true,
    endpoint: '/wms/s104',
    version: '1.3.0',
    node: {
      id: 'shanghai-port',
      name: '上海港叶子节点',
      type: 'LEAF',
      apiUrl: 'https://api.shanghai-port.gov.cn'
    },
    lastChecked: new Date().toISOString(),
    status: 'ACTIVE',
    responseTime: 85,
    uptime: 99.1
  },
  {
    id: 'cap-5',
    productType: 'S111',
    serviceType: CapabilitiesServiceTypeEnum.WMS,
    isEnabled: true,
    endpoint: '/wms/s111',
    version: '1.3.0',
    node: {
      id: 'east-china-sea',
      name: '东海分局区域节点',
      type: 'REGIONAL',
      apiUrl: 'https://api.east.msa.gov.cn'
    },
    lastChecked: new Date(Date.now() - 300000).toISOString(),
    status: 'WARNING',
    responseTime: 350,
    uptime: 97.5
  },
  {
    id: 'cap-6',
    productType: 'S124',
    serviceType: CapabilitiesServiceTypeEnum.WFS,
    isEnabled: true,
    endpoint: '/wfs/s124',
    version: '1.1.0',
    node: {
      id: 'china-national',
      name: '中国海事局国家级节点',
      type: 'NATIONAL',
      apiUrl: 'https://api.msa.gov.cn'
    },
    lastChecked: new Date().toISOString(),
    status: 'ACTIVE',
    responseTime: 110,
    uptime: 99.8
  },
  {
    id: 'cap-7',
    productType: 'S131',
    serviceType: CapabilitiesServiceTypeEnum.WMS,
    isEnabled: false,
    endpoint: '/wms/s131',
    version: '1.3.0',
    node: {
      id: 'china-national',
      name: '中国海事局国家级节点',
      type: 'NATIONAL',
      apiUrl: 'https://api.msa.gov.cn'
    },
    lastChecked: new Date(Date.now() - 86400000).toISOString(),
    status: 'INACTIVE',
    responseTime: 0,
    uptime: 0
  },
  {
    id: 'cap-8',
    productType: 'S102',
    serviceType: CapabilitiesServiceTypeEnum.WMS,
    isEnabled: true,
    endpoint: '/wms/s102',
    version: '1.3.0',
    node: {
      id: 'ningbo-port',
      name: '宁波港叶子节点',
      type: 'LEAF',
      apiUrl: 'https://api.ningbo-port.gov.cn'
    },
    lastChecked: new Date(Date.now() - 600000).toISOString(),
    status: 'ACTIVE',
    responseTime: 200,
    uptime: 98.2
  }
];

// 服务能力统计模拟数据
export const capabilitiesStats = {
  totalCapabilities: 8,
  activeCapabilities: 6,
  warningCapabilities: 1,
  inactiveCapabilities: 1,
  capabilitiesByProduct: {
    'S101': 2,
    'S102': 2,
    'S104': 1,
    'S111': 1,
    'S124': 1,
    'S131': 1
  },
  capabilitiesByService: {
    [CapabilitiesServiceTypeEnum.WMS]: 5,
    [CapabilitiesServiceTypeEnum.WFS]: 2,
    [CapabilitiesServiceTypeEnum.WCS]: 1
  },
  capabilitiesByNode: {
    'shanghai-port': 3,
    'east-china-sea': 2,
    'china-national': 2,
    'ningbo-port': 1
  },
  averageResponseTime: 168,
  averageUptime: 96.8
};

// 获取产品图标
export const getCapabilitiesProductIcon = (product: string) => {
  const icons: Record<string, any> = {
    'S101': 'Map',
    'S102': 'Waves',
    'S104': 'Anchor',
    'S111': 'Waves',
    'S124': 'AlertTriangle',
    'S131': 'Map'
  };
  return icons[product] || 'Map';
};

// 完整的能力数据结构
export interface CapabilitiesData {
  capabilities: typeof mockCapabilities;
  stats: typeof capabilitiesStats;
}

// 模拟完整数据
export const mockCapabilitiesData: CapabilitiesData = {
  capabilities: mockCapabilities,
  stats: capabilitiesStats
};