'use client'

import { useEffect, useRef } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface LeafletMapComponentProps {
  center: [number, number]
  zoom: number
  onMapReady?: (map: L.Map) => void
  className?: string
  style?: React.CSSProperties
}

export default function LeafletMapComponent({ 
  center, 
  zoom, 
  onMapReady, 
  className = "", 
  style = {} 
}: LeafletMapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return
    }

    try {
      console.log('Initializing Leaflet map...')
      
      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        minZoom: 1,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: false,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0
      })
      
      mapRef.current = map
      
      // Add zoom control
      L.control.zoom({
        position: 'topright'
      }).addTo(map)
      
      // Add scale control
      L.control.scale({
        position: 'bottomleft',
        metric: true,
        imperial: false,
        maxWidth: 200
      }).addTo(map)
      
      // Add base layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <strong>显示坐标: WGS84</strong>',
        minZoom: 1,
        maxZoom: 18,
        noWrap: true,
        updateWhenIdle: false,
        updateWhenZooming: true,
        keepBuffer: 4,
        bounds: [[-90, -180], [90, 180]],
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0
      }).addTo(map)
      
      console.log('Map initialized successfully')
      
      // Notify parent component
      if (onMapReady) {
        onMapReady(map)
      }
      
    } catch (error) {
      console.error('Error initializing map:', error)
    }

    return () => {
      if (mapRef.current) {
        try {
          console.log('Cleaning up map...')
          mapRef.current.off()
          mapRef.current.eachLayer((layer: any) => {
            mapRef.current?.removeLayer(layer)
          })
          const container = mapRef.current.getContainer()
          if (container && container.parentNode) {
            container.parentNode.removeChild(container)
          }
          mapRef.current = null
          console.log('Map cleaned up successfully')
        } catch (error) {
          console.warn('Error cleaning up map:', error)
          mapRef.current = null
        }
      }
    }
  }, [center, zoom, onMapReady])

  return (
    <div 
      ref={mapContainerRef}
      className={className}
      style={{ ...style, minHeight: '400px' }}
    />
  )
}