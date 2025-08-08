// 数据集相关模拟数据
import { DatasetStatus, ProductType } from '@prisma/client';

// 数据集状态枚举
export const DatasetStatusEnum = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
  DEPRECATED: 'DEPRECATED'
} as const;

// 产品类型枚举
export const ProductTypeEnum = {
  S101: 'S101',
  S102: 'S102',
  S104: 'S104',
  S111: 'S111',
  S124: 'S124',
  S131: 'S131'
} as const;

// S-100产品配置
export const DATASETS_S100_PRODUCTS = [
  { value: ProductTypeEnum.S101, label: 'S-101 电子海图' },
  { value: ProductTypeEnum.S102, label: 'S-102 高精度水深' },
  { value: ProductTypeEnum.S104, label: 'S-104 动态水位' },
  { value: ProductTypeEnum.S111, label: 'S-111 实时海流' },
  { value: ProductTypeEnum.S124, label: 'S-124 航行警告' },
  { value: ProductTypeEnum.S131, label: 'S-131 海洋保护区' }
];

// 数据集状态配置
export const DATASET_STATUS = {
  [DatasetStatus.DRAFT]: { label: '草稿', color: 'gray' },
  [DatasetStatus.PUBLISHED]: { label: '已发布', color: 'green' },
  [DatasetStatus.ARCHIVED]: { label: '已归档', color: 'blue' },
  [DatasetStatus.DEPRECATED]: { label: '已废弃', color: 'red' }
};

