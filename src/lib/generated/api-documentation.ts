// 自动生成的API文档 - 请勿手动修改
// 生成时间: 2025-08-10T01:16:10.334Z
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
          "method": "GET",
          "path": "/apiadmin/apikeys",
          "description": "GET /apiadmin/apikeys",
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
          "path": "/apiadmin/cache",
          "description": "GET /apiadmin/cache",
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
          "path": "/apiadmin/config",
          "description": "GET /apiadmin/config",
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
          "path": "/apiadmin/service-directory/sync",
          "description": "GET /apiadmin/service-directory/sync",
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
          "path": "/apiauth/login",
          "description": "POST /apiauth/login",
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
          "path": "/apicapabilities",
          "description": "GET /apicapabilities",
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
          "path": "/apidatasets/{id}/publish",
          "description": "POST /apidatasets/{id}/publish",
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
          "path": "/apidatasets/{id}",
          "description": "GET /apidatasets/{id}",
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
          "path": "/apidatasets",
          "description": "GET /apidatasets",
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
          "path": "/apidrawing-instructions",
          "description": "POST /apidrawing-instructions",
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
          "path": "/apihealth",
          "description": "GET /apihealth",
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
          "path": "/apimonitoring",
          "description": "GET /apimonitoring",
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
          "path": "/apinodes/{id}/base-map/config",
          "description": "GET /apinodes/{id}/base-map/config",
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
          "path": "/apinodes/{id}",
          "description": "GET /apinodes/{id}",
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
          "path": "/apinodes",
          "description": "GET /apinodes",
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
          "path": "/apis101/wfs",
          "description": "GET /apis101/wfs",
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
          "path": "/apis101/wms",
          "description": "GET /apis101/wms",
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
          "path": "/apis102/wcs",
          "description": "GET /apis102/wcs",
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
          "path": "/apis102/wms",
          "description": "GET /apis102/wms",
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
          "path": "/apiself-assessment",
          "description": "GET /apiself-assessment",
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
          "path": "/apiservices/{id}/pilot",
          "description": "POST /apiservices/{id}/pilot",
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
          "path": "/apiservices/{id}/publish",
          "description": "POST /apiservices/{id}/publish",
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
          "path": "/apiservices/{id}",
          "description": "GET /apiservices/{id}",
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
          "path": "/apiservices",
          "description": "GET /apiservices",
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
          "path": "/apiusers/{id}",
          "description": "GET /apiusers/{id}",
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
          "path": "/apiusers/base-map/preference",
          "description": "GET /apiusers/base-map/preference",
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
          "path": "/apiusers/meta",
          "description": "GET /apiusers/meta",
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
          "path": "/apiusers",
          "description": "GET /apiusers",
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
          "path": "/apiv1/{product}/{service_type}",
          "description": "GET /apiv1/{product}/{service_type}",
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
      "name": "节点管理服务",
      "description": "节点间通信，实现能力发现与聚合",
      "icon": "Network",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "GET",
          "path": "/apiadmin/nodes",
          "description": "GET /apiadmin/nodes",
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
      "name": "服务管理",
      "description": "服务注册、发布和管理",
      "icon": "Settings",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "POST",
          "path": "/apiadmin/services/{id}/actions",
          "description": "POST /apiadmin/services/{id}/actions",
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
          "path": "/apiadmin/services/{id}",
          "description": "GET /apiadmin/services/{id}",
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
          "path": "/apiadmin/services",
          "description": "GET /apiadmin/services",
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
          "method": "PUT",
          "path": "/apiadmin/users/{id}/roles",
          "description": "PUT /apiadmin/users/{id}/roles",
          "category": "public",
          "version": "v1.0.0",
          "authentication": "None",
          "securityLevel": "low",
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
          "path": "/apiadmin/users",
          "description": "GET /apiadmin/users",
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
      "name": "数据摄入服务",
      "description": "S-100数据摄入和管理",
      "icon": "Upload",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "POST",
          "path": "/apiinternal/ingest/s101",
          "description": "POST /apiinternal/ingest/s101",
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
          "path": "/apiinternal/ingest/s102",
          "description": "POST /apiinternal/ingest/s102",
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
          "path": "/apimanagement/capabilities",
          "description": "GET /apimanagement/capabilities",
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
          "path": "/apinodes/{id}/capabilities",
          "description": "GET /apinodes/{id}/capabilities",
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
          "path": "/apiv1/capabilities",
          "description": "GET /apiv1/capabilities",
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
      "name": "健康检查服务",
      "description": "系统健康状态检查",
      "icon": "Heart",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "GET",
          "path": "/apimanagement/health",
          "description": "GET /apimanagement/health",
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
          "path": "/apimonitoring/health-history",
          "description": "GET /apimonitoring/health-history",
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
          "path": "/apinodes/{id}/health",
          "description": "POST /apinodes/{id}/health",
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
          "path": "/apiv1/s101/wfs",
          "description": "GET /apiv1/s101/wfs",
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
          "path": "/apiv1/s101/wms",
          "description": "GET /apiv1/s101/wms",
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
      "name": "S-102高精度水深服务",
      "description": "提供高精度水深数据的Web覆盖服务和Web地图服务",
      "icon": "Database",
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "GET",
          "path": "/apiv1/s102/wcs",
          "description": "GET /apiv1/s102/wcs",
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
          "path": "/apiv1/s102/wms",
          "description": "GET /apiv1/s102/wms",
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
      "securityLevel": "low",
      "endpoints": [
        {
          "method": "GET",
          "path": "/apiv1/s104/wms",
          "description": "GET /apiv1/s104/wms",
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
          "path": "/apiadmin/nodes/{id}/coverage",
          "description": "GET /apiadmin/nodes/{id}/coverage",
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
          "path": "/apiadmin/nodes/{id}/health-check",
          "description": "POST /apiadmin/nodes/{id}/health-check",
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
          "method": "POST",
          "path": "/apiadmin/nodes/{id}/offline",
          "description": "POST /apiadmin/nodes/{id}/offline",
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
          "path": "/apiadmin/nodes/{id}/policy",
          "description": "GET /apiadmin/nodes/{id}/policy",
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
          "path": "/apiadmin/nodes/{id}/publish",
          "description": "POST /apiadmin/nodes/{id}/publish",
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
          "method": "POST",
          "path": "/apiadmin/nodes/{id}/push-services",
          "description": "POST /apiadmin/nodes/{id}/push-services",
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
          "path": "/apiadmin/nodes/{id}",
          "description": "GET /apiadmin/nodes/{id}",
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
          "path": "/apiadmin/nodes/{id}/sync",
          "description": "POST /apiadmin/nodes/{id}/sync",
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
        }
      ]
    }
  ],
  "administration": [],
  "generatedAt": "2025-08-10T01:16:10.334Z",
  "version": "1.0.0"
};
