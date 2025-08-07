'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import MapUpdater from './MapUpdater'
import MapInfoDisplay from './MapInfoDisplay'
import { 
  Activity, 
  Search, 
  X, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Layers,
  Settings,
  Maximize2,
  Minimize2,
  Edit,
  Save,
  MapPin,
  Plus,
  Trash2
} from 'lucide-react'
import { 
  GeoJSONGeometry, 
  parseGeoJSON, 
  stringifyGeoJSON, 
  createPoint,
  createBoundingBoxPolygon,
  generateDefaultCoverage,
  validateGeoJSON,
  formatCoverageForDisplay,
  calculateCenter,
  calculateBoundingBox
} from '@/lib/utils/geo-utils'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
)
const WMSTileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.WMSTileLayer),
  { ssr: false }
)
const ZoomControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ZoomControl),
  { ssr: false }
)
const ScaleControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ScaleControl),
  { ssr: false }
)

// Types
interface NodeType {
  id: string
  name: string
  type: 'GLOBAL_ROOT' | 'NATIONAL' | 'REGIONAL' | 'LEAF'
  level: number
  description: string
  healthStatus: 'HEALTHY' | 'WARNING' | 'ERROR'
  services: string[]
  location: { lat: number; lng: number }
}

interface ServiceType {
  id: string
  name: string
  type: 'WMS' | 'WFS' | 'WCS'
  product: string
  status: 'ACTIVE' | 'MAINTENANCE' | 'ERROR'
  endpoint: string
  version: string
  layers?: string[]
  formats: string[]
  nodeId: string
}

interface MapLayer {
  id: string
  name: string
  type: 'base' | 'service'
  visible: boolean
  opacity: number
  color: string
}

interface S100ServiceMapProps {
  nodes: NodeType[]
  services: ServiceType[]
  selectedNode: NodeType
  onNodeSelect: (node: NodeType) => void
  onNodeUpdate?: (nodeId: string, updates: Partial<NodeType>) => void
  editable?: boolean
  height?: string
  baseMapConfig?: {
    type: 'osm' | 'satellite' | 'terrain' | 'custom'
    customUrl?: string
    attribution?: string
    minZoom?: number
    maxZoom?: number
  }
}

