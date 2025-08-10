'use client'

import { Button } from '@/components/ui/button'
import { Search, MapPin } from 'lucide-react'

interface BasicMapControlsProps {
  onSearchToggle?: () => void
  onEditToggle?: () => void
  isSearchOpen?: boolean
  isEditing?: boolean
}

export default function BasicMapControls({
  onSearchToggle,
  onEditToggle,
  isSearchOpen = false,
  isEditing = false
}: BasicMapControlsProps) {
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