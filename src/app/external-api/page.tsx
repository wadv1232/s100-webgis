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
  Globe,
  Lock,
  Key,
  Book,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Code,
  Database,
  Map,
  Settings,
  Activity,
  FileText,
  Download
} from 'lucide-react'

export default function ExternalAPIPage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')

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
              您需要登录并拥有API访问权限才能查看外部API文档
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

  // 外部API端点定义
  const externalAPIs = [
    {
      category: 'S-101电子海图服务',
      icon: Map,
      description: '提供电子海图数据的Web要素服务和Web地图服务',
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/s101/wfs',
          version: 'v1.0.0',
          description: 'S-101 Web要素服务，支持GeoJSON格式输出',
          authentication: 'API Key',
          parameters: [
            { name: 'bbox', type: 'string', required: true, description: '边界框坐标 (minX,minY,maxX,maxY)' },
            { name: 'featureCodes', type: 'string', required: false, description: '要素代码列表，逗号分隔' },
            { name: 'format', type: 'string', required: false, description: '输出格式，默认GeoJSON' },
            { name: 'crs', type: 'string', required: false, description: '坐标参考系统' }
          ],
          responseFormat: 'GeoJSON',
          example: {
            request: '/api/v1/s101/wfs?bbox=120.0,30.0,122.0,32.0&featureCodes=DEPARE,DRGARE',
            response: {
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
        },
        {
          method: 'GET',
          path: '/api/v1/s101/wms',
          version: 'v1.0.0',
          description: 'S-101 Web地图服务，支持WMS 1.3.0标准',
          authentication: 'API Key',
          parameters: [
            { name: 'SERVICE', type: 'string', required: true, description: '服务类型，固定为WMS' },
            { name: 'VERSION', type: 'string', required: true, description: '版本号，如1.3.0' },
            { name: 'REQUEST', type: 'string', required: true, description: '请求类型 (GetMap, GetCapabilities)' },
            { name: 'LAYERS', type: 'string', required: true, description: '图层名称' },
            { name: 'STYLES', type: 'string', required: false, description: '样式名称' },
            { name: 'CRS', type: 'string', required: true, description: '坐标参考系统' },
            { name: 'BBOX', type: 'string', required: true, description: '边界框' },
            { name: 'WIDTH', type: 'integer', required: true, description: '图像宽度' },
            { name: 'HEIGHT', type: 'integer', required: true, description: '图像高度' },
            { name: 'FORMAT', type: 'string', required: true, description: '图像格式' }
          ],
          responseFormat: 'Image (PNG/JPEG)',
          example: {
            request: '/api/v1/s101/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=s101&STYLES=default&CRS=EPSG:4326&BBOX=120.0,30.0,122.0,32.0&WIDTH=800&HEIGHT=600&FORMAT=image/png',
            response: 'PNG image data'
          }
        }
      ]
    },
    {
      category: 'S-102高精度水深服务',
      icon: Database,
      description: '提供高精度水深数据的Web覆盖服务和Web地图服务',
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/s102/wcs',
          version: 'v1.0.0',
          description: 'S-102 Web覆盖服务，支持多种格网数据格式',
          authentication: 'API Key',
          parameters: [
            { name: 'SERVICE', type: 'string', required: true, description: '服务类型，固定为WCS' },
            { name: 'VERSION', type: 'string', required: true, description: '版本号' },
            { name: 'REQUEST', type: 'string', required: true, description: '请求类型 (GetCoverage, GetCapabilities)' },
            { name: 'COVERAGE', type: 'string', required: true, description: '覆盖数据名称' },
            { name: 'FORMAT', type: 'string', required: true, description: '输出格式 (GeoTIFF, NetCDF)' },
            { name: 'BBOX', type: 'string', required: true, description: '边界框' },
            { name: 'CRS', type: 'string', required: true, description: '坐标参考系统' },
            { name: 'WIDTH', type: 'integer', required: false, description: '网格宽度' },
            { name: 'HEIGHT', type: 'integer', required: false, description: '网格高度' }
          ],
          responseFormat: 'GeoTIFF/NetCDF',
          example: {
            request: '/api/v1/s102/wcs?SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage&COVERAGE=s102_bathymetry&FORMAT=GeoTIFF&BBOX=120.0,30.0,122.0,32.0&CRS=EPSG:4326&WIDTH=1000&HEIGHT=800',
            response: 'GeoTIFF format bathymetry data'
          }
        },
        {
          method: 'GET',
          path: '/api/v1/s102/wms',
          version: 'v1.0.0',
          description: 'S-102水深数据Web地图服务',
          authentication: 'API Key',
          parameters: [
            { name: 'SERVICE', type: 'string', required: true, description: '服务类型，固定为WMS' },
            { name: 'VERSION', type: 'string', required: true, description: '版本号' },
            { name: 'REQUEST', type: 'string', required: true, description: '请求类型' },
            { name: 'LAYERS', type: 'string', required: true, description: '图层名称' },
            { name: 'BBOX', type: 'string', required: true, description: '边界框' },
            { name: 'FORMAT', type: 'string', required: true, description: '图像格式' }
          ],
          responseFormat: 'Image (PNG/JPEG)',
          example: {
            request: '/api/v1/s102/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=s102&BBOX=120.0,30.0,122.0,32.0&WIDTH=800&HEIGHT=600&FORMAT=image/png',
            response: 'PNG image with bathymetry data'
          }
        }
      ]
    },
    {
      category: '服务能力查询',
      icon: Activity,
      description: '查询系统服务能力和节点信息',
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/capabilities',
          version: 'v1.0.0',
          description: '获取系统服务能力和可用节点信息',
          authentication: 'API Key',
          parameters: [
            { name: 'bbox', type: 'string', required: false, description: '指定区域的边界框' },
            { name: 'productType', type: 'string', required: false, description: 'S-100产品类型 (S101, S102等)' },
            { name: 'serviceType', type: 'string', required: false, description: '服务类型 (WMS, WFS, WCS)' }
          ],
          responseFormat: 'JSON',
          example: {
            request: '/api/v1/capabilities?bbox=120.0,30.0,122.0,32.0&productType=S101',
            response: {
              capabilities: [
                {
                  nodeId: 'shanghai-port',
                  productType: 'S101',
                  serviceType: 'WMS',
                  endpoint: '/api/v1/s101/wms',
                  coverage: {
                    type: 'Polygon',
                    coordinates: [[[120.0, 30.0], [122.0, 30.0], [122.0, 32.0], [120.0, 32.0], [120.0, 30.0]]]
                  }
                }
              ]
            }
          }
        }
      ]
    }
  ]

  // SDK和工具
  const sdks = [
    {
      name: 'JavaScript SDK',
      version: 'v2.1.0',
      description: '适用于浏览器和Node.js的JavaScript SDK',
      language: 'JavaScript',
      install: 'npm install s100-maritime-sdk',
      features: ['Promise支持', 'TypeScript类型定义', '自动重试机制', '错误处理'],
      downloadUrl: '/sdks/s100-js-sdk-v2.1.0.zip'
    },
    {
      name: 'Python SDK',
      version: 'v2.0.0',
      description: '适用于Python 3.7+的官方SDK',
      language: 'Python',
      install: 'pip install s100-maritime',
      features: ['异步支持', 'Pandas集成', 'Jupyter Notebook支持', '数据可视化'],
      downloadUrl: '/sdks/s100-python-sdk-v2.0.0.tar.gz'
    },
    {
      name: 'Java SDK',
      version: 'v1.5.0',
      description: '适用于Java 8+的企业级SDK',
      language: 'Java',
      install: 'implementation "org.iho:s100-maritime:1.5.0"',
      features: ['Spring Boot集成', 'Maven/Gradle支持', '连接池管理', '日志集成'],
      downloadUrl: '/sdks/s100-java-sdk-v1.5.0.jar'
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

  const filteredAPIs = selectedCategory === 'all' 
    ? externalAPIs 
    : externalAPIs.filter(api => api.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6 p-4 pt-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <Globe className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            外部API文档
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            为第三方开发者和系统集成商提供的标准海事数据服务API接口
          </p>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">API版本</p>
                  <p className="text-2xl font-bold">v1.0.0</p>
                </div>
                <Book className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">认证方式</p>
                  <p className="text-2xl font-bold">API Key</p>
                </div>
                <Key className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">支持格式</p>
                  <p className="text-2xl font-bold">GeoJSON, WMS, WCS</p>
                </div>
                <Code className="h-12 w-12 text-purple-500 opacity-20" />
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
            <TabsTrigger value="sdks" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              SDK下载
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              代码示例
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
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    全部
                  </button>
                  {externalAPIs.map((api) => (
                    <button
                      key={api.category}
                      onClick={() => setSelectedCategory(api.category)}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedCategory === api.category 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <api.icon className="h-4 w-4" />
                      {api.category}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* API Details */}
            <div className="space-y-6">
              {filteredAPIs.map((api) => (
                <Card key={api.category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <api.icon className="h-6 w-6 text-blue-600" />
                      {api.category}
                    </CardTitle>
                    <CardDescription>{api.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {api.endpoints.map((endpoint, index) => (
                        <div key={index} className="border rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            {getMethodBadge(endpoint.method)}
                            <code className="bg-gray-100 px-3 py-1 rounded font-mono text-lg">
                              {endpoint.path}
                            </code>
                            <Badge variant="outline">{endpoint.version}</Badge>
                            <Badge className="bg-green-100 text-green-700">
                              {endpoint.authentication}
                            </Badge>
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
                                  <div key={idx} className="bg-gray-50 p-3 rounded">
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
                              <div className="bg-gray-50 p-3 rounded">
                                <p className="text-sm font-medium mb-2">{endpoint.responseFormat}</p>
                                {endpoint.example && (
                                  <details className="mt-3">
                                    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                                      查看示例
                                    </summary>
                                    <div className="mt-2 space-y-3">
                                      <div>
                                        <p className="text-xs font-medium text-gray-600 mb-1">请求示例:</p>
                                        <code className="block bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
                                          {endpoint.example.request}
                                        </code>
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

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Button variant="outline" size="sm">
                              <FileText className="h-3 w-3 mr-1" />
                              完整文档
                            </Button>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              在线测试
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-3 w-3 mr-1" />
                              复制URL
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SDKs Tab */}
          <TabsContent value="sdks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sdks.map((sdk, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{sdk.name}</CardTitle>
                      <Badge variant="outline">{sdk.version}</Badge>
                    </div>
                    <CardDescription>{sdk.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">语言:</p>
                      <p className="font-medium">{sdk.language}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">安装:</p>
                      <code className="block bg-gray-100 p-2 rounded text-sm">{sdk.install}</code>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">特性:</p>
                      <div className="space-y-1">
                        {sdk.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      下载SDK
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Code Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* JavaScript Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    JavaScript 示例
                  </CardTitle>
                  <CardDescription>
                    使用JavaScript SDK调用S-101 WFS服务
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <pre>
                      <code>{`// 导入SDK
import { S100Client } from 's100-maritime-sdk';

// 初始化客户端
const client = new S100Client({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.example.com'
});

// 获取S-101电子海图数据
async function getNauticalChart() {
  try {
    const response = await client.s101.wfs.getFeatures({
      bbox: '120.0,30.0,122.0,32.0',
      featureCodes: ['DEPARE', 'DRGARE'],
      format: 'GeoJSON'
    });
    
    console.log('获取到要素数量:', response.features.length);
    return response.features;
  } catch (error) {
    console.error('API调用失败:', error);
  }
}

// 使用示例
getNauticalChart().then(features => {
  // 处理海图要素数据
  features.forEach(feature => {
    console.log('要素类型:', feature.properties.featureCode);
    console.log('坐标:', feature.geometry.coordinates);
  });
});`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Python Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Python 示例
                  </CardTitle>
                  <CardDescription>
                    使用Python SDK调用S-102 WCS服务
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <pre>
                      <code>{`# 导入SDK
import s100_maritime
import matplotlib.pyplot as plt

# 初始化客户端
client = s100_maritime.Client(
    api_key='YOUR_API_KEY',
    base_url='https://api.example.com'
)

# 获取S-102高精度水深数据
def get_bathymetry_data():
    try:
        # 获取水深格网数据
        coverage = client.s102.wcs.get_coverage(
            coverage='s102_bathymetry',
            bbox='120.0,30.0,122.0,32.0',
            format='GeoTIFF',
            width=1000,
            height=800
        )
        
        # 转换为numpy数组
        bathymetry_array = coverage.to_array()
        
        # 显示水深数据
        plt.figure(figsize=(10, 8))
        plt.imshow(bathymetry_array, cmap='ocean')
        plt.colorbar(label='水深 (m)')
        plt.title('S-102 高精度水深数据')
        plt.show()
        
        return bathymetry_array
        
    except Exception as e:
        print(f'API调用失败: {e}')

# 使用示例
if __name__ == '__main__':
    data = get_bathymetry_data()
    print(f'数据形状: {data.shape}')`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* cURL Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    cURL 示例
                  </CardTitle>
                  <CardDescription>
                    使用cURL直接调用API端点
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <pre>
                      <code>{`# 获取S-101 WFS服务能力
curl -X GET 'https://api.example.com/api/v1/s101/wfs' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Accept: application/json' \\
  -G \\
  --data-urlencode 'service=WFS' \\
  --data-urlencode 'version=1.0.0' \\
  --data-urlencode 'request=GetCapabilities'

# 获取指定区域的海图要素
curl -X GET 'https://api.example.com/api/v1/s101/wfs' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Accept: application/json' \\
  -G \\
  --data-urlencode 'bbox=120.0,30.0,122.0,32.0' \\
  --data-urlencode 'featureCodes=DEPARE,DRGARE' \\
  --data-urlencode 'format=GeoJSON'

# 获取S-102水深数据
curl -X GET 'https://api.example.com/api/v1/s102/wms' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -G \\
  --data-urlencode 'SERVICE=WMS' \\
  --data-urlencode 'VERSION=1.3.0' \\
  --data-urlencode 'REQUEST=GetMap' \\
  --data-urlencode 'LAYERS=s102' \\
  --data-urlencode 'BBOX=120.0,30.0,122.0,32.0' \\
  --data-urlencode 'WIDTH=800' \\
  --data-urlencode 'HEIGHT=600' \\
  --data-urlencode 'FORMAT=image/png' \\
  --output bathymetry.png`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Authentication Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API认证示例
                  </CardTitle>
                  <CardDescription>
                    API密钥认证和错误处理
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <pre>
                      <code>{`// API密钥认证示例
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://api.example.com';

// 请求拦截器
const apiRequest = async (endpoint, options = {}) => {
  const url = \`\${BASE_URL}\${endpoint}\`;
  
  const config = {
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    // 处理HTTP错误
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(\`API Error: \${response.status} - \${errorData.message || 'Unknown error'}\`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Request failed:', error.message);
    
    // 处理特定错误
    if (error.message.includes('401')) {
      console.error('API密钥无效或已过期');
    } else if (error.message.includes('429')) {
      console.error('请求频率超限，请稍后重试');
    } else if (error.message.includes('500')) {
      console.error('服务器内部错误');
    }
    
    throw error;
  }
};

// 使用示例
try {
  const data = await apiRequest('/api/v1/capabilities');
  console.log('API调用成功:', data);
} catch (error) {
  console.error('API调用失败:', error.message);
}`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}