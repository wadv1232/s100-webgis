'use client'

import { useState, useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { Card, CardContent } from '@/components/ui/card'

interface MapInfoDisplayProps {
  showCursorCoordinates?: boolean
  showViewBounds?: boolean
}

export default function MapInfoDisplay({ 
  showCursorCoordinates = true, 
  showViewBounds = true 
}: MapInfoDisplayProps) {
  const map = useMap()
  const [cursorPosition, setCursorPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [viewBounds, setViewBounds] = useState<{
    north: number
    south: number
    east: number
    west: number
  } | null>(null)

  // Handle mouse movement for cursor coordinates
  useEffect(() => {
    if (!map || !showCursorCoordinates) return

    const handleMouseMove = (e: any) => {
      const { lat, lng } = e.latlng
      setCursorPosition({ lat, lng })
    }

    const handleMouseOut = () => {
      setCursorPosition(null)
    }

    map.on('mousemove', handleMouseMove)
    map.on('mouseout', handleMouseOut)

    return () => {
      map.off('mousemove', handleMouseMove)
      map.off('mouseout', handleMouseOut)
    }
  }, [map, showCursorCoordinates])

  // Handle view bounds changes
  useEffect(() => {
    if (!map || !showViewBounds) return

    const updateViewBounds = () => {
      const bounds = map.getBounds()
      setViewBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      })
    }

    // Initial update
    updateViewBounds()

    // Update on map move/zoom
    map.on('moveend', updateViewBounds)
    map.on('zoomend', updateViewBounds)

    return () => {
      map.off('moveend', updateViewBounds)
      map.off('zoomend', updateViewBounds)
    }
  }, [map, showViewBounds])

  // Normalize longitude to -180 to +180 range
  const normalizeLongitude = (lng: number): number => {
    let normalized = lng % 360
    if (normalized > 180) {
      normalized -= 360
    } else if (normalized < -180) {
      normalized += 360
    }
    return normalized
  }

  // Format coordinates for display
  const formatCoordinate = (value: number, type: 'lat' | 'lng') => {
    let normalizedValue = value
    
    // Normalize longitude to proper range
    if (type === 'lng') {
      normalizedValue = normalizeLongitude(value)
    }
    
    const abs = Math.abs(normalizedValue)
    const degrees = Math.floor(abs)
    const minutes = Math.floor((abs - degrees) * 60)
    const seconds = Math.floor(((abs - degrees) * 60 - minutes) * 60)
    
    const direction = type === 'lat' 
      ? normalizedValue >= 0 ? 'N' : 'S'
      : normalizedValue >= 0 ? 'E' : 'W'
    
    return `${degrees}°${minutes}'${seconds}"${direction}`
  }

  const formatDecimal = (value: number, precision: number = 6) => {
    let normalizedValue = value
    
    // Normalize longitude to proper range
    if (Math.abs(value) > 180) {
      normalizedValue = normalizeLongitude(value)
    }
    
    return normalizedValue.toFixed(precision)
  }

  return (
    <>
      {/* Cursor Coordinates - Bottom Left */}
      {showCursorCoordinates && cursorPosition && (
        <div 
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            zIndex: 1000,
          }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">光标位置:</span>
                  <span className="font-mono">
                    {formatDecimal(cursorPosition.lat, 6)}, {formatDecimal(cursorPosition.lng, 6)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">度分秒:</span>
                  <span className="font-mono text-xs">
                    {formatCoordinate(cursorPosition.lat, 'lat')} {formatCoordinate(cursorPosition.lng, 'lng')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Bounds - Bottom Right */}
      {showViewBounds && viewBounds && (
        <div 
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            zIndex: 1000,
          }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-2 text-xs">
              <div className="space-y-1">
                <div className="font-medium text-gray-600 mb-1">当前视图范围:</div>
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <span className="text-gray-500">北界:</span>
                    <span className="font-mono ml-1">{formatDecimal(viewBounds.north, 6)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">南界:</span>
                    <span className="font-mono ml-1">{formatDecimal(viewBounds.south, 6)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">东界:</span>
                    <span className="font-mono ml-1">{formatDecimal(viewBounds.east, 6)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">西界:</span>
                    <span className="font-mono ml-1">{formatDecimal(viewBounds.west, 6)}</span>
                  </div>
                </div>
                <div className="mt-1 pt-1 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">中心:</span>
                    <span className="font-mono text-xs">
                      {formatDecimal((viewBounds.north + viewBounds.south) / 2, 6)}, {formatDecimal((viewBounds.east + viewBounds.west) / 2, 6)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}