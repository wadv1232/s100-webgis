'use client'

import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapTileLayer, 
  MapConfig 
} from '@/config/map-config'
import { MapLayerSelectorProps } from '@/hooks/useMapConfig'
import { 
  Layers, 
  AlertTriangle, 
  Settings, 
  RefreshCw,
  Globe,
  Satellite,
  Mountain,
  Car
} from 'lucide-react'

interface MapLayerSelectorComponentProps extends MapLayerSelectorProps {
  configWarnings?: string[]
  onReloadConfig?: () => void
  showWarnings?: boolean
  compact?: boolean
}

// 获取图层类型图标
function getLayerTypeIcon(type: MapTileLayer['type']) {
  switch (type) {
    case 'vector':
      return <Globe className="h-4 w-4" />
    case 'satellite':
      return <Satellite className="h-4 w-4" />
    case 'terrain':
      return <Mountain className="h-4 w-4" />
    case 'traffic':
      return <Car className="h-4 w-4" />
    default:
      return <Layers className="h-4 w-4" />
  }
}

// 获取图层类型颜色
function getLayerTypeColor(type: MapTileLayer['type']): string {
  switch (type) {
    case 'vector':
      return 'bg-blue-100 text-blue-800'
    case 'satellite':
      return 'bg-purple-100 text-purple-800'
    case 'terrain':
      return 'bg-green-100 text-green-800'
    case 'traffic':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// 获取图层类型名称
function getLayerTypeName(type: MapTileLayer['type']): string {
  switch (type) {
    case 'vector':
      return '矢量'
    case 'satellite':
      return '卫星'
    case 'terrain':
      return '地形'
    case 'traffic':
      return '路况'
    default:
      return '自定义'
  }
}

export function MapLayerSelector({
  currentLayerId,
  onLayerChange,
  mapConfig,
  configWarnings = [],
  onReloadConfig,
  showWarnings = true,
  compact = false
}: MapLayerSelectorComponentProps) {
  // 按类型分组图层
  const layersByType = mapConfig.layers.reduce((acc, layer) => {
    if (!acc[layer.type]) {
      acc[layer.type] = []
    }
    acc[layer.type].push(layer)
    return acc
  }, {} as Record<MapTileLayer['type'], MapTileLayer[]>)

  // 获取当前图层
  const currentLayer = mapConfig.layers.find(layer => layer.id === currentLayerId)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Select value={currentLayerId} onValueChange={onLayerChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="选择底图" />
          </SelectTrigger>
          <SelectContent>
            {mapConfig.layers.map(layer => (
              <SelectItem key={layer.id} value={layer.id}>
                <div className="flex items-center gap-2">
                  {getLayerTypeIcon(layer.type)}
                  <span>{layer.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {onReloadConfig && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReloadConfig}
            title="重新加载配置"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 配置警告 */}
      {showWarnings && configWarnings.length > 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">地图配置警告:</div>
              {configWarnings.map((warning, index) => (
                <div key={index} className="text-sm">• {warning}</div>
              ))}
              {onReloadConfig && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReloadConfig}
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  重新加载配置
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 当前图层信息 */}
      {currentLayer && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          {getLayerTypeIcon(currentLayer.type)}
          <div className="flex-1">
            <div className="font-medium">{currentLayer.name}</div>
            <div className="text-sm text-gray-500">
              {currentLayer.attribution.replace(/<[^>]*>/g, '')}
            </div>
          </div>
          <Badge className={getLayerTypeColor(currentLayer.type)}>
            {getLayerTypeName(currentLayer.type)}
          </Badge>
        </div>
      )}

      {/* 图层选择器 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">选择底图:</label>
        <Select value={currentLayerId} onValueChange={onLayerChange}>
          <SelectTrigger>
            <SelectValue placeholder="选择底图图层" />
          </SelectTrigger>
          <SelectContent>
            {/* 按类型分组显示 */}
            {Object.entries(layersByType).map(([type, layers]) => (
              <div key={type}>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
                  {getLayerTypeName(type as MapTileLayer['type'])}
                </div>
                {layers.map(layer => (
                  <SelectItem key={layer.id} value={layer.id}>
                    <div className="flex items-center gap-2">
                      {getLayerTypeIcon(layer.type)}
                      <span>{layer.name}</span>
                      {layer.token && (
                        <Badge variant="outline" className="text-xs">
                          需要密钥
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 图层统计 */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>共 {mapConfig.layers.length} 个图层</span>
        {onReloadConfig && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReloadConfig}
            className="h-6 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            刷新
          </Button>
        )}
      </div>
    </div>
  )
}

// 导出类型
export type { MapLayerSelectorComponentProps }