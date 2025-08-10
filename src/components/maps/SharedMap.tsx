'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import MapLoadingIndicator from '@/components/ui/MapLoadingIndicator'
import CoordinateDisplay from '@/components/ui/CoordinateDisplay'
import MapLegend from '@/components/ui/MapLegend'
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
  coverage?: string
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
  coverage?: string
}

interface MapLayer {
  id: string
  name: string
  type: 'base' | 'node' | 'service' | 'overlay'
  visible: boolean
  opacity: number
  color: string
  icon?: string
  description?: string
}

export interface SharedMapProps {
  nodes?: NodeType[]
  services?: ServiceType[]
  selectedNode?: NodeType | null
  onNodeSelect?: (node: NodeType) => void
  onNodeUpdate?: (nodeId: string, updates: Partial<NodeType>) => void
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
  // 场景控制
  mode?: 'view' | 'edit' | 'management'
  editable?: boolean
  showNodeMarkers?: boolean
  showServiceLayers?: boolean
  // 编辑功能
  onGeometryUpdate?: (nodeId: string, geometry: GeoJSONGeometry) => void
  // 预览功能
  previewService?: ServiceType | null
  onPreviewComplete?: () => void
}

export interface SharedMapRef {
  previewService: (service: ServiceType) => void
  startEditing: (node: NodeType) => void
  fitBounds: (bounds: any) => void
  getCenter: () => { lat: number; lng: number }
  setCenter: (center: [number, number]) => void
}

