'use client'

import { Button } from '@/components/ui/button'
import { Search, Layers, MapPin } from 'lucide-react'

interface MapControlsProps {
  onSearchToggle?: () => void
  onLayerToggle?: () => void
  onEditToggle?: () => void
  isSearchOpen?: boolean
  isEditing?: boolean
}

export default function MapControls({
  onSearchToggle,
  onLayerToggle,
  onEditToggle,
  isSearchOpen = false,
  isEditing = false
}: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-20">
      <div className="bg-white rounded-lg shadow-lg p-2">
        {onSearchToggle && (
          <Button
            variant={isSearchOpen ? 'default' : 'outline'}
            size="sm"
            onClick={onSearchToggle}
            className="mb-1"
          >
            <Search size={16} />
          </Button>
        )}
        
        {onLayerToggle && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLayerToggle}
            className="mb-1"
          >
            <Layers size={16} />
          </Button>
        )}
        
        {onEditToggle && (
          <Button
            variant={isEditing ? 'default' : 'outline'}
            size="sm"
            onClick={onEditToggle}
          >
            <MapPin size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}