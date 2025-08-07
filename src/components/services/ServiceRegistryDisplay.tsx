'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Globe, 
  Map, 
  Waves, 
  Anchor, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Settings,
  Plus,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { serviceRegistry } from '@/lib/services/service-init'
import { IServiceConfig } from '@/lib/services/base-service'

// 服务图标映射
const SERVICE_ICONS: Record<string, React.ComponentType<any>> = {
  'S101': Map,
  'S102': Waves,
  'S104': Anchor,
  'S111': Activity,
  'S124': AlertTriangle,
}

// 服务类型中文名称映射
const SERVICE_TYPE_NAMES: Record<string, string> = {
  'S101': '电子海图',
  'S102': '高精度水深',
  'S104': '动态水位',
  'S111': '实时海流',
  'S124': '航行警告',
}

// 能力类型中文名称映射
const CAPABILITY_TYPE_NAMES: Record<string, string> = {
  'WMS': 'Web地图服务',
  'WFS': 'Web要素服务',
  'WCS': 'Web覆盖服务',
}

export default function ServiceRegistryDisplay() {
  const [services, setServices] = useState<IServiceConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<IServiceConfig | null>(null)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = () => {
    try {
      const serviceConfigs = serviceRegistry.getServiceConfigs()
      setServices(serviceConfigs)
      if (serviceConfigs.length > 0) {
        setSelectedService(serviceConfigs[0])
      }
    } catch (error) {
      console.error('Failed to load services:', error)
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (serviceCode: string) => {
    const IconComponent = SERVICE_ICONS[serviceCode] || Globe
    return <IconComponent className="h-6 w-6" />
  }

  const getServiceTypeName = (serviceCode: string) => {
    return SERVICE_TYPE_NAMES[serviceCode] || serviceCode
  }

  const getCapabilityTypeName = (capabilityType: string) => {
    return CAPABILITY_TYPE_NAMES[capabilityType] || capabilityType
  }

  const getStatusBadge = (serviceCode: string) => {
    // 模拟服务状态，实际项目中应该从健康检查获取
    const statuses = ['HEALTHY', 'WARNING', 'ERROR']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    switch (randomStatus) {
      case 'HEALTHY':
        return <Badge variant="default" className="bg-green-500">正常</Badge>
      case 'WARNING':
        return <Badge variant="secondary">警告</Badge>
      case 'ERROR':
        return <Badge variant="destructive">错误</Badge>
      default:
        return <Badge variant="outline">离线</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>正在加载服务...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 服务概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            服务注册表
          </CardTitle>
          <CardDescription>
            动态注册和管理的S-100系列海事服务
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{services.length}</div>
              <div className="text-sm text-gray-600">注册服务</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {services.reduce((acc, service) => acc + service.capabilities.length, 0)}
              </div>
              <div className="text-sm text-gray-600">服务能力</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(services.flatMap(s => s.capabilities.map(c => c.type))).size}
              </div>
              <div className="text-sm text-gray-600">能力类型</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {services.filter(s => s.capabilities.some(c => c.type === 'WMS')).length}
              </div>
              <div className="text-sm text-gray-600">WMS服务</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 服务列表和详情 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 服务列表 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>已注册服务</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.serviceCode}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedService?.serviceCode === service.serviceCode
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600">
                        {getServiceIcon(service.serviceCode)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{service.serviceCode}</h4>
                        <p className="text-sm text-gray-600">
                          {getServiceTypeName(service.serviceCode)}
                        </p>
                      </div>
                      <div>
                        {getStatusBadge(service.serviceCode)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {service.capabilities.slice(0, 3).map((capability) => (
                          <Badge key={capability.type} variant="outline" className="text-xs">
                            {capability.type}
                          </Badge>
                        ))}
                        {service.capabilities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{service.capabilities.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 服务详情 */}
        <div className="lg:col-span-2">
          {selectedService ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getServiceIcon(selectedService.serviceCode)}
                  {selectedService.serviceName}
                </CardTitle>
                <CardDescription>
                  {selectedService.serviceDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">概览</TabsTrigger>
                    <TabsTrigger value="capabilities">服务能力</TabsTrigger>
                    <TabsTrigger value="endpoints">访问端点</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">服务代码</label>
                        <p className="text-sm text-gray-900">{selectedService.serviceCode}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">服务类型</label>
                        <p className="text-sm text-gray-900">
                          {getServiceTypeName(selectedService.serviceCode)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">支持格式</label>
                        <p className="text-sm text-gray-900">
                          {selectedService.supportedFormats.join(', ')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">默认格式</label>
                        <p className="text-sm text-gray-900">{selectedService.defaultFormat}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">坐标系统</label>
                        <p className="text-sm text-gray-900">
                          {selectedService.supportedCRS.join(', ')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">服务状态</label>
                        <div>{getStatusBadge(selectedService.serviceCode)}</div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Link href={`/${selectedService.serviceCode.toLowerCase()}`}>
                        <Button className="w-full">
                          <Map className="h-4 w-4 mr-2" />
                          访问服务页面
                        </Button>
                      </Link>
                    </div>
                  </TabsContent>

                  <TabsContent value="capabilities" className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>能力类型</TableHead>
                          <TableHead>名称</TableHead>
                          <TableHead>描述</TableHead>
                          <TableHead>支持参数</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedService.capabilities.map((capability) => (
                          <TableRow key={capability.type}>
                            <TableCell>
                              <Badge variant="outline">
                                {getCapabilityTypeName(capability.type)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {capability.name}
                            </TableCell>
                            <TableCell className="text-sm">
                              {capability.description}
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="space-y-1">
                                <div>
                                  <span className="font-medium">必需:</span>
                                  <span className="ml-1">
                                    {capability.supportedParameters.slice(0, 3).join(', ')}
                                    {capability.supportedParameters.length > 3 && '...'}
                                  </span>
                                </div>
                                {capability.optionalParameters.length > 0 && (
                                  <div>
                                    <span className="font-medium">可选:</span>
                                    <span className="ml-1">
                                      {capability.optionalParameters.slice(0, 3).join(', ')}
                                      {capability.optionalParameters.length > 3 && '...'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="endpoints" className="space-y-4">
                    {selectedService.capabilities.map((capability) => (
                      <div key={capability.type} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {getCapabilityTypeName(capability.type)}
                          </Badge>
                          <span className="font-medium">{capability.name}</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="text-sm font-medium text-gray-700">端点URL</label>
                            <code className="block text-sm bg-gray-100 p-2 rounded mt-1">
                              {capability.endpoint}
                            </code>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">支持操作</label>
                            <div className="flex gap-2 mt-1">
                              {capability.type === 'WMS' && (
                                <>
                                  <Badge variant="secondary">GetCapabilities</Badge>
                                  <Badge variant="secondary">GetMap</Badge>
                                </>
                              )}
                              {capability.type === 'WFS' && (
                                <>
                                  <Badge variant="secondary">GetCapabilities</Badge>
                                  <Badge variant="secondary">GetFeature</Badge>
                                </>
                              )}
                              {capability.type === 'WCS' && (
                                <>
                                  <Badge variant="secondary">GetCapabilities</Badge>
                                  <Badge variant="secondary">DescribeCoverage</Badge>
                                  <Badge variant="secondary">GetCoverage</Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">请选择一个服务查看详情</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}