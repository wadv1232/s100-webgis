'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Settings, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Map,
  Database,
  Waves,
  Anchor,
  Zap,
  Eye,
  RefreshCw,
  Plus,
  Filter,
  Search,
  MapPin,
  Code,
  Power,
  Info,
  Server,
  Globe,
  Network,
  Shield
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Service {
  id: string
  name: string
  type: string
  product: string
  version: string
  status: string
  endpoint: string
  node: string
  nodeType: string
  nodeId: string
  lastUpdated: string
  uptime: string
  requestCount: number
  avgResponseTime: number
  layers: string[]
  formats: string[]
  description: string
  isEnabled: boolean
}

interface ServicesData {
  services: Service[]
  stats: {
    total: number
    active: number
    warning: number
    error: number
    maintenance: number
    byProduct: Record<string, number>
    byType: Record<string, number>
  }
  filters: {
    nodeId?: string
    productType?: string
    serviceType?: string
    status?: string
  }
}

export default function ServicesManagement() {
  const [servicesData, setServicesData] = useState<ServicesData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showMonitorModal, setShowMonitorModal] = useState(false)
  
  // 配置状态
  const [serviceConfig, setServiceConfig] = useState({
    scope: {
      minLat: '',
      maxLat: '',
      minLon: '',
      maxLon: ''
    },
    internalApi: {
      enabled: false,
      deployment: 'local', // 'local' 或 'remote'
      internalEndpoint: '',  // 内部实际访问端点
      externalEndpoint: '',  // 外部统一访问端点
      rateLimit: '',
      timeout: ''
    },
    status: {
      isOnline: true,
      broadcastEnabled: false
    }
  })

  // 获取服务数据
  const fetchServices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedProduct !== 'all') params.append('productType', selectedProduct)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (selectedType !== 'all') params.append('serviceType', selectedType)

      const response = await fetch(`/api/services?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setServicesData(result.data)
      } else {
        console.error('获取服务数据失败:', result.error)
      }
    } catch (error) {
      console.error('获取服务数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [selectedProduct, selectedStatus, selectedType])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'ERROR':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'MAINTENANCE':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">活跃</Badge>
      case 'WARNING':
        return <Badge variant="secondary">警告</Badge>
      case 'ERROR':
        return <Badge variant="destructive">错误</Badge>
      case 'MAINTENANCE':
        return <Badge className="bg-blue-500">维护中</Badge>
      default:
        return <Badge variant="outline">离线</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'WMS':
        return <Map className="h-4 w-4 text-blue-600" />
      case 'WFS':
        return <Database className="h-4 w-4 text-green-600" />
      case 'WCS':
        return <Waves className="h-4 w-4 text-purple-600" />
      default:
        return <Zap className="h-4 w-4 text-gray-600" />
    }
  }

  const getProductIcon = (product: string) => {
    switch (product) {
      case 'S101':
        return <Anchor className="h-5 w-5 text-blue-600" />
      case 'S102':
        return <Waves className="h-5 w-5 text-purple-600" />
      default:
        return <Zap className="h-5 w-5 text-gray-600" />
    }
  }

  // 过滤服务
  const filterServices = (services: Service[]) => {
    return services.filter(service => {
      const matchesSearch = searchTerm === '' || 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.node.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
    })
  }

  const services = servicesData?.services || []
  const filteredServices = filterServices(services)

  // 统计数据
  const stats = servicesData?.stats || {
    total: 0,
    active: 0,
    warning: 0,
    error: 0,
    maintenance: 0,
    byProduct: {},
    byType: {}
  }

  const handleViewDetails = (service: Service) => {
    setSelectedService(service)
    setShowDetailModal(true)
  }

  const handleConfigure = (service: Service) => {
    setSelectedService(service)
    // 初始化配置数据
    setServiceConfig({
      scope: {
        minLat: '22.0',
        maxLat: '25.0',
        minLon: '113.0',
        maxLon: '117.0'
      },
      internalApi: {
        enabled: true,
        deployment: 'remote', // 默认异地部署
        internalEndpoint: 'https://shanghai-port.msa.gov.cn/api/v1/s101/wfs',
        externalEndpoint: 'https://s100.com/api/v1/s101/wfs',
        rateLimit: '1000',
        timeout: '30'
      },
      status: {
        isOnline: service.status === 'ACTIVE',
        broadcastEnabled: false
      }
    })
    setShowConfigModal(true)
  }

  const handleMonitor = (service: Service) => {
    setSelectedService(service)
    setShowMonitorModal(true)
  }

  const handleCloseModals = () => {
    setShowDetailModal(false)
    setShowConfigModal(false)
    setShowMonitorModal(false)
    setSelectedService(null)
  }

  const handleRefresh = () => {
    fetchServices()
  }

  const handleAddService = () => {
    // 导航到服务注册页面或打开注册对话框
    alert('新增服务功能正在开发中')
  }

  const handleConfigChange = (section: string, field: string, value: any) => {
    setServiceConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const handleSaveConfig = () => {
    // 模拟保存配置
    console.log('保存配置:', serviceConfig)
    alert('配置已保存')
    handleCloseModals()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6 p-4 pt-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  ← 返回首页
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8 text-blue-600" />
              服务管理
            </h1>
            <p className="text-gray-600 mt-2">
              管理和监控S-100海事数据服务
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新状态
            </Button>
            <Button onClick={handleAddService}>
              <Plus className="h-4 w-4 mr-2" />
              新增服务
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总服务数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Settings className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">活跃服务</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">S-101服务</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.byProduct.S101 || 0}</p>
                </div>
                <Anchor className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">S-102服务</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.byProduct.S102 || 0}</p>
                </div>
                <Waves className="h-12 w-12 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选和搜索 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              筛选和搜索
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">产品类型</label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择产品" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部产品</SelectItem>
                    <SelectItem value="S101">S-101电子海图</SelectItem>
                    <SelectItem value="S102">S-102高精度水深</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">服务状态</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="ACTIVE">活跃</SelectItem>
                    <SelectItem value="WARNING">警告</SelectItem>
                    <SelectItem value="ERROR">错误</SelectItem>
                    <SelectItem value="MAINTENANCE">维护中</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">服务类型</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="WMS">WMS</SelectItem>
                    <SelectItem value="WFS">WFS</SelectItem>
                    <SelectItem value="WCS">WCS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">搜索</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索服务名称、描述..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 服务列表 */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">全部服务 ({filteredServices.length})</TabsTrigger>
            <TabsTrigger value="s101">S-101服务 ({services.filter(s => s.product === 'S101').length})</TabsTrigger>
            <TabsTrigger value="s102">S-102服务 ({services.filter(s => s.product === 'S102').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getProductIcon(service.product)}
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      {getTypeIcon(service.type)}
                      <span>{service.type} 服务 • 版本 {service.version}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">{service.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">部署节点:</span>
                          <p className="font-medium">{service.node}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">运行时间:</span>
                          <p className="font-medium text-green-600">{service.uptime}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">请求数:</span>
                          <p className="font-medium">{service.requestCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">响应时间:</span>
                          <p className="font-medium">{service.avgResponseTime}ms</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {service.layers?.slice(0, 3).map((layer: string) => (
                          <Badge key={layer} variant="outline" className="text-xs">
                            {layer}
                          </Badge>
                        ))}
                        {service.features?.slice(0, 3).map((feature: string) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {service.coverages?.slice(0, 3).map((coverage: string) => (
                          <Badge key={coverage} variant="outline" className="text-xs">
                            {coverage}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewDetails(service)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看详情
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleConfigure(service)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        配置
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleMonitor(service)}
                      >
                        <Activity className="h-4 w-4 mr-1" />
                        监控
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="s101" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filterServices(services.filter(s => s.product === 'S101')).map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getProductIcon(service.product)}
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      {getTypeIcon(service.type)}
                      <span>{service.type} 服务 • 版本 {service.version}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">{service.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">部署节点:</span>
                          <p className="font-medium">{service.node}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">运行时间:</span>
                          <p className="font-medium text-green-600">{service.uptime}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">请求数:</span>
                          <p className="font-medium">{service.requestCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">响应时间:</span>
                          <p className="font-medium">{service.avgResponseTime}ms</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {service.layers?.slice(0, 3).map((layer: string) => (
                          <Badge key={layer} variant="outline" className="text-xs">
                            {layer}
                          </Badge>
                        ))}
                        {service.features?.slice(0, 3).map((feature: string) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewDetails(service)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看详情
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleConfigure(service)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        配置
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleMonitor(service)}
                      >
                        <Activity className="h-4 w-4 mr-1" />
                        监控
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="s102" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filterServices(services.filter(s => s.product === 'S102')).map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getProductIcon(service.product)}
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      {getTypeIcon(service.type)}
                      <span>{service.type} 服务 • 版本 {service.version}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">{service.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">部署节点:</span>
                          <p className="font-medium">{service.node}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">运行时间:</span>
                          <p className="font-medium text-green-600">{service.uptime}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">请求数:</span>
                          <p className="font-medium">{service.requestCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">响应时间:</span>
                          <p className="font-medium">{service.avgResponseTime}ms</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {service.layers?.slice(0, 3).map((layer: string) => (
                          <Badge key={layer} variant="outline" className="text-xs">
                            {layer}
                          </Badge>
                        ))}
                        {service.coverages?.slice(0, 3).map((coverage: string) => (
                          <Badge key={coverage} variant="outline" className="text-xs">
                            {coverage}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewDetails(service)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看详情
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleConfigure(service)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        配置
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleMonitor(service)}
                      >
                        <Activity className="h-4 w-4 mr-1" />
                        监控
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* 详情模态框 */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>服务详情</DialogTitle>
              <DialogDescription>
                查看服务的详细信息和配置
              </DialogDescription>
            </DialogHeader>
            {selectedService && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">服务名称</label>
                    <p className="text-sm text-gray-600">{selectedService.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">服务类型</label>
                    <p className="text-sm text-gray-600">{selectedService.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">产品类型</label>
                    <p className="text-sm text-gray-600">{selectedService.product}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">版本</label>
                    <p className="text-sm text-gray-600">{selectedService.version}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">状态</label>
                    <div className="mt-1">{getStatusBadge(selectedService.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">部署节点</label>
                    <p className="text-sm text-gray-600">{selectedService.node}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">描述</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedService.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">服务端点</label>
                  <p className="text-sm text-gray-600 mt-1 font-mono">{selectedService.endpoint}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCloseModals}>
                    关闭
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 配置模态框 */}
        <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>服务配置</DialogTitle>
              <DialogDescription>
                配置服务参数和设置
              </DialogDescription>
            </DialogHeader>
            {selectedService && (
              <div className="space-y-6">
                {/* 服务基本信息 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">服务信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">服务名称</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedService.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">服务类型</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedService.type}</p>
                    </div>
                  </div>
                </div>

                {/* 1. 服务范围配置 */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    服务范围
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minLat" className="text-sm font-medium">最小纬度</Label>
                      <Input
                        id="minLat"
                        type="number"
                        step="0.000001"
                        value={serviceConfig.scope.minLat}
                        onChange={(e) => handleConfigChange('scope', 'minLat', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxLat" className="text-sm font-medium">最大纬度</Label>
                      <Input
                        id="maxLat"
                        type="number"
                        step="0.000001"
                        value={serviceConfig.scope.maxLat}
                        onChange={(e) => handleConfigChange('scope', 'maxLat', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minLon" className="text-sm font-medium">最小经度</Label>
                      <Input
                        id="minLon"
                        type="number"
                        step="0.000001"
                        value={serviceConfig.scope.minLon}
                        onChange={(e) => handleConfigChange('scope', 'minLon', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxLon" className="text-sm font-medium">最大经度</Label>
                      <Input
                        id="maxLon"
                        type="number"
                        step="0.000001"
                        value={serviceConfig.scope.maxLon}
                        onChange={(e) => handleConfigChange('scope', 'maxLon', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    设置服务提供的地理范围边界，超出此范围的请求将被拒绝
                  </p>
                </div>

                {/* 2. 内部API配置 */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Code className="h-5 w-5 mr-2 text-green-600" />
                    内部API设置
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">启用内部API</Label>
                        <p className="text-xs text-gray-500">允许内部系统调用此服务的API接口</p>
                      </div>
                      <Switch
                        checked={serviceConfig.internalApi.enabled}
                        onCheckedChange={(checked) => handleConfigChange('internalApi', 'enabled', checked)}
                      />
                    </div>

                    {serviceConfig.internalApi.enabled && (
                      <>
                        {/* 部署位置选择 */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">部署位置</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <div
                              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                serviceConfig.internalApi.deployment === 'local'
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleConfigChange('internalApi', 'deployment', 'local')}
                            >
                              <div className="flex items-center space-x-2">
                                <Server className="h-4 w-4 text-blue-600" />
                                <div>
                                  <p className="text-sm font-medium">本地部署</p>
                                  <p className="text-xs text-gray-500">服务部署在本地服务器</p>
                                </div>
                              </div>
                            </div>
                            <div
                              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                serviceConfig.internalApi.deployment === 'remote'
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleConfigChange('internalApi', 'deployment', 'remote')}
                            >
                              <div className="flex items-center space-x-2">
                                <Globe className="h-4 w-4 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium">异地部署</p>
                                  <p className="text-xs text-gray-500">支持跨国/地区部署</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 端点配置 */}
                        <div className="space-y-4">
                          <Label className="text-sm font-medium flex items-center">
                            <Network className="h-4 w-4 mr-2 text-purple-600" />
                            服务端点配置
                          </Label>
                          
                          {/* 内部端点 */}
                          <div className="space-y-2">
                            <Label htmlFor="internalEndpoint" className="text-sm font-medium flex items-center">
                              <Shield className="h-3 w-3 mr-1 text-orange-600" />
                              内部实际端点
                            </Label>
                            <Input
                              id="internalEndpoint"
                              type="url"
                              placeholder="https://internal-domain.gov.cn/api/v1/service/wfs"
                              value={serviceConfig.internalApi.internalEndpoint}
                              onChange={(e) => handleConfigChange('internalApi', 'internalEndpoint', e.target.value)}
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500">
                              内部系统实际访问的服务地址，支持各国/地区本地化部署
                            </p>
                          </div>

                          {/* 外部端点 */}
                          <div className="space-y-2">
                            <Label htmlFor="externalEndpoint" className="text-sm font-medium flex items-center">
                              <Globe className="h-3 w-3 mr-1 text-blue-600" />
                              外部统一端点
                            </Label>
                            <Input
                              id="externalEndpoint"
                              type="url"
                              placeholder="https://s100.com/api/v1/s101/wfs"
                              value={serviceConfig.internalApi.externalEndpoint}
                              onChange={(e) => handleConfigChange('internalApi', 'externalEndpoint', e.target.value)}
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500">
                              对外提供的统一访问接口，需符合S-100国际标准规范
                            </p>
                          </div>
                        </div>

                        {/* 接口标准说明 */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="flex items-start">
                            <Info className="h-4 w-4 mt-0.5 mr-2 text-purple-600" />
                            <div className="text-sm">
                              <p className="font-medium text-purple-800">统一接口规范</p>
                              <p className="text-purple-600 mt-1">
                                支持各国/地区异地部署，内部端点可使用本地化地址，
                                但必须通过统一的对外接口提供服务，确保符合S-100国际数据标准。
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 性能配置 */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="rateLimit" className="text-sm font-medium">速率限制 (请求/分钟)</Label>
                            <Input
                              id="rateLimit"
                              type="number"
                              value={serviceConfig.internalApi.rateLimit}
                              onChange={(e) => handleConfigChange('internalApi', 'rateLimit', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="timeout" className="text-sm font-medium">超时时间 (秒)</Label>
                            <Input
                              id="timeout"
                              type="number"
                              value={serviceConfig.internalApi.timeout}
                              onChange={(e) => handleConfigChange('internalApi', 'timeout', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        {/* 部署信息提示 */}
                        <div className={`rounded-lg p-3 ${
                          serviceConfig.internalApi.deployment === 'local'
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-green-50 border border-green-200'
                        }`}>
                          <div className="flex items-start">
                            <Info className="h-4 w-4 mt-0.5 mr-2 text-blue-600" />
                            <div className="text-sm">
                              <p className="font-medium text-blue-800">
                                {serviceConfig.internalApi.deployment === 'local' ? '本地部署模式' : '异地部署模式'}
                              </p>
                              <p className="text-blue-600 mt-1">
                                {serviceConfig.internalApi.deployment === 'local' 
                                  ? '服务部署在本地，内部系统直接访问内部端点，外部用户通过统一接口访问。'
                                  : '支持跨国/地区部署，内部端点可配置为本地化地址，外部统一接口保持一致。'
                                }
                              </p>
                              {serviceConfig.internalApi.internalEndpoint && serviceConfig.internalApi.externalEndpoint && (
                                <div className="mt-2 space-y-1">
                                  <p className="text-xs font-medium">端点映射：</p>
                                  <p className="text-xs">内部: {serviceConfig.internalApi.internalEndpoint}</p>
                                  <p className="text-xs">外部: {serviceConfig.internalApi.externalEndpoint}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. 服务状态配置 */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Power className="h-5 w-5 mr-2 text-purple-600" />
                    服务状态控制
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">服务上线状态</Label>
                        <p className="text-xs text-gray-500">控制服务是否对外提供服务</p>
                      </div>
                      <Switch
                        checked={serviceConfig.status.isOnline}
                        onCheckedChange={(checked) => handleConfigChange('status', 'isOnline', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">向上广播</Label>
                        <p className="text-xs text-gray-500">将服务状态信息广播给上级系统</p>
                      </div>
                      <Switch
                        checked={serviceConfig.status.broadcastEnabled}
                        onCheckedChange={(checked) => handleConfigChange('status', 'broadcastEnabled', checked)}
                        disabled={!serviceConfig.status.isOnline}
                      />
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <Info className="h-4 w-4 text-blue-600 mr-2" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-800">当前状态</p>
                          <p className="text-blue-600">
                            {serviceConfig.status.isOnline ? '服务已上线' : '服务已下线'}
                            {serviceConfig.status.broadcastEnabled && ' · 广播已启用'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={handleCloseModals}>
                    取消
                  </Button>
                  <Button onClick={handleSaveConfig}>
                    保存配置
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 监控模态框 */}
        <Dialog open={showMonitorModal} onOpenChange={setShowMonitorModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>服务监控</DialogTitle>
              <DialogDescription>
                查看服务性能和健康状态
              </DialogDescription>
            </DialogHeader>
            {selectedService && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <label className="text-sm font-medium text-green-800">运行时间</label>
                    <p className="text-lg font-bold text-green-600">{selectedService.uptime}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="text-sm font-medium text-blue-800">响应时间</label>
                    <p className="text-lg font-bold text-blue-600">{selectedService.avgResponseTime}ms</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <label className="text-sm font-medium text-purple-800">请求数</label>
                    <p className="text-lg font-bold text-purple-600">{selectedService.requestCount.toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <label className="text-sm font-medium text-orange-800">状态</label>
                    <div className="mt-1">{getStatusBadge(selectedService.status)}</div>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="text-sm font-medium">最后更新</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(selectedService.lastUpdated).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCloseModals}>
                    关闭
                  </Button>
                  <Button onClick={handleCloseModals}>
                    查看详细监控
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}