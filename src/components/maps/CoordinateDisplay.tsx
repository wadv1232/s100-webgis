'use client'

import { useEffect, useState } from 'react'

interface CoordinateDisplayProps {
  map: any
  format?: 'WGS84' | 'GCJ02'
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export default function CoordinateDisplay({
  map,
  format = 'WGS84',
  position = 'bottom-right'
}: CoordinateDisplayProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!map) return

    const handleMouseMove = (e: any) => {
      setCoordinates({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      })
    }

    map.on('mousemove', handleMouseMove)

    return () => {
      map.off('mousemove', handleMouseMove)
    }
  }, [map])

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
        return 'bottom-4 right-4'
    }
  }

  if (!coordinates) return null

  return (
    <div className={`absolute z-20 ${getPositionClasses()}`}>
      <div className="bg-white rounded-lg shadow-lg p-2">
        <div className="text-xs font-mono">
          {format}: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
        </div>
      </div>
    </div>
  )
}