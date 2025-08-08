'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Search, 
  Map, 
  Database, 
  Filter, 
  RefreshCw, 
  Globe,
  Building,
  Anchor,
  Zap,
  Grid3X3,
  List,
  BarChart3,
  Eye,
  Download,
  Settings,
  Activity,
  Layers,
  Maximize
} from 'lucide-react'
import { mockCapabilitiesData, S100_PRODUCTS, SERVICE_TYPES, getProductIcon } from '@/mock-data'

// S-100产品类型
const S100_PRODUCTS = [
  { value: 'S101', name: 'S-101 电子海图', description: '电子海图数据', icon: Map },
  { value: 'S102', name: 'S-102 高精度水深', description: '高精度水深格网数据', icon: Anchor },
  { value: 'S104', name: 'S-104 动态水位', description: '动态水位数据', icon: Activity },
  { value: 'S111', name: 'S-111 实时海流', description: '实时海流数据', icon: Zap },
  { value: 'S124', name: 'S-124 航行警告', description: '航行警告信息', icon: Settings },
  { value: 'S125', name: 'S-125 航行信息', description: '航行信息服务', icon: Database },
  { value: 'S131', name: 'S-131 海洋保护区', description: '海洋保护区数据', icon: Map }
]

// 服务类型
const SERVICE_TYPES = [
  { value: 'WFS', name: 'Web要素服务', description: '矢量要素数据服务' },
  { value: 'WMS', name: 'Web地图服务', description: '地图图像渲染服务' },
  { value: 'WCS', name: 'Web覆盖服务', description: '格网数据覆盖服务' }
]

// 节点类型
const NODE_TYPES = [
  { value: 'GLOBAL_ROOT', name: '全球根节点', icon: Globe },
  { value: 'NATIONAL', name: '国家级节点', icon: Building },
  { value: 'REGIONAL', name: '区域节点', icon: Map },
  { value: 'LEAF', name: '叶子节点', icon: Anchor }
]

// 模拟服务能力数据
const mockCapabilitiesData = {
  capabilities: [
    {
      id: '1',
      nodeId: 'shanghai-port',
      node: {
        id: 'shanghai-port',
        name: '上海港叶子节点',
        type: 'LEAF',
        level: 3,
        apiUrl: 'http://shanghai-port.example.com/api',
        coverage: { type: 'Polygon', coordinates: [[[121.0, 31.0], [122.0, 31.0], [122.0, 32.0], [121.0, 32.0], [121.0, 31.0]]] }
      },
      productType: 'S101',
      serviceType: 'WFS',
      isEnabled: true,
      endpoint: '/api/v1/s101/wfs',
      version: '1.0.0'
    },
    {
      id: '2',
      nodeId: 'shanghai-port',
      node: {
        id: 'shanghai-port',
        name: '上海港叶子节点',
        type: 'LEAF',
        level: 3,
        apiUrl: 'http://shanghai-port.example.com/api',
        coverage: { type: 'Polygon', coordinates: [[[121.0, 31.0], [122.0, 31.0], [122.0, 32.0], [121.0, 32.0], [121.0, 31.0]]] }
      },
      productType: 'S101',
      serviceType: 'WMS',
      isEnabled: true,
      endpoint: '/api/v1/s101/wms',
      version: '1.0.0'
    },
    {
      id: '3',
      nodeId: 'shanghai-port',
      node: {
        id: 'shanghai-port',
        name: '上海港叶子节点',
        type: 'LEAF',
        level: 3,
        apiUrl: 'http://shanghai-port.example.com/api',
        coverage: { type: 'Polygon', coordinates: [[[121.0, 31.0], [122.0, 31.0], [122.0, 32.0], [121.0, 32.0], [121.0, 31.0]]] }
      },
      productType: 'S102',
      serviceType: 'WCS',
      isEnabled: true,
      endpoint: '/api/v1/s102/wcs',
      version: '1.0.0'
    },
    {
      id: '4',
      nodeId: 'east-china-sea',
      node: {
        id: 'east-china-sea',
        name: '东海分局区域节点',
        type: 'REGIONAL',
        level: 2,
        apiUrl: 'http://east-china-sea.example.com/api',
        coverage: { type: 'Polygon', coordinates: [[[120.0, 30.0], [123.0, 30.0], [123.0, 33.0], [120.0, 33.0], [120.0, 30.0]]] }
      },
      productType: 'S101',
      serviceType: 'WMS',
      isEnabled: true,
      endpoint: '/api/v1/s101/wms',
      version: '1.0.0'
    }
  ],
  stats: {
    totalCapabilities: 4,
    byProduct: {
      S101: 3,
      S102: 1
    },
    byService: {
      WFS: 1,
      WMS: 2,
      WCS: 1
    },
    byNode: {
      'shanghai-port': 3,
      'east-china-sea': 1
    },
    byNodeType: {
      GLOBAL_ROOT: 0,
      NATIONAL: 0,
      REGIONAL: 1,
      LEAF: 1
    }
  },
  serviceMatrix: {
    S101: {
      WFS: true,
      WMS: true,
      WCS: false
    },
    S102: {
      WFS: false,
      WMS: false,
      WCS: true
    }
  },
  availableProducts: ['S101', 'S102'],
  availableServices: ['WFS', 'WMS', 'WCS']
}

