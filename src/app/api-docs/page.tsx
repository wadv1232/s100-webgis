'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Copy, Play, ExternalLink, Code, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface ApiEndpoint {
  method: string
  path: string
  description: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
    example?: string
  }>
  requestBody?: {
    type: string
    description: string
    example: string
  }
  responses: Array<{
    code: number
    description: string
    example?: string
  }>
}

const apiEndpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/capabilities',
    description: '获取指定区域内所有可用的S-100数据服务',
    parameters: [
      {
        name: 'bbox',
        type: 'string',
        required: true,
        description: '边界框坐标，格式：minX,minY,maxX,maxY',
        example: '120.0,30.0,122.0,32.0'
      },
      {
        name: 'products',
        type: 'string',
        required: false,
        description: '过滤特定产品类型，多个用逗号分隔',
        example: 'S101,S104'
      }
    ],
    responses: [
      {
        code: 200,
        description: '成功返回服务能力列表',
        example: `{
  "services": [
    {
      "productId": "S101",
      "productName": "Electronic Navigational Chart",
      "serviceType": "WMS",
      "endpoint": "http://node.example.com/wms",
      "nodeId": "shanghai-port",
      "nodeName": "上海港节点",
      "coverage": {
        "type": "Polygon",
        "coordinates": [[[120.5,31.2],[121.8,31.2],[121.8,31.5],[120.5,31.5],[120.5,31.2]]]
      }
    }
  ]
}`
      }
    ]
  },
  {
    method: 'GET',
    path: '/api/v1/s101/wms',
    description: '获取S-101电子海图WMS服务',
    parameters: [
      {
        name: 'bbox',
        type: 'string',
        required: true,
        description: 'WMS边界框',
        example: '120.0,30.0,122.0,32.0'
      },
      {
        name: 'width',
        type: 'integer',
        required: true,
        description: '图像宽度',
        example: '800'
      },
      {
        name: 'height',
        type: 'integer',
        required: true,
        description: '图像高度',
        example: '600'
      },
      {
        name: 'format',
        type: 'string',
        required: false,
        description: '图像格式',
        example: 'image/png'
      }
    ],
    responses: [
      {
        code: 200,
        description: '成功返回海图图像',
        example: '返回PNG图像数据'
      },
      {
        code: 307,
        description: '临时重定向到最优服务节点',
        example: '重定向到叶子节点的实际服务地址'
      }
    ]
  },
  {
    method: 'GET',
    path: '/api/v1/s104/wms',
    description: '获取S-104水位数据WMS服务',
    parameters: [
      {
        name: 'bbox',
        type: 'string',
        required: true,
        description: 'WMS边界框',
        example: '120.0,30.0,122.0,32.0'
      },
      {
        name: 'width',
        type: 'integer',
        required: true,
        description: '图像宽度',
        example: '800'
      },
      {
        name: 'height',
        type: 'integer',
        required: true,
        description: '图像高度',
        example: '600'
      },
      {
        name: 'time',
        type: 'string',
        required: false,
        description: '时间参数',
        example: '2024-01-01T12:00:00Z'
      }
    ],
    responses: [
      {
        code: 200,
        description: '成功返回水位数据图像',
        example: '返回PNG图像数据'
      }
    ]
  },
  {
    method: 'POST',
    path: '/admin/nodes',
    description: '创建新的子节点（管理员功能）',
    requestBody: {
      type: 'application/json',
      description: '节点创建请求体',
      example: `{
  "node_id": "cn-js-msa",
  "node_name": "江苏海事服务节点",
  "initial_coverage": {
    "type": "Polygon",
    "coordinates": [[[119.0,31.5],[121.0,31.5],[121.0,33.0],[119.0,33.0],[119.0,31.5]]]
  },
  "required_products": ["S101", "S124"]
}`
    },
    responses: [
      {
        code: 201,
        description: '节点创建成功',
        example: `{
  "nodeId": "cn-js-msa",
  "nodeName": "江苏海事服务节点",
  "apiKey": "sk-abc123...",
  "status": "created"
}`
      }
    ]
  }
]

