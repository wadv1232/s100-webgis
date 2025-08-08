'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Settings, 
  Search, 
  Filter,
  Globe,
  Map,
  Waves,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import ServiceActions from './ServiceActions'
import RegisterServiceDialog from './RegisterServiceDialog'

interface Service {
  id: string
  nodeId: string
  nodeName: string
  nodeType: string
  productType: string
  serviceType: string
  endpoint: string
  version: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

interface ServiceManagementTableProps {
  initialServices?: Service[]
}

export default function ServiceManagementTable({ initialServices = [] }: ServiceManagementTableProps) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterNode, setFilterNode] = useState('')
  const [filterProduct, setFilterProduct] = useState('')
  const [filterService, setFilterService] = useState('')

  // 模拟节点数据
  const nodes = [
    { id: '1', name: '上海港' },
    { id: '2', name: '东海分局' },
    { id: '3', name: '中国海事局' }
  ]

  // 产品类型
  const productTypes = ['S101', 'S102', 'S104', 'S111', 'S124', 'S125', 'S131']

  // 服务类型
  const serviceTypes = ['WFS', 'WMS', 'WCS']

  const loadServices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterNode) params.append('nodeId', filterNode)
      if (filterProduct) params.append('productType', filterProduct)
      if (filterService) params.append('serviceType', filterService)

      const response = await fetch(`/api/services?${params}`)
      if (response.ok) {
        const data = await response.json()
        const formattedServices = data.capabilities.map((cap: any) => ({
          id: cap.id,
          nodeId: cap.nodeId,
          nodeName: cap.node.name,
          nodeType: cap.node.type,
          productType: cap.productType,
          serviceType: cap.serviceType,
          endpoint: cap.endpoint,
          version: cap.version,
          isEnabled: cap.isEnabled,
          createdAt: cap.createdAt,
          updatedAt: cap.updatedAt
        }))
        setServices(formattedServices)
      }
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [filterNode, filterProduct, filterService])

  const getServiceIcon = (productType: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'S101': Map,
      'S102': Waves,
      'S104': Activity,
      'S111': Globe,
      'S124': AlertTriangle,
      'S125': Activity,
      'S131': AlertTriangle
    }
    const IconComponent = iconMap[productType] || Globe
    return <IconComponent className="h-4 w-4" />
  }

  const getNodeTypeBadge = (nodeType: string) => {
    const typeMap: Record<string, { label: string; variant: any }> = {
      'GLOBAL_ROOT': { label: '全球根', variant: 'default' as const },
      'NATIONAL': { label: '国家级', variant: 'secondary' as const },
      'REGIONAL': { label: '区域级', variant: 'outline' as const },
      'LEAF': { label: '叶子节点', variant: 'destructive' as const }
    }
    const config = typeMap[nodeType] || { label: nodeType, variant: 'outline' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusBadge = (isEnabled: boolean) => {
    return isEnabled ? (
      <Badge variant="default" className="bg-green-500">
        <CheckCircle className="h-3 w-3 mr-1" />
        启用
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        禁用
      </Badge>
    )
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = searchTerm === '' || 
      service.nodeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.productType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* 头部操作区域 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            服务管理
          </h2>
          <p className="text-gray-600 mt-1">
            管理所有已注册的S-100服务
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadServices} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <RegisterServiceDialog onServiceRegistered={loadServices} />
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总服务数</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">
              已注册服务
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">启用服务</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {services.filter(s => s.isEnabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              活跃服务
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">节点覆盖</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {new Set(services.map(s => s.nodeId)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              覆盖节点
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">产品类型</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(services.map(s => s.productType)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              S-100产品
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            筛选条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">搜索</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索服务..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">节点</label>
              <Select value={filterNode} onValueChange={setFilterNode}>
                <SelectTrigger>
                  <SelectValue placeholder="选择节点" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部节点</SelectItem>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">产品类型</label>
              <Select value={filterProduct} onValueChange={setFilterProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="选择产品" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部产品</SelectItem>
                  {productTypes.map((product) => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">服务类型</label>
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger>
                  <SelectValue placeholder="选择服务" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部服务</SelectItem>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 服务表格 */}
      <Card>
        <CardHeader>
          <CardTitle>服务列表</CardTitle>
          <CardDescription>
            所有已注册的S-100服务及其状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>服务信息</TableHead>
                  <TableHead>所属节点</TableHead>
                  <TableHead>服务端点</TableHead>
                  <TableHead>版本</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        加载中...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-center">
                        <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">暂无服务数据</p>
                        <p className="text-sm text-gray-400 mt-1">
                          点击&quot;注册新服务&quot;按钮添加第一个服务
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="text-blue-600">
                            {getServiceIcon(service.productType)}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {service.productType}
                              <Badge variant="outline" className="text-xs">
                                {service.serviceType}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              {service.productType === 'S101' ? '电子海图' :
                               service.productType === 'S102' ? '高精度水深' :
                               service.productType === 'S104' ? '动态水位' :
                               service.productType === 'S111' ? '实时海流' :
                               service.productType === 'S124' ? '航行警告' :
                               service.productType === 'S131' ? '海洋保护区' :
                               service.productType}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{service.nodeName}</div>
                          <div>{getNodeTypeBadge(service.nodeType)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {service.endpoint}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.version}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(service.isEnabled)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(service.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ServiceActions 
                          service={service}
                          onServiceUpdated={loadServices}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}