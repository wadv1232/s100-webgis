'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Map, 
  Layers, 
  Settings, 
  Eye, 
  Download, 
  RefreshCw,
  ArrowLeft,
  Globe,
  Database,
  Zap,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Anchor,
  Waves,
  Satellite,
  Mountain,
  Image as ImageIcon,
  Link as LinkIcon,
  Info,
  TestTube
} from 'lucide-react'
import S100ServiceMap from '@/components/maps/SharedMapFixed'
import ServiceDetailModal from '@/components/ui/ServiceDetailModal'
import { mapServiceNodes, mockS100Services } from '@/mock-data'

export default function MapServicesPage() {
  const [selectedNode, setSelectedNode] = useState(mapServiceNodes[3]) // 默认选择上海港
  const [s100Services, setS100Services] = useState(mockS100Services)
  const [selectedService, setSelectedService] = useState(null)
  const [activeTab, setActiveTab] = useState('map-services')
  const tabsRef = useRef(null)
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [serviceConfig, setServiceConfig] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    showLayers: true,
    showLegend: true,
    defaultFormat: 'image/png',
    // 图层和显示配置
    display: {
      showCoordinates: true,
      showLayerPanel: false,
      showLegendPanel: false,
      layerPanelPosition: 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
      coordinatePanelPosition: 'bottom-left', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
      panelOpacity: 95, // 0-100
      alwaysOnTop: true // 图层和坐标面板始终在最上层
    },
    // 底图配置
    baseMap: {
      type: 'osm', // 'osm', 'satellite', 'terrain', 'custom'
      customUrl: '',
      attribution: '',
      maxZoom: 18,
      minZoom: 1
    }
  })
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    imageUrl?: string
    loading: boolean
  }>({
    success: false,
    message: '',
    loading: false
  })
  
  // 新增状态：服务详情弹窗
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [currentService, setCurrentService] = useState<any>(null)

  // Handle node updates for editing
  const handleNodeUpdate = (nodeId: string, updates: any) => {
    console.log('Updating node:', nodeId, updates)
    // In a real application, this would call an API to update the node
    // For now, we'll just update the local state
    setSelectedNode(prev => prev?.id === nodeId ? { ...prev, ...updates } : prev)
  }

  // 处理服务详情查看
  const handleServiceDetailClick = (service: any) => {
    setCurrentService(service)
    setIsServiceModalOpen(true)
  }

  // 处理在地图上预览服务
  const handlePreviewOnMap = (service: any) => {
    console.log('Preview service on map:', service)
    // 关闭弹窗
    setIsServiceModalOpen(false)
    // 切换到地图标签页
    setActiveTab('map-services')
    
    // 延迟执行预览，确保地图组件已经渲染
    setTimeout(() => {
      // 通过自定义事件通知地图组件进行预览
      const event = new CustomEvent('previewService', { detail: service })
      window.dispatchEvent(event)
    }, 300)
  }

  // Load base map configuration for the selected node
  const loadBaseMapConfig = async (nodeId: string) => {
    setLoadingConfig(true)
    try {
      // 根据节点选择合适的用户认证
      // 对于 china-national 节点，使用节点管理员用户
      // 对于其他节点，使用管理员用户
      let token: string
      if (nodeId === 'china-national') {
        token = 'node-admin@example.com' // 节点管理员
      } else {
        token = 'admin@example.com' // 系统管理员
      }
      
      const response = await fetch(`/api/nodes/${nodeId}/base-map/config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setServiceConfig(prev => ({
            ...prev,
            baseMap: {
              type: result.data.type || 'osm',
              customUrl: result.data.customUrl || '',
              attribution: result.data.attribution || '',
              minZoom: result.data.minZoom || 1,
              maxZoom: result.data.maxZoom || 18
            }
          }))
        }
      } else {
        console.error('Failed to load base map config:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error loading base map config:', error)
    } finally {
      setLoadingConfig(false)
    }
  }

  // Save base map configuration for the selected node
  const saveBaseMapConfig = async () => {
    setLoadingConfig(true)
    try {
      // 根据节点选择合适的用户认证
      let token: string
      if (selectedNode.id === 'china-national') {
        token = 'node-admin@example.com' // 节点管理员
      } else {
        token = 'admin@example.com' // 系统管理员
      }
      
      const response = await fetch(`/api/nodes/${selectedNode.id}/base-map/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...serviceConfig.baseMap,
          ...serviceConfig.display,
          isDefault: true
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Show success message (you can use a toast here)
          alert('底图配置保存成功！')
        } else {
          alert(`保存失败：${result.error}${result.details ? `\n详细信息：${result.details}` : ''}`)
        }
      } else {
        const error = await response.json()
        alert(`保存失败：${error.error}${error.details ? `\n详细信息：${error.details}` : ''}`)
      }
    } catch (error) {
      console.error('Error saving base map config:', error)
      alert('保存失败，请重试')
    } finally {
      setLoadingConfig(false)
    }
  }

  // Handle service configuration button click
  const handleServiceConfigClick = () => {
    setActiveTab('configuration')
    // Scroll to tabs section
    setTimeout(() => {
      if (tabsRef.current) {
        tabsRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  // Test base map URL
  const testBaseMapUrl = async () => {
    setTestResult(prev => ({ ...prev, loading: true, message: '正在测试底图连接...', success: false }))
    
    try {
      let testUrl: string
      
      switch (serviceConfig.baseMap.type) {
        case 'osm':
          testUrl = 'https://tile.openstreetmap.org/10/500/300.png'
          break
        case 'satellite':
          testUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/500/300'
          break
        case 'terrain':
          testUrl = 'https://stamen-tiles.a.ssl.fastly.net/terrain/10/500/300.png'
          break
        case 'custom':
          if (!serviceConfig.baseMap.customUrl) {
            setTestResult({
              success: false,
              message: '请先输入自定义底图URL',
              loading: false
            })
            return
          }
          // 替换模板变量为测试值
          testUrl = serviceConfig.baseMap.customUrl
            .replace('{z}', '10')
            .replace('{x}', '500')
            .replace('{y}', '300')
            .replace('{s}', 'a')
          break
        default:
          testUrl = 'https://tile.openstreetmap.org/10/500/300.png'
      }

      // 测试图片加载
      const img = new Image()
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时')), 10000)
      })
      
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = testUrl
      })

      await Promise.race([loadPromise, timeoutPromise])
      
      setTestResult({
        success: true,
        message: '底图连接测试成功！图片可以正常加载。',
        imageUrl: testUrl,
        loading: false
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: `底图连接测试失败：${error instanceof Error ? error.message : '未知错误'}`,
        loading: false
      })
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'MAINTENANCE':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'ERROR':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-500">活跃</Badge>
      case 'MAINTENANCE':
        return <Badge variant="secondary">维护中</Badge>
      case 'ERROR':
        return <Badge variant="destructive">错误</Badge>
      default:
        return <Badge variant="outline">离线</Badge>
    }
  }

  const getNodeServices = (nodeId: string) => {
    const node = mapServiceNodes.find(n => n.id === nodeId)
    return node ? node.services : []
  }

  const getAvailableServices = (nodeId: string) => {
    const nodeServices = getNodeServices(nodeId)
    return {
      mapServices: s100Services.filter(service => 
        nodeServices.some(ns => ns.includes(service.product) && ns.includes('WMS'))
      ),
      apiServices: s100Services.filter(service => 
        nodeServices.some(ns => ns.includes(service.product) && (ns.includes('WFS') || ns.includes('WCS')))
      )
    }
  }

  const { mapServices, apiServices } = getAvailableServices(selectedNode.id)

  // Load base map config when node changes
  useEffect(() => {
    if (selectedNode) {
      loadBaseMapConfig(selectedNode.id)
    }
  }, [selectedNode])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回首页
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Map className="h-8 w-8 text-blue-600" />
            S-100服务地图
          </h1>
          <p className="text-gray-600 mt-2">
            底图 + S-100服务叠加呈现
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新服务
          </Button>
          <Button onClick={handleServiceConfigClick}>
            <Settings className="h-4 w-4 mr-2" />
            服务配置
          </Button>
        </div>
      </div>

      {/* S-100 Service Map */}
      <S100ServiceMap 
        nodes={mapServiceNodes}
        services={s100Services}
        selectedNode={selectedNode}
        onNodeSelect={(node) => setSelectedNode(node)}
        onNodeUpdate={handleNodeUpdate}
        editable={false}
        mode="view"
        baseMapConfig={serviceConfig.baseMap}
        displayConfig={serviceConfig.display}
      />

      {/* Node Selection */}
      <Card>
        <CardHeader>
          <CardTitle>节点选择</CardTitle>
          <CardDescription>
            选择要查看和管理的服务节点
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mapServiceNodes.map((node) => (
              <div
                key={node.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedNode.id === node.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedNode(node)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {node.type === 'GLOBAL_ROOT' && <Globe className="h-5 w-5 text-blue-600" />}
                    {node.type === 'NATIONAL' && <Database className="h-5 w-5 text-green-600" />}
                    {node.type === 'REGIONAL' && <Map className="h-5 w-5 text-orange-600" />}
                    {node.type === 'LEAF' && <Activity className="h-5 w-5 text-purple-600" />}
                    <span className="font-medium">{node.name}</span>
                  </div>
                  {getHealthIcon(node.healthStatus)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{node.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{node.type}</Badge>
                  <Badge variant="secondary">{node.services.length} 服务</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs ref={tabsRef} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="map-services">地图服务</TabsTrigger>
          <TabsTrigger value="api-services">API服务</TabsTrigger>
          <TabsTrigger value="configuration">服务配置</TabsTrigger>
        </TabsList>

        <TabsContent value="map-services" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">地图服务 (WMS)</h2>
              <p className="text-gray-600">{selectedNode.name} 支持的地图服务</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                预览地图
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出配置
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mapServices.map((service) => (
              <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-blue-600" />
                      {service.name}
                    </CardTitle>
                    {getHealthBadge(service.status)}
                  </div>
                  <CardDescription>
                    版本 {service.version} • WMS服务
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">端点</span>
                      <span className="text-sm font-mono">{service.endpoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">支持格式</span>
                      <div className="flex gap-1">
                        {(service.formats || []).slice(0, 2).map((format) => (
                          <Badge key={format} variant="outline" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                        {(service.formats || []).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{(service.formats || []).length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">图层</span>
                      <div className="flex gap-1">
                        {(service.layers || []).slice(0, 3).map((layer) => (
                          <Badge key={layer} variant="secondary" className="text-xs">
                            {layer}
                          </Badge>
                        ))}
                        {(service.layers || []).length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(service.layers || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleServiceDetailClick(service)}
                    >
                      查看详情
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleServiceDetailClick(service)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      预览
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api-services" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">API服务 (WFS/WCS)</h2>
              <p className="text-gray-600">{selectedNode.name} 支持的API服务</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                测试API
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                API文档
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {apiServices.map((service) => (
              <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-green-600" />
                      {service.name}
                    </CardTitle>
                    {getHealthBadge(service.status)}
                  </div>
                  <CardDescription>
                    版本 {service.version} • {service.type}服务
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">端点</span>
                      <span className="text-sm font-mono">{service.endpoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">支持格式</span>
                      <div className="flex gap-1">
                        {service.formats.map((format) => (
                          <Badge key={format} variant="outline" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {service.type === 'WFS' && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">要素类型</span>
                        <div className="flex gap-1">
                          {service.features?.slice(0, 2).map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {(service.features || []).length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(service.features || []).length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {service.type === 'WCS' && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">覆盖类型</span>
                        <div className="flex gap-1">
                          {service.coverages?.slice(0, 2).map((coverage) => (
                            <Badge key={coverage} variant="secondary" className="text-xs">
                              {coverage}
                            </Badge>
                          ))}
                          {(service.coverages || []).length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(service.coverages || []).length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedService(service)}
                    >
                      查看详情
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      测试
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>服务配置</CardTitle>
              <CardDescription>
                配置地图服务的全局参数和行为
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-refresh">自动刷新</Label>
                      <p className="text-sm text-gray-500">定期刷新服务状态</p>
                    </div>
                    <Switch
                      id="auto-refresh"
                      checked={serviceConfig.autoRefresh}
                      onCheckedChange={(checked) => 
                        setServiceConfig(prev => ({ ...prev, autoRefresh: checked }))
                      }
                    />
                  </div>
                  
                  {serviceConfig.autoRefresh && (
                    <div>
                      <Label htmlFor="refresh-interval">刷新间隔 (秒)</Label>
                      <Select 
                        value={serviceConfig.refreshInterval.toString()} 
                        onValueChange={(value) => 
                          setServiceConfig(prev => ({ ...prev, refreshInterval: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10秒</SelectItem>
                          <SelectItem value="30">30秒</SelectItem>
                          <SelectItem value="60">1分钟</SelectItem>
                          <SelectItem value="300">5分钟</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-layers">显示图层</Label>
                      <p className="text-sm text-gray-500">在地图上显示图层列表</p>
                    </div>
                    <Switch
                      id="show-layers"
                      checked={serviceConfig.showLayers}
                      onCheckedChange={(checked) => 
                        setServiceConfig(prev => ({ ...prev, showLayers: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-legend">显示图例</Label>
                      <p className="text-sm text-gray-500">在地图上显示图例</p>
                    </div>
                    <Switch
                      id="show-legend"
                      checked={serviceConfig.showLegend}
                      onCheckedChange={(checked) => 
                        setServiceConfig(prev => ({ ...prev, showLegend: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="default-format">默认输出格式</Label>
                <Select 
                  value={serviceConfig.defaultFormat} 
                  onValueChange={(value) => 
                    setServiceConfig(prev => ({ ...prev, defaultFormat: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/png">PNG图像</SelectItem>
                    <SelectItem value="image/jpeg">JPEG图像</SelectItem>
                    <SelectItem value="application/json">JSON</SelectItem>
                    <SelectItem value="application/gml+xml">GML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* 图层和显示配置 */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">图层和显示配置</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-coordinates">显示坐标</Label>
                        <p className="text-sm text-gray-500">在地图上显示光标坐标和图面范围</p>
                      </div>
                      <Switch
                        id="show-coordinates"
                        checked={serviceConfig.display.showCoordinates}
                        onCheckedChange={(checked) => 
                          setServiceConfig(prev => ({ 
                            ...prev, 
                            display: { ...prev.display, showCoordinates: checked }
                          }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-layer-panel">显示图层面板</Label>
                        <p className="text-sm text-gray-500">在地图上显示图层控制面板</p>
                      </div>
                      <Switch
                        id="show-layer-panel"
                        checked={serviceConfig.display.showLayerPanel}
                        onCheckedChange={(checked) => 
                          setServiceConfig(prev => ({ 
                            ...prev, 
                            display: { ...prev.display, showLayerPanel: checked }
                          }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-legend-panel">显示图例面板</Label>
                        <p className="text-sm text-gray-500">在地图上显示图例信息面板</p>
                      </div>
                      <Switch
                        id="show-legend-panel"
                        checked={serviceConfig.display.showLegendPanel}
                        onCheckedChange={(checked) => 
                          setServiceConfig(prev => ({ 
                            ...prev, 
                            display: { ...prev.display, showLegendPanel: checked }
                          }))
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="always-on-top">始终在最上层</Label>
                        <p className="text-sm text-gray-500">图层和坐标面板始终显示在最上层</p>
                      </div>
                      <Switch
                        id="always-on-top"
                        checked={serviceConfig.display.alwaysOnTop}
                        onCheckedChange={(checked) => 
                          setServiceConfig(prev => ({ 
                            ...prev, 
                            display: { ...prev.display, alwaysOnTop: checked }
                          }))
                        }
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="panel-opacity">面板透明度</Label>
                      <Select 
                        value={serviceConfig.display.panelOpacity.toString()} 
                        onValueChange={(value) => 
                          setServiceConfig(prev => ({ 
                            ...prev, 
                            display: { ...prev.display, panelOpacity: parseInt(value) }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100% (不透明)</SelectItem>
                          <SelectItem value="95">95%</SelectItem>
                          <SelectItem value="90">90%</SelectItem>
                          <SelectItem value="85">85%</SelectItem>
                          <SelectItem value="80">80%</SelectItem>
                          <SelectItem value="75">75%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="layer-panel-position">图层面板位置</Label>
                      <Select 
                        value={serviceConfig.display.layerPanelPosition} 
                        onValueChange={(value) => 
                          setServiceConfig(prev => ({ 
                            ...prev, 
                            display: { ...prev.display, layerPanelPosition: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top-right">右上角</SelectItem>
                          <SelectItem value="top-left">左上角</SelectItem>
                          <SelectItem value="bottom-right">右下角</SelectItem>
                          <SelectItem value="bottom-left">左下角</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="coordinate-panel-position">坐标面板位置</Label>
                      <Select 
                        value={serviceConfig.display.coordinatePanelPosition} 
                        onValueChange={(value) => 
                          setServiceConfig(prev => ({ 
                            ...prev, 
                            display: { ...prev.display, coordinatePanelPosition: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top-right">右上角</SelectItem>
                          <SelectItem value="top-left">左上角</SelectItem>
                          <SelectItem value="bottom-right">右下角</SelectItem>
                          <SelectItem value="bottom-left">左下角</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 底图配置 */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Map className="h-5 w-5 mr-2 text-blue-600" />
                  底图配置
                </h3>
                
                <div className="space-y-6">
                  {/* 底图类型选择 */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">底图类型</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          serviceConfig.baseMap.type === 'osm'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setServiceConfig(prev => ({
                          ...prev,
                          baseMap: { ...prev.baseMap, type: 'osm' }
                        }))}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <Globe className="h-6 w-6 text-blue-600" />
                          <div className="text-center">
                            <p className="text-sm font-medium">OpenStreetMap</p>
                            <p className="text-xs text-gray-500">标准街道地图</p>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          serviceConfig.baseMap.type === 'satellite'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setServiceConfig(prev => ({
                          ...prev,
                          baseMap: { ...prev.baseMap, type: 'satellite' }
                        }))}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <Satellite className="h-6 w-6 text-green-600" />
                          <div className="text-center">
                            <p className="text-sm font-medium">卫星影像</p>
                            <p className="text-xs text-gray-500">高清卫星图</p>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          serviceConfig.baseMap.type === 'terrain'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setServiceConfig(prev => ({
                          ...prev,
                          baseMap: { ...prev.baseMap, type: 'terrain' }
                        }))}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <Mountain className="h-6 w-6 text-orange-600" />
                          <div className="text-center">
                            <p className="text-sm font-medium">地形图</p>
                            <p className="text-xs text-gray-500">高程地形</p>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          serviceConfig.baseMap.type === 'custom'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setServiceConfig(prev => ({
                          ...prev,
                          baseMap: { ...prev.baseMap, type: 'custom' }
                        }))}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <ImageIcon className="h-6 w-6 text-purple-600" />
                          <div className="text-center">
                            <p className="text-sm font-medium">自定义</p>
                            <p className="text-xs text-gray-500">自定义底图</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 自定义底图配置 */}
                  {serviceConfig.baseMap.type === 'custom' && (
                    <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                      <div>
                        <Label htmlFor="custom-url" className="text-sm font-medium flex items-center">
                          <LinkIcon className="h-4 w-4 mr-1 text-purple-600" />
                          自定义底图URL
                        </Label>
                        <Input
                          id="custom-url"
                          type="url"
                          placeholder="https://tile.example.com/{z}/{x}/{y}.png"
                          value={serviceConfig.baseMap.customUrl}
                          onChange={(e) => setServiceConfig(prev => ({
                            ...prev,
                            baseMap: { ...prev.baseMap, customUrl: e.target.value }
                          }))}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          支持模板变量: {`{z}`} (缩放级别), {`{x}`} (列号), {`{y}`} (行号)
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="attribution" className="text-sm font-medium">归属信息</Label>
                        <Input
                          id="attribution"
                          placeholder="© Example Company"
                          value={serviceConfig.baseMap.attribution}
                          onChange={(e) => setServiceConfig(prev => ({
                            ...prev,
                            baseMap: { ...prev.baseMap, attribution: e.target.value }
                          }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* 缩放级别配置 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-zoom" className="text-sm font-medium">最小缩放级别</Label>
                      <Select 
                        value={serviceConfig.baseMap.minZoom.toString()} 
                        onValueChange={(value) => setServiceConfig(prev => ({
                          ...prev,
                          baseMap: { ...prev.baseMap, minZoom: parseInt(value) }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="max-zoom" className="text-sm font-medium">最大缩放级别</Label>
                      <Select 
                        value={serviceConfig.baseMap.maxZoom.toString()} 
                        onValueChange={(value) => setServiceConfig(prev => ({
                          ...prev,
                          baseMap: { ...prev.baseMap, maxZoom: parseInt(value) }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="16">16</SelectItem>
                          <SelectItem value="17">17</SelectItem>
                          <SelectItem value="18">18</SelectItem>
                          <SelectItem value="19">19</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* 底图信息提示 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <Info className="h-4 w-4 mt-0.5 mr-2 text-blue-600" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800">底图配置说明</p>
                        <p className="text-blue-600 mt-1">
                          当前选择的底图类型: {{
                            'osm': 'OpenStreetMap标准街道地图',
                            'satellite': '卫星影像底图',
                            'terrain': '地形高程底图',
                            'custom': '自定义底图服务'
                          }[serviceConfig.baseMap.type]}
                        </p>
                        {serviceConfig.baseMap.type === 'custom' && serviceConfig.baseMap.customUrl && (
                          <p className="text-blue-600 mt-1">
                            自定义端点: {serviceConfig.baseMap.customUrl}
                          </p>
                        )}
                        <div className="mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowTestDialog(true)}
                            className="flex items-center gap-2"
                          >
                            <TestTube className="h-4 w-4" />
                            测试底图连接
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  重置默认
                </Button>
                <Button onClick={saveBaseMapConfig} disabled={loadingConfig}>
                  {loadingConfig ? '保存中...' : '保存配置'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 底图测试对话框 */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              测试底图连接
            </DialogTitle>
            <DialogDescription>
              测试当前配置的底图URL是否可以正常访问和加载
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium">底图类型：</span>
                  <span className="ml-2">{{
                    'osm': 'OpenStreetMap',
                    'satellite': '卫星影像',
                    'terrain': '地形图',
                    'custom': '自定义底图'
                  }[serviceConfig.baseMap.type]}</span>
                </div>
                {serviceConfig.baseMap.type === 'custom' && (
                  <div>
                    <span className="font-medium">自定义URL：</span>
                    <div className="mt-1 p-2 bg-white rounded border text-xs font-mono break-all">
                      {serviceConfig.baseMap.customUrl || '未设置'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 测试结果 */}
            {testResult.message && (
              <div className={`rounded-lg p-3 ${
                testResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-red-600" />
                  )}
                  <div className="text-sm">
                    <p className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                      {testResult.message}
                    </p>
                    {testResult.success && testResult.imageUrl && (
                      <div className="mt-2">
                        <p className="text-green-700 text-xs mb-1">测试图片预览：</p>
                        <div className="border border-green-200 rounded overflow-hidden bg-white">
                          <img 
                            src={testResult.imageUrl} 
                            alt="底图测试" 
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                        <p className="text-green-600 text-xs mt-1 break-all">
                          URL: {testResult.imageUrl}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowTestDialog(false)}
              >
                关闭
              </Button>
              <Button 
                onClick={testBaseMapUrl}
                disabled={testResult.loading}
              >
                {testResult.loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    测试中...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    开始测试
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 服务详情弹窗 */}
      <ServiceDetailModal
        service={currentService}
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onPreviewOnMap={handlePreviewOnMap}
      />
    </div>
  )
}
