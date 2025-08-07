'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/auth/permissions'
import { Permission, UserRole } from '@prisma/client'
import {
  Lock,
  Key,
  Book,
  Copy,
  Settings,
  Database,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  Code,
  FileText,
  Activity,
  Users,
  Shield,
  Terminal
} from 'lucide-react'

export default function InternalAPIPage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')

  if (!user || !hasPermission(user.role as UserRole, Permission.API_TEST)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              访问受限
            </CardTitle>
            <CardDescription>
              您需要拥有API测试权限才能查看内部API文档
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'}>
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 内部API端点定义
  const internalAPIs = [
    {
      category: '数据摄入服务',
      icon: Upload,
      description: '用于数据管理员摄入和管理S-100数据',
      securityLevel: 'high',
      endpoints: [
        {
          method: 'POST',
          path: '/internal/ingest/s101',
          version: 'v1.0.0',
          description: 'S-101电子海图数据摄入接口',
          authentication: 'Internal Token + IP Whitelist',
          securityLevel: 'high',
          parameters: [
            { name: 'file', type: 'file', required: true, description: 'S-101数据文件 (S-57 ENC格式)' },
            { name: 'metadata', type: 'json', required: true, description: '数据元信息JSON' },
            { name: 'validationLevel', type: 'string', required: false, description: '验证级别 (strict, normal, loose)' },
            { name: 'autoPublish', type: 'boolean', required: false, description: '是否自动发布' }
          ],
          responseFormat: 'JSON',
          example: {
            request: {
              file: 'enc_file.000',
              metadata: {
                datasetName: '上海港电子海图',
                version: '1.0.0',
                scale: '1:50000',
                updateDate: '2024-01-20'
              },
              validationLevel: 'strict',
              autoPublish: false
            },
            response: {
              success: true,
              datasetId: 'dataset_123456',
              validationResults: {
                passed: true,
                warnings: ['深度值超出范围'],
                errors: []
              },
              processingTime: 2500
            }
          }
        },
        {
          method: 'POST',
          path: '/internal/ingest/s102',
          version: 'v1.0.0',
          description: 'S-102高精度水深数据摄入接口',
          authentication: 'Internal Token + IP Whitelist',
          securityLevel: 'high',
          parameters: [
            { name: 'file', type: 'file', required: true, description: 'S-102水深数据文件 (GeoTIFF, NetCDF格式)' },
            { name: 'metadata', type: 'json', required: true, description: '数据元信息JSON' },
            { name: 'resolution', type: 'string', required: false, description: '数据分辨率验证' },
            { name: 'verticalDatum', type: 'string', required: false, description: '垂直基准面' }
          ],
          responseFormat: 'JSON',
          example: {
            request: {
              file: 'bathymetry.tif',
              metadata: {
                datasetName: '上海港高精度水深',
                version: '1.0.0',
                resolution: '1m',
                verticalDatum: 'MSL'
              }
            },
            response: {
              success: true,
              datasetId: 'dataset_789012',
              processingInfo: {
                gridGenerated: true,
                coverageCalculated: true,
                metadataExtracted: true
              }
            }
          }
        }
      ]
    },
    {
      category: '系统管理服务',
      icon: Settings,
      description: '系统管理员专用接口，用于节点和用户管理',
      securityLevel: 'critical',
      endpoints: [
        {
          method: 'POST',
          path: '/internal/admin/nodes',
          version: 'v1.0.0',
          description: '创建和管理网络节点',
          authentication: 'Admin Token + IP Whitelist',
          securityLevel: 'critical',
          parameters: [
            { name: 'name', type: 'string', required: true, description: '节点名称' },
            { name: 'type', type: 'string', required: true, description: '节点类型 (GLOBAL_ROOT, NATIONAL, REGIONAL, LEAF)' },
            { name: 'apiUrl', type: 'string', required: true, description: '节点API地址' },
            { name: 'coverage', type: 'geojson', required: true, description: '覆盖范围GeoJSON' },
            { name: 'parentId', type: 'string', required: false, description: '父节点ID' }
          ],
          responseFormat: 'JSON',
          example: {
            request: {
              name: '天津港节点',
              type: 'LEAF',
              apiUrl: 'https://tianjin-port.msa.gov.cn/api',
              coverage: {
                type: 'Polygon',
                coordinates: [[[117.5, 38.8], [118.0, 38.8], [118.0, 39.2], [117.5, 39.2], [117.5, 38.8]]]
              },
              parentId: 'north-china-sea-node'
            },
            response: {
              success: true,
              nodeId: 'node_tianjin_001',
              status: 'active',
              capabilities: []
            }
          }
        },
        {
          method: 'PUT',
          path: '/internal/admin/nodes/{id}/health',
          version: 'v1.0.0',
          description: '更新节点健康状态',
          authentication: 'Admin Token + IP Whitelist',
          securityLevel: 'critical',
          parameters: [
            { name: 'healthStatus', type: 'string', required: true, description: '健康状态 (HEALTHY, WARNING, ERROR, OFFLINE)' },
            { name: 'metrics', type: 'json', required: false, description: '健康指标数据' }
          ],
          responseFormat: 'JSON',
          example: {
            request: {
              healthStatus: 'HEALTHY',
              metrics: {
                responseTime: 120,
                availability: 99.9,
                errorRate: 0.1
              }
            },
            response: {
              success: true,
              lastHealthCheck: '2024-01-20T10:30:00Z',
              status: 'updated'
            }
          }
        }
      ]
    },
    {
      category: '服务目录同步',
      icon: Activity,
      description: '服务目录同步和数据一致性检查',
      securityLevel: 'high',
      endpoints: [
        {
          method: 'POST',
          path: '/internal/sync/full',
          version: 'v1.0.0',
          description: '全量服务目录同步',
          authentication: 'Internal Token',
          securityLevel: 'high',
          parameters: [
            { name: 'forceSync', type: 'boolean', required: false, description: '强制同步' },
            { name: 'validateData', type: 'boolean', required: false, description: '验证数据一致性' },
            { name: 'timeout', type: 'integer', required: false, description: '超时时间(秒)' }
          ],
          responseFormat: 'JSON',
          example: {
            request: {
              forceSync: false,
              validateData: true,
              timeout: 300
            },
            response: {
              success: true,
              syncId: 'sync_20240120_103000',
              startTime: '2024-01-20T10:30:00Z',
              endTime: '2024-01-20T10:35:00Z',
              summary: {
                totalNodes: 4,
                syncedNodes: 4,
                failedNodes: 0,
                totalServices: 12,
                syncedServices: 12
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/internal/sync/incremental',
          version: 'v1.0.0',
          description: '增量服务目录同步',
          authentication: 'Internal Token',
          securityLevel: 'high',
          parameters: [
            { name: 'nodeIds', type: 'array', required: false, description: '指定节点ID列表' },
            { name: 'serviceTypes', type: 'array', required: false, description: '指定服务类型列表' }
          ],
          responseFormat: 'JSON',
          example: {
            request: {
              nodeIds: ['shanghai-port', 'ningbo-port'],
              serviceTypes: ['WMS', 'WFS']
            },
            response: {
              success: true,
              changes: [
                {
                  nodeId: 'shanghai-port',
                  serviceType: 'WMS',
                  changeType: 'updated',
                  timestamp: '2024-01-20T10:32:00Z'
                }
              ]
            }
          }
        }
      ]
    },
    {
      category: '用户和权限管理',
      icon: Users,
      description: '用户管理和权限控制接口',
      securityLevel: 'critical',
      endpoints: [
        {
          method: 'POST',
          path: '/internal/admin/users',
          version: 'v1.0.0',
          description: '创建用户和分配权限',
          authentication: 'Admin Token',
          securityLevel: 'critical',
          parameters: [
            { name: 'username', type: 'string', required: true, description: '用户名' },
            { name: 'email', type: 'string', required: true, description: '邮箱地址' },
            { name: 'role', type: 'string', required: true, description: '用户角色' },
            { name: 'nodeId', type: 'string', required: false, description: '所属节点ID' },
            { name: 'permissions', type: 'array', required: false, description: '额外权限列表' }
          ],
          responseFormat: 'JSON',
          example: {
            request: {
              username: 'new_operator',
              email: 'operator@shanghai-port.cn',
              role: 'DATA_MANAGER',
              nodeId: 'shanghai-port',
              permissions: ['DATASET_PUBLISH']
            },
            response: {
              success: true,
              userId: 'user_789012',
              credentials: {
                temporaryPassword: 'temp_pass_123',
                expiresAt: '2024-01-21T10:30:00Z'
              }
            }
          }
        }
      ]
    }
  ]

  const getMethodBadge = (method: string) => {
    const badges = {
      GET: <Badge className="bg-blue-500">GET</Badge>,
      POST: <Badge className="bg-green-500">POST</Badge>,
      PUT: <Badge className="bg-yellow-500">PUT</Badge>,
      DELETE: <Badge className="bg-red-500">DELETE</Badge>
    }
    return badges[method as keyof typeof badges] || <Badge variant="outline">{method}</Badge>
  }

  const getSecurityBadge = (level: string) => {
    const badges = {
      high: <Badge className="bg-orange-500">高级别</Badge>,
      critical: <Badge className="bg-red-500">关键级别</Badge>,
      normal: <Badge className="bg-green-500">普通级别</Badge>
    }
    return badges[level as keyof typeof badges] || <Badge variant="outline">未知</Badge>
  }

  const filteredAPIs = selectedCategory === 'all' 
    ? internalAPIs 
    : internalAPIs.filter(api => api.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6 p-4 pt-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <Lock className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            内部API文档
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            系统内部管理接口，仅供授权管理员和内部系统调用
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">机密文档 - 严禁外传</span>
            </div>
          </div>
        </div>

        {/* Security Warning */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Shield className="h-5 w-5" />
              安全提醒
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-red-700 mb-2">访问控制:</h4>
                <ul className="space-y-1 text-red-600">
                  <li>• 需要内部认证令牌</li>
                  <li>• IP地址白名单限制</li>
                  <li>• 基于角色的访问控制</li>
                  <li>• 操作日志完整记录</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-700 mb-2">使用规范:</h4>
                <ul className="space-y-1 text-red-600">
                  <li>• 仅限内部系统调用</li>
                  <li>• 严禁外部暴露</li>
                  <li>• 定期轮换密钥</li>
                  <li>• 监控异常访问</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">API总数</p>
                  <p className="text-2xl font-bold">{internalAPIs.reduce((sum, api) => sum + api.endpoints.length, 0)}</p>
                </div>
                <Code className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">安全级别</p>
                  <p className="text-2xl font-bold text-red-600">关键</p>
                </div>
                <Shield className="h-12 w-12 text-red-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">认证方式</p>
                  <p className="text-2xl font-bold">内部令牌</p>
                </div>
                <Key className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="endpoints" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="endpoints" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              API端点
            </TabsTrigger>
            <TabsTrigger value="authentication" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              认证说明
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              监控日志
            </TabsTrigger>
          </TabsList>

          {/* API Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-6">
            {/* Category Filter */}
            <Card>
              <CardHeader>
                <CardTitle>API分类</CardTitle>
                <CardDescription>选择要查看的API类别</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    全部
                  </button>
                  {internalAPIs.map((api) => (
                    <button
                      key={api.category}
                      onClick={() => setSelectedCategory(api.category)}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedCategory === api.category 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <api.icon className="h-4 w-4" />
                      {api.category}
                      {getSecurityBadge(api.securityLevel)}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* API Details */}
            <div className="space-y-6">
              {filteredAPIs.map((api) => (
                <Card key={api.category} className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <api.icon className="h-6 w-6 text-red-600" />
                      {api.category}
                      {getSecurityBadge(api.securityLevel)}
                    </CardTitle>
                    <CardDescription>{api.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {api.endpoints.map((endpoint, index) => (
                        <div key={index} className="border rounded-lg p-6 bg-red-50">
                          <div className="flex items-center gap-3 mb-4">
                            {getMethodBadge(endpoint.method)}
                            <code className="bg-red-100 px-3 py-1 rounded font-mono text-lg">
                              {endpoint.path}
                            </code>
                            <Badge variant="outline">{endpoint.version}</Badge>
                            <Badge className="bg-red-100 text-red-700">
                              {endpoint.authentication}
                            </Badge>
                            {getSecurityBadge(endpoint.securityLevel)}
                          </div>
                          
                          <p className="text-gray-700 mb-4">{endpoint.description}</p>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Parameters */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                请求参数
                              </h4>
                              <div className="space-y-2">
                                {endpoint.parameters.map((param, idx) => (
                                  <div key={idx} className="bg-white p-3 rounded border">
                                    <div className="flex items-center gap-2 mb-1">
                                      <code className="text-sm font-mono">{param.name}</code>
                                      <Badge variant="outline" className="text-xs">
                                        {param.type}
                                      </Badge>
                                      {param.required && (
                                        <Badge variant="destructive" className="text-xs">
                                          必需
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">{param.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Response */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                响应格式
                              </h4>
                              <div className="bg-white p-3 rounded border">
                                <p className="text-sm font-medium mb-2">{endpoint.responseFormat}</p>
                                {endpoint.example && (
                                  <details className="mt-3">
                                    <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                                      查看示例
                                    </summary>
                                    <div className="mt-2 space-y-3">
                                      <div>
                                        <p className="text-xs font-medium text-gray-600 mb-1">请求示例:</p>
                                        <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
                                          <code>{JSON.stringify(endpoint.example.request, null, 2)}</code>
                                        </pre>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-gray-600 mb-1">响应示例:</p>
                                        <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
                                          <code>{JSON.stringify(endpoint.example.response, null, 2)}</code>
                                        </pre>
                                      </div>
                                    </div>
                                  </details>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Security Notes */}
                          <div className="mt-4 pt-4 border-t border-red-200">
                            <div className="flex items-center gap-2 text-sm text-red-600">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="font-medium">安全提醒:</span>
                            </div>
                            <ul className="text-sm text-red-600 mt-1 space-y-1">
                              <li>• 此接口仅限内部系统调用</li>
                              <li>• 所有请求会被记录和审计</li>
                              <li>• 请确保在生产环境使用前充分测试</li>
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value="authentication" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    内部认证机制
                  </CardTitle>
                  <CardDescription>
                    内部API的认证和授权流程
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">认证方式:</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-medium">内部令牌 (Internal Token)</div>
                        <p className="text-sm text-gray-600 mt-1">
                          系统生成的长时效认证令牌，仅用于内部服务间通信
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-medium">管理员令牌 (Admin Token)</div>
                        <p className="text-sm text-gray-600 mt-1">
                          具有完全权限的管理员令牌，用于关键操作
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-medium">IP白名单</div>
                        <p className="text-sm text-gray-600 mt-1">
                          限制访问来源IP地址，增强安全性
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">令牌格式:</h4>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded">
                      <code className="text-sm">
                        sk_internal_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    安全最佳实践
                  </CardTitle>
                  <CardDescription>
                    使用内部API的安全建议
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">令牌管理</h5>
                        <p className="text-sm text-gray-600">定期轮换令牌，避免长期使用同一令牌</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">访问控制</h5>
                        <p className="text-sm text-gray-600">遵循最小权限原则，仅授予必要的权限</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">网络安全</h5>
                        <p className="text-sm text-gray-600">使用HTTPS加密传输，限制访问来源</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">监控审计</h5>
                        <p className="text-sm text-gray-600">监控API调用，定期审计访问日志</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Token Generation Example */}
            <Card>
              <CardHeader>
                <CardTitle>令牌生成示例</CardTitle>
                <CardDescription>
                  如何生成和使用内部认证令牌
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>
                  <TabsContent value="javascript" className="space-y-4">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                      <pre>
                        <code>{`// 生成内部认证令牌
const crypto = require('crypto');

function generateInternalToken() {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  const payload = \`\${timestamp}:\${random}\`;
  const secret = process.env.INTERNAL_TOKEN_SECRET;
  
  // 使用HMAC-SHA256签名
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return \`sk_internal_\${payload}:\${signature}\`;
}

// 使用令牌调用内部API
async function callInternalAPI() {
  const token = generateInternalToken();
  
  const response = await fetch('/internal/ingest/s101', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json',
      'X-Internal-Caller': 'data-ingestion-service'
    },
    body: JSON.stringify({
      // 请求数据
    })
  });
  
  return response.json();
}`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="python" className="space-y-4">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                      <pre>
                        <code>{`import hashlib
import hmac
import time
import secrets
import requests

def generate_internal_token():
    timestamp = str(int(time.time() * 1000))
    random_part = secrets.token_hex(16)
    payload = f"{timestamp}:{random_part}"
    secret = os.environ.get('INTERNAL_TOKEN_SECRET')
    
    # 使用HMAC-SHA256签名
    signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return f"sk_internal_{payload}:{signature}"

# 使用令牌调用内部API
def call_internal_api():
    token = generate_internal_token()
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'X-Internal-Caller': 'data-ingestion-service'
    }
    
    data = {
        # 请求数据
    }
    
    response = requests.post(
        'https://api.example.com/internal/ingest/s101',
        headers=headers,
        json=data
    )
    
    return response.json()`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    API监控指标
                  </CardTitle>
                  <CardDescription>
                    内部API调用监控和性能指标
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-2xl font-bold text-blue-600">99.9%</div>
                      <div className="text-sm text-blue-600">可用性</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-2xl font-bold text-green-600">125ms</div>
                      <div className="text-sm text-green-600">平均响应时间</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <div className="text-2xl font-bold text-yellow-600">1,247</div>
                      <div className="text-sm text-yellow-600">今日调用次数</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="text-2xl font-bold text-purple-600">0.01%</div>
                      <div className="text-sm text-purple-600">错误率</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    实时日志
                  </CardTitle>
                  <CardDescription>
                    内部API调用日志示例
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-64 overflow-y-auto">
                    <pre className="text-xs">
                      <code>{`[2024-01-20 10:30:15] INFO  InternalAPI - POST /internal/ingest/s101
  User: admin@system.local | IP: 192.168.1.100
  Request: {"file":"shanghai_enc.000","metadata":{"datasetName":"上海港电子海图"}}
  Response: {"success":true,"datasetId":"dataset_123456"} | Duration: 2,547ms

[2024-01-20 10:31:22] INFO  InternalAPI - POST /internal/sync/full
  User: sync-service@system.local | IP: 192.168.1.101
  Request: {"forceSync":false,"validateData":true}
  Response: {"success":true,"syncId":"sync_20240120_103122"} | Duration: 4,892ms

[2024-01-20 10:32:45] WARN  InternalAPI - PUT /internal/admin/nodes/node_789/health
  User: admin@system.local | IP: 192.168.1.102
  Request: {"healthStatus":"WARNING","metrics":{"responseTime":450}}
  Response: {"success":true,"status":"updated"} | Duration: 1,234ms

[2024-01-20 10:33:10] ERROR InternalAPI - POST /internal/ingest/s102
  User: data-manager@shanghai-port.cn | IP: 192.168.1.103
  Request: {"file":"invalid_bathymetry.tif"}
  Error: Invalid file format | Duration: 456ms`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Alerts */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  安全告警
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-red-700">异常访问检测</h5>
                      <p className="text-sm text-red-600">
                        检测到来自IP 203.0.113.45的大量API调用，已自动限制访问频率
                      </p>
                      <p className="text-xs text-red-500 mt-1">2024-01-20 10:35:00</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-yellow-700">令牌即将过期</h5>
                      <p className="text-sm text-yellow-600">
                        内部数据摄入服务令牌将在7天后过期，请及时更新
                      </p>
                      <p className="text-xs text-yellow-500 mt-1">2024-01-20 10:30:00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}