'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const ScaleControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ScaleControl),
  { ssr: false }
)

// Import MapInfoDisplay component
const MapInfoDisplay = dynamic(
  () => import('@/components/MapInfoDisplay').then((mod) => mod.default),
  { ssr: false }
)

export default function TestCoordinatesPage() {
  const [mapKey, setMapKey] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  
  // Test coordinates including problematic ones
  const testCoordinates = [
    { name: 'Shanghai', lat: 31.2000, lng: 121.5000 },
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Problematic', lat: -88.032349, lng: -326.667414 }, // This should be normalized
    { name: 'Another Issue', lat: 45.5, lng: 400.0 }, // This should also be normalized
  ]

  // Handle component mounting and resize observation
  useEffect(() => {
    setIsMounted(true)
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setMapKey(prev => prev + 1)
        }
      }
    })

    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleMapClick = (e: any) => {
    console.log('Map clicked at:', e.latlng)
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>坐标系统测试页面 - WGS84</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>此页面用于测试坐标显示和标准化功能。</p>
              <p><strong>地图投影: Web Mercator (EPSG:3857)</strong></p>
              <p><strong>显示坐标: WGS84 (EPSG:4326)</strong></p>
              <p>问题坐标应该被自动标准化到正确范围：纬度 [-90, 90]，经度 [-180, 180]</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">测试坐标点：</h3>
                <div className="space-y-1 text-sm">
                  {testCoordinates.map((coord, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <strong>{coord.name}:</strong> 
                      <span className="ml-2 font-mono">
                        {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">预期标准化结果：</h3>
                <div className="space-y-1 text-sm">
                  <div className="p-2 bg-green-50 rounded">
                    <strong>Problematic:</strong> 
                    <span className="ml-2 font-mono">
                      -88.032349, 33.332586
                    </span>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <strong>Another Issue:</strong> 
                    <span className="ml-2 font-mono">
                      45.5, 40.0
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">交互式地图测试 (Web Mercator + WGS84 显示)：</h3>
                <button 
                  onClick={() => setMapKey(prev => prev + 1)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  重置地图
                </button>
              </div>
              <div 
                ref={mapContainerRef}
                style={{ 
                  height: '600px', 
                  width: '100%',
                  position: 'relative',
                  display: 'block',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  minHeight: '600px'
                }} 
                className="map-container border rounded-lg"
              >
                {isMounted && (
                  <MapContainer
                    key={mapKey}
                    center={[31.2000, 121.5000]}
                    zoom={2}
                    style={{ 
                      height: '100%', 
                      width: '100%',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'transparent' // 确保背景透明
                    }}
                    onClick={handleMapClick}
                    worldCopyJump={false} // 禁用世界复制跳跃
                    maxBounds={[[-90, -180], [90, 180]]} // 限制世界边界
                    maxBoundsViscosity={1.0} // 严格边界限制
                    minZoom={1} // 最小缩放级别
                    maxZoom={18} // 最大缩放级别
                    zoomControl={false} // 禁用默认缩放控制
                    attributionControl={false} // 禁用默认归属控制
                    whenCreated={(map) => {
                      console.log('Test map created with Web Mercator projection', map)
                      
                      // 设置地图边界
                      map.setMaxBounds([[-90, -180], [90, 180]])
                      
                      setTimeout(() => {
                        map.invalidateSize()
                        console.log('Test map size invalidated')
                        
                        // 额外的尺寸验证
                        const container = map.getContainer()
                        if (container) {
                          const rect = container.getBoundingClientRect()
                          console.log('Test map container dimensions:', {
                            width: rect.width,
                            height: rect.height
                          })
                        }
                      }, 50)
                    }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <strong>显示坐标: WGS84</strong>'
                      noWrap={true}
                      updateWhenIdle={false}
                      updateWhenZooming={true}
                      keepBuffer={4} // 增加缓冲区减少瓦片闪烁
                      bounds={[[-90, -180], [90, 180]]} // 限制世界范围
                      maxBounds={[[-90, -180], [90, 180]]} // 限制最大边界
                      maxBoundsViscosity={1.0} // 严格边界限制
                    />
                    
                    {/* Scale Control */}
                    <ScaleControl 
                      position="bottomleft" 
                      metric={true} 
                      imperial={false}
                      maxWidth={200}
                    />
                    
                    {/* Add test markers */}
                    {testCoordinates.map((coord, index) => (
                      <Marker 
                        key={index}
                        position={[coord.lat, coord.lng]}
                      >
                        <Popup>
                          <div>
                            <strong>{coord.name}</strong><br/>
                            原始坐标: {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}<br/>
                            <small>点击地图其他位置查看坐标显示</small>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    
                    {/* Add coordinate display */}
                    <MapInfoDisplay 
                      showCursorCoordinates={true}
                      showViewBounds={true}
                    />
                  </MapContainer>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}