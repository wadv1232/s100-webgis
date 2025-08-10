'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import dynamic from 'next/dynamic'
import MapControls from './MapControls'
import MapLayerSelector from './MapLayerSelector'
import CoordinateDisplay from './CoordinateDisplay'
import EditTools from './EditTools'

// Dynamically import LeafletMapSimple to avoid SSR issues
const LeafletMapSimple = dynamic(
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
  visible: boolean
  icon?: string
}

export interface ModularMapProps {
  nodes?: NodeType[]
  services?: ServiceType[]
  selectedNode?: NodeType | null
  onNodeSelect?: (node: NodeType) => void
  onNodeUpdate?: (nodeId: string, updates: Partial<NodeType>) => void
  height?: string
  mode?: 'view' | 'edit' | 'management'
  editable?: boolean
  onGeometryUpdate?: (nodeId: string, geometry: any) => void
  showCoordinates?: boolean
  showLayers?: boolean
  showControls?: boolean
}

export interface ModularMapRef {
  startEditing: (node: NodeType) => void
  fitBounds: (bounds: any) => void
  getCenter: () => { lat: number; lng: number }
  setCenter: (center: [number, number]) => void
}

const ModularMap = forwardRef<ModularMapRef, ModularMapProps>(({
  nodes = [],
  services = [],
  selectedNode = null,
  onNodeSelect,
  onNodeUpdate,
  height = '600px',
  mode = 'view',
  editable = false,
  onGeometryUpdate,
  showCoordinates = true,
  showLayers = true,
  showControls = true
}, ref) => {
  const [mapCenter, setMapCenter] = useState([31.2000, 121.5000])
  const [mapZoom, setMapZoom] = useState(6)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [editingNode, setEditingNode] = useState<NodeType | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    { id: 'base', name: '基础地图', visible: true, icon: '🗺️' },
    { id: 'nodes', name: '节点标记', visible: true, icon: '📍' },
    { id: 'services', name: '服务区域', visible: true, icon: '🔧' },
    { id: 'coverage', name: '覆盖范围', visible: true, icon: '📊' }
  ])

  const mapRef = useRef<any>(null)

  // Handle map ready
  const handleMapReady = (map: any) => {
    mapRef.current = map
    setIsMapLoaded(true)
    console.log('Map loaded successfully')
  }

  // Handle layer toggle
  const handleLayerToggle = (layerId: string, visible: boolean) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible } : layer
    ))
  }

  // Handle node selection
  const handleNodeSelect = (node: NodeType) => {
    if (onNodeSelect) {
      onNodeSelect(node)
    }
    setMapCenter([node.location.lat, node.location.lng])
    setMapZoom(10)
  }

  // Handle geometry update
  const handleGeometryUpdate = (geometry: any) => {
    if (editingNode && onGeometryUpdate) {
      onGeometryUpdate(editingNode.id, geometry)
      setEditingNode(null)
    }
  }

  // Start editing
  const startEditing = (node: NodeType) => {
    if (!editable || mode !== 'edit') return
    console.log('Starting edit for node:', node.name)
    setEditingNode(node)
    
    if (mapRef.current && node.location) {
      mapRef.current.setView([node.location.lat, node.location.lng], 10)
    }
  }

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startEditing,
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

  // Handle selected node changes
  useEffect(() => {
    if (selectedNode && mode === 'edit' && editable) {
      startEditing(selectedNode)
    }
  }, [selectedNode, mode, editable])

  return (
    <div className="relative w-full" style={{ height }}>
      {/* Map container */}
      <LeafletMapSimple
        center={mapCenter}
        zoom={mapZoom}
        onMapReady={handleMapReady}
        className="w-full h-full"
        style={{ height }}
      />
      
      {/* Map controls */}
      {showControls && (
        <MapControls
          onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
          isSearchOpen={isSearchOpen}
          onEditToggle={() => {
            if (selectedNode) {
              startEditing(selectedNode)
            }
          }}
          isEditing={!!editingNode}
        />
      )}
      
      {/* Layer selector */}
      {showLayers && (
        <MapLayerSelector
          layers={mapLayers}
          onLayerToggle={handleLayerToggle}
          position="bottom-left"
        />
      )}
      
      {/* Coordinate display */}
      {showCoordinates && (
        <CoordinateDisplay
          map={mapRef.current}
          format="WGS84"
          position="bottom-right"
        />
      )}
      
      {/* Edit tools */}
      {mode === 'edit' && editable && editingNode && (
        <EditTools
          node={editingNode}
          onSave={handleGeometryUpdate}
          onCancel={() => setEditingNode(null)}
          position="top-left"
        />
      )}
    </div>
  )
})

ModularMap.displayName = 'ModularMap'

export default ModularMap