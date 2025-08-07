// 测试节点数据
export const mockNodes = [
  {
    id: 'node-001',
    name: '上海海事服务中心',
    type: 'NATIONAL' as const,
    level: 2,
    description: '国家级海事数据服务中心',
    healthStatus: 'HEALTHY' as const,
    services: ['S-101', 'S-102', 'S-104'],
    location: { lat: 31.2000, lng: 121.5000 }
  },
  {
    id: 'node-002',
    name: '北京海事服务中心',
    type: 'NATIONAL' as const,
    level: 2,
    description: '国家级海事数据服务中心',
    healthStatus: 'HEALTHY' as const,
    services: ['S-101', 'S-111'],
    location: { lat: 39.9042, lng: 116.4074 }
  },
  {
    id: 'node-003',
    name: '广州海事服务中心',
    type: 'REGIONAL' as const,
    level: 3,
    description: '区域级海事数据服务中心',
    healthStatus: 'WARNING' as const,
    services: ['S-102', 'S-124'],
    location: { lat: 23.1291, lng: 113.2644 }
  },
  {
    id: 'node-004',
    name: '深圳海事服务中心',
    type: 'REGIONAL' as const,
    level: 3,
    description: '区域级海事数据服务中心',
    healthStatus: 'ERROR' as const,
    services: ['S-101', 'S-104'],
    location: { lat: 22.5431, lng: 114.0579 }
  },
  {
    id: 'node-005',
    name: '天津海事服务中心',
    type: 'LEAF' as const,
    level: 4,
    description: '基层海事数据服务中心',
    healthStatus: 'HEALTHY' as const,
    services: ['S-102'],
    location: { lat: 39.3434, lng: 117.3616 }
  }
]

// 测试服务数据
export const mockServices = [
  {
    id: 'service-001',
    name: 'S-101电子海图服务',
    type: 'WMS' as const,
    product: 'S-101',
    status: 'ACTIVE' as const,
    endpoint: 'https://maritime.example.com/wms',
    version: '1.3.0',
    formats: ['image/png', 'image/jpeg'],
    nodeId: 'node-001'
  },
  {
    id: 'service-002',
    name: 'S-102水深服务',
    type: 'WMS' as const,
    product: 'S-102',
    status: 'ACTIVE' as const,
    endpoint: 'https://maritime.example.com/wms',
    version: '1.3.0',
    formats: ['image/png', 'image/jpeg'],
    nodeId: 'node-001'
  },
  {
    id: 'service-003',
    name: 'S-104航行信息服务',
    type: 'WMS' as const,
    product: 'S-104',
    status: 'ACTIVE' as const,
    endpoint: 'https://maritime.example.com/wms',
    version: '1.3.0',
    formats: ['image/png', 'image/jpeg'],
    nodeId: 'node-001'
  },
  {
    id: 'service-004',
    name: 'S-111水位服务',
    type: 'WMS' as const,
    product: 'S-111',
    status: 'ACTIVE' as const,
    endpoint: 'https://maritime.example.com/wms',
    version: '1.3.0',
    formats: ['image/png', 'image/jpeg'],
    nodeId: 'node-002'
  },
  {
    id: 'service-005',
    name: 'S-124海上气象服务',
    type: 'WMS' as const,
    product: 'S-124',
    status: 'MAINTENANCE' as const,
    endpoint: 'https://maritime.example.com/wms',
    version: '1.3.0',
    formats: ['image/png', 'image/jpeg'],
    nodeId: 'node-003'
  }
]

// 测试地图数据
export const mockMapData = {
  center: [31.2000, 121.5000] as [number, number],
  zoom: 6,
  bounds: [
    [20, 110],
    [45, 125]
  ] as [[number, number], [number, number]]
}

