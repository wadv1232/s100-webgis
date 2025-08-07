'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, 
  Layers, 
  Edit, 
  Save, 
  X,
  Trash2,
  Plus,
  Square,
  Circle,
  Pencil,
  Eraser,
  Download,
  Upload,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { useMapConfig } from '@/hooks/useMapConfig'
import { MapLayerSelector } from './MapLayerSelector'

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
const FeatureGroup = dynamic(
  () => import('react-leaflet').then((mod) => mod.FeatureGroup),
  { ssr: false }
)
const useMap = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMap),
  { ssr: false }
)

// Types for drawing features
interface DrawingFeature {
  id: string
  type: 'Point' | 'LineString' | 'Polygon' | 'Rectangle' | 'Circle'
  geometry: any
  properties?: Record<string, any>
  style?: {
    color?: string
    weight?: number
    opacity?: number
    fillColor?: string
    fillOpacity?: number
  }
}

interface DrawingInstruction {
  id: string
  type: 'draw' | 'edit' | 'delete' | 'style'
  featureType: string
  geometry: any
  properties?: Record<string, any>
  style?: Record<string, any>
  timestamp: number
}

interface EnhancedMapWithConfigProps {
  initialFeatures?: DrawingFeature[]
  onFeaturesChange?: (features: DrawingFeature[]) => void
  onInstructionsGenerated?: (instructions: DrawingInstruction[]) => void
  editable?: boolean
  height?: string
  className?: string
  title?: string
  description?: string
}

// Default drawing styles
const DEFAULT_STYLES = {
  point: { color: '#3b82f6', radius: 8 },
  polyline: { color: '#10b981', weight: 3 },
  polygon: { color: '#f59e0b', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.2 },
  rectangle: { color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.2 },
  circle: { color: '#8b5cf6', weight: 2, fillColor: '#8b5cf6', fillOpacity: 0.2 }
}