const SharedMap = forwardRef<SharedMapRef, SharedMapProps>(({
  nodes = [],
  services = [],
  selectedNode = null,
  onNodeSelect,
  onNodeUpdate,
  height = '600px',
  baseMapConfig,
  displayConfig,
  mode = 'view',
  editable = false,
  showNodeMarkers = true,
  showServiceLayers = true,
  onGeometryUpdate,
  previewService = null,
  onPreviewComplete
}, ref) => {
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
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  
  // 新增状态：坐标显示
  const [showCoordinates, setShowCoordinates] = useState(displayConfig?.showCoordinates ?? true)
  
  // 新增状态：图层管理
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    { id: 'base', name: '基础地图', type: 'base', visible: true, icon: '🗺️' },
    { id: 'nodes', name: '节点标记', type: 'node', visible: showNodeMarkers, color: '#3b82f6', icon: '📍' },
    { id: 'services', name: '服务区域', type: 'service', visible: showServiceLayers, color: '#10b981', icon: '🔧' },
    { id: 'coverage', name: '覆盖范围', type: 'overlay', visible: true, color: '#f59e0b', icon: '📊' }
  ])
  
  // 新增状态：服务详情
  const [currentPreviewService, setCurrentPreviewService] = useState<ServiceType | null>(null)
  
  // 新增状态：绘制功能
  const [drawControl, setDrawControl] = useState<any>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawMode, setDrawMode] = useState<'polygon' | 'rectangle' | 'marker'>('polygon')
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([])
  const [tempLayer, setTempLayer] = useState<any>(null)
  
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const drawControlRef = useRef<any>(null)

  // Update base layer when baseMapConfig changes
  useEffect(() => {
    if (baseMapConfig) {
      setBaseLayer(baseMapConfig.type)
    }
  }, [baseMapConfig])

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    previewService: (service: ServiceType) => {
      handlePreviewOnMap(service)
    },
    startEditing: (node: NodeType) => {
      startEditing(node)
    },
    fitBounds: (bounds: any) => {
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds)
      }
    },
    getCenter: () => {
      if (mapRef.current) {
        const center = mapRef.current.getCenter()
        return { lat: center.lat, lng: center.lng }
      }
      return { lat: mapCenter[0], lng: mapCenter[1] }
    },
    setCenter: (center: [number, number]) => {
      setMapCenter(center)
      if (mapRef.current) {
        mapRef.current.setView(center, mapZoom)
      }
    }
  }))

  // 处理预览服务
  const handlePreviewOnMap = (service: ServiceType) => {
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
            if (mapRef.current) {
              mapRef.current.removeLayer(layer)
            }
          }, 5000)
          
          // 通知预览完成
          if (onPreviewComplete) {
            onPreviewComplete()
          }
        }
      } catch (error) {
        console.error('Error previewing service on map:', error)
      }
    }
  }

  // 处理外部预览服务请求
  useEffect(() => {
    if (previewService) {
      setCurrentPreviewService(previewService)
      handlePreviewOnMap(previewService)
    }
  }, [previewService])

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
      if (showNodeMarkers) {
        addNodeMarkers(map)
      }
      
      // 添加服务图层
      if (showServiceLayers) {
        addServiceLayers(map)
      }
      
      // 添加地图事件监听器
      addMapEventListeners(map)
      
      console.log('Map initialized successfully')
      setIsMapLoaded(true)
      
      // 延迟重绘地图，确保容器尺寸正确
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize()
          console.log('Map size invalidated')
          
          // 如果有节点数据，调整地图视图到第一个节点的位置
          if (nodes.length > 0 && nodes[0].location) {
            const node = nodes[0]
            mapRef.current.setView([node.location.lat, node.location.lng], 10)
            console.log('Map view set to node location:', node.location)
          }
        }
      }, 300)
      
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
      
      // 如果在编辑模式下，处理地图点击以设置位置
      if (mode === 'edit' && editable && editingNode) {
        handleMapClick(e)
      }
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
    mapLayers.forEach(layer => {
      const layerElement = document.getElementById(`layer-${layer.id}`)
      if (layerElement) {
        layerElement.style.display = layer.visible ? 'block' : 'none'
      }
    })
  }

  // Node selection
  const handleNodeSelect = (node: NodeType) => {
    if (mode === 'edit' && editable) {
      setEditingNode(node)
    }
    if (onNodeSelect) {
      onNodeSelect(node)
    }
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
    if (result.type === 'node' && onNodeSelect) {
      onNodeSelect(result.node)
    }
    setSearchResults([])
    setIsSearchOpen(false)
  }

  // Start editing node geometry
  const startEditing = (node: NodeType) => {
    console.log('Starting edit for node:', node.name)
    setEditingNode(node)
    setEditMode('manual')
    
    // 确保地图已加载
    if (!isMapLoaded || !mapRef.current) {
      console.warn('Map not loaded yet, delaying edit start')
      setTimeout(() => startEditing(node), 500)
      return
    }
    
    // 初始化绘制控件
    if (!drawControlRef.current) {
      initializeDrawControl()
    }
    
    // 调整地图视图到节点位置
    if (node.location) {
      mapRef.current.setView([node.location.lat, node.location.lng], 10)
      console.log('Map view set to node location:', node.location)
    }
    
    if (node.coverage) {
      setCoverage(node.coverage)
      try {
        const geometry = parseGeoJSON(node.coverage)
        setTempGeometry(geometry)
        
        // 在地图上显示当前几何图形
        if (mapRef.current && geometry) {
          // 清除之前的编辑图层
          mapRef.current.eachLayer((layer: any) => {
            if (layer.options && layer.options.isEditLayer) {
              mapRef.current.removeLayer(layer)
            }
          })
          
          // 添加新的几何图形
          const editLayer = L.geoJSON(geometry as any, {
            style: {
              color: '#ef4444',
              weight: 3,
              fillColor: '#ef4444',
              fillOpacity: 0.2,
              isEditLayer: true
            }
          }).addTo(mapRef.current)
          
          // 调整地图视图到几何图形范围
          mapRef.current.fitBounds(editLayer.getBounds())
          console.log('Geometry displayed on map')
        }
        
        // 计算中心点
        const center = calculateCenter(geometry)
        if (center) {
          setLatitude(center.lat.toString())
          setLongitude(center.lng.toString())
        }
      } catch (error) {
        console.error('Error parsing coverage:', error)
      }
    } else {
      // 生成默认覆盖范围
      const defaultCoverage = generateDefaultCoverage(node.location.lat, node.location.lng, 0.01)
      setCoverage(stringifyGeoJSON(defaultCoverage))
      setTempGeometry(defaultCoverage)
      setLatitude(node.location.lat.toString())
      setLongitude(node.location.lng.toString())
      
      // 在地图上显示默认几何图形
      if (mapRef.current && defaultCoverage) {
        const editLayer = L.geoJSON(defaultCoverage as any, {
          style: {
            color: '#ef4444',
            weight: 3,
            fillColor: '#ef4444',
            fillOpacity: 0.2,
            isEditLayer: true
          }
        }).addTo(mapRef.current)
        
        mapRef.current.fitBounds(editLayer.getBounds())
      }
    }
    
    setValidation({ valid: true })
    console.log('Edit mode started successfully')
  }

  // Cancel editing
  const cancelEdit = () => {
    console.log('Canceling edit mode')
    
    // 停止绘制模式
    if (isDrawing) {
      stopDrawing()
    }
    
    // 清理地图上的编辑图层
    if (mapRef.current) {
      mapRef.current.eachLayer((layer: any) => {
        if (layer.options && layer.options.isEditLayer) {
          mapRef.current.removeLayer(layer)
        }
      })
      console.log('Edit layers cleared from map')
    }
    
    setEditingNode(null)
    setTempGeometry(null)
    setCoverage('')
    setLatitude('')
    setLongitude('')
    setValidation({ valid: true })
    console.log('Edit mode canceled')
  }

  // Save edited geometry
  const saveEdit = () => {
    if (!editingNode || !tempGeometry) return
    
    if (onGeometryUpdate) {
      onGeometryUpdate(editingNode.id, tempGeometry)
    }
    
    cancelEdit()
  }

  // Update coverage from coordinates
  const updateCoverageFromCoordinates = () => {
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

  // 初始化绘制控件
  const initializeDrawControl = () => {
    console.log('Draw control initialized (simplified version)')
    // 不使用leaflet-draw，而是使用自定义的绘制逻辑
  }

  // 开始绘制
  const startDrawing = (mode: 'polygon' | 'rectangle' | 'marker' = 'polygon') => {
    if (!mapRef.current || !isMapLoaded) return

    setDrawMode(mode)
    setIsDrawing(true)
    setDrawPoints([])
    
    // 清除之前的临时图层
    if (tempLayer) {
      mapRef.current.removeLayer(tempLayer)
      setTempLayer(null)
    }

    console.log('Started drawing mode:', mode)
  }

  // 停止绘制
  const stopDrawing = () => {
    setIsDrawing(false)
    setDrawPoints([])
    
    // 清除临时图层
    if (tempLayer && mapRef.current) {
      mapRef.current.removeLayer(tempLayer)
      setTempLayer(null)
    }

    console.log('Stopped drawing mode')
  }

  // 完成绘制
  const finishDrawing = () => {
    if (!mapRef.current || drawPoints.length === 0) return

    let geometry: GeoJSONGeometry | null = null

    if (drawMode === 'marker' && drawPoints.length === 1) {
      const [lng, lat] = drawPoints[0]
      geometry = {
        type: 'Point',
        coordinates: [lng, lat]
      }
      
      // 更新位置坐标
      setLatitude(lat.toString())
      setLongitude(lng.toString())
    } else if (drawMode === 'polygon' && drawPoints.length >= 3) {
      // 闭合多边形
      const coordinates = [...drawPoints, drawPoints[0]]
      geometry = {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    } else if (drawMode === 'rectangle' && drawPoints.length === 2) {
      const [lng1, lat1] = drawPoints[0]
      const [lng2, lat2] = drawPoints[1]
      
      // 创建矩形坐标
      const coordinates = [
        [lng1, lat1],
        [lng2, lat1],
        [lng2, lat2],
        [lng1, lat2],
        [lng1, lat1]
      ]
      geometry = {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    }

    if (geometry) {
      setTempGeometry(geometry)
      setCoverage(stringifyGeoJSON(geometry))
      
      // 如果不是点，计算中心点
      if (drawMode !== 'marker') {
        const center = calculateCenter(geometry)
        if (center) {
          setLatitude(center.lat.toString())
          setLongitude(center.lng.toString())
        }
      }

      // 自动保存几何图形
      if (editingNode && onGeometryUpdate) {
        onGeometryUpdate(editingNode.id, geometry)
      }
    }

    stopDrawing()
  }

  // 处理绘制创建事件
  const handleDrawCreated = (e: any) => {
    const layer = e.layer
    const type = e.layerType

    console.log('Draw created:', type, layer)

    // 清除之前的编辑图层
    if (mapRef.current) {
      mapRef.current.eachLayer((layer: any) => {
        if (layer.options && layer.options.isEditLayer) {
          mapRef.current.removeLayer(layer)
        }
      })
    }

    // 标记为编辑图层
    layer.options.isEditLayer = true

    // 根据绘制类型生成GeoJSON
    let geometry: GeoJSONGeometry | null = null

    if (type === 'polygon') {
      const latlngs = layer.getLatLngs()[0]
      const coordinates = latlngs.map((latlng: any) => [latlng.lng, latlng.lat])
      // 闭合多边形
      coordinates.push(coordinates[0])
      
      geometry = {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    } else if (type === 'rectangle') {
      const bounds = layer.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      
      geometry = {
        type: 'Polygon',
        coordinates: [
          [
            [sw.lng, sw.lat],
            [ne.lng, sw.lat],
            [ne.lng, ne.lat],
            [sw.lng, ne.lat],
            [sw.lng, sw.lat]
          ]
        ]
      }
    } else if (type === 'marker') {
      const latlng = layer.getLatLng()
      
      geometry = {
        type: 'Point',
        coordinates: [latlng.lng, latlng.lat]
      }
      
      // 更新位置坐标
      setLatitude(latlng.lat.toString())
      setLongitude(latlng.lng.toString())
    }

    if (geometry) {
      setTempGeometry(geometry)
      setCoverage(stringifyGeoJSON(geometry))
      
      // 如果是点，不需要计算中心点，直接使用点的坐标
      if (type !== 'marker') {
        // 计算中心点
        const center = calculateCenter(geometry)
        if (center) {
          setLatitude(center.lat.toString())
          setLongitude(center.lng.toString())
        }
      }

      // 自动保存几何图形
      if (editingNode && onGeometryUpdate) {
        onGeometryUpdate(editingNode.id, geometry)
      }
    }

    // 退出绘制模式
    stopDrawing()
  }

  // 处理绘制编辑事件
  const handleDrawEdited = (e: any) => {
    const layers = e.layers
    layers.eachLayer((layer: any) => {
      console.log('Layer edited:', layer)
      
      // 将编辑后的图层转换为GeoJSON
      const geojson = layer.toGeoJSON()
      if (geojson && geojson.geometry) {
        const geometry = geojson.geometry as GeoJSONGeometry
        setTempGeometry(geometry)
        setCoverage(stringifyGeoJSON(geometry))
        
        // 计算中心点
        const center = calculateCenter(geometry)
        if (center) {
          setLatitude(center.lat.toString())
          setLongitude(center.lng.toString())
        }

        // 自动保存几何图形
        if (editingNode && onGeometryUpdate) {
          onGeometryUpdate(editingNode.id, geometry)
        }
      }
    })
  }

  // 处理绘制删除事件
  const handleDrawDeleted = (e: any) => {
    console.log('Draw deleted:', e)
    setTempGeometry(null)
    setCoverage('')
    setLatitude('')
    setLongitude('')
  }

  // 开始绘制
  const startDrawing = (mode: 'polygon' | 'rectangle' | 'marker' = 'polygon') => {
    if (!mapRef.current || !drawControlRef.current) return

    setDrawMode(mode)
    setIsDrawing(true)

    // 添加绘制控件到地图
    drawControlRef.current.addTo(mapRef.current)

    // 根据模式启用相应的绘制工具
    setTimeout(() => {
      if (mode === 'polygon') {
        // 查找并点击多边形绘制按钮
        const polygonButton = document.querySelector('.leaflet-draw-draw-polygon') as HTMLElement
        if (polygonButton) {
          polygonButton.click()
        }
      } else if (mode === 'rectangle') {
        // 查找并点击矩形绘制按钮
        const rectangleButton = document.querySelector('.leaflet-draw-draw-rectangle') as HTMLElement
        if (rectangleButton) {
          rectangleButton.click()
        }
      } else if (mode === 'marker') {
        // 查找并点击标记绘制按钮
        const markerButton = document.querySelector('.leaflet-draw-draw-marker') as HTMLElement
        if (markerButton) {
          markerButton.click()
        }
      }
    }, 100)

    console.log('Started drawing mode:', mode)
  }

  // 停止绘制
  const stopDrawing = () => {
    if (!mapRef.current || !drawControlRef.current) return

    setIsDrawing(false)
    
    // 从地图移除绘制控件
    try {
      mapRef.current.removeControl(drawControlRef.current)
    } catch (error) {
      console.warn('Error removing draw control:', error)
    }

    console.log('Stopped drawing mode')
  }

  // 处理地图点击设置位置
  const handleMapClick = (e: any) => {
    if (!editingNode || !isMapLoaded) return

    const lat = e.latlng.lat
    const lng = e.latlng.lng

    console.log('Map clicked at:', lat, lng)

    // 如果在绘制模式下，添加绘制点
    if (isDrawing) {
      const newPoint: [number, number] = [lng, lat]
      const newPoints = [...drawPoints, newPoint]
      setDrawPoints(newPoints)

      // 清除之前的临时图层
      if (tempLayer && mapRef.current) {
        mapRef.current.removeLayer(tempLayer)
      }

      // 创建新的临时图层
      if (drawMode === 'marker') {
        // 标记模式
        const marker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        }).addTo(mapRef.current)
        
        setTempLayer(marker)
        
        // 标记模式只需要一个点，自动完成
        setTimeout(() => finishDrawing(), 100)
      } else if (drawMode === 'polygon' && newPoints.length >= 3) {
        // 多边形模式
        const latlngs = newPoints.map(([lng, lat]) => [lat, lng])
        const polygon = L.polygon(latlngs, {
          color: '#ef4444',
          weight: 3,
          fillColor: '#ef4444',
          fillOpacity: 0.2
        }).addTo(mapRef.current)
        
        setTempLayer(polygon)
      } else if (drawMode === 'rectangle' && newPoints.length === 2) {
        // 矩形模式
        const [[lng1, lat1], [lng2, lat2]] = newPoints
        const bounds = L.latLngBounds([lat1, lng1], [lat2, lng2])
        const rectangle = L.rectangle(bounds, {
          color: '#ef4444',
          weight: 3,
          fillColor: '#ef4444',
          fillOpacity: 0.2
        }).addTo(mapRef.current)
        
        setTempLayer(rectangle)
        
        // 矩形模式只需要两个点，自动完成
        setTimeout(() => finishDrawing(), 100)
      } else if (drawMode === 'polygon') {
        // 多边形模式，显示临时线条
        const latlngs = newPoints.map(([lng, lat]) => [lat, lng])
        const polyline = L.polyline(latlngs, {
          color: '#ef4444',
          weight: 3
        }).addTo(mapRef.current)
        
        setTempLayer(polyline)
      }

      return
    }

    // 如果在编辑模式下，更新位置坐标
    setLatitude(lat.toString())
    setLongitude(lng.toString())

    // 如果没有覆盖范围，创建一个默认的覆盖范围
    if (!tempGeometry) {
      const bbox = createBoundingBoxPolygon({
        minLng: lng - 0.01,
        minLat: lat - 0.01,
        maxLng: lng + 0.01,
        maxLat: lat + 0.01
      })
      setTempGeometry(bbox)
      setCoverage(stringifyGeoJSON(bbox))

      // 在地图上显示覆盖范围
      if (mapRef.current) {
        const editLayer = L.geoJSON(bbox as any, {
          style: {
            color: '#ef4444',
            weight: 3,
            fillColor: '#ef4444',
            fillOpacity: 0.2,
            isEditLayer: true
          }
        }).addTo(mapRef.current)
      }

      // 自动保存
      if (onGeometryUpdate) {
        onGeometryUpdate(editingNode.id, bbox)
      }
    }
  }

  // 组件挂载和尺寸处理
  useEffect(() => {
    setIsMounted(true)
    
    // 延迟初始化地图，确保容器已渲染
    const timer = setTimeout(() => {
      initializeMap()
    }, 200)
    
    return () => {
      clearTimeout(timer)
      // 清理地图
      cleanupMap()
    }
  }, [])

  // 处理外部编辑请求
  useEffect(() => {
    const handleStartNodeEdit = (event: CustomEvent) => {
      const node = event.detail
      console.log('Received external edit request for node:', node.name)
      startEditing(node)
    }
    
    window.addEventListener('start-node-edit', handleStartNodeEdit as EventListener)
    
    return () => {
      window.removeEventListener('start-node-edit', handleStartNodeEdit as EventListener)
    }
  }, [isMapLoaded])

  // 监听外部selectedNode变化
  useEffect(() => {
    if (selectedNode && mode === 'edit' && editable && isMapLoaded) {
      console.log('External selectedNode changed, starting edit for:', selectedNode.name)
      // 确保editingNode与外部selectedNode同步
      if (!editingNode || editingNode.id !== selectedNode.id) {
        startEditing(selectedNode)
      }
    } else if (!selectedNode && editingNode) {
      console.log('External selectedNode cleared, canceling edit mode')
      cancelEdit()
    }
  }, [selectedNode, mode, editable, isMapLoaded])

  // 监听编辑模式变化
  useEffect(() => {
    if (mode === 'edit' && editable && selectedNode && isMapLoaded) {
      console.log('Entering edit mode for node:', selectedNode.name)
      // 自动启动编辑模式
      startEditing(selectedNode)
    } else if (mode !== 'edit' && editingNode) {
      console.log('Exiting edit mode')
      cancelEdit()
    }
  }, [mode, editable, selectedNode, isMapLoaded])

  // 监听容器尺寸变化
  useEffect(() => {
    if (!mapContainerRef.current || !mapRef.current) return
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0 && mapRef.current) {
          // 延迟重绘地图，确保DOM更新完成
          setTimeout(() => {
            mapRef.current.invalidateSize()
          }, 100)
        }
      }
    })
    
    resizeObserver.observe(mapContainerRef.current)
    resizeObserverRef.current = resizeObserver
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [isMapLoaded])

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
        
        // 不要移除地图容器，只需要清理地图实例
        if (mapRef.current._container && mapRef.current._container._leaflet_id) {
          mapRef.current.remove()
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
    
    console.log('Adding node markers, nodes:', nodes)
    console.log('Node markers visible:', mapLayers.find(l => l.id === 'nodes')?.visible)
    
    if (!mapLayers.find(l => l.id === 'nodes')?.visible) {
      console.log('Node markers layer is not visible')
      return
    }
    
    nodes.forEach((node) => {
      console.log('Adding marker for node:', node.name, 'location:', node.location)
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
    
    const serviceLayers = services.filter(service => 
      selectedNode ? selectedNode.services.some(ns => ns.includes(service.product)) : true
    )
    
    serviceLayers.forEach((service) => {
      const layer = mapLayers.find(l => l.id === service.product.toLowerCase())
      if (!layer?.visible) return
      
      L.tileLayer.wms(`${service.endpoint}?SERVICE=WMS&VERSION=${service.version}&REQUEST=GetMap`, {
        layers: service.product,
        styles: '',
        format: 'image/png',
        transparent: true,
        opacity: layer.opacity || 0.7
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
  }, [fullscreen, height, editingNode, baseLayer, showNodeMarkers, showServiceLayers])

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

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return '#10b981'
      case 'WARNING':
        return '#f59e0b'
      case 'ERROR':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  // 根据模式获取标题
  const getMapTitle = () => {
    switch (mode) {
      case 'view':
        return '地图视图'
      case 'edit':
        return '地理信息编辑'
      case 'management':
        return '节点地理分布'
      default:
        return '地图'
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
                {getMapTitle()}
              </CardTitle>
              <CardDescription>
                {mode === 'edit' ? '编辑节点地理信息' : 
                 mode === 'management' ? '节点地理分布和状态监控' :
                 '海事数据服务地理分布和实时状态监控'}
              </CardDescription>
            </div>
            
            {/* 根据模式显示不同的控制按钮 */}
            <div className="flex items-center gap-2">
              {mode === 'view' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    搜索
                  </Button>
                </>
              )}
              
              {mode === 'management' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    搜索
                  </Button>
                </>
              )}
              
              {mode === 'edit' && editable && selectedNode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditing(selectedNode)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  编辑地理数据
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreen(!fullscreen)}
              >
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Editing Panel - 只在编辑模式下显示 */}
          {mode === 'edit' && editingNode && (
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
                      type="number"
                      step="0.000001"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="31.2000"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-sm">经度</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="121.5000"
                      className="text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={updateCoverageFromCoordinates}
                    className="w-full"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    从坐标更新范围
                  </Button>
                </div>
                
                {/* Drawing Controls */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">绘制工具</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button
                        size="sm"
                        variant={isDrawing && drawMode === 'polygon' ? 'default' : 'outline'}
                        onClick={() => startDrawing('polygon')}
                        disabled={isDrawing && drawMode !== 'polygon'}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        绘制多边形
                      </Button>
                      <Button
                        size="sm"
                        variant={isDrawing && drawMode === 'rectangle' ? 'default' : 'outline'}
                        onClick={() => startDrawing('rectangle')}
                        disabled={isDrawing && drawMode !== 'rectangle'}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        绘制矩形
                      </Button>
                      <Button
                        size="sm"
                        variant={isDrawing && drawMode === 'marker' ? 'default' : 'outline'}
                        onClick={() => startDrawing('marker')}
                        disabled={isDrawing && drawMode !== 'marker'}
                        className="text-xs"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        绘制点
                      </Button>
                    </div>
                    {isDrawing && (
                      <div className="mt-2 space-y-2">
                        <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                          🎨 绘制模式已激活 - 在地图上绘制{
                            drawMode === 'polygon' ? '多边形' : 
                            drawMode === 'rectangle' ? '矩形' : '点'
                          }
                        </Badge>
                        
                        {drawMode === 'polygon' && (
                          <div className="text-xs text-muted-foreground">
                            已选择 {drawPoints.length} 个点，至少需要3个点来完成多边形
                          </div>
                        )}
                        
                        {drawMode === 'rectangle' && drawPoints.length === 1 && (
                          <div className="text-xs text-muted-foreground">
                            已选择1个点，请点击选择第二个点完成矩形
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={finishDrawing}
                            disabled={drawMode === 'polygon' && drawPoints.length < 3}
                            className="text-xs flex-1"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            完成绘制
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={stopDrawing}
                            className="text-xs flex-1"
                          >
                            <X className="h-3 w-3 mr-1" />
                            取消
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    💡 提示：点击地图设置位置，使用绘制工具创建覆盖范围
                    <br/>
                    📍 绘制点：单击地图放置标记
                    <br/>
                    ⬜ 绘制矩形：点击两个对角点
                    <br/>
                    🔷 绘制多边形：点击至少3个点，然后点击&ldquo;完成绘制&rdquo;
                  </div>
                </div>
                
                {/* Coverage */}
                <div className="space-y-3 md:col-span-2">
                  <div>
                    <Label htmlFor="coverage" className="text-sm">覆盖范围 (GeoJSON)</Label>
                    <Textarea
                      id="coverage"
                      value={coverage}
                      onChange={(e) => {
                        setCoverage(e.target.value)
                        try {
                          const geometry = parseGeoJSON(e.target.value)
                          setTempGeometry(geometry)
                          setValidation({ valid: true })
                        } catch (error) {
                          setValidation({ valid: false, error: 'GeoJSON格式无效' })
                        }
                      }}
                      placeholder={`{"type": "Polygon", "coordinates": [[[120.0, 31.0], [122.0, 31.0], [122.0, 32.0], [120.0, 32.0], [120.0, 31.0]]]}`}
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
              display: 'block',
              overflow: 'hidden',
              boxSizing: 'border-box',
              zIndex: 1
            }}
            className="map-container rounded-b-lg"
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
            {isMapLoaded && displayConfig?.showLegendPanel && (
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
    </div>
  )
})

SharedMap.displayName = 'SharedMap'

export default SharedMap