// 测试坐标数据（包含问题坐标）
export const testCoordinates = [
  { name: 'Shanghai', lat: 31.2000, lng: 121.5000, expected: [31.2000, 121.5000] },
  { name: 'New York', lat: 40.7128, lng: -74.0060, expected: [40.7128, -74.0060] },
  { name: 'London', lat: 51.5074, lng: -0.1278, expected: [51.5074, -0.1278] },
  { name: 'Problematic', lat: -88.032349, lng: -326.667414, expected: [-88.032349, 33.332586] },
  { name: 'Another Issue', lat: 45.5, lng: 400.0, expected: [45.5, 40.0] },
  { name: 'Out of Bounds', lat: 95.0, lng: -200.0, expected: [90.0, 160.0] }
]

// 底图配置测试数据
export const baseMapConfigs = [
  {
    type: 'osm' as const,
    name: '标准地图',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  },
  {
    type: 'satellite' as const,
    name: '卫星地图',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}',
    attribution: '© Esri'
  },
  {
    type: 'terrain' as const,
    name: '地形地图',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap'
  },
  {
    type: 'custom' as const,
    name: '自定义地图',
    url: 'https://custom-tile-server.com/{z}/{x}/{y}.png',
    attribution: 'Custom Provider'
  }
]

// API 响应模拟数据
export const mockApiResponses = {
  nodes: {
    success: {
      status: 200,
      data: mockNodes
    },
    error: {
      status: 500,
      error: 'Internal Server Error'
    }
  },
  services: {
    success: {
      status: 200,
      data: mockServices
    },
    error: {
      status: 404,
      error: 'Services not found'
    }
  },
  nodeDetail: {
    success: {
      status: 200,
      data: mockNodes[0]
    },
    notFound: {
      status: 404,
      error: 'Node not found'
    }
  },
  baseMapConfig: {
    success: {
      status: 200,
      data: {
        type: 'satellite',
        minZoom: 1,
        maxZoom: 18
      }
    },
    error: {
      status: 400,
      error: 'Invalid configuration'
    }
  }
}

// 用户故事测试数据
export const userStoryTestData = {
  story1: {
    name: '海事服务浏览',
    user: '海事服务用户',
    goal: '浏览和查看不同地区的海事服务节点和状态',
    steps: [
      '访问地图服务页面',
      '查看地图上的节点标记',
      '点击节点查看详情',
      '验证节点状态显示'
    ]
  },
  story2: {
    name: '节点管理',
    user: '系统管理员',
    goal: '管理海事服务节点',
    steps: [
      '登录系统',
      '进入节点管理界面',
      '创建新节点',
      '编辑现有节点',
      '删除节点'
    ]
  },
  story3: {
    name: '坐标测试',
    user: '开发人员',
    goal: '测试坐标系统正确性',
    steps: [
      '访问坐标测试页面',
      '查看测试坐标点',
      '验证坐标标准化',
      '测试边界处理'
    ]
  },
  story4: {
    name: '底图配置',
    user: '系统配置员',
    goal: '配置不同底图类型',
    steps: [
      '访问底图配置界面',
      '切换底图类型',
      '验证底图加载',
      '保存配置'
    ]
  }
}

// 创建测试数据的辅助函数
export const createMockNode = (overrides = {}) => ({
  id: 'test-node',
  name: 'Test Node',
  type: 'NATIONAL',
  level: 2,
  description: 'Test Description',
  healthStatus: 'HEALTHY',
  services: ['S-101'],
  location: { lat: 0, lng: 0 },
  ...overrides
})

export const createMockService = (overrides = {}) => ({
  id: 'test-service',
  name: 'Test Service',
  type: 'WMS',
  product: 'S-101',
  status: 'ACTIVE',
  endpoint: 'https://test.com/wms',
  version: '1.3.0',
  formats: ['image/png'],
  nodeId: 'test-node',
  ...overrides
})

export const createMockCoordinate = (overrides = {}) => ({
  name: 'Test Coordinate',
  lat: 0,
  lng: 0,
  expected: [0, 0],
  ...overrides
})