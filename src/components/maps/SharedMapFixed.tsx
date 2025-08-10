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

// Dynamically import LeafletMapSimple to avoid SSR issues
const LeafletMapComponent = dynamic(
  () => import('./LeafletMapSimple'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
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
  const [coverage, setCoverage] = useState('')
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
          // 动态导入Leaflet
          import('leaflet').then(L => {
            const layer = L.default.geoJSON(geometry as any, {
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
          })
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
  const initializeMap = () => {
    if (mapRef.current) {
      console.log('Map already initialized')
      return
    }

    setIsInitializing(true)
    setMapError(null)
    
    try {
      console.log('Starting map initialization...')
      
      console.log('Leaflet imported successfully')
      
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
      const L = require('leaflet')
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
      
      // 如果在绘制模式下，处理地图点击以添加绘制点
      if (isDrawing && editingNode) {
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
    if (!map) return

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
          const L = require('leaflet')
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
      if (mapRef.current) {
        const L = require('leaflet')
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
  }

  // Handle map click for editing
  const handleMapClick = (e: any) => {
    console.log('Handling map click:', e.latlng)
    
    if (!editingNode) {
      console.warn('No editing node selected')
      return
    }
    
    const { lat, lng } = e.latlng
    
    if (editMode === 'point') {
      // 设置节点位置
      setLatitude(lat.toString())
      setLongitude(lng.toString())
      
      // 创建点几何图形
      const pointGeometry = createPoint(lat, lng)
      setTempGeometry(pointGeometry)
      setCoverage(stringifyGeoJSON(pointGeometry))
      
      // 在地图上显示点
      if (mapRef.current) {
        const L = require('leaflet')
        // 清除之前的编辑图层
        mapRef.current.eachLayer((layer: any) => {
          if (layer.options && layer.options.isEditLayer) {
            mapRef.current.removeLayer(layer)
          }
        })
        
        // 添加新的点
        L.marker([lat, lng], {
          isEditLayer: true
        }).addTo(mapRef.current)
      }
      
    } else if (editMode === 'bbox') {
      // 处理边界框绘制
      if (!drawPoints.length) {
        // 第一个点
        setDrawPoints([[lat, lng]])
      } else {
        // 第二个点，完成边界框
        const bboxPoints = [...drawPoints, [lat, lng]]
        setDrawPoints([])
        
        // 创建边界框几何图形
        const bboxGeometry = createBoundingBoxPolygon(bboxPoints[0], bboxPoints[1])
        setTempGeometry(bboxGeometry)
        setCoverage(stringifyGeoJSON(bboxGeometry))
        
        // 在地图上显示边界框
        if (mapRef.current) {
          const L = require('leaflet')
          // 清除之前的编辑图层
          mapRef.current.eachLayer((layer: any) => {
            if (layer.options && layer.options.isEditLayer) {
              mapRef.current.removeLayer(layer)
            }
          })
          
          // 添加新的边界框
          L.geoJSON(bboxGeometry as any, {
            style: {
              color: '#ef4444',
              weight: 3,
              fillColor: '#ef4444',
              fillOpacity: 0.2,
              isEditLayer: true
            }
          }).addTo(mapRef.current)
        }
      }
      
    } else if (isDrawing) {
      // 处理多边形绘制
      const newPoints = [...drawPoints, [lat, lng]]
      setDrawPoints(newPoints)
      
      // 在地图上显示临时多边形
      if (mapRef.current) {
        const L = require('leaflet')
        
        // 清除之前的临时图层
        if (tempLayer) {
          mapRef.current.removeLayer(tempLayer)
          setTempLayer(null)
        }
        
        // 创建多边形几何图形
        if (newPoints.length >= 3) {
          // 闭合多边形
          const closedPoints = [...newPoints, newPoints[0]]
          const polygonGeometry = {
            type: 'Polygon',
            coordinates: [closedPoints.map(p => [p[1], p[0]])]
          }
          
          const layer = L.geoJSON(polygonGeometry as any, {
            style: {
              color: '#ef4444',
              weight: 3,
              fillColor: '#ef4444',
              fillOpacity: 0.2,
              isEditLayer: true
            }
          }).addTo(mapRef.current)
          
          setTempLayer(layer)
        } else {
          // 显示点之间的连线
          const latlngs = newPoints.map(p => [p[0], p[1]])
          const polyline = L.polyline(latlngs, {
            color: '#ef4444',
            weight: 3,
            isEditLayer: true
          }).addTo(mapRef.current)
          
          setTempLayer(polyline)
        }
      }
    }
  }

  // Start drawing
  const startDrawing = (mode: 'polygon' | 'rectangle' | 'marker') => {
    if (!editingNode) {
      console.warn('No editing node selected')
      return
    }
    
    console.log('Starting drawing mode:', mode)
    setDrawMode(mode)
    setIsDrawing(true)
    setDrawPoints([])
    
    // 清除之前的临时图层
    if (tempLayer && mapRef.current) {
      mapRef.current.removeLayer(tempLayer)
      setTempLayer(null)
    }
    
    if (mode === 'rectangle') {
      setEditMode('bbox')
    } else if (mode === 'marker') {
      setEditMode('point')
    }
  }

  // Finish drawing
  const finishDrawing = () => {
    if (!editingNode || !isDrawing) {
      return
    }
    
    console.log('Finishing drawing')
    
    if (drawMode === 'polygon' && drawPoints.length >= 3) {
      // 创建多边形几何图形
      const closedPoints = [...drawPoints, drawPoints[0]]
      const polygonGeometry = {
        type: 'Polygon',
        coordinates: [closedPoints.map(p => [p[1], p[0]])]
      }
      
      setTempGeometry(polygonGeometry)
      setCoverage(stringifyGeoJSON(polygonGeometry))
      
      // 在地图上显示最终多边形
      if (mapRef.current) {
        const L = require('leaflet')
        
        // 清除之前的临时图层
        if (tempLayer) {
          mapRef.current.removeLayer(tempLayer)
        }
        
        // 添加最终多边形
        const layer = L.geoJSON(polygonGeometry as any, {
          style: {
            color: '#ef4444',
            weight: 3,
            fillColor: '#ef4444',
            fillOpacity: 0.2,
            isEditLayer: true
          }
        }).addTo(mapRef.current)
        
        setTempLayer(layer)
      }
    }
    
    // 重置绘制状态
    setIsDrawing(false)
    setDrawPoints([])
    setEditMode('manual')
  }

  // Cancel drawing
  const cancelDrawing = () => {
    console.log('Canceling drawing')
    
    // 清除临时图层
    if (tempLayer && mapRef.current) {
      mapRef.current.removeLayer(tempLayer)
      setTempLayer(null)
    }
    
    // 重置绘制状态
    setIsDrawing(false)
    setDrawPoints([])
    setEditMode('manual')
  }

  // Save geometry changes
  const saveGeometry = () => {
    if (!editingNode || !tempGeometry) {
      return
    }
    
    console.log('Saving geometry for node:', editingNode.name)
    
    // 验证几何图形
    if (!validateGeoJSON(tempGeometry)) {
      setValidation({ valid: false, error: '几何图形格式无效' })
      return
    }
    
    // 更新节点
    const updates: Partial<NodeType> = {
      coverage: stringifyGeoJSON(tempGeometry),
      latitude: parseFloat(latitude) || editingNode.location.lat,
      longitude: parseFloat(longitude) || editingNode.location.lng
    }
    
    if (onNodeUpdate) {
      onNodeUpdate(editingNode.id, updates)
    }
    
    if (onGeometryUpdate) {
      onGeometryUpdate(editingNode.id, tempGeometry)
    }
    
    setValidation({ valid: true })
    console.log('Geometry saved successfully')
  }

  // Cancel editing
  const cancelEdit = () => {
    console.log('Canceling edit')
    
    // 清除编辑图层
    if (mapRef.current) {
      mapRef.current.eachLayer((layer: any) => {
        if (layer.options && layer.options.isEditLayer) {
          mapRef.current.removeLayer(layer)
        }
      })
    }
    
    // 重置状态
    setEditingNode(null)
    setTempGeometry(null)
    setCoverage('')
    setLatitude('')
    setLongitude('')
    setValidation({ valid: true })
    setIsDrawing(false)
    setDrawPoints([])
    setEditMode('manual')
    
    if (tempLayer) {
      setTempLayer(null)
    }
  }

  // Add base layer
  const addBaseLayer = (map: any) => {
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
        tileUrl = baseMapConfig?.customUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution = baseMapConfig?.attribution || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <strong>显示坐标: WGS84</strong>'
        break
      default:
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <strong>显示坐标: WGS84</strong>'
    }
    
    const L = require('leaflet')
    L.tileLayer(tileUrl, {
      attribution,
      minZoom: 1,
      maxZoom: 18,
      noWrap: true,
      updateWhenIdle: false,
      updateWhenZooming: true,
      keepBuffer: 4,
      bounds: [[-90, -180], [90, 180]],
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0
    }).addTo(map)
  }

  // Add node markers
  const addNodeMarkers = (map: any) => {
    const L = require('leaflet')
    
    nodes.forEach(node => {
      if (!node.location) return
      
      // 根据节点健康状态选择颜色
      let markerColor = '#3b82f6' // 默认蓝色
      if (node.healthStatus === 'WARNING') {
        markerColor = '#f59e0b' // 黄色
      } else if (node.healthStatus === 'ERROR') {
        markerColor = '#ef4444' // 红色
      }
      
      // 创建自定义图标
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${markerColor};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
      
      const marker = L.marker([node.location.lat, node.location.lng], {
        icon: customIcon,
        title: node.name
      }).addTo(map)
      
      // 添加点击事件
      marker.on('click', () => {
        handleNodeSelect(node)
      })
      
      // 添加弹出窗口
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${node.name}</h3>
          <p style="margin: 0 0 8px 0; color: #666;">${node.description || '无描述'}</p>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 12px; background-color: ${
              node.healthStatus === 'HEALTHY' ? '#10b981' : 
              node.healthStatus === 'WARNING' ? '#f59e0b' : '#ef4444'
            }; color: white;">
              ${node.healthStatus === 'HEALTHY' ? '正常' : 
                node.healthStatus === 'WARNING' ? '警告' : '错误'}
            </span>
            <span style="font-size: 12px; color: #666;">级别: ${node.level}</span>
          </div>
          <div style="font-size: 12px; color: #666;">
            服务数量: ${node.services.length}
          </div>
        </div>
      `)
    })
  }

  // Add service layers
  const addServiceLayers = (map: any) => {
    const L = require('leaflet')
    
    services.forEach(service => {
      if (!service.coverage) return
      
      try {
        const geometry = parseGeoJSON(service.coverage)
        if (!geometry) return
        
        // 根据服务状态选择颜色
        let layerColor = '#10b981' // 默认绿色
        if (service.status === 'MAINTENANCE') {
          layerColor = '#f59e0b' // 黄色
        } else if (service.status === 'ERROR') {
          layerColor = '#ef4444' // 红色
        }
        
        const layer = L.geoJSON(geometry as any, {
          style: {
            color: layerColor,
            weight: 2,
            fillColor: layerColor,
            fillOpacity: 0.1
          }
        }).addTo(map)
        
        // 添加弹出窗口
        layer.bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${service.name}</h3>
            <p style="margin: 0 0 8px 0; color: #666;">${service.product}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 12px; background-color: ${
                service.status === 'ACTIVE' ? '#10b981' : 
                service.status === 'MAINTENANCE' ? '#f59e0b' : '#ef4444'
              }; color: white;">
                ${service.status === 'ACTIVE' ? '运行中' : 
                  service.status === 'MAINTENANCE' ? '维护中' : '错误'}
              </span>
              <span style="font-size: 12px; color: #666;">${service.type}</span>
            </div>
            <div style="font-size: 12px; color: #666;">
              版本: ${service.version}
            </div>
          </div>
        `)
        
      } catch (error) {
        console.error('Error adding service layer:', error)
      }
    })
  }

  // Cleanup map
  const cleanupMap = () => {
    if (mapRef.current) {
      try {
        console.log('Cleaning up map...')
        mapRef.current.off()
        mapRef.current.eachLayer((layer: any) => {
          mapRef.current?.removeLayer(layer)
        })
        const container = mapRef.current.getContainer()
        if (container && container.parentNode) {
          container.parentNode.removeChild(container)
        }
        mapRef.current = null
        console.log('Map cleaned up successfully')
      } catch (error) {
        console.warn('Error cleaning up map:', error)
        mapRef.current = null
      }
    }
  }

  // Initialize draw control
  const initializeDrawControl = () => {
    if (!mapRef.current || drawControlRef.current) return
    
    console.log('Initializing draw control...')
    
    // 不使用leaflet-draw，而是使用自定义的绘制逻辑
    drawControlRef.current = {
      enable: () => {
        console.log('Draw control enabled')
      },
      disable: () => {
        console.log('Draw control disabled')
      }
    }
    
    setDrawControl(drawControlRef.current)
  }

  // Update map when nodes or services change
  useEffect(() => {
    if (isMapLoaded && mapRef.current) {
      // 清除现有图层
      mapRef.current.eachLayer((layer: any) => {
        if (!layer.options || !layer.options.isBaseLayer) {
          mapRef.current?.removeLayer(layer)
        }
      })
      
      // 重新添加图层
      if (showNodeMarkers) {
        addNodeMarkers(mapRef.current)
      }
      
      if (showServiceLayers) {
        addServiceLayers(mapRef.current)
      }
    }
  }, [nodes, services, showNodeMarkers, showServiceLayers, isMapLoaded])

  // Update map when base layer changes
  useEffect(() => {
    if (isMapLoaded && mapRef.current) {
      // 清除基础图层
      mapRef.current.eachLayer((layer: any) => {
        if (layer.options && layer.options.isBaseLayer) {
          mapRef.current?.removeLayer(layer)
        }
      })
      
      // 添加新的基础图层
      addBaseLayer(mapRef.current)
    }
  }, [baseLayer, isMapLoaded])

  // Handle map container resize
  useEffect(() => {
    if (!mapContainerRef.current) return
    
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current && isMapLoaded) {
        mapRef.current.invalidateSize()
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

  // Initialize map when component mounts
  useEffect(() => {
    setIsMounted(true)
    
    // Add event listener for node editing
    const handleNodeEditEvent = (event: CustomEvent) => {
      console.log('Received node edit event:', event.detail)
      if (event.detail && mode === 'edit' && editable) {
        startEditing(event.detail)
      }
    }
    
    window.addEventListener('start-node-edit', handleNodeEditEvent as EventListener)
    
    return () => {
      cleanupMap()
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
      window.removeEventListener('start-node-edit', handleNodeEditEvent as EventListener)
    }
  }, [])

  // Initialize map when mounted and container is ready
  useEffect(() => {
    if (isMounted && mapContainerRef.current && !isMapLoaded && !isInitializing) {
      initializeMap()
    }
  }, [isMounted, mapContainerRef.current, isMapLoaded, isInitializing])

  // Handle editing node changes
  useEffect(() => {
    if (editingNode && mode === 'edit' && editable && isMapLoaded) {
      startEditing(editingNode)
    }
  }, [editingNode, mode, editable, isMapLoaded])

  // Handle preview service changes
  useEffect(() => {
    if (previewService && isMapLoaded) {
      handlePreviewOnMap(previewService)
    }
  }, [previewService, isMapLoaded])

  // Render map container
  return (
    <div className="relative w-full" style={{ height }}>
      {/* Map container */}
      <div 
        ref={mapContainerRef}
        className="w-full h-full bg-gray-100 rounded-lg overflow-hidden"
        style={{ height }}
      >
        {/* Loading indicator */}
        {isInitializing && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
            <MapLoadingIndicator message="正在初始化地图..." />
          </div>
        )}
        
        {/* Error message */}
        {mapError && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center p-6">
              <div className="text-red-500 mb-4">
                <AlertTriangle size={48} />
              </div>
              <h3 className="text-lg font-semibold mb-2">地图加载失败</h3>
              <p className="text-gray-600 mb-4">{mapError}</p>
              <Button onClick={retryMapInitialization} variant="outline">
                重试
              </Button>
            </div>
          </div>
        )}
        
        {/* Map content will be rendered here by Leaflet */}
      </div>
      
      {/* Search control */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-white rounded-lg shadow-lg p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search size={16} />
          </Button>
          
          {isSearchOpen && (
            <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg p-2 w-64">
              <Input
                placeholder="搜索节点或服务..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="mb-2"
              />
              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                      onClick={() => handleResultSelect(result)}
                    >
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-gray-500">
                        {result.type === 'node' ? '节点' : '服务'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Layer control */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-white rounded-lg shadow-lg p-2">
          <h4 className="font-medium mb-2">图层</h4>
          {mapLayers.map((layer) => (
            <div key={layer.id} className="flex items-center mb-1">
              <Checkbox
                id={`layer-${layer.id}`}
                checked={layer.visible}
                onCheckedChange={(checked) => handleLayerToggle(layer.id, checked as boolean)}
              />
              <Label htmlFor={`layer-${layer.id}`} className="ml-2 text-sm">
                {layer.icon} {layer.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Coordinate display */}
      {showCoordinates && (
        <div className="absolute bottom-4 right-4 z-20">
          <CoordinateDisplay
            map={mapRef.current}
            format="WGS84"
          />
        </div>
      )}
      
      {/* Edit controls */}
      {mode === 'edit' && editable && editingNode && (
        <div className="absolute top-20 left-4 z-20">
          <div className="bg-white rounded-lg shadow-lg p-4 w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">编辑节点几何图形</h3>
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X size={16} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">节点名称</Label>
                <div className="text-sm text-gray-600">{editingNode.name}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm font-medium">纬度</Label>
                  <Input
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="纬度"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">经度</Label>
                  <Input
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="经度"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">覆盖范围 (GeoJSON)</Label>
                <Textarea
                  value={coverage}
                  onChange={(e) => setCoverage(e.target.value)}
                  placeholder="GeoJSON 格式的覆盖范围"
                  rows={4}
                />
              </div>
              
              {!validation.valid && (
                <div className="text-red-500 text-sm">
                  {validation.error}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant={editMode === 'point' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => startDrawing('marker')}
                >
                  <MapPin size={16} className="mr-1" />
                  标记
                </Button>
                <Button
                  variant={editMode === 'bbox' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => startDrawing('rectangle')}
                >
                  <Maximize2 size={16} className="mr-1" />
                  矩形
                </Button>
                <Button
                  variant={isDrawing ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => startDrawing('polygon')}
                >
                  <Plus size={16} className="mr-1" />
                  多边形
                </Button>
              </div>
              
              {isDrawing && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={finishDrawing}>
                    <CheckCircle size={16} className="mr-1" />
                    完成
                  </Button>
                  <Button variant="outline" size="sm" onClick={cancelDrawing}>
                    <X size={16} className="mr-1" />
                    取消
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button size="sm" onClick={saveGeometry}>
                  <Save size={16} className="mr-1" />
                  保存
                </Button>
                <Button variant="outline" size="sm" onClick={cancelEdit}>
                  取消
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Legend */}
      {displayConfig?.showLegendPanel && (
        <div className="absolute top-4 left-20 z-20">
          <MapLegend
            nodes={nodes}
            services={services}
            position={displayConfig.layerPanelPosition}
          />
        </div>
      )}
    </div>
  )
})

SharedMap.displayName = 'SharedMap'

export default SharedMap