interface Capability {
  id: string
  nodeId: string
  node: {
    id: string
    name: string
    type: string
    level: number
    apiUrl: string
    coverage: any
  }
  productType: string
  serviceType: string
  isEnabled: boolean
  endpoint: string
  version: string
}

interface CapabilitiesData {
  capabilities: Capability[]
  stats: {
    totalCapabilities: number
    byProduct: Record<string, number>
    byService: Record<string, number>
    byNode: Record<string, number>
    byNodeType: Record<string, number>
  }
  serviceMatrix: Record<string, Record<string, boolean>>
  availableProducts: string[]
  availableServices: string[]
}

export default function CapabilitiesPage() {
  const [capabilitiesData, setCapabilitiesData] = useState<CapabilitiesData>(mockCapabilitiesData)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    bbox: '',
    productType: 'all',
    serviceType: 'all',
    nodeId: 'all'
  })
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix')

  // 获取服务能力数据
  const fetchCapabilities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value)
      })

      const response = await fetch(`/api/capabilities?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setCapabilitiesData(result.data)
      } else {
        console.error('获取服务能力失败:', result.error)
      }
    } catch (error) {
      console.error('获取服务能力失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取产品图标
  const getProductIcon = (productType: string) => {
    const product = S100_PRODUCTS.find(p => p.value === productType)
    return product ? product.icon : Database
  }

  // 获取节点类型图标
  const getNodeTypeIcon = (nodeType: string) => {
    const nodeTypeConfig = NODE_TYPES.find(n => n.value === nodeType)
    return nodeTypeConfig ? nodeTypeConfig.icon : Globe
  }

  // 生成服务端点URL
  const generateServiceUrl = (capability: Capability) => {
    return `${capability.node.apiUrl}${capability.endpoint}`
  }

  // 重置过滤器
  const resetFilters = () => {
    setFilters({
      bbox: '',
      productType: 'all',
      serviceType: 'all',
      nodeId: 'all'
    })
  }

  useEffect(() => {
    fetchCapabilities()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Search className="h-8 w-8 text-purple-600" />
            服务能力探索
          </h1>
          <p className="text-gray-600 mt-2">
            探索和查询S-100架构中各节点的服务能力分布
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCapabilities} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 过滤器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            查询条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>边界框 (BBox)</Label>
              <Input
                placeholder="minX,minY,maxX,maxY"
                value={filters.bbox}
                onChange={(e) => setFilters({ ...filters, bbox: e.target.value })}
              />
            </div>
            <div>
              <Label>产品类型</Label>
              <Select value={filters.productType} onValueChange={(value) => setFilters({ ...filters, productType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择产品类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部产品</SelectItem>
                  {S100_PRODUCTS.map((product) => (
                    <SelectItem key={product.value} value={product.value}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>服务类型</Label>
              <Select value={filters.serviceType} onValueChange={(value) => setFilters({ ...filters, serviceType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择服务类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部服务</SelectItem>
                  {SERVICE_TYPES.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>节点</Label>
              <Select value={filters.nodeId} onValueChange={(value) => setFilters({ ...filters, nodeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择节点" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部节点</SelectItem>
                  {Array.from(new Set(capabilitiesData.capabilities.map(c => c.node.name))).map((nodeName, index) => {
                    const capability = capabilitiesData.capabilities.find(c => c.node.name === nodeName)
                    return (
                      <SelectItem key={capability?.nodeId || index} value={capability?.nodeId || `node-${index}`}>
                        {nodeName}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={resetFilters}>
              重置
            </Button>
            <Button onClick={fetchCapabilities} disabled={loading}>
              查询
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总服务能力</p>
                <p className="text-2xl font-bold text-blue-600">{capabilitiesData.stats.totalCapabilities}</p>
              </div>
              <Layers className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">产品类型</p>
                <p className="text-2xl font-bold text-green-600">{capabilitiesData.availableProducts.length}</p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">服务类型</p>
                <p className="text-2xl font-bold text-purple-600">{capabilitiesData.availableServices.length}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">覆盖节点</p>
                <p className="text-2xl font-bold text-orange-600">{Object.keys(capabilitiesData.stats.byNode).length}</p>
              </div>
              <Globe className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs defaultValue="matrix" className="w-full">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="matrix" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              能力矩阵
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              详细列表
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              统计分析
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>服务能力矩阵</CardTitle>
              <CardDescription>
                展示各产品类型支持的服务类型
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">产品类型</th>
                      {capabilitiesData.availableServices.map((service) => (
                        <th key={service} className="text-center p-3 font-medium">{service}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {capabilitiesData.availableProducts.map((product) => {
                      const ProductIcon = getProductIcon(product)
                      const productInfo = S100_PRODUCTS.find(p => p.value === product)
                      return (
                        <tr key={product} className="border-b">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <ProductIcon className="h-5 w-5" />
                              <div>
                                <div className="font-medium">{product}</div>
                                <div className="text-xs text-gray-500">{productInfo?.description}</div>
                              </div>
                            </div>
                          </td>
                          {capabilitiesData.availableServices.map((service) => {
                            const isSupported = capabilitiesData.serviceMatrix[product]?.[service] || false
                            return (
                              <td key={service} className="text-center p-3">
                                {isSupported ? (
                                  <div className="flex items-center justify-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1" />
                                    <span className="text-sm text-green-600">支持</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center">
                                    <div className="w-3 h-3 bg-gray-300 rounded-full mr-1" />
                                    <span className="text-sm text-gray-400">不支持</span>
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>服务能力详细列表</CardTitle>
              <CardDescription>
                查看每个节点提供的具体服务能力
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {capabilitiesData.capabilities.map((capability) => {
                  const ProductIcon = getProductIcon(capability.productType)
                  const NodeIcon = getNodeTypeIcon(capability.node.type)
                  const productInfo = S100_PRODUCTS.find(p => p.value === capability.productType)
                  const serviceInfo = SERVICE_TYPES.find(s => s.value === capability.serviceType)
                  
                  return (
                    <div key={capability.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <ProductIcon className="h-5 w-5" />
                            <div>
                              <h3 className="font-medium">{productInfo?.name}</h3>
                              <p className="text-sm text-gray-500">{serviceInfo?.name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <NodeIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{capability.node.name}</span>
                            <Badge variant="outline">{capability.node.type}</Badge>
                          </div>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>端点: {generateServiceUrl(capability)}</div>
                            <div>版本: {capability.version}</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            测试
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            文档
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>按产品类型统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(capabilitiesData.stats.byProduct).map(([product, count]) => {
                    const ProductIcon = getProductIcon(product)
                    const productInfo = S100_PRODUCTS.find(p => p.value === product)
                    const percentage = Math.round((count / capabilitiesData.stats.totalCapabilities) * 100)
                    
                    return (
                      <div key={product} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ProductIcon className="h-4 w-4" />
                          <span className="text-sm">{productInfo?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>按服务类型统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(capabilitiesData.stats.byService).map(([service, count]) => {
                    const serviceInfo = SERVICE_TYPES.find(s => s.value === service)
                    const percentage = Math.round((count / capabilitiesData.stats.totalCapabilities) * 100)
                    
                    return (
                      <div key={service} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          <span className="text-sm">{serviceInfo?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>按节点统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(capabilitiesData.stats.byNode).map(([nodeId, count]) => {
                    const capability = capabilitiesData.capabilities.find(c => c.nodeId === nodeId)
                    if (!capability) return null
                    
                    const NodeIcon = getNodeTypeIcon(capability.node.type)
                    const percentage = Math.round((count / capabilitiesData.stats.totalCapabilities) * 100)
                    
                    return (
                      <div key={nodeId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <NodeIcon className="h-4 w-4" />
                          <span className="text-sm">{capability.node.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>按节点类型统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(capabilitiesData.stats.byNodeType).map(([nodeType, count]) => {
                    if (count === 0) return null
                    
                    const nodeTypeInfo = NODE_TYPES.find(n => n.value === nodeType)
                    const NodeTypeIcon = nodeTypeInfo ? nodeTypeInfo.icon : Globe
                    const percentage = Math.round((count / capabilitiesData.stats.totalCapabilities) * 100)
                    
                    return (
                      <div key={nodeType} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <NodeTypeIcon className="h-4 w-4" />
                          <span className="text-sm">{nodeTypeInfo?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}