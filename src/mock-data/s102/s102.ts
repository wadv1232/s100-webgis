// S-102相关模拟数据

// S-102数据集模拟数据
export const mockS102Datasets = [
  {
    id: '1',
    name: '上海港高精度水深数据',
    description: '上海港区域S-102高精度水深格网数据',
    version: '1.2',
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    status: 'PUBLISHED',
    publishedAt: '2024-01-15T10:00:00Z',
    coverage: {
      type: 'Polygon',
      coordinates: [[[121.0, 31.0], [122.0, 31.0], [122.0, 32.0], [121.0, 32.0], [121.0, 31.0]]]
    },
    resolution: '5m',
    verticalDatum: 'Mean Sea Level (MSL)',
    horizontalDatum: 'WGS84',
    depthRange: { min: -45.2, max: -2.1 },
    gridSize: { width: 1200, height: 800 },
    timeRange: {
      start: '2024-01-01T00:00:00Z',
      end: '2024-12-31T23:59:59Z'
    },
    metadata: {
      surveyMethod: 'Multibeam Echosounder',
      accuracy: '±0.1m',
      density: 'High Density',
      processingLevel: 'Level 2'
    }
  },
  {
    id: '2',
    name: '长江口航道水深数据',
    description: '长江口航道S-102水深监测数据',
    version: '2.0',
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    status: 'PUBLISHED',
    publishedAt: '2024-01-10T14:30:00Z',
    coverage: {
      type: 'Polygon',
      coordinates: [[[121.5, 31.0], [122.5, 31.0], [122.5, 31.5], [121.5, 31.5], [121.5, 31.0]]]
    },
    resolution: '2m',
    verticalDatum: 'Lowest Astronomical Tide (LAT)',
    horizontalDatum: 'WGS84',
    depthRange: { min: -25.8, max: -1.5 },
    gridSize: { width: 1500, height: 1000 },
    timeRange: {
      start: '2024-01-01T00:00:00Z',
      end: '2024-12-31T23:59:59Z'
    },
    metadata: {
      surveyMethod: 'Single Beam Echosounder',
      accuracy: '±0.2m',
      density: 'Medium Density',
      processingLevel: 'Level 1'
    }
  },
  {
    id: '3',
    name: '东海分局水深数据',
    description: '东海分局辖区S-102高精度水深数据',
    version: '1.5',
    nodeId: 'east-china-sea',
    nodeName: '东海分局区域节点',
    status: 'PUBLISHED',
    publishedAt: '2024-01-08T09:15:00Z',
    coverage: {
      type: 'Polygon',
      coordinates: [[[118.0, 28.0], [124.0, 28.0], [124.0, 34.0], [118.0, 34.0], [118.0, 28.0]]]
    },
    resolution: '10m',
    verticalDatum: 'Mean Sea Level (MSL)',
    horizontalDatum: 'WGS84',
    depthRange: { min: -120.5, max: -5.2 },
    gridSize: { width: 2400, height: 1800 },
    timeRange: {
      start: '2024-01-01T00:00:00Z',
      end: '2024-12-31T23:59:59Z'
    },
    metadata: {
      surveyMethod: 'Multibeam Echosounder',
      accuracy: '±0.3m',
      density: 'Medium Density',
      processingLevel: 'Level 2'
    }
  }
]

// 颜色映射方案
export const COLOR_SCALES = [
  { value: 'viridis', name: 'Viridis', description: '蓝-绿-黄渐变' },
  { value: 'plasma', name: 'Plasma', description: '紫-粉-黄渐变' },
  { value: 'inferno', name: 'Inferno', description: '黑-红-黄渐变' },
  { value: 'magma', name: 'Magma', description: '黑-紫-白渐变' },
  { value: 'cividis', name: 'Cividis', description: '蓝-黄渐变（色盲友好）' },
  { value: 'turbo', name: 'Turbo', description: '蓝-青-黄-红渐变' }
]

// 渲染样式
export const RENDER_STYLES = [
  { value: 'default', name: '默认', icon: '🏔️' },
  { value: 'contours', name: '等深线', icon: '📐' },
  { value: 'shaded_relief', name: '阴影地形', icon: '🌅' },
  { value: 'hillshade', name: '山体阴影', icon: '⛰️' },
  { value: 'slope', name: '坡度', icon: '📊' },
  { value: 'aspect', name: '坡向', icon: '🧭' }
]

// S-102数据集统计
export const s102Stats = {
  totalDatasets: 3,
  publishedDatasets: 3,
  averageResolution: '5.7m',
  totalCoverage: '约8500平方公里',
  datasetsByNode: {
    'shanghai-port': 2,
    'east-china-sea': 1
  },
  resolutions: ['2m', '5m', '10m'],
  surveyMethods: {
    'Multibeam Echosounder': 2,
    'Single Beam Echosounder': 1
  }
}