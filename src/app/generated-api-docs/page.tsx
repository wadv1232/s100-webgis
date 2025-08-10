'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiDocumentation } from '@/lib/generated/api-documentation'

export default function GeneratedApiDocsPage() {
  const { public: publicApis, federation: federationApis, administration: adminApis } = apiDocumentation

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
      low: <Badge className="bg-green-100 text-green-700">低</Badge>,
      medium: <Badge className="bg-yellow-100 text-yellow-700">中</Badge>,
      high: <Badge className="bg-orange-100 text-orange-700">高</Badge>,
      critical: <Badge className="bg-red-100 text-red-700">关键</Badge>
    }
    return badges[level as keyof typeof badges] || <Badge variant="outline">未知</Badge>
  }

  const totalEndpoints = [
    ...publicApis.flatMap(cat => cat.endpoints.length),
    ...federationApis.flatMap(cat => cat.endpoints.length),
    ...adminApis.flatMap(cat => cat.endpoints.length)
  ].reduce((sum, count) => sum + count, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6 p-4 pt-8">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            自动生成的API文档
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            基于API路由文件自动扫描生成的完整API文档，包含对外数据服务API、协作API和内部综合管理API
          </p>
          <div className="mt-4 text-sm text-gray-500">
            生成时间: {new Date(apiDocumentation.generatedAt).toLocaleString('zh-CN')} | 版本: {apiDocumentation.version}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{totalEndpoints}</p>
                <p className="text-sm text-gray-600">总API端点</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{publicApis.length}</p>
                <p className="text-sm text-gray-600">对外服务API</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{federationApis.length}</p>
                <p className="text-sm text-gray-600">协作API</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{adminApis.length}</p>
                <p className="text-sm text-gray-600">内部管理API</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="public" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="public">对外数据服务API</TabsTrigger>
            <TabsTrigger value="federation">协作API</TabsTrigger>
            <TabsTrigger value="administration">内部综合管理API</TabsTrigger>
          </TabsList>

          {/* Public APIs */}
          <TabsContent value="public" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>对外数据服务API (Public Data Service API)</CardTitle>
                <CardDescription>
                  为第三方开发者和系统集成商提供的标准海事数据服务API接口
                </CardDescription>
              </CardHeader>
            </Card>

            {publicApis.map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category.name}
                    {getSecurityBadge(category.securityLevel)}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.endpoints.map((endpoint, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {getMethodBadge(endpoint.method)}
                          <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">
                            {endpoint.path}
                          </code>
                          <Badge variant="outline">{endpoint.version}</Badge>
                          <Badge className="bg-blue-100 text-blue-700">
                            {endpoint.authentication}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{endpoint.description}</p>
                        
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-medium mb-2">路径参数:</h5>
                            <div className="flex flex-wrap gap-2">
                              {endpoint.parameters.map((param, paramIndex) => (
                                <Badge key={paramIndex} variant="outline">
                                  {param.name}: {param.type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h5 className="font-medium mb-2">响应状态:</h5>
                          <div className="flex flex-wrap gap-2">
                            {endpoint.responses.map((response, respIndex) => (
                              <Badge key={respIndex} variant={response.code === 200 ? "default" : "secondary"}>
                                {response.code}: {response.description}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Federation APIs */}
          <TabsContent value="federation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>协作API (Federation API)</CardTitle>
                <CardDescription>
                  用于节点间通信，实现能力发现与聚合。对上级节点可见
                </CardDescription>
              </CardHeader>
            </Card>

            {federationApis.map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category.name}
                    {getSecurityBadge(category.securityLevel)}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.endpoints.map((endpoint, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {getMethodBadge(endpoint.method)}
                          <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">
                            {endpoint.path}
                          </code>
                          <Badge variant="outline">{endpoint.version}</Badge>
                          <Badge className="bg-orange-100 text-orange-700">
                            {endpoint.authentication}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{endpoint.description}</p>
                        
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-medium mb-2">路径参数:</h5>
                            <div className="flex flex-wrap gap-2">
                              {endpoint.parameters.map((param, paramIndex) => (
                                <Badge key={paramIndex} variant="outline">
                                  {param.name}: {param.type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h5 className="font-medium mb-2">响应状态:</h5>
                          <div className="flex flex-wrap gap-2">
                            {endpoint.responses.map((response, respIndex) => (
                              <Badge key={respIndex} variant={response.code === 200 ? "default" : "secondary"}>
                                {response.code}: {response.description}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Administration APIs */}
          <TabsContent value="administration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>内部综合管理API (Administration API)</CardTitle>
                <CardDescription>
                  供本级管理员通过管理后台进行操作，拥有最高权限。此部分API不对外公开，仅限内部网络或通过VPN访问
                </CardDescription>
              </CardHeader>
            </Card>

            {adminApis.map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category.name}
                    {getSecurityBadge(category.securityLevel)}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.endpoints.map((endpoint, index) => (
                      <div key={index} className="border rounded-lg p-4 border-red-200 bg-red-50">
                        <div className="flex items-center gap-3 mb-3">
                          {getMethodBadge(endpoint.method)}
                          <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">
                            {endpoint.path}
                          </code>
                          <Badge variant="outline">{endpoint.version}</Badge>
                          <Badge className="bg-red-100 text-red-700">
                            {endpoint.authentication}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{endpoint.description}</p>
                        
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-medium mb-2">路径参数:</h5>
                            <div className="flex flex-wrap gap-2">
                              {endpoint.parameters.map((param, paramIndex) => (
                                <Badge key={paramIndex} variant="outline">
                                  {param.name}: {param.type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h5 className="font-medium mb-2">响应状态:</h5>
                          <div className="flex flex-wrap gap-2">
                            {endpoint.responses.map((response, respIndex) => (
                              <Badge key={respIndex} variant={response.code === 200 ? "default" : "secondary"}>
                                {response.code}: {response.description}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}