'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { MapPin, X, Save } from 'lucide-react'

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

interface SimpleMapProps {
  nodes?: NodeType[]
  selectedNode?: NodeType | null
  onNodeSelect?: (node: NodeType) => void
  onGeometryUpdate?: (nodeId: string, geometry: any) => void
  height?: string
  mode?: 'view' | 'edit'
  editable?: boolean
}

export interface SimpleMapRef {
  startEditing: (node: NodeType) => void
  fitBounds: (bounds: any) => void
  getCenter: () => { lat: number; lng: number }
  setCenter: (center: [number, number]) => void
}

const SimpleMap = forwardRef<SimpleMapRef, SimpleMapProps>(({
  nodes = [],
  selectedNode = null,
  onNodeSelect,
  onGeometryUpdate,
  height = '600px',
  mode = 'view',
  editable = false
}, ref) => {
  const [mapCenter, setMapCenter] = useState([31.2000, 121.5000])
  const [mapZoom, setMapZoom] = useState(6)
  const [editingNode, setEditingNode] = useState<NodeType | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [coverage, setCoverage] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  const mapRef = useRef<any>(null)

  // Handle map ready
  const handleMapReady = (map: any) => {
    mapRef.current = map
    setIsMapLoaded(true)
    console.log('Map loaded successfully')
  }

  // Handle node selection
  const handleNodeSelect = (node: NodeType) => {
    if (onNodeSelect) {
      onNodeSelect(node)
    }
    setMapCenter([node.location.lat, node.location.lng])
    setMapZoom(10)
  }

  // Start editing
  const startEditing = (node: NodeType) => {
    if (!editable || mode !== 'edit') return
    console.log('Starting edit for node:', node.name)
    setEditingNode(node)
    
    if (node.coverage) {
      setCoverage(node.coverage)
      try {
        const geojson = JSON.parse(node.coverage)
        if (geojson.type === 'Point' && geojson.coordinates) {
          setLatitude(geojson.coordinates[1].toString())
          setLongitude(geojson.coordinates[0].toString())
        }
      } catch (error) {
        console.error('Error parsing coverage:', error)
      }
    }
    
    if (mapRef.current && node.location) {
      mapRef.current.setView([node.location.lat, node.location.lng], 10)
    }
  }

  // Handle geometry update
  const handleGeometryUpdate = () => {
    if (editingNode && onGeometryUpdate) {
      const geometry = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      }
      onGeometryUpdate(editingNode.id, geometry)
      setEditingNode(null)
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
      
      {/* Edit tools */}
      {mode === 'edit' && editable && editingNode && (
        <div className="absolute top-20 left-4 z-20">
          <div className="bg-white rounded-lg shadow-lg p-4 w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">编辑节点几何图形</h3>
              <Button variant="ghost" size="sm" onClick={() => setEditingNode(null)}>
                <X size={16} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">节点名称</div>
                <div className="text-sm text-gray-600">{editingNode.name}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm font-medium">纬度</div>
                  <input
                    type="number"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="纬度"
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium">经度</div>
                  <input
                    type="number"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="经度"
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" onClick={handleGeometryUpdate}>
                  <Save size={16} className="mr-1" />
                  保存
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditingNode(null)}>
                  取消
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

SimpleMap.displayName = 'SimpleMap'

export default SimpleMap