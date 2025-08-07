// 监控相关模拟数据

// 健康检查历史记录
export const healthHistory = [
  {
    id: '1',
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    status: 'HEALTHY',
    responseTime: 120,
    timestamp: new Date().toISOString(),
    details: {
      cpu: 45,
      memory: 67,
      disk: 82,
      network: 95
    }
  },
  {
    id: '2',
    nodeId: 'ningbo-port',
    nodeName: '宁波港叶子节点',
    status: 'WARNING',
    responseTime: 350,
    timestamp: new Date(Date.now() - 300000).toISOString(),
    details: {
      cpu: 78,
      memory: 85,
      disk: 91,
      network: 88
    }
  },
  {
    id: '3',
    nodeId: 'east-china-sea',
    nodeName: '东海分局区域节点',
    status: 'HEALTHY',
    responseTime: 95,
    timestamp: new Date(Date.now() - 600000).toISOString(),
    details: {
      cpu: 32,
      memory: 54,
      disk: 67,
      network: 92
    }
  },
  {
    id: '4',
    nodeId: 'china-national',
    nodeName: '中国海事局国家级节点',
    status: 'HEALTHY',
    responseTime: 80,
    timestamp: new Date(Date.now() - 900000).toISOString(),
    details: {
      cpu: 28,
      memory: 45,
      disk: 58,
      network: 96
    }
  },
  {
    id: '5',
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    status: 'HEALTHY',
    responseTime: 110,
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    details: {
      cpu: 42,
      memory: 61,
      disk: 79,
      network: 93
    }
  }
];

// 系统性能指标
export const systemMetrics = {
  cpu: {
    current: 35,
    average: 42,
    max: 78,
    history: [
      { time: '00:00', value: 25 },
      { time: '04:00', value: 22 },
      { time: '08:00', value: 45 },
      { time: '12:00', value: 62 },
      { time: '16:00', value: 58 },
      { time: '20:00', value: 41 },
      { time: '24:00', value: 28 }
    ]
  },
  memory: {
    current: 67,
    average: 71,
    max: 89,
    history: [
      { time: '00:00', value: 58 },
      { time: '04:00', value: 52 },
      { time: '08:00', value: 65 },
      { time: '12:00', value: 78 },
      { time: '16:00', value: 82 },
      { time: '20:00', value: 71 },
      { time: '24:00', value: 63 }
    ]
  },
  disk: {
    current: 82,
    average: 79,
    max: 91,
    history: [
      { time: '00:00', value: 75 },
      { time: '04:00', value: 76 },
      { time: '08:00', value: 78 },
      { time: '12:00', value: 81 },
      { time: '16:00', value: 84 },
      { time: '20:00', value: 83 },
      { time: '24:00', value: 80 }
    ]
  },
  network: {
    current: 95,
    average: 92,
    max: 99,
    history: [
      { time: '00:00', value: 88 },
      { time: '04:00', value: 85 },
      { time: '08:00', value: 91 },
      { time: '12:00', value: 96 },
      { time: '16:00', value: 98 },
      { time: '20:00', value: 94 },
      { time: '24:00', value: 90 }
    ]
  }
};

// 服务性能统计
export const servicePerformance = [
  {
    id: 'svc-1',
    name: 'S101-WMS',
    node: '上海港叶子节点',
    avgResponseTime: 120,
    maxResponseTime: 350,
    minResponseTime: 85,
    uptime: 99.5,
    requestCount: 15420,
    errorCount: 77,
    lastHour: [
      { time: '00:00', requests: 120, errors: 2 },
      { time: '01:00', requests: 98, errors: 1 },
      { time: '02:00', requests: 85, errors: 0 },
      { time: '03:00', requests: 92, errors: 1 },
      { time: '04:00', requests: 110, errors: 3 },
      { time: '05:00', requests: 125, errors: 2 },
      { time: '06:00', requests: 140, errors: 1 }
    ]
  },
  {
    id: 'svc-2',
    name: 'S102-WCS',
    node: '东海分局区域节点',
    avgResponseTime: 180,
    maxResponseTime: 420,
    minResponseTime: 120,
    uptime: 98.8,
    requestCount: 8765,
    errorCount: 105,
    lastHour: [
      { time: '00:00', requests: 85, errors: 5 },
      { time: '01:00', requests: 92, errors: 8 },
      { time: '02:00', requests: 78, errors: 3 },
      { time: '03:00', requests: 88, errors: 6 },
      { time: '04:00', requests: 95, errors: 9 },
      { time: '05:00', requests: 102, errors: 7 },
      { time: '06:00', requests: 115, errors: 4 }
    ]
  },
  {
    id: 'svc-3',
    name: 'S104-WMS',
    node: '上海港叶子节点',
    avgResponseTime: 95,
    maxResponseTime: 200,
    minResponseTime: 65,
    uptime: 99.1,
    requestCount: 12350,
    errorCount: 111,
    lastHour: [
      { time: '00:00', requests: 150, errors: 8 },
      { time: '01:00', requests: 135, errors: 6 },
      { time: '02:00', requests: 120, errors: 4 },
      { time: '03:00', requests: 145, errors: 7 },
      { time: '04:00', requests: 160, errors: 9 },
      { time: '05:00', requests: 175, errors: 5 },
      { time: '06:00', requests: 190, errors: 6 }
    ]
  }
];

