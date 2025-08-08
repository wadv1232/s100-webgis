'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface MapUpdaterProps {
  center: [number, number]
  zoom: number
  baseLayer: string
}

export default function MapUpdater({ center, zoom, baseLayer }: MapUpdaterProps) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    // Update map center and zoom
    map.setView(center, zoom, {
      animate: true,
      duration: 0.5
    })

    // Handle map resize and invalidate size
    const handleResize = () => {
      setTimeout(() => {
        if (map) {
          map.invalidateSize()
        }
      }, 100) // Small delay to ensure DOM updates are complete
    }

    // Initial resize handling
    handleResize()

    // Add event listeners for resize
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [center, zoom, map])

  // Handle base layer changes
  useEffect(() => {
    if (!map) return

    // Force map redraw when base layer changes
    setTimeout(() => {
      if (map) {
        map.invalidateSize()
      }
    }, 50)
  }, [baseLayer, map])

  return null
}