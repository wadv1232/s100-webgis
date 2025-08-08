'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Leaflet only on client side
const LeafletMap = dynamic(
  () => import('./LeafletMapComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
)

interface DynamicMapProps {
  center: [number, number]
  zoom: number
  onMapReady?: (map: any) => void
  className?: string
  style?: React.CSSProperties
}

export default function DynamicMap({ 
  center, 
  zoom, 
  onMapReady, 
  className = "", 
  style = {} 
}: DynamicMapProps) {
  return (
    <LeafletMap 
      center={center}
      zoom={zoom}
      onMapReady={onMapReady}
      className={className}
      style={style}
    />
  )
}