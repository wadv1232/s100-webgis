// 开发者相关模拟数据

// API文档结构
export const apiDocumentation = {
  version: '1.0.0',
  title: 'S-100海事服务平台 API',
  description: '为开发者提供的S-100海事数据服务API文档',
  baseUrl: 'https://api.example.com/v1',
  contact: {
    name: 'API支持团队',
    email: 'api-support@example.com',
    url: 'https://example.com/support'
  },
  license: {
    name: 'MIT',
    url: 'https://opensource.org/licenses/MIT'
  },
  servers: [
    {
      url: 'https://api.example.com/v1',
      description: '生产环境'
    },
    {
      url: 'https://staging-api.example.com/v1',
      description: '测试环境'
    }
  ],
  authentication: {
    type: 'Bearer',
    description: '使用Bearer Token进行认证',
    header: 'Authorization',
    prefix: 'Bearer '
  }
};

// API端点分类
export const apiCategories = [
  {
    id: 'nodes',
    name: '节点管理',
    description: '系统节点的管理操作',
    icon: 'Network',
    endpoints: [
      {
        path: '/nodes',
        method: 'GET',
        summary: '获取节点列表',
        description: '获取系统中所有节点的分页列表',
        parameters: [
          {
            name: 'page',
            in: 'query',
            type: 'integer',
            required: false,
            description: '页码，从1开始'
          },
          {
            name: 'limit',
            in: 'query',
            type: 'integer',
            required: false,
            description: '每页数量，默认10'
          },
          {
            name: 'type',
            in: 'query',
            type: 'string',
            required: false,
            description: '节点类型过滤'
          }
        ],
        responses: {
          200: {
            description: '成功获取节点列表',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: {
                  type: 'object',
                  properties: {
                    nodes: {
                      type: 'array',
                      items: { '$ref': '#/definitions/Node' }
                    },
                    pagination: { '$ref': '#/definitions/Pagination' }
                  }
                }
              }
            }
          }
        }
      },
      {
        path: '/nodes/{id}',
        method: 'GET',
        summary: '获取节点详情',
        description: '根据ID获取单个节点的详细信息',
        parameters: [
          {
            name: 'id',
            in: 'path',
            type: 'string',
            required: true,
            description: '节点ID'
          }
        ],
        responses: {
          200: {
            description: '成功获取节点详情',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: { '$ref': '#/definitions/Node' }
              }
            }
          }
        }
      }
    ]
  },
  {
    id: 'datasets',
    name: '数据集管理',
    description: '海事数据集的管理操作',
    icon: 'Database',
    endpoints: [
      {
        path: '/datasets',
        method: 'GET',
        summary: '获取数据集列表',
        description: '获取系统中所有数据集的分页列表',
        parameters: [
          {
            name: 'nodeId',
            in: 'query',
            type: 'string',
            required: false,
            description: '节点ID过滤'
          },
          {
            name: 'productType',
            in: 'query',
            type: 'string',
            required: false,
            description: '产品类型过滤'
          }
        ],
        responses: {
          200: {
            description: '成功获取数据集列表',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: {
                  type: 'object',
                  properties: {
                    datasets: {
                      type: 'array',
                      items: { '$ref': '#/definitions/Dataset' }
                    },
                    pagination: { '$ref': '#/definitions/Pagination' }
                  }
                }
              }
            }
          }
        }
      }
    ]
  },
  {
    id: 'services',
    name: '服务管理',
    description: 'S-100服务的管理操作',
    icon: 'Settings',
    endpoints: [
      {
        path: '/services',
        method: 'GET',
        summary: '获取服务列表',
        description: '获取系统中所有S-100服务的列表',
        responses: {
          200: {
            description: '成功获取服务列表',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: {
                  type: 'object',
                  properties: {
                    services: {
                      type: 'array',
                      items: { '$ref': '#/definitions/Service' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  }
];

// 数据模型定义
export const dataModels = {
  Node: {
    type: 'object',
    properties: {
      id: { type: 'string', description: '节点ID' },
      name: { type: 'string', description: '节点名称' },
      type: { type: 'string', enum: ['GLOBAL_ROOT', 'NATIONAL', 'REGIONAL', 'LEAF'], description: '节点类型' },
      level: { type: 'integer', description: '节点层级' },
      description: { type: 'string', description: '节点描述' },
      healthStatus: { type: 'string', enum: ['HEALTHY', 'WARNING', 'ERROR', 'OFFLINE'], description: '健康状态' },
      isActive: { type: 'boolean', description: '是否激活' },
      apiUrl: { type: 'string', description: 'API地址' },
      location: {
        type: 'object',
        properties: {
          lat: { type: 'number', description: '纬度' },
          lng: { type: 'number', description: '经度' }
        }
      },
      createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
      updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
    }
  },
  Dataset: {
    type: 'object',
    properties: {
      id: { type: 'string', description: '数据集ID' },
      name: { type: 'string', description: '数据集名称' },
      description: { type: 'string', description: '数据集描述' },
      productType: { type: 'string', description: '产品类型' },
      status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'DEPRECATED'], description: '状态' },
      version: { type: 'string', description: '版本号' },
      coverage: { type: 'string', description: '覆盖范围' },
      fileSize: { type: 'integer', description: '文件大小（字节）' },
      nodeId: { type: 'string', description: '所属节点ID' },
      publishedAt: { type: 'string', format: 'date-time', description: '发布时间' },
      createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
      updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
    }
  },
  Service: {
    type: 'object',
    properties: {
      id: { type: 'string', description: '服务ID' },
      name: { type: 'string', description: '服务名称' },
      productType: { type: 'string', description: '产品类型' },
      serviceType: { type: 'string', enum: ['WMS', 'WFS', 'WCS'], description: '服务类型' },
      isEnabled: { type: 'boolean', description: '是否启用' },
      endpoint: { type: 'string', description: '服务端点' },
      version: { type: 'string', description: '版本号' },
      nodeId: { type: 'string', description: '所属节点ID' },
      lastChecked: { type: 'string', format: 'date-time', description: '最后检查时间' }
    }
  },
  Pagination: {
    type: 'object',
    properties: {
      page: { type: 'integer', description: '当前页码' },
      limit: { type: 'integer', description: '每页数量' },
      total: { type: 'integer', description: '总记录数' },
      totalPages: { type: 'integer', description: '总页数' }
    }
  }
};

// SDK和工具
export const sdksAndTools = [
  {
    id: 'javascript-sdk',
    name: 'JavaScript SDK',
    description: '用于JavaScript/TypeScript的官方SDK',
    language: 'JavaScript',
    version: '1.0.0',
    downloadUrl: 'https://github.com/example/s100-js-sdk',
    documentation: 'https://docs.example.com/js-sdk',
    examples: [
      {
        title: '获取节点列表',
        code: `import { S100Client } from '@s100/sdk';

const client = new S100Client({
  baseUrl: 'https://api.example.com/v1',
  token: 'your-token'
});

const nodes = await client.nodes.list({
  page: 1,
  limit: 10
});`
      },
      {
        title: '获取数据集',
        code: `const datasets = await client.datasets.list({
  nodeId: 'shanghai-port',
  productType: 'S101'
});`
      }
    ]
  },
  {
    id: 'python-sdk',
    name: 'Python SDK',
    description: '用于Python的官方SDK',
    language: 'Python',
    version: '1.0.0',
    downloadUrl: 'https://github.com/example/s100-python-sdk',
    documentation: 'https://docs.example.com/python-sdk',
    examples: [
      {
        title: '获取节点列表',
        code: `from s100 import S100Client

client = S100Client(
    base_url='https://api.example.com/v1',
    token='your-token'
)

nodes = client.nodes.list(page=1, limit=10)`
      }
    ]
  },
  {
    id: 'postman-collection',
    name: 'Postman Collection',
    description: 'Postman API测试集合',
    language: 'JSON',
    version: '1.0.0',
    downloadUrl: 'https://example.com/api/s100-postman-collection.json',
    documentation: 'https://docs.example.com/postman',
    examples: []
  }
];

// 开发者统计
export const developerStats = {
  totalEndpoints: 15,
  totalSdks: 3,
  documentationPages: 45,
  activeDevelopers: 156,
  apiCallsToday: 15420,
  averageResponseTime: 156,
  popularEndpoints: [
    { path: '/nodes', calls: 5420, percentage: 35 },
    { path: '/datasets', calls: 3870, percentage: 25 },
    { path: '/services', calls: 2890, percentage: 19 },
    { path: '/capabilities', calls: 2150, percentage: 14 },
    { path: '/monitoring', calls: 1090, percentage: 7 }
  ]
};