const ApiDocs = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)
  const [testParams, setTestParams] = useState<Record<string, string>>({})
  const [testResponse, setTestResponse] = useState<string>('')
  const [isTesting, setIsTesting] = useState(false)

  const handleTestApi = async (endpoint: ApiEndpoint) => {
    setIsTesting(true)
    try {
      // 构建测试URL
      const baseUrl = window.location.origin
      let url = `${baseUrl}${endpoint.path}`
      
      if (endpoint.method === 'GET' && Object.keys(testParams).length > 0) {
        const params = new URLSearchParams()
        Object.entries(testParams).forEach(([key, value]) => {
          if (value) params.append(key, value)
        })
        url += `?${params.toString()}`
      }

      const response = await fetch(url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: endpoint.method === 'POST' ? JSON.stringify(testParams) : undefined
      })

      const data = await response.text()
      setTestResponse(`Status: ${response.status}\n\n${data}`)
    } catch (error) {
      setTestResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTesting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800'
      case 'POST': return 'bg-blue-100 text-blue-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">S-100 海事服务平台 API 文档</h1>
        <p className="text-muted-foreground mb-4">
          为ECDIS开发者提供的完整API参考文档和交互式测试工具
        </p>
        <div className="flex gap-4 mb-6">
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            生产就绪
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            RESTful API
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Code className="w-3 h-3" />
            JSON 响应
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">API 端点</TabsTrigger>
          <TabsTrigger value="quickstart">快速开始</TabsTrigger>
          <TabsTrigger value="examples">代码示例</TabsTrigger>
          <TabsTrigger value="errors">错误处理</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API 端点列表</CardTitle>
              <CardDescription>
                点击任意端点查看详细信息和进行交互式测试
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map((endpoint, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader 
                      className="pb-3"
                      onClick={() => setSelectedEndpoint(endpoint)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEndpoint(endpoint)
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardDescription className="mt-2">
                        {endpoint.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedEndpoint && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getMethodColor(selectedEndpoint.method)}>
                      {selectedEndpoint.method}
                    </Badge>
                    <CardTitle>{selectedEndpoint.path}</CardTitle>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(`${selectedEndpoint.method} ${selectedEndpoint.path}`)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>{selectedEndpoint.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList>
                    <TabsTrigger value="details">详情</TabsTrigger>
                    <TabsTrigger value="test">测试</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-6">
                    {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">参数</h4>
                        <div className="space-y-3">
                          {selectedEndpoint.parameters.map((param, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-sm">{param.name}</code>
                                <Badge variant="outline">{param.type}</Badge>
                                {param.required && <Badge variant="destructive">必需</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{param.description}</p>
                              {param.example && (
                                <div className="bg-muted p-2 rounded text-xs font-mono">
                                  示例: {param.example}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEndpoint.requestBody && (
                      <div>
                        <h4 className="font-semibold mb-3">请求体</h4>
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="text-sm mb-2">
                            <Badge variant="outline">{selectedEndpoint.requestBody.type}</Badge>
                            <p className="text-muted-foreground mt-1">{selectedEndpoint.requestBody.description}</p>
                          </div>
                          <pre className="text-xs overflow-x-auto">
                            {selectedEndpoint.requestBody.example}
                          </pre>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-3">响应</h4>
                      <Accordion type="single" collapsible>
                        {selectedEndpoint.responses.map((response, index) => (
                          <AccordionItem key={index} value={`response-${index}`}>
                            <AccordionTrigger className="text-sm">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={response.code === 200 ? "default" : "secondary"}
                                >
                                  {response.code}
                                </Badge>
                                {response.description}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              {response.example && (
                                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                                  {response.example}
                                </pre>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </TabsContent>

                  <TabsContent value="test" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">API 测试</h4>
                      <div className="space-y-4">
                        {selectedEndpoint.parameters?.map((param, index) => (
                          <div key={index}>
                            <Label htmlFor={`param-${param.name}`}>
                              {param.name} {param.required && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                              id={`param-${param.name}`}
                              placeholder={param.example || param.description}
                              value={testParams[param.name] || ''}
                              onChange={(e) => setTestParams(prev => ({
                                ...prev,
                                [param.name]: e.target.value
                              }))}
                            />
                          </div>
                        ))}

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleTestApi(selectedEndpoint)}
                            disabled={isTesting}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {isTesting ? '测试中...' : '测试 API'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setTestParams({})
                              setTestResponse('')
                            }}
                          >
                            清空
                          </Button>
                        </div>

                        {testResponse && (
                          <div>
                            <Label>响应结果</Label>
                            <Textarea 
                              value={testResponse}
                              readOnly
                              className="font-mono text-xs h-64"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quickstart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>5分钟快速开始</CardTitle>
              <CardDescription>
                按照以下步骤，快速将S-100平台集成到您的ECDIS应用中
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">获取服务能力</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      首先查询当前位置可用的S-100数据服务
                    </p>
                    <div className="bg-muted p-3 rounded text-sm font-mono">
                      GET /api/v1/capabilities?bbox=120.0,30.0,122.0,32.0
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">解析响应数据</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      解析返回的JSON，构建数据图层菜单
                    </p>
                    <div className="bg-muted p-3 rounded text-sm font-mono">
                      {`// 解析服务列表
const services = response.data.services;
services.forEach(service => {
  addLayerMenu(service.productName, service.serviceType);
});`}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">请求海图数据</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      根据用户选择，请求相应的S-100数据
                    </p>
                    <div className="bg-muted p-3 rounded text-sm font-mono">
                      GET /api/v1/s101/wms?bbox=120.5,31.2,121.0,31.5&width=800&height=600
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">处理重定向</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      正确处理HTTP 307重定向，直接连接到最优节点
                    </p>
                    <div className="bg-muted p-3 rounded text-sm font-mono">
                      {`// 处理307重定向
if (response.status === 307) {
  const newUrl = response.headers.get('Location');
  return fetch(newUrl);
}`}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold">显示海图</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      将获取的图像数据显示在ECDIS界面上
                    </p>
                    <div className="bg-muted p-3 rounded text-sm font-mono">
                      {`// 显示海图图像
const imageBlob = await response.blob();
const imageUrl = URL.createObjectURL(imageBlob);
mapLayer.setImage(imageUrl);`}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>代码示例</CardTitle>
              <CardDescription>
                常见编程语言的完整集成示例
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="javascript" className="w-full">
                <TabsList>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="java">Java</TabsTrigger>
                </TabsList>

                <TabsContent value="javascript">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">JavaScript/TypeScript 示例</h4>
                      <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`class S100Client {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getCapabilities(bbox, products = null) {
    const params = new URLSearchParams({ bbox });
    if (products) params.append('products', products);
    
    const response = await fetch(\`\${this.baseUrl}/api/v1/capabilities?\${params}\`);
    return await response.json();
  }

  async getWMSImage(productId, bbox, width, height, options = {}) {
    const params = new URLSearchParams({
      bbox, width: width.toString(), height: height.toString(), ...options
    });

    let response = await fetch(\`\${this.baseUrl}/api/v1/\${productId.toLowerCase()}/wms?\${params}\`);
    
    // 处理307重定向
    if (response.status === 307) {
      const newUrl = response.headers.get('Location');
      response = await fetch(newUrl);
    }

    return await response.blob();
  }
}

// 使用示例
const client = new S100Client('https://api.s100.example.com');

// 获取服务能力
const capabilities = await client.getCapabilities('120.0,30.0,122.0,32.0');
console.log('可用服务:', capabilities.services);

// 获取S101海图
const imageBlob = await client.getWMSImage('S101', '120.5,31.2,121.0,31.5', 800, 600);
const imageUrl = URL.createObjectURL(imageBlob);`}
                      </pre>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="python">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Python 示例</h4>
                      <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import requests
from typing import Dict, List, Optional
import json

class S100Client:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
    
    def get_capabilities(self, bbox: str, products: Optional[str] = None) -> Dict:
        """获取服务能力"""
        params = {'bbox': bbox}
        if products:
            params['products'] = products
        
        response = self.session.get(
            f"{self.base_url}/api/v1/capabilities",
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def get_wms_image(self, product_id: str, bbox: str, width: int, height: int, 
                     options: Optional[Dict] = None) -> bytes:
        """获取WMS图像"""
        params = {
            'bbox': bbox,
            'width': width,
            'height': height,
            **(options or {})
        }
        
        response = self.session.get(
            f"{self.base_url}/api/v1/{product_id.lower()}/wms",
            params=params,
            allow_redirects=False  # 不自动跟随重定向
        )
        
        # 处理307重定向
        if response.status_code == 307:
            new_url = response.headers['Location']
            response = self.session.get(new_url)
        
        response.raise_for_status()
        return response.content

# 使用示例
client = S100Client('https://api.s100.example.com')

# 获取服务能力
capabilities = client.get_capabilities('120.0,30.0,122.0,32.0')
print("可用服务:", capabilities['services'])

# 获取S101海图
image_data = client.get_wms_image('S101', '120.5,31.2,121.0,31.5', 800, 600)
with open('chart.png', 'wb') as f:
    f.write(image_data)`}
                      </pre>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="java">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Java 示例</h4>
                      <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

public class S100Client {
    private final String baseUrl;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    public S100Client(String baseUrl) {
        this.baseUrl = baseUrl;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }
    
    public Map<String, Object> getCapabilities(String bbox, String products) throws Exception {
        // 构建请求URL
        String url = String.format("%s/api/v1/capabilities?bbox=%s", baseUrl, bbox);
        if (products != null) {
            url += "&products=" + products;
        }
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .build();
            
        HttpResponse<String> response = httpClient.send(
            request, HttpResponse.BodyHandlers.ofString());
            
        if (response.statusCode() != 200) {
            throw new RuntimeException("API请求失败: " + response.statusCode());
        }
        
        return objectMapper.readValue(response.body(), Map.class);
    }
    
    public byte[] getWMSImage(String productId, String bbox, int width, int height, 
                             Map<String, String> options) throws Exception {
        // 构建请求参数
        Map<String, String> params = new HashMap<>();
        params.put("bbox", bbox);
        params.put("width", String.valueOf(width));
        params.put("height", String.valueOf(height));
        if (options != null) {
            params.putAll(options);
        }
        
        // 构建查询字符串
        String queryString = params.entrySet().stream()
            .map(entry -> entry.getKey() + "=" + entry.getValue())
            .reduce((p1, p2) -> p1 + "&" + p2)
            .orElse("");
            
        String url = String.format("%s/api/v1/%s/wms?%s", 
                                 baseUrl, productId.toLowerCase(), queryString);
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .build();
            
        HttpResponse<byte[]> response = httpClient.send(
            request, HttpResponse.BodyHandlers.ofByteArray());
            
        // 处理307重定向
        if (response.statusCode() == 307) {
            String newUrl = response.headers().firstValue("Location").orElse("");
            request = HttpRequest.newBuilder()
                .uri(URI.create(newUrl))
                .build();
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        }
        
        if (response.statusCode() != 200) {
            throw new RuntimeException("图像请求失败: " + response.statusCode());
        }
        
        return response.body();
    }
}

// 使用示例
public class Main {
    public static void main(String[] args) throws Exception {
        S100Client client = new S100Client("https://api.s100.example.com");
        
        // 获取服务能力
        Map<String, Object> capabilities = client.getCapabilities("120.0,30.0,122.0,32.0", null);
        System.out.println("可用服务: " + capabilities.get("services"));
        
        // 获取S101海图
        byte[] imageData = client.getWMSImage("S101", "120.5,31.2,121.0,31.5", 800, 600, null);
        // 保存图像文件...
    }
}`}
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>错误处理</CardTitle>
              <CardDescription>
                标准化的错误响应格式和处理建议
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">错误响应格式</h4>
                <div className="bg-muted p-4 rounded">
                  <pre className="text-sm">
{`{
  "error": {
    "code": "ERROR_CODE",
    "message": "人类可读的错误描述",
    "details": {
      // 额外的错误详情（可选）
    }
  }
}`}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">常见错误码</h4>
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">SERVICE_UNAVAILABLE</Badge>
                      <span className="text-sm font-mono">503</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      请求的服务暂时不可用，可能是节点维护中
                    </p>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">INVALID_BBOX</Badge>
                      <span className="text-sm font-mono">400</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      提供的边界框坐标格式无效或超出范围
                    </p>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">PRODUCT_NOT_SUPPORTED</Badge>
                      <span className="text-sm font-mono">404</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      请求的S-100产品类型在指定区域不可用
                    </p>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">RATE_LIMIT_EXCEEDED</Badge>
                      <span className="text-sm font-mono">429</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      请求频率超过限制，请稍后重试
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">错误处理建议</h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-medium">重试机制</h5>
                      <p className="text-sm text-muted-foreground">
                        对于503服务不可用错误，建议实现指数退避重试机制
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-medium">用户友好提示</h5>
                      <p className="text-sm text-muted-foreground">
                        将技术错误码转换为用户友好的提示信息显示在ECDIS界面上
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-medium">日志记录</h5>
                      <p className="text-sm text-muted-foreground">
                        记录详细的错误信息以便问题诊断和性能优化
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ApiDocs