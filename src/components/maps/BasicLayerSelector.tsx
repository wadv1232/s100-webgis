'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface MapLayer {
  id: string
  name: string
  visible: boolean
  icon?: string
}

interface BasicLayerSelectorProps {
  layers: MapLayer[]
  onLayerToggle: (layerId: string, visible: boolean) => void
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export default function BasicLayerSelector({
  layers,
  onLayerToggle,
  position = 'bottom-left'
}: BasicLayerSelectorProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'bottom-4 left-4'
    }
  }

  return (
    <div className={`absolute z-20 ${getPositionClasses()}`}>
      <div className="bg-white rounded-lg shadow-lg p-2">
        <h4 className="font-medium mb-2 text-sm">图层</h4>
        {layers.map((layer) => (
          <div key={layer.id} className="flex items-center mb-1">
            <Checkbox
              id={`layer-${layer.id}`}
              checked={layer.visible}
              onCheckedChange={(checked) => onLayerToggle(layer.id, checked as boolean)}
            />
            <Label htmlFor={`layer-${layer.id}`} className="ml-2 text-sm">
              {layer.icon} {layer.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}