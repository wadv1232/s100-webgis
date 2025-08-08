'use client'

import { useEffect, useRef, useState } from 'react'

interface ClientOnlyMapProps {
  onMapReady?: (map: any) => void
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function ClientOnlyMap({ 
  onMapReady, 
  children, 
  className = "", 
  style = {} 
}: ClientOnlyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Only run on client side
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div 
        ref={mapContainerRef}
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ ...style, minHeight: '400px' }}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  return (
    <div 
      ref={mapContainerRef}
      className={className}
      style={style}
    >
      {children}
    </div>
  )
}