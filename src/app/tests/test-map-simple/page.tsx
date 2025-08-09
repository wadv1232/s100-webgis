'use client'

import { useEffect, useRef } from 'react'

export default function TestMapSimple() {
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeMap = async () => {
      try {
        console.log('Starting simple map test...')
        
        // Dynamically import Leaflet
        const leafletModule = await import('leaflet')
        await import('leaflet/dist/leaflet.css')
        
        const L = leafletModule.default || leafletModule
        
        console.log('Leaflet imported successfully')
        
        if (!mapContainerRef.current) {
          console.error('Map container not found')
          return
        }

        // Create simple map
        const map = L.map(mapContainerRef.current, {
          center: [31.2000, 121.5000],
          zoom: 6
        })

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        // Add a marker
        L.marker([31.2000, 121.5000])
          .addTo(map)
          .bindPopup('上海')
          .openPopup()

        console.log('Simple map initialized successfully')
      } catch (error) {
        console.error('Error initializing simple map:', error)
      }
    }

    initializeMap()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">简单地图测试</h1>
      <div 
        ref={mapContainerRef}
        style={{ 
          height: '600px', 
          width: '100%',
          border: '1px solid #ccc',
          borderRadius: '8px'
        }}
        className="map-container"
      >
        地图加载中...
      </div>
    </div>
  )
}