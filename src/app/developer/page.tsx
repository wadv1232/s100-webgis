'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/auth/permissions'
import { Permission, UserRole } from '@prisma/client'
import {
  Code,
  Book,
  Globe,
  Lock,
  Key,
  Terminal,
  FileText,
  Users,
  Download,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Settings,
  Database,
  Map
} from 'lucide-react'

export default function DeveloperPortal() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  // 模拟API密钥数据
  const apiKeys = [
    {
      id: '1',
      name: 'ECDIS测试应用',
      key: 'sk_test_51H7j2k3l4m5n6o7p8q9r0s',
      permissions: ['API_READ', 'API_TEST'],
      createdAt: '2024-01-15',
      lastUsed: '2024-01-20',
      status: 'active'
    },
    {
      id: '2',
      name: '生产环境集成',
      key: 'sk_live_9z8y7x6w5v4u3t2s1r0q9p',
      permissions: ['API_READ', 'API_TEST', 'API_KEY_MANAGE'],
      createdAt: '2024-01-10',
      lastUsed: '2024-01-19',
      status: 'active'
    }
  ]

  // 模拟API使用统计
  const apiStats = {
    totalRequests: 15420,
    successRate: 99.8,
    averageResponseTime: 245,
    dailyRequests: [1200, 1100, 1300, 1250, 1400, 1350, 1500],
    topEndpoints: [
      { path: '/api/v1/s101/wfs', count: 5200, percentage: 34 },
      { path: '/api/v1/s101/wms', count: 4800, percentage: 31 },
      { path: '/api/v1/s102/wcs', count: 3200, percentage: 21 },
      { path: '/api/v1/s102/wms', count: 2220, percentage: 14 }
    ]
  }

  // API服务列表
  const apiServices = [
    {
      category: 'S-101电子海图服务',
      endpoints: [
        { method: 'GET', path: '/api/v1/s101/wfs', description: 'Web要素服务', auth: 'API Key' },
        { method: 'GET', path: '/api/v1/s101/wms', description: 'Web地图服务', auth: 'API Key' }
      ],
      icon: Map
    },
    {
      category: 'S-102高精度水深服务',
      endpoints: [
        { method: 'GET', path: '/api/v1/s102/wcs', description: 'Web覆盖服务', auth: 'API Key' },
        { method: 'GET', path: '/api/v1/s102/wms', description: 'Web地图服务', auth: 'API Key' }
      ],
      icon: Database
    },
    {
      category: '系统管理服务',
      endpoints: [
        { method: 'GET', path: '/api/v1/capabilities', description: '服务能力查询', auth: 'API Key' },
        { method: 'POST', path: '/internal/ingest/s101', description: 'S-101数据摄入', auth: 'Internal' },
        { method: 'POST', path: '/internal/ingest/s102', description: 'S-102数据摄入', auth: 'Internal' }
      ],
      icon: Settings
    }
  ]

  // 开发者工具
  const devTools = [
    {
      name: 'API测试控制台',
      description: '在线测试API端点，查看实时响应',
      icon: Terminal,
      href: '/api-test-console',
      color: 'blue'
    },
    {
      name: 'SDK下载',
      description: 'JavaScript、Python、Java SDK包下载',
      icon: Download,
      href: '/sdk-downloads',
      color: 'green'
    },
    {
      name: '代码示例',
      description: '各种编程语言的集成示例代码',
      icon: FileText,
      href: '/code-examples',
      color: 'purple'
    },
    {
      name: 'Webhook配置',
      description: '配置数据更新通知和事件回调',
      icon: ExternalLink,
      href: '/webhook-config',
      color: 'orange'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">活跃</Badge>
      case 'inactive':
        return <Badge variant="secondary">未激活</Badge>
      case 'revoked':
        return <Badge variant="destructive">已撤销</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const getMethodBadge = (method: string) => {
    const badges = {
      GET: <Badge className="bg-blue-500">GET</Badge>,
      POST: <Badge className="bg-green-500">POST</Badge>,
      PUT: <Badge className="bg-yellow-500">PUT</Badge>,
      DELETE: <Badge className="bg-red-500">DELETE</Badge>
    }
    return badges[method as keyof typeof badges] || <Badge variant="outline">{method}</Badge>
  }

  if (!user || !hasPermission(user.role as UserRole, Permission.API_READ)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              访问受限
            </CardTitle>
            <CardDescription>
              您需要登录并拥有API访问权限才能查看开发者门户
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6 p-4 pt-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <Code className="h-16 w-16 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            开发者门户
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            为ECDIS开发者和系统集成商提供完整的API访问工具、文档和技术支持
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">API请求总数</p>
                  <p className="text-2xl font-bold">{apiStats.totalRequests.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">成功率</p>
                  <p className="text-2xl font-bold text-green-600">{apiStats.successRate}%</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">平均响应时间</p>
                  <p className="text-2xl font-bold">{apiStats.averageResponseTime}ms</p>
                </div>
                <Clock className="h-12 w-12 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">活跃API密钥</p>
                  <p className="text-2xl font-bold">{apiKeys.filter(k => k.status === 'active').length}</p>
                </div>
                <Key className="h-12 w-12 text-indigo-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 max-w-3xl mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              概览
            </TabsTrigger>
            <TabsTrigger value="api-reference" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              API参考
            </TabsTrigger>
            <TabsTrigger value="external-api" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              外部API
            </TabsTrigger>
            <TabsTrigger value="internal-api" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              内部API
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API密钥
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              开发工具
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Getting Started */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5" />
                    快速开始
                  </CardTitle>
                  <CardDescription>
                    新手开发者入门指南
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium">注册开发者账号</h4>
                        <p className="text-sm text-gray-600">申请开发者权限并验证邮箱</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium">创建API密钥</h4>
                        <p className="text-sm text-gray-600">生成API密钥用于身份验证</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium">阅读API文档</h4>
                        <p className="text-sm text-gray-600">了解API端点和参数说明</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <h4 className="font-medium">开始集成开发</h4>
                        <p className="text-sm text-gray-600">使用SDK或直接调用API</p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Book className="h-4 w-4 mr-2" />
                    查看完整文档
                  </Button>
                </CardContent>
              </Card>

              {/* API Endpoints Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    API端点概览
                  </CardTitle>
                  <CardDescription>
                    可用的API服务分类
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiServices.map((service, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <service.icon className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">{service.category}</h4>
                        </div>
                        <div className="space-y-2">
                          {service.endpoints.slice(0, 2).map((endpoint, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              {getMethodBadge(endpoint.method)}
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">{endpoint.path}</code>
                              <Badge variant="outline" className="text-xs">
                                {endpoint.auth}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Latest News */}
            <Card>
              <CardHeader>
                <CardTitle>开发者动态</CardTitle>
                <CardDescription>
                  最新的API更新和开发者公告
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">S-102 WCS服务正式发布</h4>
                      <p className="text-sm text-gray-600">新增高精度水深数据Web覆盖服务，支持多种数据格式输出</p>
                      <p className="text-xs text-gray-500 mt-1">2024-01-20</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center">
                      <Code className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">Python SDK v2.0发布</h4>
                      <p className="text-sm text-gray-600">全新的Python SDK支持异步调用和更好的错误处理</p>
                      <p className="text-xs text-gray-500 mt-1">2024-01-18</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-yellow-100 text-yellow-600 rounded-full w-8 h-8 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">API认证升级通知</h4>
                      <p className="text-sm text-gray-600">将于2月1日升级API认证机制，请及时更新您的集成代码</p>
                      <p className="text-xs text-gray-500 mt-1">2024-01-15</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api-reference" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    API参考文档
                  </CardTitle>
                  <CardDescription>
                    完整的API端点参考和参数说明
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiServices.map((service, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <service.icon className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">{service.category}</h4>
                        </div>
                        <div className="space-y-3">
                          {service.endpoints.map((endpoint, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                {getMethodBadge(endpoint.method)}
                                <code className="text-sm font-mono">{endpoint.path}</code>
                                <Badge variant="outline" className="text-xs">
                                  {endpoint.auth}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{endpoint.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    代码示例
                  </CardTitle>
                  <CardDescription>
                    常用编程语言的集成示例
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">JavaScript</h4>
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                        <code>{`// 获取S-101数据
const response = await fetch('/api/v1/s101/wfs', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  params: {
    bbox: '120.0,30.0,122.0,32.0',
    featureCodes: 'DEPARE,DRGARE'
  }
});

const data = await response.json();`}</code>
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Python</h4>
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                        <code>{`import requests

# 获取S-101数据
response = requests.get('/api/v1/s101/wfs', 
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    params={
        'bbox': '120.0,30.0,122.0,32.0',
        'featureCodes': 'DEPARE,DRGARE'
    }
)

data = response.json()`}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* External API Tab */}
          <TabsContent value="external-api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  第三方集成API
                </CardTitle>
                <CardDescription>
                  外部系统和第三方服务的API接口
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">海事数据服务</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">IHO S-100注册服务</h4>
                        <p className="text-sm text-gray-600 mb-3">国际海道测量组织S-100产品注册服务</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-blue-500">GET</Badge>
                            <code className="text-xs">https://registry.iho.int/s100/products</code>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-green-500">POST</Badge>
                            <code className="text-xs">https://registry.iho.int/s100/validate</code>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">WMTS服务</h4>
                        <p className="text-sm text-gray-600 mb-3">Web地图瓦片服务标准接口</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-blue-500">GET</Badge>
                            <code className="text-xs">/wmts/1.0.0/WMTSCapabilities.xml</code>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-blue-500">GET</Badge>
                            <code className="text-xs">/wmts/1.0.0/tile/{'{'}TileMatrix{'}'}/{'{'}TileRow{'}'}/{'{'}TileCol{'}'}.png</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">认证和授权</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">OAuth 2.0服务</h4>
                        <p className="text-sm text-gray-600 mb-3">标准OAuth 2.0授权流程</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-blue-500">GET</Badge>
                            <code className="text-xs">/oauth/authorize</code>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-green-500">POST</Badge>
                            <code className="text-xs">/oauth/token</code>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-yellow-500">POST</Badge>
                            <code className="text-xs">/oauth/revoke</code>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">API网关服务</h4>
                        <p className="text-sm text-gray-600 mb-3">统一API网关和负载均衡</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-blue-500">GET</Badge>
                            <code className="text-xs">/gateway/health</code>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-blue-500">GET</Badge>
                            <code className="text-xs">/gateway/metrics</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Internal API Tab */}
          <TabsContent value="internal-api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  内部系统API
                </CardTitle>
                <CardDescription>
                  系统内部服务和数据管理接口
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800">权限说明</h4>
                    </div>
                    <p className="text-sm text-yellow-700">
                      内部API仅限系统管理员和授权服务访问，需要特殊的内部认证令牌。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">数据摄入服务</h3>
                      <div className="space-y-3">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">S-101数据摄入</h4>
                          <p className="text-sm text-gray-600 mb-3">电子海图数据批量摄入和处理</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Badge className="bg-green-500">POST</Badge>
                              <code className="text-xs">/internal/ingest/s101</code>
                              <Badge variant="destructive" className="text-xs">Internal</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge className="bg-blue-500">GET</Badge>
                              <code className="text-xs">/internal/ingest/s101/status/{'{'}jobId{'}'}</code>
                              <Badge variant="destructive" className="text-xs">Internal</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">S-102数据摄入</h4>
                          <p className="text-sm text-gray-600 mb-3">高精度水深数据批量摄入和处理</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Badge className="bg-green-500">POST</Badge>
                              <code className="text-xs">/internal/ingest/s102</code>
                              <Badge variant="destructive" className="text-xs">Internal</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge className="bg-yellow-500">PUT</Badge>
                              <code className="text-xs">/internal/ingest/s102/{'{'}datasetId{'}'}</code>
                              <Badge variant="destructive" className="text-xs">Internal</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">系统管理服务</h3>
                      <div className="space-y-3">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">节点管理</h4>
                          <p className="text-sm text-gray-600 mb-3">网络节点和层级结构管理</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Badge className="bg-blue-500">GET</Badge>
                              <code className="text-xs">/internal/nodes</code>
                              <Badge variant="destructive" className="text-xs">Internal</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge className="bg-green-500">POST</Badge>
                              <code className="text-xs">/internal/nodes</code>
                              <Badge variant="destructive" className="text-xs">Internal</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge className="bg-yellow-500">PUT</Badge>
                              <code className="text-xs">/internal/nodes/{'{'}nodeId{'}'}</code>
                              <Badge variant="destructive" className="text-xs">Internal</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">服务监控</h4>
                          <p className="text-sm text-gray-600 mb-3">服务健康状态和性能监控</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Badge className="bg-blue-500">GET</Badge>
                              <code className="text-xs">/internal/monitoring/health</code>
                              <Badge variant="destructive" className="text-xs">Internal</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge className="bg-blue-500">GET</Badge>
                              <code className="text-xs">/internal/monitoring/metrics</code>
                              <Badge variant="destructive" className="text-xs">Internal</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      API密钥管理
                    </CardTitle>
                    <CardDescription>
                      管理您的API密钥和访问权限
                    </CardDescription>
                  </div>
                  {hasPermission(user.role as UserRole, Permission.API_KEY_CREATE) && (
                    <Button>
                      <Key className="h-4 w-4 mr-2" />
                      创建新密钥
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{apiKey.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                              {apiKey.key}
                            </code>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {getStatusBadge(apiKey.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">权限：</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {apiKey.permissions.map((permission, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {permission.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">创建时间：</span>
                          <p className="font-medium">{apiKey.createdAt}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">最后使用：</span>
                          <p className="font-medium">{apiKey.lastUsed}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api-reference" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* API Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>API分类</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {apiServices.map((service, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <service.icon className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{service.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* API Details */}
              <div className="lg:col-span-2 space-y-6">
                {apiServices.map((service, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <service.icon className="h-5 w-5 text-blue-600" />
                        {service.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {service.endpoints.map((endpoint, idx) => (
                          <div key={idx} className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              {getMethodBadge(endpoint.method)}
                              <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                                {endpoint.path}
                              </code>
                              <Badge variant="outline">{endpoint.auth}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <FileText className="h-3 w-3 mr-1" />
                                文档
                              </Button>
                              <Button variant="outline" size="sm">
                                <Terminal className="h-3 w-3 mr-1" />
                                测试
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Developer Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {devTools.map((tool, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <tool.icon className={`h-8 w-8 text-${tool.color}-600`} />
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                    </div>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      访问工具 <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Code Example */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  快速代码示例
                </CardTitle>
                <CardDescription>
                  常用编程语言的集成示例
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>
                  <TabsContent value="javascript" className="space-y-4">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                      <pre>
                        <code>{`// 获取S-101电子海图数据
const response = await fetch('/api/v1/s101/wfs', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  params: {
    bbox: '120.0,30.0,122.0,32.0',
    featureCodes: 'DEPARE,DRGARE'
  }
});

const data = await response.json();
console.log('海图要素:', data.features);`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="python" className="space-y-4">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                      <pre>
                        <code>{`import requests

# 获取S-101电子海图数据
response = requests.get('/api/v1/s101/wfs', 
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    params={
        'bbox': '120.0,30.0,122.0,32.0',
        'featureCodes': 'DEPARE,DRGARE'
    }
)

data = response.json()
print('海图要素:', data['features'])`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="curl" className="space-y-4">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                      <pre>
                        <code>{`# 获取S-101电子海图数据
curl -X GET '/api/v1/s101/wfs' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -G \\
  --data-urlencode 'bbox=120.0,30.0,122.0,32.0' \\
  --data-urlencode 'featureCodes=DEPARE,DRGARE'`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}