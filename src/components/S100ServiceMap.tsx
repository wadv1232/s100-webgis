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
import MapLoadingIndicator from './ui/MapLoadingIndicator'
import CoordinateDisplay from './ui/CoordinateDisplay'
import MapLegend from './ui/MapLegend'
import ServiceDetailModal from './ui/ServiceDetailModal'
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

// Import Leaflet dynamically for better control
let L: any
if (typeof window !== 'undefined') {
  // Don't import immediately, we'll import it when needed
}

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
  displayConfig?: {
    showCoordinates: boolean
    showLayerPanel: boolean
    showLegendPanel: boolean
    layerPanelPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    coordinatePanelPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    panelOpacity: number
    alwaysOnTop: boolean
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
  baseMapConfig,
  displayConfig
}: S100ServiceMapProps) {
  const [mapCenter, setMapCenter] = useState([31.2000, 121.5000])
  const [mapZoom, setMapZoom] = useState(6)
  const [baseLayer, setBaseLayer] = useState(baseMapConfig?.type || 'osm')
  const [fullscreen, setFullscreen] = useState(false)
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
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 }) // 容器尺寸状态
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  
  // 新增状态：坐标显示
  const [showCoordinates, setShowCoordinates] = useState(displayConfig?.showCoordinates ?? true)
  
  // 新增状态：图层管理
  const [mapLayers, setMapLayers] = useState([
    { id: 'base', name: '基础地图', type: 'base', visible: true, icon: '🗺️' },
    { id: 'nodes', name: '节点标记', type: 'node', visible: true, color: '#3b82f6', icon: '📍' },
    { id: 'services', name: '服务区域', type: 'service', visible: true, color: '#10b981', icon: '🔧' },
    { id: 'coverage', name: '覆盖范围', type: 'overlay', visible: true, color: '#f59e0b', icon: '📊' }
  ])
  
  // 新增状态：服务详情
  const [selectedService, setSelectedService] = useState<any>(null)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  
  // 根据配置设置面板显示状态
  const [showLayerPanel, setShowLayerPanel] = useState(displayConfig?.showLayerPanel ?? true)
  const [showLegend, setShowLegend] = useState(displayConfig?.showLegendPanel ?? true)
  
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // Update base layer when baseMapConfig changes
  useEffect(() => {
    if (baseMapConfig) {
      setBaseLayer(baseMapConfig.type)
    }
  }, [baseMapConfig])

  // 地图初始化函数
  const initializeMap = async () => {
    if (mapRef.current) {
      console.log('Map already initialized')
      return
    }

    setIsInitializing(true)
    setMapError(null)
    
    try {
      console.log('Starting map initialization...')
      
      // Dynamically import Leaflet
      const leafletModule = await import('leaflet')
      await import('leaflet/dist/leaflet.css')
      
      L = leafletModule.default || leafletModule
      
      console.log('Leaflet imported successfully')
      
      // Fix for default markers in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      
      console.log('Map container:', mapContainerRef.current)
      
      if (!mapContainerRef.current) {
        console.error('Map container not found')
        setMapError('地图容器未找到')
        setIsInitializing(false)
        return
      }
      
      console.log('Initializing Leaflet map...')
      
      // 清理现有地图
      cleanupMap()
      
      // 创建新地图实例
      const map = L.map(mapContainerRef.current, {
        center: mapCenter,
        zoom: mapZoom,
        minZoom: 1,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: false,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0
      })
      
      mapRef.current = map
      
      // 添加缩放控制
      L.control.zoom({
        position: 'topright'
      }).addTo(map)
      
      // 添加比例尺
      L.control.scale({
        position: 'bottomleft',
        metric: true,
        imperial: false,
        maxWidth: 200
      }).addTo(map)
      
      // 添加基础图层
      addBaseLayer(map)
      
      // 添加节点标记
      addNodeMarkers(map)
      
      // 添加服务图层
      addServiceLayers(map)
      
      // 添加地图事件监听器
      addMapEventListeners(map)
      
      console.log('Map initialized successfully')
      setIsMapLoaded(true)
      
    } catch (error) {
      console.error('Error initializing map:', error)
      console.error('Error details:', error instanceof Error ? error.message : error)
      setMapError(error instanceof Error ? error.message : '地图初始化失败')
    } finally {
      setIsInitializing(false)
    }
  }

  // 添加地图事件监听器
  const addMapEventListeners = (map: any) => {
    if (!map) return

    // 监听地图点击事件
    map.on('click', (e: any) => {
      console.log('Map clicked at:', e.latlng)
    })

    // 监听地图加载事件
    map.on('load', () => {
      console.log('Map loaded successfully')
      setIsMapLoaded(true)
    })

    // 监听错误事件
    map.on('error', (error: any) => {
      console.error('Map error:', error)
      setMapError('地图运行时错误')
    })
  }

  // 重试地图初始化
  const retryMapInitialization = () => {
    setMapError(null)
    setIsMapLoaded(false)
    initializeMap()
  }

  // 图层切换处理
  const handleLayerToggle = (layerId: string, visible: boolean) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible } : layer
    ))
    
    // 更新地图图层显示
    if (mapRef.current) {
      updateMapLayers(mapRef.current)
    }
  }

  // 更新地图图层
  const updateMapLayers = (map: any) => {
    if (!map || !L) return

    // 根据图层状态更新显示
    layers.forEach(layer => {
      const layerElement = document.getElementById(`layer-${layer.id}`)
      if (layerElement) {
        layerElement.style.display = layer.visible ? 'block' : 'none'
      }
    })
  }

  // 服务详情处理
  const handleServiceClick = (service: any) => {
    setSelectedService(service)
    setIsServiceModalOpen(true)
  }

  // 在地图上预览服务
  const handlePreviewOnMap = (service: any) => {
    if (mapRef.current && service.coverage) {
      try {
        const geometry = parseGeoJSON(service.coverage)
        if (geometry) {
          // 在地图上高亮显示服务覆盖范围
          const layer = L.geoJSON(geometry as any, {
            style: {
              color: '#ef4444',
              weight: 3,
              fillColor: '#ef4444',
              fillOpacity: 0.2
            }
          }).addTo(mapRef.current)
          
          // 调整地图视图到服务范围
          mapRef.current.fitBounds(layer.getBounds())
          
          // 5秒后移除高亮
          setTimeout(() => {
            mapRef.current.removeLayer(layer)
          }, 5000)
        }
      } catch (error) {
        console.error('Error previewing service on map:', error)
      }
    }
  }

  // 组件挂载和尺寸处理 - 直接Leaflet实现
  useEffect(() => {
    setIsMounted(true)
    
    // 延迟初始化地图，确保容器已渲染
    const timer = setTimeout(() => {
      initializeMap()
    }, 100)
    
    return () => {
      clearTimeout(timer)
      // 清理地图
      cleanupMap()
    }
  }, [])

  // 清理地图函数
  const cleanupMap = () => {
    if (mapRef.current && L) {
      try {
        console.log('Cleaning up map...')
        
        // 移除所有事件监听器
        mapRef.current.off()
        
        // 清理所有图层
        mapRef.current.eachLayer((layer: any) => {
          mapRef.current.removeLayer(layer)
        })
        
        // 移除地图容器
        const container = mapRef.current.getContainer()
        if (container && container.parentNode) {
          container.parentNode.removeChild(container)
        }
        
        // 清理引用
        mapRef.current = null
        
        console.log('Map cleaned up successfully')
      } catch (error) {
        console.warn('Error cleaning up map:', error)
        mapRef.current = null
      }
    }
  }

  // 添加基础图层
  const addBaseLayer = (map: any) => {
    if (!L) return
    
    let tileUrl: string
    let attribution: string
    
    switch (baseLayer) {
      case 'satellite':
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}'
        attribution = '&copy; <a href="https://www.esri.com/">Esri</a> | <strong>显示坐标: WGS84</strong>'
        break
      case 'terrain':
        tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
        attribution = '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a> | <strong>显示坐标: WGS84</strong>'
        break
      case 'custom':
        if (baseMapConfig?.customUrl) {
          tileUrl = baseMapConfig.customUrl
          attribution = baseMapConfig.attribution || 'Custom Base Map'
        } else {
          tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <strong>显示坐标: WGS84</strong>'
        }
        break
      default:
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <strong>显示坐标: WGS84</strong>'
    }
    
    L.tileLayer(tileUrl, {
      attribution,
      minZoom: baseMapConfig?.minZoom || 1,
      maxZoom: baseMapConfig?.maxZoom || 18,
      noWrap: true,
      updateWhenIdle: false,
      updateWhenZooming: true,
      keepBuffer: 4,
      bounds: [[-90, -180], [90, 180]],
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0
    }).addTo(map)
  }

  // 添加节点标记
  const addNodeMarkers = (map: any) => {
    if (!L) return
    
    if (!mapLayers.find(l => l.id === 'nodes')?.visible) {
      return
    }
    
    nodes.forEach((node) => {
      const isSelected = editingNode?.id === node.id
      const color = getNodeColor(node.healthStatus)
      
      // 创建自定义图标
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      })
      
      const marker = L.marker([node.location.lat, node.location.lng], { icon })
      
      // 添加点击事件
      marker.on('click', () => {
        handleNodeSelect(node)
      })
      
      // 添加弹出窗口
      const popupContent = `
        <div class="p-2">
          <h3 class="font-semibold">${node.name}</h3>
          <p class="text-sm text-gray-600">${node.description}</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="px-2 py-1 text-xs border rounded">${node.type}</span>
            <span class="text-xs">${node.healthStatus}</span>
          </div>
          <div class="mt-2">
            <p class="text-sm font-medium">服务: ${node.services?.length || 0}</p>
          </div>
        </div>
      `
      
      marker.bindPopup(popupContent)
      marker.addTo(map)
    })
  }

  // 添加服务图层
  const addServiceLayers = (map: any) => {
    if (!L) return
    
    serviceLayers.forEach((service) => {
      const layer = mapLayers.find(l => l.id === service.product.toLowerCase())
      if (!layer?.visible) return
      
      L.tileLayer.wms(`${service.endpoint}?SERVICE=WMS&VERSION=${service.version}&REQUEST=GetMap`, {
        layers: service.product,
        styles: '',
        format: 'image/png',
        transparent: true,
        opacity: layer.opacity
      }).addTo(map)
    })
  }

  // 处理影响地图容器尺寸的状态变化
  useEffect(() => {
    console.log('Layout-related state changed, reinitializing map...')
    // 重新初始化地图
    cleanupMap()
    setTimeout(() => {
      if (isMapLoaded) {
        initializeMap()
      }
    }, 100)
  }, [fullscreen, height, editingNode, baseLayer])

  const serviceLayers = services.filter(service => 
    selectedNode.services.some(ns => ns.includes(service.product))
  )

  // Layer control functions - 保持向后兼容
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
            {/* 地图加载指示器 */}
            <MapLoadingIndicator
              isLoading={isInitializing}
              isError={!!mapError}
              onRetry={retryMapInitialization}
              message={mapError || '正在初始化地图...'}
            />
            
            {/* 坐标显示 */}
            {showCoordinates && isMapLoaded && mapRef.current && (
              <CoordinateDisplay 
                map={mapRef.current} 
                position={displayConfig?.coordinatePanelPosition || 'bottom-left'}
                opacity={displayConfig?.panelOpacity || 95}
                zIndex={displayConfig?.alwaysOnTop ? 1000 : 10}
              />
            )}
            
            {/* 图例控制 */}
            {isMapLoaded && showLayerPanel && (
              <MapLegend
                layers={mapLayers}
                onLayerToggle={handleLayerToggle}
                position={displayConfig?.layerPanelPosition || 'top-right'}
                opacity={displayConfig?.panelOpacity || 95}
                zIndex={displayConfig?.alwaysOnTop ? 1000 : 10}
              />
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* 服务详情弹窗 */}
      <ServiceDetailModal
        service={selectedService}
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onPreviewOnMap={handlePreviewOnMap}
      />
    </div>
  )
}