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
  Grid
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
  type: 'nodes' | 'services' | 'coverage' | 'custom'
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

export default function NodeMap({ nodes, selectedNode, onNodeSelect, onNodeUpdate, className = '' }: NodeMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER)
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    { id: 'nodes', name: '节点位置', type: 'nodes', visible: true },
    { id: 'services', name: '服务覆盖', type: 'services', visible: true },
    { id: 'coverage', name: '覆盖范围', type: 'coverage', visible: true }
  ])
  const [tileLayer, setTileLayer] = useState('osm')
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

  // Start editing node position
  const startEditingNode = (node: Node) => {
    setEditingNode(node)
    setIsEditMode(true)
  }

  // Save edited node position
  const saveNodePosition = (lat: number, lng: number) => {
    if (editingNode && onNodeUpdate) {
      onNodeUpdate(editingNode.id, {
        location: { lat, lng }
      })
      setEditingNode(null)
      setIsEditMode(false)
    }
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingNode(null)
    setIsEditMode(false)
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
            节点地理分布
          </CardTitle>
          <CardDescription>
            显示所有节点的地理位置和服务覆盖范围
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
              节点地理分布
            </CardTitle>
            <CardDescription>
              显示所有节点的地理位置和服务覆盖范围
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
            
            {/* Map click handler for editing */}
            {isEditMode && editingNode && (
              <MapClickHandler 
                onMapClick={(lat, lng) => {
                  saveNodePosition(lat, lng)
                }}
              />
            )}
            
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
                            {node.coverage && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">覆盖:</span>
                                <span className="text-xs">{node.coverage}</span>
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
                                编辑位置
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
          </MapContainer>
          
          {/* Edit Mode Indicator */}
          {isEditMode && (
            <div className="absolute top-2 left-2 bg-white px-3 py-2 rounded-lg shadow-md text-xs font-medium">
              <Edit className="h-3 w-3 inline mr-1" />
              编辑模式已启用
              {editingNode ? (
                <div className="mt-1 text-blue-600">
                  点击地图更新 "{editingNode.name}" 位置
                </div>
              ) : (
                <div className="mt-1 text-gray-600">
                  选择节点后点击地图更新位置
                </div>
              )}
            </div>
          )}
        </div>
        
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
        </div>
      </CardContent>
    </Card>
  )
}