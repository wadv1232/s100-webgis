// 节点相关模拟数据

// 节点健康状态枚举
export const NodeHealthStatus = {
  HEALTHY: 'HEALTHY',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  OFFLINE: 'OFFLINE'
} as const;

// 节点类型枚举
export const NodeType = {
  GLOBAL_ROOT: 'GLOBAL_ROOT',
  NATIONAL: 'NATIONAL',
  REGIONAL: 'REGIONAL',
  LEAF: 'LEAF'
} as const;

// 节点模拟数据
export const mockNodes = [
  {
    id: 'global-root',
    code: 'IHO_GLOBAL_ROOT',
    name: 'IHO全球根节点',
    type: NodeType.GLOBAL_ROOT,
    level: 0,
    description: '国际海道测量组织全球协调节点',
    healthStatus: NodeHealthStatus.HEALTHY,
    isActive: true,
    apiUrl: 'https://api.iho.org/global',
    adminUrl: 'https://admin.iho.org/global',
    coverage: '全球范围',
    location: { lat: 0, lng: 0 },
    lastHealthCheck: new Date().toISOString(),
    children: ['china-national'],
    _count: {
      datasets: 45,
      childNodeRelations: 1,
      capabilities: 12
    }
  },
  {
    id: 'china-national',
    code: 'CHINA_NATIONAL',
    name: '中国海事局国家级节点',
    type: NodeType.NATIONAL,
    level: 1,
    description: '中国海事局总部的技术负责人',
    healthStatus: NodeHealthStatus.HEALTHY,
    isActive: true,
    apiUrl: 'https://api.msa.gov.cn/national',
    adminUrl: 'https://admin.msa.gov.cn/national',
    coverage: '中国沿海',
    location: { lat: 35.8617, lng: 104.1954 },
    lastHealthCheck: new Date().toISOString(),
    parent: 'global-root',
    children: ['east-china-sea', 'south-china-sea', 'north-china-sea'],
    _count: {
      datasets: 120,
      childNodeRelations: 3,
      capabilities: 8
    }
  },
  {
    id: 'east-china-sea',
    code: 'EAST_CHINA_BUREAU',
    name: '东海分局区域节点',
    type: NodeType.REGIONAL,
    level: 2,
    description: '中国海事局东海分局',
    healthStatus: NodeHealthStatus.HEALTHY,
    isActive: true,
    apiUrl: 'https://api.east.msa.gov.cn',
    adminUrl: 'https://admin.east.msa.gov.cn',
    coverage: '东海区域',
    location: { lat: 31.2304, lng: 121.4737 },
    lastHealthCheck: new Date().toISOString(),
    parent: 'china-national',
    children: ['shanghai-port', 'ningbo-port', 'qingdao-port'],
    _count: {
      datasets: 85,
      childNodeRelations: 3,
      capabilities: 6
    }
  },
  {
    id: 'shanghai-port',
    code: 'SHANGHAI_PORT',
    name: '上海港叶子节点',
    type: NodeType.LEAF,
    level: 3,
    description: '上海港务局数据管理中心',
    healthStatus: NodeHealthStatus.HEALTHY,
    isActive: true,
    apiUrl: 'https://api.shanghai-port.gov.cn',
    adminUrl: 'https://admin.shanghai-port.gov.cn',
    coverage: '上海港区域',
    location: { lat: 31.2304, lng: 121.4737 },
    lastHealthCheck: new Date().toISOString(),
    parent: 'east-china-sea',
    capabilities: [
      {
        id: 'cap-1',
        productType: 'S101',
        serviceType: 'WMS',
        isEnabled: true,
        endpoint: '/wms/s101',
        version: '1.3.0'
      },
      {
        id: 'cap-2',
        productType: 'S102',
        serviceType: 'WCS',
        isEnabled: true,
        endpoint: '/wcs/s102',
        version: '1.1.1'
      }
    ],
    _count: {
      datasets: 25,
      childNodeRelations: 0,
      capabilities: 2
    }
  },
  {
    id: 'ningbo-port',
    code: 'NINGBO_PORT',
    name: '宁波港叶子节点',
    type: NodeType.LEAF,
    level: 3,
    description: '宁波港务局数据管理中心',
    healthStatus: NodeHealthStatus.WARNING,
    isActive: true,
    apiUrl: 'https://api.ningbo-port.gov.cn',
    adminUrl: 'https://admin.ningbo-port.gov.cn',
    coverage: '宁波港区域',
    location: { lat: 29.8683, lng: 121.5440 },
    lastHealthCheck: new Date(Date.now() - 3600000).toISOString(),
    parent: 'east-china-sea',
    capabilities: [
      {
        id: 'cap-3',
        productType: 'S101',
        serviceType: 'WMS',
        isEnabled: true,
        endpoint: '/wms/s101',
        version: '1.3.0'
      }
    ],
    _count: {
      datasets: 18,
      childNodeRelations: 0,
      capabilities: 1
    }
  }
];

// 节点类型名称映射
export const getNodeTypeName = (type: string) => {
  switch (type) {
    case NodeType.GLOBAL_ROOT:
      return '全球根节点';
    case NodeType.NATIONAL:
      return '国家级节点';
    case NodeType.REGIONAL:
      return '区域节点';
    case NodeType.LEAF:
      return '叶子节点';
    default:
      return '未知类型';
  }
};

// 获取健康状态图标（返回组件配置）
export const getHealthIconConfig = (status: string) => {
  switch (status) {
    case NodeHealthStatus.HEALTHY:
      return { icon: 'CheckCircle', className: 'h-4 w-4 text-green-500' };
    case NodeHealthStatus.WARNING:
      return { icon: 'Clock', className: 'h-4 w-4 text-yellow-500' };
    case NodeHealthStatus.ERROR:
      return { icon: 'AlertTriangle', className: 'h-4 w-4 text-red-500' };
    default:
      return { icon: 'Clock', className: 'h-4 w-4 text-gray-500' };
  }
};

// 获取健康状态徽章（返回配置）
export const getHealthBadge = (status: string) => {
  switch (status) {
    case NodeHealthStatus.HEALTHY:
      return { variant: 'default' as const, className: 'bg-green-500', text: '健康' };
    case NodeHealthStatus.WARNING:
      return { variant: 'secondary' as const, className: '', text: '警告' };
    case NodeHealthStatus.ERROR:
      return { variant: 'destructive' as const, className: '', text: '错误' };
    default:
      return { variant: 'outline' as const, className: '', text: '离线' };
  }
};