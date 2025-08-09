'use client'

import { useState } from 'react'
import { Layers, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react'

interface LegendItem {
  id: string
  name: string
  type: 'base' | 'node' | 'service' | 'overlay'
  visible: boolean
  color?: string
  icon?: string
  description?: string
}

interface MapLegendProps {
  layers: LegendItem[]
  onLayerToggle: (layerId: string, visible: boolean) => void
  className?: string
}

export default function MapLegend({ layers, onLayerToggle, className = "" }: MapLegendProps) {
  const [expanded, setExpanded] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    base: true,
    node: true,
    service: true,
    overlay: true
  })

  const groupLayers = (layers: LegendItem[]) => {
    return {
      base: layers.filter(layer => layer.type === 'base'),
      node: layers.filter(layer => layer.type === 'node'),
      service: layers.filter(layer => layer.type === 'service'),
      overlay: layers.filter(layer => layer.type === 'overlay')
    }
  }

  const groupedLayers = groupLayers(layers)

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  const groupNames = {
    base: '基础图层',
    node: '节点图层',
    service: '服务图层',
    overlay: '覆盖图层'
  }

  const groupIcons = {
    base: '🗺️',
    node: '📍',
    service: '🔧',
    overlay: '📊'
  }

  return (
    <div className={`absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg z-10 ${className}`}>
      <div className="p-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900">图层控制</span>
          </div>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2">
            {Object.entries(groupedLayers).map(([groupType, groupLayers]) => {
              if (groupLayers.length === 0) return null

              const isGroupExpanded = expandedGroups[groupType]

              return (
                <div key={groupType} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(groupType)}
                    className="flex items-center justify-between w-full text-left p-1 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{groupIcons[groupType as keyof typeof groupIcons]}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {groupNames[groupType as keyof typeof groupNames]}
                      </span>
                      <span className="text-xs text-gray-500">({groupLayers.length})</span>
                    </div>
                    {isGroupExpanded ? (
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-gray-500" />
                    )}
                  </button>

                  {isGroupExpanded && (
                    <div className="ml-4 space-y-1">
                      {groupLayers.map((layer) => (
                        <div
                          key={layer.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer group"
                          onClick={() => onLayerToggle(layer.id, !layer.visible)}
                        >
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onLayerToggle(layer.id, !layer.visible)
                              }}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              {layer.visible ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </button>
                            <div className="flex items-center space-x-2">
                              {layer.color && (
                                <div
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: layer.color }}
                                />
                              )}
                              {layer.icon && (
                                <span className="text-xs">{layer.icon}</span>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {layer.name}
                                </div>
                                {layer.description && (
                                  <div className="text-xs text-gray-500">
                                    {layer.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}