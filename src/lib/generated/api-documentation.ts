// 自动生成的API文档 - 请勿手动修改
// 生成时间: 2025-08-11T05:05:32.452Z
// 版本: 1.0.0

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  category: 'public' | 'federation' | 'administration';
  version: string;
  authentication: string;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    example?: string;
  }>;
  requestBody?: {
    type: string;
    description: string;
    example: string;
  };
  responses: Array<{
    code: number;
    description: string;
    example?: string;
  }>;
  tags?: string[];
  deprecated?: boolean;
}

export interface ApiCategory {
  name: string;
  description: string;
  icon: string;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  endpoints: ApiEndpoint[];
}

export interface ApiDocumentation {
  public: ApiCategory[];
  federation: ApiCategory[];
  administration: ApiCategory[];
  generatedAt: string;
  version: string;
}

export const apiDocumentation: ApiDocumentation = {
  "public": [
    {
      "name": "其他服务",
      "description": "其他API服务",
      "icon": "Code",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "POST",
          "path": "/api/auth/login",
          "description": "POST /api/auth/login",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/datasets/{id}/publish",
          "description": "POST /api/datasets/{id}/publish",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/datasets/{id}",
          "description": "GET /api/datasets/{id}",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/datasets/batch/publish",
          "description": "POST /api/datasets/batch/publish",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/datasets",
          "description": "GET /api/datasets",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/discovery/recommend",
          "description": "GET /api/discovery/recommend",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/drawing-instructions",
          "description": "POST /api/drawing-instructions",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/home/products",
          "description": "GET /api/home/products",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/search/spatial",
          "description": "GET /api/search/spatial",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/self-assessment",
          "description": "GET /api/self-assessment",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/system/status",
          "description": "GET /api/system/status",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/test/db",
          "description": "GET /api/test/db",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/test/node-create",
          "description": "POST /api/test/node-create",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/v1/{product}/{service_type}",
          "description": "GET /api/v1/{product}/{service_type}",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "API Key",
          "securityLevel": "medium",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "product",
              "type": "string",
              "required": true,
              "description": "product参数"
            },
            {
              "name": "service_type",
              "type": "string",
              "required": true,
              "description": "service_type参数"
            }
          ]
        }
      ]
    },
    {
      "name": "服务能力查询",
      "description": "查询系统服务能力和节点信息",
      "icon": "Search",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "GET",
          "path": "/api/capabilities",
          "description": "获取服务能力",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/management/capabilities",
          "description": "GET /api/management/capabilities",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/v1/capabilities",
          "description": "获取指定区域内所有可用的S-100数据服务",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "API Key",
          "securityLevel": "medium",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        }
      ]
    },
    {
      "name": "健康检查服务",
      "description": "系统健康状态检查",
      "icon": "Heart",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "GET",
          "path": "/api/health",
          "description": "健康检查",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/management/health",
          "description": "GET /api/management/health",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/monitoring/health-history",
          "description": "GET /api/monitoring/health-history",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        }
      ]
    },
    {
      "name": "节点管理服务",
      "description": "节点间通信，实现能力发现与聚合",
      "icon": "Network",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "GET",
          "path": "/api/home/nodes",
          "description": "GET /api/home/nodes",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/nodes",
          "description": "节点管理",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        }
      ]
    },
    {
      "name": "监控服务",
      "description": "系统监控和性能指标",
      "icon": "Activity",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "GET",
          "path": "/api/monitoring/alerts",
          "description": "GET /api/monitoring/alerts",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/monitoring/realtime",
          "description": "GET /api/monitoring/realtime",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/monitoring",
          "description": "GET /api/monitoring",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        }
      ]
    },
    {
      "name": "S-101电子海图服务",
      "description": "提供电子海图数据的Web要素服务和Web地图服务",
      "icon": "Map",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "GET",
          "path": "/api/s101/wfs",
          "description": "GET /api/s101/wfs",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/s101/wms",
          "description": "GET /api/s101/wms",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/v1/s101/wfs",
          "description": "获取S-101电子海图Web要素服务",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "API Key",
          "securityLevel": "medium",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/v1/s101/wms",
          "description": "获取S-101电子海图Web地图服务",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "API Key",
          "securityLevel": "medium",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        }
      ]
    },
    {
      "name": "S-102高精度水深服务",
      "description": "提供高精度水深数据的Web覆盖服务和Web地图服务",
      "icon": "Database",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "GET",
          "path": "/api/s102/wcs",
          "description": "GET /api/s102/wcs",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/s102/wms",
          "description": "GET /api/s102/wms",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/v1/s102/wcs",
          "description": "获取S-102高精度水深Web覆盖服务",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "API Key",
          "securityLevel": "medium",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/v1/s102/wms",
          "description": "获取S-102高精度水深Web地图服务",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "API Key",
          "securityLevel": "medium",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        }
      ]
    },
    {
      "name": "服务管理",
      "description": "服务注册、发布和管理",
      "icon": "Settings",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "POST",
          "path": "/api/services/{id}/pilot",
          "description": "POST /api/services/{id}/pilot",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/services/{id}/publish",
          "description": "POST /api/services/{id}/publish",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/services/{id}",
          "description": "GET /api/services/{id}",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/services/batch/activate",
          "description": "POST /api/services/batch/activate",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/services/remote/{id}/sync",
          "description": "POST /api/services/remote/{id}/sync",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/services/remote/{id}/validate",
          "description": "POST /api/services/remote/{id}/validate",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/services/remote",
          "description": "POST /api/services/remote",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/services",
          "description": "服务管理",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        }
      ]
    },
    {
      "name": "用户管理服务",
      "description": "用户管理和权限控制接口",
      "icon": "Users",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "GET",
          "path": "/api/users/{id}",
          "description": "GET /api/users/{id}",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/users/base-map/preference",
          "description": "GET /api/users/base-map/preference",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/users/meta",
          "description": "GET /api/users/meta",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/users",
          "description": "用户管理",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        }
      ]
    },
    {
      "name": "S-104水位数据服务",
      "description": "提供水位数据的Web地图服务",
      "icon": "Activity",
      "securityLevel": "medium",
      "endpoints": [
        {
          "method": "GET",
          "path": "/api/v1/s104/wms",
          "description": "获取S-104水位数据Web地图服务",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "API Key",
          "securityLevel": "medium",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        }
      ]
    }
  ],
  "federation": [
    {
      "name": "节点管理服务",
      "description": "节点间通信，实现能力发现与聚合",
      "icon": "Network",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "GET",
          "path": "/api/nodes/{id}/base-map/config",
          "description": "GET /api/nodes/{id}/base-map/config",
          "category": "federation",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/nodes/{id}/health",
          "description": "POST /api/nodes/{id}/health",
          "category": "federation",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/nodes/{id}",
          "description": "GET /api/nodes/{id}",
          "category": "federation",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        }
      ]
    },
    {
      "name": "服务能力查询",
      "description": "查询系统服务能力和节点信息",
      "icon": "Search",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "GET",
          "path": "/api/nodes/{id}/capabilities",
          "description": "GET /api/nodes/{id}/capabilities",
          "category": "federation",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        }
      ]
    }
  ],
  "administration": [
    {
      "name": "系统管理服务",
      "description": "系统管理员专用接口",
      "icon": "Shield",
      "securityLevel": "high",
      "endpoints": [
        {
          "method": "GET",
          "path": "/api/admin/apikeys",
          "description": "GET /api/admin/apikeys",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/admin/cache",
          "description": "GET /api/admin/cache",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/admin/config",
          "description": "GET /api/admin/config",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/admin/service-directory/sync",
          "description": "GET /api/admin/service-directory/sync",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        }
      ]
    },
    {
      "name": "节点管理服务",
      "description": "节点间通信，实现能力发现与聚合",
      "icon": "Network",
      "securityLevel": "high",
      "endpoints": [
        {
          "method": "GET",
          "path": "/api/admin/nodes/{id}/coverage",
          "description": "GET /api/admin/nodes/{id}/coverage",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/admin/nodes/{id}/health-check",
          "description": "POST /api/admin/nodes/{id}/health-check",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/admin/nodes/{id}/offline",
          "description": "POST /api/admin/nodes/{id}/offline",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/admin/nodes/{id}/policy",
          "description": "GET /api/admin/nodes/{id}/policy",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/admin/nodes/{id}/publish",
          "description": "POST /api/admin/nodes/{id}/publish",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/admin/nodes/{id}/push-services",
          "description": "POST /api/admin/nodes/{id}/push-services",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/admin/nodes/{id}",
          "description": "GET /api/admin/nodes/{id}",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/admin/nodes/{id}/sync",
          "description": "POST /api/admin/nodes/{id}/sync",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/admin/nodes",
          "description": "创建和管理网络节点",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        }
      ]
    },
    {
      "name": "服务管理",
      "description": "服务注册、发布和管理",
      "icon": "Settings",
      "securityLevel": "high",
      "endpoints": [
        {
          "method": "POST",
          "path": "/api/admin/services/{id}/actions",
          "description": "POST /api/admin/services/{id}/actions",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/admin/services/{id}",
          "description": "GET /api/admin/services/{id}",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/admin/services",
          "description": "创建和管理服务",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        }
      ]
    },
    {
      "name": "用户管理服务",
      "description": "用户管理和权限控制接口",
      "icon": "Users",
      "securityLevel": "critical",
      "endpoints": [
        {
          "method": "PUT",
          "path": "/api/admin/users/{id}/roles",
          "description": "PUT /api/admin/users/{id}/roles",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "critical",
          "responses": [
            {
              "code": 200,
              "description": "更新成功"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ],
          "parameters": [
            {
              "name": "id",
              "type": "string",
              "required": true,
              "description": "id参数"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/api/admin/users",
          "description": "用户管理",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 200,
              "description": "成功获取数据"
            },
            {
              "code": 404,
              "description": "资源不存在"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        }
      ]
    },
    {
      "name": "数据摄入服务",
      "description": "S-100数据摄入和管理",
      "icon": "Upload",
      "securityLevel": "high",
      "endpoints": [
        {
          "method": "POST",
          "path": "/api/internal/ingest/s101",
          "description": "POST /api/internal/ingest/s101",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        },
        {
          "method": "POST",
          "path": "/api/internal/ingest/s102",
          "description": "POST /api/internal/ingest/s102",
          "category": "administration",
          "version": "v1.0.0",
          "authentication": "Internal Token + IP Whitelist",
          "securityLevel": "high",
          "responses": [
            {
              "code": 201,
              "description": "创建成功"
            },
            {
              "code": 400,
              "description": "请求参数错误"
            },
            {
              "code": 500,
              "description": "服务器内部错误"
            }
          ]
        }
      ]
    }
  ],
  "generatedAt": "2025-08-11T05:05:32.452Z",
  "version": "1.0.0"
};