// Drawing control component
function DrawControls({ 
  onDrawStart, 
  onDrawEnd, 
  onEditStart, 
  onEditEnd, 
  onDelete,
  enabled 
}: {
  onDrawStart: (type: string) => void
  onDrawEnd: (feature: DrawingFeature) => void
  onEditStart: () => void
  onEditEnd: (feature: DrawingFeature) => void
  onDelete: (featureId: string) => void
  enabled: boolean
}) {
  const map = useMap()
  const drawControlRef = useRef<any>(null)

  useEffect(() => {
    if (!map || !enabled) return

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
              color: DEFAULT_STYLES.polygon.color,
              weight: DEFAULT_STYLES.polygon.weight,
              fillColor: DEFAULT_STYLES.polygon.fillColor,
              fillOpacity: DEFAULT_STYLES.polygon.fillOpacity
            }
          },
          polyline: {
            shapeOptions: {
              color: DEFAULT_STYLES.polyline.color,
              weight: DEFAULT_STYLES.polyline.weight
            }
          },
          rect: {
            shapeOptions: {
              color: DEFAULT_STYLES.rectangle.color,
              weight: DEFAULT_STYLES.rectangle.weight,
              fillColor: DEFAULT_STYLES.rectangle.fillColor,
              fillOpacity: DEFAULT_STYLES.rectangle.fillOpacity
            }
          },
          circle: {
            shapeOptions: {
              color: DEFAULT_STYLES.circle.color,
              weight: DEFAULT_STYLES.circle.weight,
              fillColor: DEFAULT_STYLES.circle.fillColor,
              fillOpacity: DEFAULT_STYLES.circle.fillOpacity
            }
          },
          marker: {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
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
              coordinates: [
                [sw.lng, sw.lat],
                [ne.lng, sw.lat],
                [ne.lng, ne.lat],
                [sw.lng, ne.lat],
                [sw.lng, sw.lat]
              ]
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

        const feature: DrawingFeature = {
          id: `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: featureType as any,
          geometry,
          properties: {
            created: new Date().toISOString(),
            type: featureType
          },
          style: DEFAULT_STYLES[type as keyof typeof DEFAULT_STYLES]
        }

        drawnItems.addLayer(layer)
        onDrawEnd(feature)
      })

      map.on(L.Draw.Event.EDITSTART, onEditStart)
      map.on(L.Draw.Event.EDITED, function (event: any) {
        const layers = event.layers
        layers.eachLayer(function (layer: any) {
          // Handle edited features
          console.log('Feature edited:', layer)
        })
        onEditEnd({} as DrawingFeature) // Simplified for now
      })

      map.on(L.Draw.Event.DELETED, function (event: any) {
        const layers = event.layers
        layers.eachLayer(function (layer: any) {
          // Handle deleted features
          console.log('Feature deleted:', layer)
        })
        onDelete('deleted_feature') // Simplified for now
      })
    }

    initDrawControl()

    return () => {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current.drawControl)
        map.removeLayer(drawControlRef.current.drawnItems)
      }
    }
  }, [map, enabled, onDrawEnd, onEditStart, onEditEnd, onDelete])

  return null
}

export default function EnhancedMapWithConfig({
  initialFeatures = [],
  onFeaturesChange,
  onInstructionsGenerated,
  editable = true,
  height = '600px',
  className = '',
  title = '增强地图编辑器',
  description = '基于 Leaflet + leaflet-draw 的 GIS 数据编辑工具'
}: EnhancedMapWithConfigProps) {
  const [isClient, setIsClient] = useState(false)
  const [features, setFeatures] = useState<DrawingFeature[]>(initialFeatures)
  const [selectedFeature, setSelectedFeature] = useState<DrawingFeature | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [drawMode, setDrawMode] = useState<string | null>(null)
  const [instructions, setInstructions] = useState<DrawingInstruction[]>([])
  const [geoJsonInput, setGeoJsonInput] = useState('')
  const [geoJsonError, setGeoJsonError] = useState('')
  
  const mapRef = useRef<any>(null)
  
  // 使用地图配置hook
  const {
    mapConfig,
    envConfig,
    isLoading: configLoading,
    error: configError,
    currentLayer,
    setCurrentLayer,
    getLayerUrl,
    configWarnings,
    isValidConfig,
    reloadConfig
  } = useMapConfig()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    setFeatures(initialFeatures)
  }, [initialFeatures])

  // Generate drawing instructions from features
  const generateInstructions = (features: DrawingFeature[]) => {
    const newInstructions: DrawingInstruction[] = features.map(feature => ({
      id: `instruction_${feature.id}`,
      type: 'draw',
      featureType: feature.type,
      geometry: feature.geometry,
      properties: feature.properties,
      style: feature.style,
      timestamp: Date.now()
    }))
    
    setInstructions(newInstructions)
    onInstructionsGenerated?.(newInstructions)
  }

  // Handle feature creation
  const handleFeatureCreated = (feature: DrawingFeature) => {
    const newFeatures = [...features, feature]
    setFeatures(newFeatures)
    onFeaturesChange?.(newFeatures)
    generateInstructions(newFeatures)
  }

  // Handle feature editing
  const handleFeatureEdited = (updatedFeature: DrawingFeature) => {
    const newFeatures = features.map(f => 
      f.id === updatedFeature.id ? updatedFeature : f
    )
    setFeatures(newFeatures)
    onFeaturesChange?.(newFeatures)
    generateInstructions(newFeatures)
  }

  // Handle feature deletion
  const handleFeatureDeleted = (featureId: string) => {
    const newFeatures = features.filter(f => f.id !== featureId)
    setFeatures(newFeatures)
    onFeaturesChange?.(newFeatures)
    generateInstructions(newFeatures)
  }

  // Import GeoJSON
  const handleImportGeoJSON = () => {
    try {
      const parsed = JSON.parse(geoJsonInput)
      
      if (!parsed.type || !parsed.coordinates) {
        throw new Error('Invalid GeoJSON format')
      }

      const feature: DrawingFeature = {
        id: `imported_${Date.now()}`,
        type: parsed.type === 'Point' ? 'Point' : 
              parsed.type === 'LineString' ? 'LineString' : 
              parsed.type === 'Polygon' ? 'Polygon' : 'Polygon',
        geometry: parsed,
        properties: {
          created: new Date().toISOString(),
          imported: true
        }
      }

      handleFeatureCreated(feature)
      setGeoJsonInput('')
      setGeoJsonError('')
    } catch (error) {
      setGeoJsonError('Invalid GeoJSON: ' + (error as Error).message)
    }
  }

  // Export features as GeoJSON
  const handleExportGeoJSON = () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: features.map(f => ({
        type: 'Feature',
        geometry: f.geometry,
        properties: f.properties
      }))
    }
    
    const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `map_features_${new Date().toISOString().split('T')[0]}.geojson`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Export drawing instructions
  const handleExportInstructions = () => {
    const blob = new Blob([JSON.stringify(instructions, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `drawing_instructions_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isClient || configLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height }} className="bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">
                {configLoading ? '地图配置加载中...' : '地图加载中...'}
              </p>
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
              {title}
              {configError && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  配置错误
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          <div className="flex gap-2">
            <MapLayerSelector
              currentLayerId={currentLayer?.id || mapConfig.defaultLayer}
              onLayerChange={(layerId) => setCurrentLayer(layerId)}
              mapConfig={mapConfig}
              configWarnings={configWarnings}
              onReloadConfig={reloadConfig}
              compact={true}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportGeoJSON}
            >
              <Download className="h-4 w-4 mr-1" />
              导出GeoJSON
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportInstructions}
            >
              <Download className="h-4 w-4 mr-1" />
              导出指令
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* 配置警告 */}
        {configWarnings.length > 0 && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">地图配置警告:</div>
                {configWarnings.map((warning, index) => (
                  <div key={index} className="text-sm">• {warning}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Map */}
          <div className="lg:col-span-3">
            <div style={{ height }} className="rounded-lg overflow-hidden border relative">
              <MapContainer
                ref={mapRef}
                center={mapConfig.center}
                zoom={mapConfig.zoom}
                minZoom={mapConfig.minZoom}
                maxZoom={mapConfig.maxZoom}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                {/* Base Tile Layer */}
                {currentLayer && (
                  <TileLayer
                    url={getLayerUrl(currentLayer.id)}
                    attribution={currentLayer.attribution}
                    maxZoom={currentLayer.maxZoom}
                    minZoom={currentLayer.minZoom}
                    subdomains={currentLayer.subdomains}
                    tileSize={currentLayer.tileSize}
                  />
                )}
                
                {/* Feature layers would go here */}
                {features.map((feature) => (
                  <GeoJSON
                    key={feature.id}
                    data={feature.geometry}
                    style={feature.style}
                    onEachFeature={(geoJsonFeature, layer) => {
                      if (feature.properties) {
                        layer.bindPopup(
                          `<div>
                            <strong>要素类型:</strong> ${feature.type}<br>
                            <strong>创建时间:</strong> ${new Date(feature.properties.created).toLocaleString()}
                          </div>`
                        )
                      }
                    }}
                  />
                ))}
                
                {/* Drawing controls */}
                {editable && (
                  <DrawControls
                    onDrawStart={() => {}}
                    onDrawEnd={handleFeatureCreated}
                    onEditStart={() => {}}
                    onEditEnd={handleFeatureEdited}
                    onDelete={handleFeatureDeleted}
                    enabled={editable}
                  />
                )}
              </MapContainer>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Layer Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">当前图层</h3>
              {currentLayer && (
                <div className="space-y-2 text-sm">
                  <div><strong>名称:</strong> {currentLayer.name}</div>
                  <div><strong>类型:</strong> {currentLayer.type}</div>
                  <div><strong>缩放级别:</strong> {currentLayer.minZoom}-{currentLayer.maxZoom}</div>
                  {currentLayer.token && (
                    <div className="text-orange-600">
                      <strong>状态:</strong> 需要API密钥
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Feature List */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">绘制要素 ({features.length})</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className={`p-2 rounded text-sm cursor-pointer hover:bg-gray-100 ${
                      selectedFeature?.id === feature.id ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => setSelectedFeature(feature)}
                  >
                    <div className="font-medium">{feature.type}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(feature.properties?.created).toLocaleString()}
                    </div>
                  </div>
                ))}
                {features.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    暂无绘制要素
                  </div>
                )}
              </div>
            </div>
            
            {/* Import/Export */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">数据导入/导出</h3>
              <div className="space-y-2">
                <Textarea
                  placeholder="粘贴 GeoJSON 数据..."
                  value={geoJsonInput}
                  onChange={(e) => setGeoJsonInput(e.target.value)}
                  className="text-xs"
                  rows={3}
                />
                {geoJsonError && (
                  <div className="text-xs text-red-600">{geoJsonError}</div>
                )}
                <Button
                  size="sm"
                  onClick={handleImportGeoJSON}
                  disabled={!geoJsonInput.trim()}
                  className="w-full"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  导入 GeoJSON
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 导出类型
export type { EnhancedMapWithConfigProps, DrawingFeature, DrawingInstruction }