// 数据集模拟数据
export const mockDatasets = [
  {
    id: '1',
    name: '上海港电子海图数据集',
    description: '上海港及周边海域的电子海图数据，包含水深、航标、碍航物等信息',
    productType: ProductTypeEnum.S101,
    status: DatasetStatus.PUBLISHED,
    version: '1.0.0',
    coverage: '上海港区域',
    fileSize: 256000000, // 256MB
    recordCount: 15420,
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    publishedAt: new Date('2024-11-01').toISOString(),
    createdAt: new Date('2024-10-15').toISOString(),
    updatedAt: new Date('2024-11-01').toISOString(),
    metadata: {
      resolution: '1:50000',
      coordinateSystem: 'WGS84',
      updateFrequency: '月度'
    },
    services: [
      {
        id: 'svc-1',
        name: 'S101-WMS',
        type: 'WMS',
        url: 'https://api.shanghai-port.gov.cn/wms/s101',
        status: 'ACTIVE'
      },
      {
        id: 'svc-2',
        name: 'S101-WFS',
        type: 'WFS',
        url: 'https://api.shanghai-port.gov.cn/wfs/s101',
        status: 'ACTIVE'
      }
    ]
  },
  {
    id: '2',
    name: '东海高精度水深数据集',
    description: '东海区域的高精度水深测量数据，精度达到0.1米',
    productType: ProductTypeEnum.S102,
    status: DatasetStatus.PUBLISHED,
    version: '2.1.0',
    coverage: '东海区域',
    fileSize: 512000000, // 512MB
    recordCount: 87650,
    nodeId: 'east-china-sea',
    nodeName: '东海分局区域节点',
    publishedAt: new Date('2024-10-15').toISOString(),
    createdAt: new Date('2024-09-20').toISOString(),
    updatedAt: new Date('2024-10-15').toISOString(),
    metadata: {
      resolution: '1:10000',
      coordinateSystem: 'WGS84',
      updateFrequency: '季度'
    },
    services: [
      {
        id: 'svc-3',
        name: 'S102-WCS',
        type: 'WCS',
        url: 'https://api.east.msa.gov.cn/wcs/s102',
        status: 'ACTIVE'
      }
    ]
  },
  {
    id: '3',
    name: '长江口动态水位数据集',
    description: '长江口区域的实时动态水位数据，更新频率为每小时',
    productType: ProductTypeEnum.S104,
    status: DatasetStatus.PUBLISHED,
    version: '1.5.0',
    coverage: '长江口区域',
    fileSize: 128000000, // 128MB
    recordCount: 4320,
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    publishedAt: new Date('2024-11-10').toISOString(),
    createdAt: new Date('2024-10-01').toISOString(),
    updatedAt: new Date('2024-11-10').toISOString(),
    metadata: {
      resolution: '实时',
      coordinateSystem: 'WGS84',
      updateFrequency: '每小时'
    },
    services: [
      {
        id: 'svc-4',
        name: 'S104-WMS',
        type: 'WMS',
        url: 'https://api.shanghai-port.gov.cn/wms/s104',
        status: 'ACTIVE'
      }
    ]
  },
  {
    id: '4',
    name: '宁波港电子海图数据集',
    description: '宁波港及周边海域的电子海图数据，包含最新的航道信息',
    productType: ProductTypeEnum.S101,
    status: DatasetStatus.DRAFT,
    version: '0.8.0',
    coverage: '宁波港区域',
    fileSize: 180000000, // 180MB
    recordCount: 9870,
    nodeId: 'ningbo-port',
    nodeName: '宁波港叶子节点',
    publishedAt: null,
    createdAt: new Date('2024-11-05').toISOString(),
    updatedAt: new Date('2024-11-05').toISOString(),
    metadata: {
      resolution: '1:50000',
      coordinateSystem: 'WGS84',
      updateFrequency: '月度'
    },
    services: []
  },
  {
    id: '5',
    name: '东海实时海流数据集',
    description: '东海区域的实时海流监测数据，包含流速和流向信息',
    productType: ProductTypeEnum.S111,
    status: DatasetStatus.PUBLISHED,
    version: '1.2.0',
    coverage: '东海区域',
    fileSize: 256000000, // 256MB
    recordCount: 21600,
    nodeId: 'east-china-sea',
    nodeName: '东海分局区域节点',
    publishedAt: new Date('2024-10-20').toISOString(),
    createdAt: new Date('2024-09-15').toISOString(),
    updatedAt: new Date('2024-10-20').toISOString(),
    metadata: {
      resolution: '实时',
      coordinateSystem: 'WGS84',
      updateFrequency: '每小时'
    },
    services: [
      {
        id: 'svc-5',
        name: 'S111-WMS',
        type: 'WMS',
        url: 'https://api.east.msa.gov.cn/wms/s111',
        status: 'ACTIVE'
      }
    ]
  },
  {
    id: '6',
    name: '中国沿海航行警告数据集',
    description: '中国沿海区域的航行警告信息，包含临时航行通告',
    productType: ProductTypeEnum.S124,
    status: DatasetStatus.PUBLISHED,
    version: '3.0.0',
    coverage: '中国沿海',
    fileSize: 64000000, // 64MB
    recordCount: 1250,
    nodeId: 'china-national',
    nodeName: '中国海事局国家级节点',
    publishedAt: new Date('2024-11-01').toISOString(),
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-11-01').toISOString(),
    metadata: {
      resolution: '实时',
      coordinateSystem: 'WGS84',
      updateFrequency: '实时'
    },
    services: [
      {
        id: 'svc-6',
        name: 'S124-WFS',
        type: 'WFS',
        url: 'https://api.msa.gov.cn/wfs/s124',
        status: 'ACTIVE'
      }
    ]
  }
];

// 数据集统计模拟数据
export const datasetStats = {
  totalDatasets: 6,
  publishedDatasets: 5,
  draftDatasets: 1,
  datasetsByProduct: {
    [ProductTypeEnum.S101]: 2,
    [ProductTypeEnum.S102]: 1,
    [ProductTypeEnum.S104]: 1,
    [ProductTypeEnum.S111]: 1,
    [ProductTypeEnum.S124]: 1,
    [ProductTypeEnum.S131]: 0
  },
  datasetsByNode: {
    'shanghai-port': 2,
    'east-china-sea': 2,
    'ningbo-port': 1,
    'china-national': 1
  },
  totalSize: 1396000000, // ~1.4GB
  recentUploads: [
    { date: '2024-12-01', count: 2 },
    { date: '2024-12-02', count: 1 },
    { date: '2024-12-03', count: 0 },
    { date: '2024-12-04', count: 1 },
    { date: '2024-12-05', count: 0 },
    { date: '2024-12-06', count: 1 },
    { date: '2024-12-07', count: 1 }
  ]
};