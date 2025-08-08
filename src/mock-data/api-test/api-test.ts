// API测试相关模拟数据

// API端点配置
export const apiEndpoints = [
  {
    id: 'nodes-list',
    name: '获取节点列表',
    method: 'GET',
    path: '/api/nodes',
    description: '获取系统中的所有节点信息',
    category: '节点管理',
    authenticated: true,
    parameters: [
      {
        name: 'page',
        type: 'number',
        required: false,
        description: '页码，默认为1'
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: '每页数量，默认为10'
      },
      {
        name: 'type',
        type: 'string',
        required: false,
        description: '节点类型过滤'
      }
    ],
    example: {
      request: '/api/nodes?page=1&limit=10&type=LEAF',
      response: {
        success: true,
        data: {
          nodes: [
            {
              id: 'shanghai-port',
              name: '上海港叶子节点',
              type: 'LEAF',
              level: 3,
              healthStatus: 'HEALTHY'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 5,
            totalPages: 1
          }
        }
      }
    }
  },
  {
    id: 'datasets-list',
    name: '获取数据集列表',
    method: 'GET',
    path: '/api/datasets',
    description: '获取系统中的所有数据集信息',
    category: '数据管理',
    authenticated: true,
    parameters: [
      {
        name: 'nodeId',
        type: 'string',
        required: false,
        description: '节点ID过滤'
      },
      {
        name: 'productType',
        type: 'string',
        required: false,
        description: '产品类型过滤'
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: '状态过滤'
      }
    ],
    example: {
      request: '/api/datasets?nodeId=shanghai-port&productType=S101',
      response: {
        success: true,
        data: {
          datasets: [
            {
              id: '1',
              name: '上海港电子海图数据集',
              productType: 'S101',
              status: 'PUBLISHED',
              nodeId: 'shanghai-port'
            }
          ]
        }
      }
    }
  },
  {
    id: 'capabilities-list',
    name: '获取服务能力列表',
    method: 'GET',
    path: '/api/capabilities',
    description: '获取系统中所有节点的服务能力',
    category: '服务管理',
    authenticated: true,
    parameters: [
      {
        name: 'productType',
        type: 'string',
        required: false,
        description: '产品类型过滤'
      },
      {
        name: 'serviceType',
        type: 'string',
        required: false,
        description: '服务类型过滤'
      },
      {
        name: 'nodeId',
        type: 'string',
        required: false,
        description: '节点ID过滤'
      }
    ],
    example: {
      request: '/api/capabilities?productType=S101&serviceType=WMS',
      response: {
        success: true,
        data: {
          capabilities: [
            {
              id: 'cap-1',
              productType: 'S101',
              serviceType: 'WMS',
              isEnabled: true,
              endpoint: '/wms/s101'
            }
          ]
        }
      }
    }
  },
  {
    id: 'create-dataset',
    name: '创建数据集',
    method: 'POST',
    path: '/api/datasets',
    description: '创建新的数据集',
    category: '数据管理',
    authenticated: true,
    parameters: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: '数据集名称'
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: '数据集描述'
      },
      {
        name: 'productType',
        type: 'string',
        required: true,
        description: '产品类型'
      },
      {
        name: 'nodeId',
        type: 'string',
        required: true,
        description: '所属节点ID'
      }
    ],
    example: {
      request: {
        method: 'POST',
        path: '/api/datasets',
        body: {
          name: '测试数据集',
          description: '这是一个测试数据集',
          productType: 'S101',
          nodeId: 'shanghai-port'
        }
      },
      response: {
        success: true,
        data: {
          id: 'new-dataset-id',
          name: '测试数据集',
          status: 'DRAFT',
          createdAt: new Date().toISOString()
        }
      }
    }
  },
  {
    id: 'node-health',
    name: '获取节点健康状态',
    method: 'GET',
    path: '/api/nodes/{id}/health',
    description: '获取指定节点的健康状态',
    category: '监控',
    authenticated: true,
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: '节点ID',
        in: 'path'
      }
    ],
    example: {
      request: '/api/nodes/shanghai-port/health',
      response: {
        success: true,
        data: {
          nodeId: 'shanghai-port',
          status: 'HEALTHY',
          responseTime: 120,
          lastChecked: new Date().toISOString(),
          metrics: {
            cpu: 45,
            memory: 67,
            disk: 82,
            network: 95
          }
        }
      }
    }
  }
];

