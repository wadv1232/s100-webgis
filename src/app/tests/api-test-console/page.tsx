'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/auth/permissions'
import { Permission, UserRole } from '@prisma/client'
import {
  Terminal,
  Play,
  Copy,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Code,
  FileText,
  Database,
  Map
} from 'lucide-react'

export default function APITestConsole() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('rest')
  const [selectedEndpoint, setSelectedEndpoint] = useState('')
  const [requestMethod, setRequestMethod] = useState('GET')
  const [requestHeaders, setRequestHeaders] = useState('{}')
  const [requestBody, setRequestBody] = useState('{}')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [executionTime, setExecutionTime] = useState(0)

  if (!user || !hasPermission(user.role as UserRole, Permission.API_TEST)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              访问受限
            </CardTitle>
            <CardDescription>
              您需要拥有API测试权限才能使用API测试控制台
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

  // API端点列表
  const apiEndpoints = [
    {
      category: 'S-101电子海图服务',
      endpoints: [
        { method: 'GET', path: '/api/v1/s101/wfs', description: 'S-101 Web要素服务' },
        { method: 'GET', path: '/api/v1/s101/wms', description: 'S-101 Web地图服务' }
      ]
    },
    {
      category: 'S-102高精度水深服务',
      endpoints: [
        { method: 'GET', path: '/api/v1/s102/wcs', description: 'S-102 Web覆盖服务' },
        { method: 'GET', path: '/api/v1/s102/wms', description: 'S-102水深地图服务' }
      ]
    },
    {
      category: '系统能力查询',
      endpoints: [
        { method: 'GET', path: '/api/v1/capabilities', description: '服务能力查询' }
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

  const executeTest = async () => {
    if (!selectedEndpoint) return

    setIsLoading(true)
    const startTime = Date.now()

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
      
      const mockResponse = {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-request-id': `req_${Date.now()}`,
          'x-response-time': `${Math.floor(Math.random() * 500) + 50}ms`
        },
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[[120.5, 30.5], [121.5, 30.5], [121.5, 31.5], [120.5, 31.5], [120.5, 30.5]]]
              },
              properties: {
                featureCode: 'DEPARE',
                depth: 15.5,
                confidence: 0.95
              }
            }
          ]
        }
      }

      setResponse(mockResponse)
    } catch (error) {
      setResponse({
        status: 500,
        error: 'API调用失败',
        message: error instanceof Error ? error.message : '未知错误'
      })
    } finally {
      setExecutionTime(Date.now() - startTime)
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6 p-4 pt-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <Terminal className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            API测试控制台
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            在线测试和调试API端点，实时查看响应结果
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* API Endpoints Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API端点
                </CardTitle>
                <CardDescription>
                  选择要测试的API端点
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiEndpoints.map((category, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">{category.category}</h4>
                    <div className="space-y-2">
                      {category.endpoints.map((endpoint, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedEndpoint(endpoint.path)
                            setRequestMethod(endpoint.method)
                          }}
                          className={`w-full text-left p-3 border rounded-lg transition-colors ${
                            selectedEndpoint === endpoint.path
                              ? 'bg-blue-50 border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getMethodBadge(endpoint.method)}
                            <span className="text-sm font-medium">{endpoint.path}</span>
                          </div>
                          <p className="text-xs text-gray-600">{endpoint.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Test Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  请求配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="method">HTTP方法</Label>
                    <Select value={requestMethod} onValueChange={setRequestMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="endpoint">端点URL</Label>
                    <Input
                      id="endpoint"
                      value={selectedEndpoint}
                      onChange={(e) => setSelectedEndpoint(e.target.value)}
                      placeholder="/api/v1/endpoint"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="headers">请求头 (JSON格式)</Label>
                  <Textarea
                    id="headers"
                    value={requestHeaders}
                    onChange={(e) => setRequestHeaders(e.target.value)}
                    placeholder='{"Authorization": "Bearer YOUR_API_KEY"}'
                    rows={3}
                  />
                </div>

                {(requestMethod === 'POST' || requestMethod === 'PUT') && (
                  <div>
                    <Label htmlFor="body">请求体 (JSON格式)</Label>
                    <Textarea
                      id="body"
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      placeholder='{"key": "value"}'
                      rows={4}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={executeTest} 
                    disabled={!selectedEndpoint || isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {isLoading ? '执行中...' : '执行测试'}
                  </Button>
                  {executionTime > 0 && (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {executionTime}ms
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Response Panel */}
            {response && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    响应结果
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {response.status === 200 ? (
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {response.status}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {response.status}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="body" className="w-full">
                    <TabsList>
                      <TabsTrigger value="body">响应体</TabsTrigger>
                      <TabsTrigger value="headers">响应头</TabsTrigger>
                      <TabsTrigger value="curl">cURL命令</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="body" className="space-y-4">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{JSON.stringify(response.data || response, null, 2)}</code>
                      </pre>
                    </TabsContent>
                    
                    <TabsContent value="headers" className="space-y-4">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{JSON.stringify(response.headers, null, 2)}</code>
                      </pre>
                    </TabsContent>
                    
                    <TabsContent value="curl" className="space-y-4">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{`curl -X ${requestMethod} "${selectedEndpoint}" \\
  -H "Content-Type: application/json" \\
  ${JSON.parse(requestHeaders).Authorization ? `-H "Authorization: ${JSON.parse(requestHeaders).Authorization}"` : ''} \\
  ${requestBody !== '{}' ? `-d '${requestBody}'` : ''}`}</code>
                      </pre>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}