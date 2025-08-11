'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/auth/permissions'
import { Permission, UserRole } from '@prisma/client'
import { apiDocumentation } from '@/lib/generated/api-documentation'
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
  Map,
  Search,
  Filter,
  Play,
  Eye,
  Shield,
  Network,
  Heart,
  Activity,
  Upload
} from 'lucide-react'

export default function DeveloperPortal() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedMethod, setSelectedMethod] = useState<string>('all')
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number | null>(null)

  // 获取类别图标
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      'public': Globe,
      'federation': Settings,
      'administration': Shield
    }
    return iconMap[category] || Code
  }

  // 动态API服务数据
  const apiServices = useMemo(() => {
    const services = []
    
    // 处理所有类别的API，只处理实际的API类别
    const apiCategories = ['public', 'federation', 'administration']
    apiCategories.forEach(categoryKey => {
      const categories = apiDocumentation[categoryKey]
      if (Array.isArray(categories)) {
        categories.forEach(category => {
          const service = {
            category: category.name,
            description: category.description,
            icon: getCategoryIcon(categoryKey),
            securityLevel: category.securityLevel,
            endpoints: category.endpoints.map(endpoint => ({
              method: endpoint.method,
              path: endpoint.path,
              description: endpoint.description,
              authentication: endpoint.authentication,
              securityLevel: endpoint.securityLevel,
              category: categoryKey,
              parameters: endpoint.parameters || [],
              responses: endpoint.responses || []
            }))
          }
          services.push(service)
        })
      }
    })
    
    return services
  }, [])

  // 搜索和筛选功能
  const filteredServices = useMemo(() => {
    return apiServices.map(service => ({
      ...service,
      endpoints: service.endpoints.filter(endpoint => {
        const matchesSearch = searchTerm === '' || 
          endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
          endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory
        const matchesMethod = selectedMethod === 'all' || endpoint.method === selectedMethod
        
        return matchesSearch && matchesCategory && matchesMethod
      })
    })).filter(service => service.endpoints.length > 0)
  }, [apiServices, searchTerm, selectedCategory, selectedMethod])

  // 获取安全级别颜色
  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'high': return 'bg-orange-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  // 获取方法徽章
  const getMethodBadge = (method: string) => {
    const badges = {
      GET: <Badge className="bg-blue-500">GET</Badge>,
      POST: <Badge className="bg-green-500">POST</Badge>,
      PUT: <Badge className="bg-yellow-500">PUT</Badge>,
      DELETE: <Badge className="bg-red-500">DELETE</Badge>,
      PATCH: <Badge className="bg-purple-500">PATCH</Badge>
    }
    return badges[method as keyof typeof badges] || <Badge variant="outline">{method}</Badge>
  }

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

  
  // 开发者工具
  const devTools = [
    {
      name: 'API测试平台',
      description: `自动生成的API测试界面，支持所有${apiServices.reduce((total, service) => total + service.endpoints.length, 0)}个端点`,
      icon: Terminal,
      href: '/api-test',
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
                    {apiServices.slice(0, 3).map((service, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <service.icon className="h-5 w-5 text-blue-600" />
                            <h4 className="font-medium">{service.category}</h4>
                            <Badge variant="outline" className="text-xs">
                              {service.endpoints.length} 个端点
                            </Badge>
                          </div>
                          <Badge className={`text-xs ${getSecurityColor(service.securityLevel)}`}>
                            {service.securityLevel}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
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
                  <div className="mt-4 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('api-reference')}
                    >
                      查看完整API文档 <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
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
            {/* Search and Filter */}
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
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="搜索API端点..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="all">所有类别</option>
                      <option value="public">公开API</option>
                      <option value="federation">联邦API</option>
                      <option value="administration">管理API</option>
                    </select>
                    <select 
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="all">所有方法</option>
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  找到 {filteredServices.reduce((total, service) => total + service.endpoints.length, 0)} 个API端点
                </div>
              </CardContent>
            </Card>

            {/* API Services */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>API分类</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredServices.map((service, index) => (
                      <button
                        key={index}
                        className={`w-full text-left p-3 border rounded-lg transition-colors ${
                          selectedServiceIndex === index 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedServiceIndex(
                          selectedServiceIndex === index ? null : index
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <service.icon className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{service.category}</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {service.endpoints.length}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* API Details */}
              <div className="lg:col-span-2 space-y-6">
                {selectedServiceIndex === null ? (
                  // 显示所有服务或搜索结果
                  filteredServices.map((service, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <service.icon className="h-5 w-5 text-blue-600" />
                          {service.category}
                          <Badge variant="outline" className="text-xs">
                            {service.endpoints.length} 个端点
                          </Badge>
                          <Badge className={`text-xs ${getSecurityColor(service.securityLevel)}`}>
                            {service.securityLevel}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {service.endpoints.map((endpoint, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  {getMethodBadge(endpoint.method)}
                                  <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                                    {endpoint.path}
                                  </code>
                                  <Badge variant="outline" className="text-xs">
                                    {endpoint.authentication}
                                  </Badge>
                                  <Badge className={`text-xs ${getSecurityColor(endpoint.securityLevel)}`}>
                                    {endpoint.securityLevel}
                                  </Badge>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(`/api-test/${endpoint.category}/${endpoint.method}/${encodeURIComponent(endpoint.path)}`, '_blank')}
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    测试
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>
                              
                              {endpoint.parameters && endpoint.parameters.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium mb-2">路径参数</h5>
                                  <div className="space-y-1">
                                    {endpoint.parameters.map((param, paramIdx) => (
                                      <div key={paramIdx} className="flex items-center gap-2 text-xs">
                                        <code className="bg-gray-100 px-1 rounded">{param.name}</code>
                                        <span className="text-gray-500">({param.type})</span>
                                        <span className="text-gray-600">{param.description}</span>
                                        {param.required && <Badge variant="destructive" className="text-xs">必需</Badge>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <FileText className="h-3 w-3 mr-1" />
                                  文档
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3 mr-1" />
                                  示例
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  // 只显示选中的服务
                  filteredServices.map((service, index) => 
                    index === selectedServiceIndex && (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <service.icon className="h-5 w-5 text-blue-600" />
                            {service.category}
                            <Badge variant="outline" className="text-xs">
                              {service.endpoints.length} 个端点
                            </Badge>
                            <Badge className={`text-xs ${getSecurityColor(service.securityLevel)}`}>
                              {service.securityLevel}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {service.endpoints.map((endpoint, idx) => (
                              <div key={idx} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    {getMethodBadge(endpoint.method)}
                                    <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                                      {endpoint.path}
                                    </code>
                                    <Badge variant="outline" className="text-xs">
                                      {endpoint.authentication}
                                    </Badge>
                                    <Badge className={`text-xs ${getSecurityColor(endpoint.securityLevel)}`}>
                                      {endpoint.securityLevel}
                                    </Badge>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => window.open(`/api-test/${endpoint.category}/${endpoint.method}/${encodeURIComponent(endpoint.path)}`, '_blank')}
                                    >
                                      <Play className="h-3 w-3 mr-1" />
                                      测试
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>
                                
                                {endpoint.parameters && endpoint.parameters.length > 0 && (
                                  <div className="mb-3">
                                    <h5 className="text-sm font-medium mb-2">路径参数</h5>
                                    <div className="space-y-1">
                                      {endpoint.parameters.map((param, paramIdx) => (
                                        <div key={paramIdx} className="flex items-center gap-2 text-xs">
                                          <code className="bg-gray-100 px-1 rounded">{param.name}</code>
                                          <span className="text-gray-500">({param.type})</span>
                                          <span className="text-gray-600">{param.description}</span>
                                          {param.required && <Badge variant="destructive" className="text-xs">必需</Badge>}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <FileText className="h-3 w-3 mr-1" />
                                    文档
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-3 w-3 mr-1" />
                                    示例
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )
                )}
              </div>
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
            
            {/* Public APIs from auto-generated data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  对外数据服务API
                </CardTitle>
                <CardDescription>
                  系统自动生成的对外数据服务API接口
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiDocumentation.public.map((category, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {React.createElement(category.icon, { className: "h-5 w-5 text-blue-600" })}
                          <h4 className="font-medium">{category.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {category.endpoints.length} 个端点
                          </Badge>
                          <Badge className={`text-xs ${getSecurityColor(category.securityLevel)}`}>
                            {category.securityLevel}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                      <div className="space-y-2">
                        {category.endpoints.slice(0, 3).map((endpoint, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {getMethodBadge(endpoint.method)}
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">{endpoint.path}</code>
                            <Badge variant="outline" className="text-xs">
                              {endpoint.authentication}
                            </Badge>
                            <Badge className={`text-xs ${getSecurityColor(endpoint.securityLevel)}`}>
                              {endpoint.securityLevel}
                            </Badge>
                          </div>
                        ))}
                        {category.endpoints.length > 3 && (
                          <div className="text-xs text-gray-500">
                            还有 {category.endpoints.length - 3} 个端点...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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

                  {/* Federation APIs */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      协作API (Federation API)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {apiDocumentation.federation.map((category, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <category.icon className="h-4 w-4 text-orange-600" />
                              <h4 className="font-medium">{category.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {category.endpoints.length} 个端点
                              </Badge>
                              <Badge className={`text-xs ${getSecurityColor(category.securityLevel)}`}>
                                {category.securityLevel}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                          <div className="space-y-2">
                            {category.endpoints.slice(0, 2).map((endpoint, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                {getMethodBadge(endpoint.method)}
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{endpoint.path}</code>
                                <Badge variant="outline" className="text-xs">
                                  {endpoint.authentication}
                                </Badge>
                                <Badge className={`text-xs ${getSecurityColor(endpoint.securityLevel)}`}>
                                  {endpoint.securityLevel}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Administration APIs */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      内部综合管理API (Administration API)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {apiDocumentation.administration.map((category, index) => (
                        <div key={index} className="border rounded-lg p-4 border-red-200 bg-red-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <category.icon className="h-4 w-4 text-red-600" />
                              <h4 className="font-medium">{category.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {category.endpoints.length} 个端点
                              </Badge>
                              <Badge className={`text-xs ${getSecurityColor(category.securityLevel)}`}>
                                {category.securityLevel}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                          <div className="space-y-2">
                            {category.endpoints.slice(0, 2).map((endpoint, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                {getMethodBadge(endpoint.method)}
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{endpoint.path}</code>
                                <Badge variant="outline" className="text-xs">
                                  {endpoint.authentication}
                                </Badge>
                                <Badge className={`text-xs ${getSecurityColor(endpoint.securityLevel)}`}>
                                  {endpoint.securityLevel}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
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
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(tool.href, '_blank')}
                    >
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