export default function S100ServiceMap({ 
  nodes, 
  services, 
  selectedNode, 
  onNodeSelect,
  onNodeUpdate,
  editable = false,
  height = '600px',
  baseMapConfig
}: S100ServiceMapProps) {
  const [mapCenter, setMapCenter] = useState([31.2000, 121.5000])
  const [mapZoom, setMapZoom] = useState(6)
  const [baseLayer, setBaseLayer] = useState(baseMapConfig?.type || 'osm')
  const [fullscreen, setFullscreen] = useState(false)
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [showLegend, setShowLegend] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<NodeType | null>(null)
  const [editMode, setEditMode] = useState<'manual' | 'point' | 'bbox' | 'preset'>('manual')
  const [tempGeometry, setTempGeometry] = useState<GeoJSONGeometry | null>(null)
  const [coverage, setCoverage] = useState<string>('')
  const [latitude, setLatitude] = useState<string>('')
  const [longitude, setLongitude] = useState<string>('')
  const [validation, setValidation] = useState<{ valid: boolean; error?: string }>({ valid: true })
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  
  // 新增状态：用于解决地图容器尺寸问题
  const [isMounted, setIsMounted] = useState(false)
  const [mapKey, setMapKey] = useState(0) // 用于强制重新挂载地图
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 }) // 容器尺寸状态
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // Update base layer when baseMapConfig changes
  useEffect(() => {
    if (baseMapConfig) {
      setBaseLayer(baseMapConfig.type)
    }
  }, [baseMapConfig])

  // 组件挂载和尺寸处理 - 核心解决方案
  useEffect(() => {
    setIsMounted(true)
    
    // 清理之前的观察者
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect()
    }
    
    // 创建 ResizeObserver 监听容器尺寸变化
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        
        // 更新容器尺寸状态
        setContainerSize({ width, height })
        
        // 只有当容器尺寸有效时才处理地图
        if (width > 100 && height > 100) { // 设置最小阈值避免小尺寸
          console.log('Container size changed:', { width, height })
          
          // 方法1: 延迟调用 invalidateSize
          if (mapRef.current) {
            setTimeout(() => {
              try {
                mapRef.current.invalidateSize()
                console.log('Map size invalidated successfully')
              } catch (error) {
                console.warn('Failed to invalidate map size:', error)
              }
            }, 100) // 增加延迟确保 DOM 更新完成
          }
          
          // 方法2: 如果 invalidateSize 失败，强制重新挂载
          else {
            setMapKey(prev => prev + 1)
          }
        }
      }
    })
    
    // 开始观察容器
    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current)
      resizeObserverRef.current = observer
      
      // 初始检查容器尺寸
      const initialRect = mapContainerRef.current.getBoundingClientRect()
      console.log('Initial container size:', {
        width: initialRect.width,
        height: initialRect.height
      })
      
      // 如果初始尺寸太小，延迟后重新挂载
      if (initialRect.width < 100 || initialRect.height < 100) {
        setTimeout(() => {
          setMapKey(prev => prev + 1)
        }, 200)
      }
    }
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [])

  // 处理影响地图容器尺寸的状态变化
  useEffect(() => {
    console.log('Layout-related state changed, updating map...')
    // 延迟处理以确保 DOM 更新完成
    const timer = setTimeout(() => {
      if (mapRef.current) {
        try {
          mapRef.current.invalidateSize()
          console.log('Map size invalidated after state change')
        } catch (error) {
          console.warn('Failed to invalidate map size after state change:', error)
          // 如果 invalidateSize 失败，强制重新挂载
          setMapKey(prev => prev + 1)
        }
      } else {
        // 如果地图不存在，强制重新挂载
        setMapKey(prev => prev + 1)
      }
    }, 150) // 增加延迟确保 DOM 完全更新
    
    return () => clearTimeout(timer)
  }, [fullscreen, height, editingNode, baseLayer]) // 添加 baseLayer 变化监听

  // 可靠的 invalidateSize 调用 - 备用方案
  useEffect(() => {
    if (mapRef.current && isMounted && containerSize.width > 100 && containerSize.height > 100) {
      const timeoutId = setTimeout(() => {
        try {
          mapRef.current.invalidateSize()
          console.log('Backup map size invalidation successful')
        } catch (error) {
          console.warn('Backup map size invalidation failed:', error)
        }
      }, 200) // 更长的延迟确保所有更新完成

      return () => clearTimeout(timeoutId)
    }
  }, [mapKey, isMounted, containerSize])

  // Initialize map layers
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    { id: 'osm', name: '标准地图', type: 'base', visible: true, opacity: 1, color: '#gray' },
    { id: 'satellite', name: '卫星地图', type: 'base', visible: false, opacity: 1, color: '#gray' },
    { id: 'terrain', name: '地形地图', type: 'base', visible: false, opacity: 1, color: '#gray' },
    { id: 'nodes', name: '节点标记', type: 'service', visible: true, opacity: 1, color: '#3b82f6' },
    { id: 'services', name: '服务覆盖', type: 'service', visible: true, opacity: 0.3, color: '#10b981' }
  ])

  const serviceLayers = services.filter(service => 
    selectedNode.services.some(ns => ns.includes(service.product))
  )

  // Layer control functions
  const toggleLayer = (layerId: string) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ))
  }

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ))
  }

  // Node selection
  const handleNodeSelect = (node: NodeType) => {
    setEditingNode(node)
    onNodeSelect(node)
    setMapCenter([node.location.lat, node.location.lng])
    setMapZoom(10)
  }

  // Search functionality
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term) {
      setSearchResults([])
      return
    }

    const results = [
      ...nodes.map(node => ({
        type: 'node',
        id: node.id,
        name: node.name,
        node
      })),
      ...services.map(service => ({
        type: 'service',
        id: service.id,
        name: service.name,
        service
      }))
    ].filter(item => 
      item.name.toLowerCase().includes(term.toLowerCase())
    )

    setSearchResults(results)
  }

  const handleResultSelect = (result: any) => {
    if (result.type === 'node') {
      handleNodeSelect(result.node)
    } else if (result.type === 'service') {
      const node = nodes.find(n => n.id === result.service.nodeId)
      if (node) {
        handleNodeSelect(node)
      }
    }
    setIsSearchOpen(false)
    setSearchTerm('')
    setSearchResults([])
  }

  // Helper functions
  const getNodeColor = (healthStatus: string) => {
    switch (healthStatus) {
      case 'HEALTHY': return '#10b981'
      case 'WARNING': return '#f59e0b'
      case 'ERROR': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getHealthIcon = (healthStatus: string) => {
    switch (healthStatus) {
      case 'HEALTHY':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'WARNING':
        return <Clock className="h-3 w-3 text-yellow-500" />
      case 'ERROR':
        return <AlertTriangle className="h-3 w-3 text-red-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-500" />
    }
  }

  // GIS Editing functions
  const startEditing = (node: NodeType) => {
    if (!editable) return
    
    setEditingNode(node)
    setEditMode('manual')
    
    // Initialize editing data
    if (node.location) {
      setLatitude(node.location.lat.toString())
      setLongitude(node.location.lng.toString())
    }
    
    // Initialize coverage if available (this would need to be added to NodeType interface)
    setCoverage('')
    setTempGeometry(null)
    setValidation({ valid: true })
  }

  const saveEdit = () => {
    if (!editingNode || !onNodeUpdate) return

    const updates: Partial<NodeType> = {}
    
    // Update location coordinates
    const lat = latitude.trim() ? parseFloat(latitude) : null
    const lng = longitude.trim() ? parseFloat(longitude) : null
    
    if (!isNaN(lat) && lat !== null) updates.location = { ...editingNode.location, lat }
    if (!isNaN(lng) && lng !== null) updates.location = { ...editingNode.location, lng }
    
    // Update coverage if available
    if (coverage.trim()) {
      if (!validation.valid) {
        alert('GeoJSON数据无效: ' + validation.error)
        return
      }
      // Note: coverage field would need to be added to NodeType interface
    }
    
    onNodeUpdate(editingNode.id, updates)
    setEditingNode(null)
    setTempGeometry(null)
    setCoverage('')
  }

  const cancelEdit = () => {
    setEditingNode(null)
    setTempGeometry(null)
    setCoverage('')
    setLatitude('')
    setLongitude('')
  }

  const handleCoverageChange = (value: string) => {
    setCoverage(value)
    
    if (value.trim()) {
      const result = validateGeoJSON(value)
      setValidation(result)
      
      if (result.valid) {
        const geometry = parseGeoJSON(value)
        setTempGeometry(geometry)
        
        // Update coordinates if it's a point
        if (geometry.type === 'Point') {
          setLatitude(geometry.coordinates[1].toString())
          setLongitude(geometry.coordinates[0].toString())
        }
      } else {
        setTempGeometry(null)
      }
    } else {
      setValidation({ valid: true })
      setTempGeometry(null)
    }
  }

  const generateFromCoordinates = () => {
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    
    if (!isNaN(lat) && !isNaN(lng)) {
      const point = createPoint(lng, lat)
      setCoverage(stringifyGeoJSON(point))
      setTempGeometry(point)
    }
  }

  const generateBBox = () => {
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    
    if (!isNaN(lat) && !isNaN(lng)) {
      const bbox = createBoundingBoxPolygon({
        minLng: lng - 0.01,
        minLat: lat - 0.01,
        maxLng: lng + 0.01,
        maxLat: lat + 0.01
      })
      setCoverage(stringifyGeoJSON(bbox))
      setTempGeometry(bbox)
    }
  }

  return (
    <div className="relative">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                S-100服务地图
              </CardTitle>
              <CardDescription>
                海事数据服务地理分布和实时状态监控
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4 mr-2" />
                搜索
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLayerPanel(!showLayerPanel)}
              >
                <Layers className="h-4 w-4 mr-2" />
                图层
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLegend(!showLegend)}
              >
                <Settings className="h-4 w-4 mr-2" />
                图例
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreen(!fullscreen)}
              >
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              {editable && selectedNode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditing(selectedNode)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  编辑地理数据
                </Button>
              )}
            </div>
          </div>
          
          {/* Editing Panel */}
          {editingNode && (
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-800">
                    编辑地理数据 - {editingNode.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit} disabled={!validation.valid}>
                    <Save className="h-4 w-4 mr-1" />
                    保存
                  </Button>
                  <Button variant="outline" size="sm" onClick={cancelEdit}>
                    <X className="h-4 w-4 mr-1" />
                    取消
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coordinates */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="latitude" className="text-sm">纬度</Label>
                    <Input
                      id="latitude"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="例: 31.2000"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-sm">经度</Label>
                    <Input
                      id="longitude"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="例: 121.5000"
                      className="text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateFromCoordinates}
                      disabled={!latitude || !longitude}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      生成点
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateBBox}
                      disabled={!latitude || !longitude}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      生成矩形
                    </Button>
                  </div>
                </div>
                
                {/* GeoJSON Editor */}
                <div>
                  <Label className="text-sm">GeoJSON 覆盖范围</Label>
                  <Textarea
                    value={coverage}
                    onChange={(e) => handleCoverageChange(e.target.value)}
                    placeholder={`输入GeoJSON格式的地理数据，例如:
{
  "type": "Point",
  "coordinates": [121.5000, 31.2000]
}`}
                    className="font-mono text-xs h-24 mt-1"
                  />
                  {coverage.trim() && (
                    <div className="mt-2">
                      {validation.valid ? (
                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                          ✓ GeoJSON格式有效
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                          ✗ {validation.error}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div 
            ref={mapContainerRef}
            style={{ 
              height: fullscreen ? '100vh' : height, 
              position: 'relative',
              width: '100%',
              minHeight: fullscreen ? '100vh' : (parseInt(height) || 600),
              display: 'block', // 改为 block 避免 flex 布局影响
              overflow: 'hidden', // 防止溢出
              boxSizing: 'border-box' // 确保 padding 和 border 包含在尺寸内
            }}
            className="map-container"
          >
            {isMounted && (
              <MapContainer
                key={mapKey} // 关键：使用 key 强制重新挂载
                center={mapCenter}
                zoom={mapZoom}
                style={{ 
                  height: '100%', 
                  width: '100%',
                  display: 'block', // 确保 block 显示
                  position: 'absolute', // 绝对定位填充容器
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 0,
                  background: 'transparent' // 确保背景透明
                }}
                ref={mapRef}
                className="leaflet-map-container"
                worldCopyJump={false} // 禁用世界复制跳跃
                maxBounds={[[-90, -180], [90, 180]]} // 限制世界边界
                maxBoundsViscosity={1.0} // 严格边界限制
                minZoom={1} // 最小缩放级别
                maxZoom={18} // 最大缩放级别
                zoomControl={false} // 禁用默认缩放控制，使用自定义的
                attributionControl={false} // 禁用默认归属控制
                whenCreated={(map) => {
                  console.log('Map created successfully with Web Mercator projection', map)
                  mapRef.current = map
                  
                  // 设置地图边界
                  map.setMaxBounds([[-90, -180], [90, 180]])
                  
                  // 地图创建后立即调用 invalidateSize
                  setTimeout(() => {
                    try {
                      map.invalidateSize()
                      console.log('Initial map size invalidation completed')
                      
                      // 额外的尺寸验证和调整
                      const container = map.getContainer()
                      if (container) {
                        const rect = container.getBoundingClientRect()
                        console.log('Map container dimensions after creation:', {
                          width: rect.width,
                          height: rect.height
                        })
                        
                        // 如果尺寸仍然不正确，强制重新调整
                        if (rect.width < 100 || rect.height < 100) {
                          setTimeout(() => {
                            map.invalidateSize()
                            console.log('Forced second invalidation due to small dimensions')
                          }, 200)
                        }
                      }
                    } catch (error) {
                      console.warn('Initial map size invalidation failed:', error)
                    }
                  }, 100)
                }}
              >
              {/* MapUpdater component for dynamic map changes */}
              <MapUpdater 
                center={mapCenter as [number, number]} 
                zoom={mapZoom} 
                baseLayer={baseLayer} 
              />
              
              {/* Scale Control */}
              <ScaleControl 
                position="bottomleft" 
                metric={true} 
                imperial={false}
                maxWidth={200}
              />
              
              {/* Base Map Layers - Web Mercator with WGS84 coordinate display */}
              {baseLayer === 'osm' && (
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <strong>显示坐标: WGS84</strong>'
                  minZoom={baseMapConfig?.minZoom || 1}
                  maxZoom={baseMapConfig?.maxZoom || 18}
                  noWrap={true} // 防止地图重复
                  updateWhenIdle={false} // 确保及时更新
                  updateWhenZooming={true} // 缩放时更新
                  keepBuffer={4} // 增加缓冲区减少瓦片闪烁
                  bounds={[[-90, -180], [90, 180]]} // 限制世界范围
                  maxBounds={[[-90, -180], [90, 180]]} // 限制最大边界
                  maxBoundsViscosity={1.0} // 严格边界限制
                />
              )}
              {baseLayer === 'satellite' && (
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}"
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a> | <strong>显示坐标: WGS84</strong>'
                  minZoom={baseMapConfig?.minZoom || 1}
                  maxZoom={baseMapConfig?.maxZoom || 18}
                  noWrap={true} // 防止地图重复
                  updateWhenIdle={false} // 确保及时更新
                  updateWhenZooming={true} // 缩放时更新
                  keepBuffer={4} // 增加缓冲区减少瓦片闪烁
                  bounds={[[ -90, -180], [90, 180]]} // 限制世界范围
                  maxBounds={[[ -90, -180], [90, 180]]} // 限制最大边界
                  maxBoundsViscosity={1.0} // 严格边界限制
                />
              )}
              {baseLayer === 'terrain' && (
                <TileLayer
                  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://opentopomap.org/">OpenTopoMap</a> | <strong>显示坐标: WGS84</strong>'
                  minZoom={baseMapConfig?.minZoom || 1}
                  maxZoom={baseMapConfig?.maxZoom || 18}
                  noWrap={true} // 防止地图重复
                  updateWhenIdle={false} // 确保及时更新
                  updateWhenZooming={true} // 缩放时更新
                  keepBuffer={4} // 增加缓冲区减少瓦片闪烁
                  bounds={[[ -90, -180], [90, 180]]} // 限制世界范围
                  maxBounds={[[ -90, -180], [90, 180]]} // 限制最大边界
                  maxBoundsViscosity={1.0} // 严格边界限制
                />
              )}
              {baseLayer === 'custom' && baseMapConfig?.customUrl && (
                <TileLayer
                  url={baseMapConfig.customUrl}
                  attribution={baseMapConfig.attribution || 'Custom Base Map'}
                  minZoom={baseMapConfig.minZoom || 1}
                  maxZoom={baseMapConfig.maxZoom || 18}
                  noWrap={true} // 防止地图重复
                  updateWhenIdle={false} // 确保及时更新
                  updateWhenZooming={true} // 缩放时更新
                  keepBuffer={4} // 增加缓冲区减少瓦片闪烁
                  bounds={[[ -90, -180], [90, 180]]} // 限制世界范围
                  maxBounds={[[ -90, -180], [90, 180]]} // 限制最大边界
                  maxBoundsViscosity={1.0} // 严格边界限制
                />
              )}

              {/* S-100 WMS Service Layers */}
              {serviceLayers.map((service) => {
                const layer = mapLayers.find(l => l.id === service.product.toLowerCase())
                if (!layer?.visible) return null
                
                return (
                  <WMSTileLayer
                    key={service.id}
                    url={`${service.endpoint}?SERVICE=WMS&VERSION=${service.version}&REQUEST=GetMap`}
                    layers={service.product}
                    styles=""
                    format="image/png"
                    transparent={true}
                    opacity={layer.opacity}
                  />
                )
              })}

              {/* Node Markers */}
              {mapLayers.find(l => l.id === 'nodes')?.visible && nodes.map((node) => {
                const isSelected = editingNode?.id === node.id
                const color = getNodeColor(node.healthStatus)
                
                return (
                  <Marker
                    key={node.id}
                    position={[node.location.lat, node.location.lng]}
                    eventHandlers={{
                      click: () => handleNodeSelect(node)
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{node.name}</h3>
                        <p className="text-sm text-gray-600">{node.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline">{node.type}</Badge>
                          <div className="flex items-center gap-1">
                            {getHealthIcon(node.healthStatus)}
                            <span className="text-xs">{node.healthStatus}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium">服务: {node.services?.length || 0}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(node.services || []).slice(0, 3).map(service => (
                              <Badge key={service} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {(node.services || []).length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{(node.services || []).length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="mt-2 w-full"
                          onClick={() => handleNodeSelect(node)}
                        >
                          查看详情
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}

              <ZoomControl position="topright" />
              
              {/* Map Info Display - Coordinates and View Bounds */}
              <MapInfoDisplay 
                showCursorCoordinates={true}
                showViewBounds={true}
              />
            </MapContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}