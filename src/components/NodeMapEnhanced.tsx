'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Layers, 
  MapPin, 
  Activity, 
  Search, 
  Edit, 
  Save, 
  X,
  Filter,
  Satellite,
  Grid,
  Square,
  Circle,
  Pencil,
  Trash2,
  Download,
  Upload,
  Plus
} from 'lucide-react'

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
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
)
const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
)
const FeatureGroup = dynamic(
  () => import('react-leaflet').then((mod) => mod.FeatureGroup),
  { ssr: false }
)
const useMap = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMap),
  { ssr: false }
)
const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
)

// Map click handler component for editing
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

// Leaflet Draw Controls Component
function DrawControls({ 
  onDrawStart, 
  onDrawEnd, 
  onEditStart, 
  onEditEnd, 
  onDelete,
  enabled,
  selectedNode,
  drawMode
}: {
  onDrawStart: (type: string) => void
  onDrawEnd: (feature: any) => void
  onEditStart: () => void
  onEditEnd: (feature: any) => void
  onDelete: (featureId: string) => void
  enabled: boolean
  selectedNode: any
  drawMode: string | null
}) {
  const map = useMap()
  const drawControlRef = useRef<any>(null)

  useEffect(() => {
    if (!map || !enabled || !selectedNode) return

    // Dynamically import leaflet-draw
    const initDrawControl = async () => {
      const L = await import('leaflet')
      await import('leaflet-draw')

      // Initialize draw control
      const drawnItems = new L.FeatureGroup()
      map.addLayer(drawnItems)

      const drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
          polygon: {
            allowIntersection: false,
            drawError: {
              color: '#e1e100',
              message: '<strong>Error:</strong> Shape edges cannot cross!'
            },
            shapeOptions: {
              color: '#3b82f6',
              weight: 2,
              fillColor: '#3b82f6',
              fillOpacity: 0.2
            }
          },
          polyline: {
            shapeOptions: {
              color: '#10b981',
              weight: 3
            }
          },
          rect: {
            shapeOptions: {
              color: '#f59e0b',
              weight: 2,
              fillColor: '#f59e0b',
              fillOpacity: 0.2
            }
          },
          circle: {
            shapeOptions: {
              color: '#8b5cf6',
              weight: 2,
              fillColor: '#8b5cf6',
              fillOpacity: 0.2
            }
          },
          marker: {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: '<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })
          }
        },
        edit: {
          featureGroup: drawnItems,
          remove: true
        }
      })

      map.addControl(drawControl)
      drawControlRef.current = { drawControl, drawnItems }

      // Handle draw events
      map.on(L.Draw.Event.CREATED, function (event: any) {
        const layer = event.layer
        const type = event.layerType
        
        let geometry: any
        let featureType: string

        switch (type) {
          case 'marker':
            const latlng = layer.getLatLng()
            geometry = {
              type: 'Point',
              coordinates: [latlng.lng, latlng.lat]
            }
            featureType = 'Point'
            break
          case 'polyline':
            const latlngs = layer.getLatLngs()
            geometry = {
              type: 'LineString',
              coordinates: latlngs.map((ll: any) => [ll.lng, ll.lat])
            }
            featureType = 'LineString'
            break
          case 'polygon':
            const polygonLatLngs = layer.getLatLngs()[0]
            geometry = {
              type: 'Polygon',
              coordinates: [[...polygonLatLngs.map((ll: any) => [ll.lng, ll.lat]), polygonLatLngs[0] ? [polygonLatLngs[0].lng, polygonLatLngs[0].lat] : []]]
            }
            featureType = 'Polygon'
            break
          case 'rectangle':
            const bounds = layer.getBounds()
            const ne = bounds.getNorthEast()
            const sw = bounds.getSouthWest()
            geometry = {
              type: 'Polygon',
              coordinates: [[
                [sw.lng, sw.lat],
                [ne.lng, sw.lat],
                [ne.lng, ne.lat],
                [sw.lng, ne.lat],
                [sw.lng, sw.lat]
              ]]
            }
            featureType = 'Rectangle'
            break
          case 'circle':
            const center = layer.getLatLng()
            const radius = layer.getRadius()
            geometry = {
              type: 'Point',
              coordinates: [center.lng, center.lat],
              properties: { radius }
            }
            featureType = 'Circle'
            break
          default:
            return
        }

        const feature = {
          id: `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: featureType,
          geometry,
          properties: {
            nodeId: selectedNode.id,
            created: new Date().toISOString(),
            type: featureType
          },
          style: {
            color: type === 'marker' ? '#ef4444' : 
                   type === 'polyline' ? '#10b981' : 
                   type === 'polygon' ? '#3b82f6' : 
                   type === 'rectangle' ? '#f59e0b' : '#8b5cf6',
            weight: 2,
            fillColor: type === 'marker' ? '#ef4444' : 
                      type === 'polyline' ? '#10b981' : 
                      type === 'polygon' ? '#3b82f6' : 
                      type === 'rectangle' ? '#f59e0b' : '#8b5cf6',
            fillOpacity: 0.2
          }
        }

        drawnItems.addLayer(layer)
        onDrawEnd(feature)
      })

      map.on(L.Draw.Event.EDITSTART, onEditStart)
      map.on(L.Draw.Event.EDITED, function (event: any) {
        const layers = event.layers
        layers.eachLayer(function (layer: any) {
          // Handle edited features
          const feature = {
            id: 'edited_feature',
            type: 'edited',
            geometry: {},
            properties: { nodeId: selectedNode.id }
          }
          onEditEnd(feature)
        })
      })

      map.on(L.Draw.Event.DELETED, function (event: any) {
        const layers = event.layers
        layers.eachLayer(function (layer: any) {
          onDelete('deleted_feature')
        })
      })
    }

    initDrawControl()

    return () => {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current.drawControl)
        map.removeLayer(drawControlRef.current.drawnItems)
      }
    }
  }, [map, enabled, selectedNode, onDrawEnd, onEditStart, onEditEnd, onDelete])

  return null
}

interface Node {
  id: string
  name: string
  type: string
  level: number
  description?: string
  apiUrl: string
  adminUrl?: string
  coverage?: string
  isActive: boolean
  healthStatus: string
  lastHealthCheck?: string
  parentId?: string
  parent?: any
  children?: any[]
  capabilities?: any[]
  _count?: {
    datasets: number
    childNodeRelations: number
  }
  location?: {
    lat: number
    lng: number
  }
  geometry?: {
    type: string
    coordinates: any
  }
}

interface NodeMapProps {
  nodes: Node[]
  selectedNode?: Node | null
  onNodeSelect?: (node: Node) => void
  onNodeUpdate?: (nodeId: string, updates: Partial<Node>) => void
  className?: string
}

// Map layer types
interface MapLayer {
  id: string
  name: string
  type: 'nodes' | 'services' | 'coverage' | 'geometry' | 'custom'
  visible: boolean
  color?: string
}

// Search result interface
interface SearchResult {
  id: string
  type: 'node' | 'service'
  name: string
  location: { lat: number; lng: number }
  node?: Node
}

// Default center coordinates (China)
const DEFAULT_CENTER: [number, number] = [35.8617, 104.1954]
const DEFAULT_ZOOM = 4

export default function NodeMapEnhanced({ nodes, selectedNode, onNodeSelect, onNodeUpdate, className = '' }: NodeMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER)
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [drawMode, setDrawMode] = useState<string | null>(null)
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    { id: 'nodes', name: '节点位置', type: 'nodes', visible: true },
    { id: 'services', name: '服务覆盖', type: 'services', visible: true },
    { id: 'coverage', name: '覆盖范围', type: 'coverage', visible: true },
    { id: 'geometry', name: '几何信息', type: 'geometry', visible: true }
  ])
  const [tileLayer, setTileLayer] = useState('osm')
  const [nodeFeatures, setNodeFeatures] = useState<any[]>([])
  const [geoJsonInput, setGeoJsonInput] = useState('')
  const [geoJsonError, setGeoJsonError] = useState('')
  const mapRef = useRef<any>(null)

  useEffect(() => {
    setIsClient(true)
    
    // If we have nodes with location data, center the map on the first node
    const nodesWithLocation = nodes.filter(node => node.location)
    if (nodesWithLocation.length > 0) {
      const firstNode = nodesWithLocation[0]
      setMapCenter([firstNode.location!.lat, firstNode.location!.lng])
      setMapZoom(6)
    }

    // Load existing geometries from nodes
    const existingFeatures = nodes
      .filter(node => node.geometry)
      .map(node => ({
        id: `node_${node.id}`,
        type: node.geometry?.type || 'Unknown',
        geometry: node.geometry,
        properties: {
          nodeId: node.id,
          nodeName: node.name,
          type: node.geometry?.type || 'Unknown'
        },
        style: {
          color: '#3b82f6',
          weight: 2,
          fillColor: '#3b82f6',
          fillOpacity: 0.2
        }
      }))
    setNodeFeatures(existingFeatures)
  }, [nodes])

  // Search functionality
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    const results: SearchResult[] = []
    
    // Search nodes
    nodes.forEach(node => {
      if (node.location && (
        node.name.toLowerCase().includes(term.toLowerCase()) ||
        node.type.toLowerCase().includes(term.toLowerCase()) ||
        node.description?.toLowerCase().includes(term.toLowerCase())
      )) {
        results.push({
          id: node.id,
          type: 'node',
          name: node.name,
          location: node.location,
          node
        })
      }
    })

    // Search services within nodes
    nodes.forEach(node => {
      if (node.location && node.capabilities) {
        node.capabilities.forEach(capability => {
          if (
            capability.productType.toLowerCase().includes(term.toLowerCase()) ||
            capability.serviceType.toLowerCase().includes(term.toLowerCase())
          ) {
            results.push({
              id: `${node.id}-${capability.id}`,
              type: 'service',
              name: `${node.name} - ${capability.productType}`,
              location: node.location,
              node
            })
          }
        })
      }
    })

    setSearchResults(results)
  }

  // Focus on search result
  const focusOnResult = (result: SearchResult) => {
    setMapCenter([result.location.lat, result.location.lng])
    setMapZoom(10)
    if (result.node && onNodeSelect) {
      onNodeSelect(result.node)
    }
    setIsSearchOpen(false)
  }

  // Toggle layer visibility
  const toggleLayer = (layerId: string) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ))
  }

  // Start editing node geometry
  const startEditingNode = (node: Node) => {
    setEditingNode(node)
    setIsEditMode(true)
    setDrawMode(null)
    
    // Center map on node
    if (node.location) {
      setMapCenter([node.location.lat, node.location.lng])
      setMapZoom(10)
    }
  }

  // Save edited node geometry
  const saveNodeGeometry = (feature: any) => {
    if (editingNode && onNodeUpdate) {
      const updates: Partial<Node> = {
        geometry: feature.geometry
      }
      
      // If it's a point geometry, also update location
      if (feature.geometry.type === 'Point') {
        updates.location = {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0]
        }
      }
      
      onNodeUpdate(editingNode.id, updates)
      
      // Update features list
      const newFeature = {
        id: `node_${editingNode.id}`,
        type: feature.type,
        geometry: feature.geometry,
        properties: {
          nodeId: editingNode.id,
          nodeName: editingNode.name,
          type: feature.type,
          updated: new Date().toISOString()
        },
        style: feature.style
      }
      
      setNodeFeatures(prev => {
        const filtered = prev.filter(f => f.properties.nodeId !== editingNode.id)
        return [...filtered, newFeature]
      })
    }
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingNode(null)
    setIsEditMode(false)
    setDrawMode(null)
  }

  // Handle feature creation
  const handleFeatureCreated = (feature: any) => {
    if (editingNode) {
      saveNodeGeometry(feature)
    }
  }

  // Handle feature deletion
  const handleFeatureDeleted = (featureId: string) => {
    if (editingNode && onNodeUpdate) {
      onNodeUpdate(editingNode.id, {
        geometry: undefined
      })
      
      // Remove from features list
      setNodeFeatures(prev => prev.filter(f => f.properties.nodeId !== editingNode.id))
    }
  }

  // Import GeoJSON
  const handleImportGeoJSON = () => {
    if (!editingNode) return
    
    try {
      const parsed = JSON.parse(geoJsonInput)
      
      if (!parsed.type || !parsed.coordinates) {
        throw new Error('Invalid GeoJSON format')
      }

      const feature = {
        id: `imported_${Date.now()}`,
        type: parsed.type,
        geometry: parsed,
        properties: {
          nodeId: editingNode.id,
          nodeName: editingNode.name,
          type: parsed.type,
          imported: true
        },
        style: {
          color: '#3b82f6',
          weight: 2,
          fillColor: '#3b82f6',
          fillOpacity: 0.2
        }
      }

      saveNodeGeometry(feature)
      setGeoJsonInput('')
      setGeoJsonError('')
    } catch (error) {
      setGeoJsonError('Invalid GeoJSON: ' + (error as Error).message)
    }
  }

  // Get node color based on health status
  const getNodeColor = (healthStatus: string) => {
    switch (healthStatus) {
      case 'HEALTHY':
        return '#22c55e'
      case 'WARNING':
        return '#eab308'
      case 'ERROR':
        return '#ef4444'
      case 'OFFLINE':
        return '#6b7280'
      default:
        return '#3b82f6'
    }
  }

  // Get node type display name
  const getNodeTypeName = (type: string) => {
    const typeNames: { [key: string]: string } = {
      GLOBAL_ROOT: '全球根节点',
      NATIONAL: '国家级节点',
      REGIONAL: '区域节点',
      LEAF: '叶子节点'
    }
    return typeNames[type] || type
  }

  // Get health status display name
  const getHealthStatusName = (status: string) => {
    const statusNames: { [key: string]: string } = {
      HEALTHY: '健康',
      WARNING: '警告',
      ERROR: '错误',
      OFFLINE: '离线'
    }
    return statusNames[status] || status
  }

  if (!isClient) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            节点地理分布 (增强版)
          </CardTitle>
          <CardDescription>
            支持点、多边形、矩形几何信息编辑的节点地理分布
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">地图加载中...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              节点地理分布 (增强版)
            </CardTitle>
            <CardDescription>
              支持点、多边形、矩形几何信息编辑的节点地理分布
            </CardDescription>
          </div>
          
          {/* Map Controls */}
          <div className="flex gap-2">
            {/* Search */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-4 w-4" />
              </Button>
              
              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 p-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="map-search">搜索节点或服务</Label>
                      <Input
                        id="map-search"
                        placeholder="输入名称、类型或描述..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    {searchResults.length > 0 && (
                      <div className="max-h-48 overflow-y-auto">
                        <Label className="text-sm font-medium">搜索结果</Label>
                        <div className="mt-2 space-y-1">
                          {searchResults.map((result) => (
                            <button
                              key={result.id}
                              onClick={() => focusOnResult(result)}
                              className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                            >
                              <div className="font-medium">{result.name}</div>
                              <div className="text-gray-500 text-xs">
                                {result.type === 'node' ? '节点' : '服务'}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Layers */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>图层控制</DialogTitle>
                  <DialogDescription>
                    选择要显示的地图图层
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">地图图层</Label>
                    <Select value={tileLayer} onValueChange={setTileLayer}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="osm">OpenStreetMap</SelectItem>
                        <SelectItem value="satellite">卫星影像</SelectItem>
                        <SelectItem value="terrain">地形图</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">数据图层</Label>
                    <div className="mt-2 space-y-2">
                      {mapLayers.map((layer) => (
                        <label key={layer.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={layer.visible}
                            onChange={() => toggleLayer(layer.id)}
                            className="rounded"
                          />
                          <span className="text-sm">{layer.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">编辑模式</Label>
                    <div className="mt-2">
                      <Button
                        variant={isEditMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsEditMode(!isEditMode)}
                        className="w-full"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {isEditMode ? '退出编辑' : '启用编辑'}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 rounded-lg overflow-hidden border relative">
          <MapContainer
            ref={mapRef}
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            {/* Tile Layer */}
            {tileLayer === 'osm' && (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            )}
            {tileLayer === 'satellite' && (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              />
            )}
            {tileLayer === 'terrain' && (
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://opentopomap.org/">OpenTopoMap</a>'
              />
            )}
            
            {/* Feature Group for drawn items */}
            <FeatureGroup>
              {/* Render node geometries */}
              {mapLayers.find(l => l.id === 'geometry')?.visible && nodeFeatures.map((feature) => (
                <GeoJSON
                  key={feature.id}
                  data={feature.geometry}
                  style={{
                    color: feature.style?.color || '#3b82f6',
                    weight: feature.style?.weight || 2,
                    fillColor: feature.style?.fillColor || '#3b82f6',
                    fillOpacity: feature.style?.fillOpacity || 0.2
                  }}
                  onEachFeature={(geoJsonFeature, layer) => {
                    layer.bindPopup(`
                      <div>
                        <strong>${feature.properties.nodeName}</strong><br/>
                        类型: ${feature.properties.type}<br/>
                        <small>更新时间: ${new Date(feature.properties.updated || feature.properties.created).toLocaleString()}</small>
                      </div>
                    `)
                  }}
                />
              ))}
            </FeatureGroup>
            
            {/* Node Markers and Overlays */}
            {nodes.map((node) => {
              if (!node.location) return null
              
              const isSelected = selectedNode?.id === node.id
              const color = getNodeColor(node.healthStatus)
              const nodesLayer = mapLayers.find(l => l.id === 'nodes')
              const servicesLayer = mapLayers.find(l => l.id === 'services')
              const coverageLayer = mapLayers.find(l => l.id === 'coverage')
              
              return (
                <div key={node.id}>
                  {/* Node marker */}
                  {nodesLayer?.visible && (
                    <Marker
                      position={[node.location.lat, node.location.lng]}
                      eventHandlers={{
                        click: () => onNodeSelect?.(node)
                      }}
                    >
                      <Popup>
                        <div className="p-2 min-w-48">
                          <h3 className="font-semibold text-sm mb-1">{node.name}</h3>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">类型:</span>
                              <Badge variant="outline" className="text-xs">
                                {getNodeTypeName(node.type)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">状态:</span>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ backgroundColor: color, color: 'white' }}
                              >
                                {getHealthStatusName(node.healthStatus)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">层级:</span>
                              <span>{node.level}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">数据集:</span>
                              <span>{node._count?.datasets || 0}</span>
                            </div>
                            {node.geometry && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">几何:</span>
                                <Badge variant="outline" className="text-xs">
                                  {node.geometry.type}
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 space-y-2">
                            {onNodeSelect && (
                              <Button 
                                size="sm" 
                                className="w-full text-xs"
                                onClick={() => onNodeSelect(node)}
                              >
                                查看详情
                              </Button>
                            )}
                            {isEditMode && onNodeUpdate && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => startEditingNode(node)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                编辑几何
                              </Button>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  
                  {/* Service coverage circle */}
                  {node.isActive && servicesLayer?.visible && (
                    <Circle
                      center={[node.location.lat, node.location.lng]}
                      radius={50000} // 50km radius
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.1,
                        weight: isSelected ? 3 : 1
                      }}
                    />
                  )}
                  
                  {/* Extended coverage area */}
                  {node.isActive && coverageLayer?.visible && (
                    <Circle
                      center={[node.location.lat, node.location.lng]}
                      radius={100000} // 100km radius
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.05,
                        weight: isSelected ? 2 : 1,
                        dashArray: '5, 10'
                      }}
                    />
                  )}
                </div>
              )
            })}
            
            {/* Draw Controls */}
            {isEditMode && (
              <DrawControls
                enabled={isEditMode}
                selectedNode={editingNode}
                drawMode={drawMode}
                onDrawStart={(type) => setDrawMode(type)}
                onDrawEnd={handleFeatureCreated}
                onEditStart={() => {}}
                onEditEnd={saveNodeGeometry}
                onDelete={handleFeatureDeleted}
              />
            )}
          </MapContainer>
          
          {/* Edit Mode Indicator */}
          {isEditMode && (
            <div className="absolute top-2 left-2 bg-white px-3 py-2 rounded-lg shadow-md text-xs font-medium">
              <Edit className="h-3 w-3 inline mr-1" />
              几何编辑模式已启用
              {editingNode ? (
                <div className="mt-1 text-blue-600">
                  正在编辑 &quot;{editingNode.name}&quot; 的几何信息
                  <div className="mt-1 text-gray-600">
                    使用右上角工具绘制点、多边形或矩形
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-gray-600">
                  选择节点后开始编辑几何信息
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Edit Panel */}
        {isEditMode && editingNode && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">
                  编辑几何信息 - {editingNode.name}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={cancelEditing}>
                  <X className="h-4 w-4 mr-1" />
                  取消
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="draw" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="draw">绘制工具</TabsTrigger>
                <TabsTrigger value="import">导入数据</TabsTrigger>
              </TabsList>
              
              <TabsContent value="draw" className="space-y-4">
                <div className="text-sm text-gray-600">
                  使用地图右上角的绘制工具来创建或编辑几何信息：
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-1"></div>
                    <div className="text-xs">点</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-1 bg-green-500 mx-auto mb-1"></div>
                    <div className="text-xs">线</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 mx-auto mb-1"></div>
                    <div className="text-xs">多边形</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-orange-500 mx-auto mb-1"></div>
                    <div className="text-xs">矩形</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="import" className="space-y-4">
                <div>
                  <Label className="text-sm">导入 GeoJSON</Label>
                  <Textarea
                    value={geoJsonInput}
                    onChange={(e) => setGeoJsonInput(e.target.value)}
                    placeholder={`输入GeoJSON格式的几何数据，例如:
{
  "type": "Polygon",
  "coordinates": [[
    [121.4, 31.2],
    [121.6, 31.2],
    [121.6, 31.4],
    [121.4, 31.4],
    [121.4, 31.2]
  ]]
}`}
                    className="font-mono text-xs h-24 mt-1"
                  />
                  {geoJsonError && (
                    <div className="text-red-500 text-xs mt-1">{geoJsonError}</div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImportGeoJSON}
                    disabled={!geoJsonInput.trim()}
                    className="mt-2"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    导入几何数据
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {/* Map legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>健康</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>警告</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>错误</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>离线</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            <span>服务覆盖</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border border-gray-400 rounded-full"></div>
            <span>扩展覆盖</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 opacity-20"></div>
            <span>几何信息</span>
          </div>
        </div>
        
        {/* Layer status */}
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
          {mapLayers.filter(l => l.visible).map(layer => (
            <span key={layer.id}>
              {layer.name}: 已显示
            </span>
          ))}
          <span>地图: {tileLayer === 'osm' ? '标准' : tileLayer === 'satellite' ? '卫星' : '地形'}</span>
        </div>
        
        {/* Node count info */}
        <div className="mt-1 text-xs text-gray-500">
          显示 {nodes.filter(n => n.location).length} 个节点 (共 {nodes.length} 个节点)
          {nodeFeatures.length > 0 && (
            <span> | {nodeFeatures.length} 个几何要素</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}