// 告警信息
export const alerts = [
  {
    id: '1',
    type: 'WARNING',
    title: '宁波港节点响应时间过长',
    description: '宁波港叶子节点响应时间超过300ms，建议检查网络连接',
    nodeId: 'ningbo-port',
    nodeName: '宁波港叶子节点',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    severity: 'medium',
    status: 'active',
    acknowledged: false
  },
  {
    id: '2',
    type: 'ERROR',
    title: 'S111服务异常',
    description: '东海分局S111实时海流服务出现异常，响应时间超过500ms',
    nodeId: 'east-china-sea',
    nodeName: '东海分局区域节点',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    severity: 'high',
    status: 'active',
    acknowledged: true
  },
  {
    id: '3',
    type: 'INFO',
    title: '系统维护通知',
    description: '计划于今晚22:00-24:00进行系统维护，期间部分服务可能不可用',
    nodeId: 'system',
    nodeName: '系统',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    severity: 'low',
    status: 'scheduled',
    acknowledged: true
  },
  {
    id: '4',
    type: 'SUCCESS',
    title: '数据发布完成',
    description: '上海港电子海图数据集已成功发布',
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    severity: 'low',
    status: 'resolved',
    acknowledged: true
  }
];

// 监控统计概览
export const monitoringStats = {
  totalNodes: 5,
  healthyNodes: 4,
  warningNodes: 1,
  errorNodes: 0,
  totalServices: 8,
  activeServices: 7,
  warningServices: 1,
  inactiveServices: 0,
  totalAlerts: 4,
  activeAlerts: 2,
  acknowledgedAlerts: 3,
  systemUptime: 99.2,
  avgResponseTime: 142
};

// 监控页面专用数据结构（适配监控页面需求）
export const mockMonitoringData = {
  nodeStats: {
    total: 8,
    healthy: 6,
    warning: 1,
    error: 0,
    offline: 1,
    byType: {
      GLOBAL_ROOT: 1,
      NATIONAL: 1,
      REGIONAL: 3,
      LEAF: 3
    }
  },
  datasetStats: {
    total: 45,
    byStatus: {
      UPLOADED: 8,
      PROCESSING: 3,
      PUBLISHED: 32,
      ARCHIVED: 2,
      ERROR: 0
    },
    byProduct: {
      S101: 18,
      S102: 12,
      S104: 5,
      S111: 4,
      S124: 3,
      S125: 2,
      S131: 1
    }
  },
  serviceStats: {
    total: 89,
    byType: {
      WFS: 32,
      WMS: 45,
      WCS: 12
    }
  },
  recentHealthChecks: [
    {
      nodeId: '1',
      nodeName: 'IHO全球根节点',
      status: 'HEALTHY',
      lastCheck: '2024-01-15T10:30:00Z',
      type: 'GLOBAL_ROOT'
    },
    {
      nodeId: '2',
      nodeName: '中国海事局国家级节点',
      status: 'HEALTHY',
      lastCheck: '2024-01-15T10:28:00Z',
      type: 'NATIONAL'
    },
    {
      nodeId: '3',
      nodeName: '东海分局区域节点',
      status: 'WARNING',
      lastCheck: '2024-01-15T10:25:00Z',
      type: 'REGIONAL'
    },
    {
      nodeId: '4',
      nodeName: '上海港叶子节点',
      status: 'HEALTHY',
      lastCheck: '2024-01-15T10:30:00Z',
      type: 'LEAF'
    }
  ],
  systemHealth: 75
};