// API测试历史记录
export const testHistory = [
  {
    id: '1',
    endpointId: 'nodes-list',
    endpointName: '获取节点列表',
    method: 'GET',
    path: '/api/nodes',
    status: 'success',
    responseTime: 156,
    timestamp: new Date().toISOString(),
    request: {
      url: '/api/nodes?page=1&limit=10',
      headers: {
        'Authorization': 'Bearer token',
        'Content-Type': 'application/json'
      }
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Response-Time': '156ms'
      },
      body: {
        success: true,
        data: {
          nodes: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        }
      }
    }
  },
  {
    id: '2',
    endpointId: 'datasets-list',
    endpointName: '获取数据集列表',
    method: 'GET',
    path: '/api/datasets',
    status: 'success',
    responseTime: 203,
    timestamp: new Date(Date.now() - 300000).toISOString(),
    request: {
      url: '/api/datasets?nodeId=shanghai-port',
      headers: {
        'Authorization': 'Bearer token',
        'Content-Type': 'application/json'
      }
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Response-Time': '203ms'
      },
      body: {
        success: true,
        data: {
          datasets: []
        }
      }
    }
  },
  {
    id: '3',
    endpointId: 'create-dataset',
    endpointName: '创建数据集',
    method: 'POST',
    path: '/api/datasets',
    status: 'error',
    responseTime: 89,
    timestamp: new Date(Date.now() - 600000).toISOString(),
    request: {
      url: '/api/datasets',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer token',
        'Content-Type': 'application/json'
      },
      body: {
        name: '测试数据集',
        productType: 'S101'
        // 缺少必需的 nodeId 参数
      }
    },
    response: {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        success: false,
        error: 'Missing required parameter: nodeId'
      }
    }
  }
];

// API统计信息
export const apiStats = {
  totalEndpoints: 5,
  totalTests: 3,
  successfulTests: 2,
  failedTests: 1,
  averageResponseTime: 149,
  endpointsByCategory: {
    '节点管理': 2,
    '数据管理': 2,
    '服务管理': 1,
    '监控': 1
  },
  testResultsByMethod: {
    GET: { total: 2, success: 2, failed: 0 },
    POST: { total: 1, success: 0, failed: 1 }
  },
  recentActivity: [
    { time: '10:30', endpoint: 'nodes-list', status: 'success' },
    { time: '10:25', endpoint: 'datasets-list', status: 'success' },
    { time: '10:20', endpoint: 'create-dataset', status: 'error' }
  ]
};

// API测试环境配置
export const testEnvironments = [
  {
    id: 'development',
    name: '开发环境',
    baseUrl: 'http://localhost:3000/api',
    description: '本地开发环境',
    isDefault: true
  },
  {
    id: 'staging',
    name: '测试环境',
    baseUrl: 'https://staging-api.example.com',
    description: '测试和预发布环境',
    isDefault: false
  },
  {
    id: 'production',
    name: '生产环境',
    baseUrl: 'https://api.example.com',
    description: '生产环境',
    isDefault: false
  }
];

// API认证配置
export const authConfigs = [
  {
    id: 'bearer-token',
    name: 'Bearer Token',
    type: 'bearer',
    description: '使用Bearer Token进行认证',
    token: 'your-bearer-token-here'
  },
  {
    id: 'api-key',
    name: 'API Key',
    type: 'apikey',
    description: '使用API Key进行认证',
    key: 'your-api-key-here',
    header: 'X-API-Key'
  },
  {
    id: 'basic-auth',
    name: 'Basic Auth',
    type: 'basic',
    description: '使用Basic认证',
    username: 'your-username',
    password: 'your-password'
  }
];