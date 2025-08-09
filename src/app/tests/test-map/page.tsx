'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Map } from 'lucide-react'
import Link from 'next/link'

export default function TestMapPage() {
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.2000, 121.5000])
  const [mapZoom, setMapZoom] = useState(6)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  const initializeMap = async () => {
    if (mapRef.current) {
      console.log('Map already initialized')
      return
    }

    setIsInitializing(true)
    
    try {
      console.log('Starting map initialization...')
      
      // Dynamically import Leaflet
      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')
      
      console.log('Leaflet imported successfully')
      
      // Fix for default markers in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      
      console.log('Map container:', mapContainerRef.current)
      
      if (!mapContainerRef.current) {
        console.error('Map container not found')
        setIsInitializing(false)
        return
      }
      
      console.log('Initializing Leaflet map...')
      
      // Create map instance
      const map = L.map(mapContainerRef.current!, {
        center: mapCenter,
        zoom: mapZoom,
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
      
      // Add a sample marker
      L.marker([31.2000, 121.5000])
        .addTo(map)
        .bindPopup('Shanghai, China')
        .openPopup()
      
      console.log('Map initialized successfully')
      setIsMapLoaded(true)
      
    } catch (error) {
      console.error('Error initializing map:', error)
      console.error('Error details:', error instanceof Error ? error.message : error)
    } finally {
      setIsInitializing(false)
    }
  }

  useEffect(() => {
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
  }, [])

  const updateMapView = (center: [number, number], zoom: number) => {
    setMapCenter(center)
    setMapZoom(zoom)
    if (mapRef.current) {
      mapRef.current.setView(center, zoom)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回首页
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Map className="h-8 w-8 text-blue-600" />
            测试地图
          </h1>
          <p className="text-gray-600 mt-2">
            简单的地图测试页面
          </p>
        </div>
      </div>

      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle>动态地图组件</CardTitle>
          <CardDescription>
            使用动态导入的Leaflet地图组件
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapContainerRef}
            className="w-full bg-gray-100 flex items-center justify-center"
            style={{ height: '600px' }}
          >
            {!isMapLoaded && (
              <div className="text-center">
                <div className="text-gray-500 mb-4">
                  {isInitializing ? 'Initializing map...' : 'Map not loaded'}
                </div>
                {!isInitializing && (
                  <Button
                    onClick={initializeMap}
                    disabled={isInitializing}
                  >
                    {isInitializing ? 'Loading...' : 'Load Map'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>地图控制</CardTitle>
          <CardDescription>
            测试地图功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={() => updateMapView([31.2000, 121.5000], 10)}
              variant="outline"
            >
              上海
            </Button>
            <Button
              onClick={() => updateMapView([39.9042, 116.4074], 10)}
              variant="outline"
            >
              北京
            </Button>
            <Button
              onClick={() => updateMapView([22.3193, 114.1694], 10)}
              variant="outline"
            >
              香港
            </Button>
            <Button
              onClick={() => updateMapView(mapCenter, Math.min(mapZoom + 1, 18))}
              variant="outline"
            >
              放大
            </Button>
            <Button
              onClick={() => updateMapView(mapCenter, Math.max(mapZoom - 1, 1))}
              variant="outline"
            >
              缩小
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}