// S-101相关模拟数据

// S-101数据集模拟数据
export const mockS101Datasets = [
  {
    id: '1',
    name: '上海港电子海图',
    description: '上海港区域S-101电子海图数据',
    version: '1.0',
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    status: 'PUBLISHED',
    publishedAt: '2024-01-15T10:00:00Z',
    coverage: {
      type: 'Polygon',
      coordinates: [[[121.0, 31.0], [122.0, 31.0], [122.0, 32.0], [121.0, 32.0], [121.0, 31.0]]]
    },
    scale: '1:50000',
    edition: 2024,
    updateNumber: 1,
    features: [
      { type: 'DEPARE', count: 1250 },
      { type: 'BOYLAT', count: 85 },
      { type: 'LIGHTS', count: 320 },
      { type: 'BUOY', count: 156 }
    ]
  },
  {
    id: '2',
    name: '长江口航道图',
    description: '长江口航道S-101电子海图',
    version: '2.1',
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    status: 'PUBLISHED',
    publishedAt: '2024-01-10T14:30:00Z',
    coverage: {
      type: 'Polygon',
      coordinates: [[[121.5, 31.0], [122.5, 31.0], [122.5, 31.5], [121.5, 31.5], [121.5, 31.0]]]
    },
    scale: '1:25000',
    edition: 2024,
    updateNumber: 3,
    features: [
      { type: 'DEPARE', count: 890 },
      { type: 'BOYLAT', count: 120 },
      { type: 'LIGHTS', count: 210 },
      { type: 'BUOY', count: 95 }
    ]
  },
  {
    id: '3',
    name: '东海分局电子海图',
    description: '东海分局辖区S-101电子海图数据',
    version: '1.2',
    nodeId: 'east-china-sea',
    nodeName: '东海分局区域节点',
    status: 'PUBLISHED',
    publishedAt: '2024-01-08T09:15:00Z',
    coverage: {
      type: 'Polygon',
      coordinates: [[[118.0, 28.0], [124.0, 28.0], [124.0, 34.0], [118.0, 34.0], [118.0, 28.0]]]
    },
    scale: '1:100000',
    edition: 2024,
    updateNumber: 2,
    features: [
      { type: 'DEPARE', count: 2450 },
      { type: 'BOYLAT', count: 180 },
      { type: 'LIGHTS', count: 450 },
      { type: 'BUOY', count: 220 }
    ]
  }
]

// S-101要素类型
export const S101_FEATURE_TYPES = {
  DEPARE: { name: '深度区域', color: '#4a90e2' },
  BOYLAT: { name: '浮标、立标', color: '#ff6b6b' },
  LIGHTS: { name: '灯标', color: '#ffd93d' },
  BUOY: { name: '浮标', color: '#6bcf7f' },
  SOUNDG: { name: '测深点', color: '#e84393' },
  COALNE: { name: '海岸线', color: '#2d3436' },
  DEPCNT: { name: '等深线', color: '#0984e3' },
  OBSTRN: { name: '障碍物', color: '#d63031' }
}

// S-101数据集统计
export const s101Stats = {
  totalDatasets: 3,
  publishedDatasets: 3,
  totalFeatures: {
    DEPARE: 4590,
    BOYLAT: 385,
    LIGHTS: 980,
    BUOY: 471
  },
  datasetsByNode: {
    'shanghai-port': 2,
    'east-china-sea': 1
  },
  averageScale: '1:58333'
}