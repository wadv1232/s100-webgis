'use client'

import { useState, useEffect } from 'react'
import { MapPin, Move } from 'lucide-react'

interface CoordinateDisplayProps {
  map: any
  className?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  opacity?: number
  zIndex?: number
}

interface BoundingBox {
  north: number
  south: number
  east: number
  west: number
}

export default function CoordinateDisplay({ 
  map, 
  className = "", 
  position = 'bottom-left',
  opacity = 95,
  zIndex = 10
}: CoordinateDisplayProps) {
  const [cursorPosition, setCursorPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null)

  useEffect(() => {
    if (!map) return

    // 监听鼠标移动事件
    const handleMouseMove = (e: any) => {
      if (e.latlng) {
        setCursorPosition({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        })
      }
    }

    // 监听地图移动和缩放事件
    const updateBoundingBox = () => {
      try {
        const bounds = map.getBounds()
        if (bounds) {
          setBoundingBox({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          })
        }
      } catch (error) {
        console.warn('Error getting map bounds:', error)
      }
    }

    // 添加事件监听器
    map.on('mousemove', handleMouseMove)
    map.on('moveend', updateBoundingBox)
    map.on('zoomend', updateBoundingBox)

    // 初始化边界
    updateBoundingBox()

    // 清理函数
    return () => {
      map.off('mousemove', handleMouseMove)
      map.off('moveend', updateBoundingBox)
      map.off('zoomend', updateBoundingBox)
    }
  }, [map])

  // 根据位置配置获取对应的CSS类
  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
      default:
        return 'bottom-4 left-4'
    }
  }

  if (!cursorPosition && !boundingBox) {
    return null
  }

  return (
    <div className={`absolute ${getPositionClasses(position)} bg-white/${opacity} backdrop-blur-sm rounded-lg shadow-lg p-3 space-y-2 z-[${zIndex}] ${className}`}>
      {/* 光标坐标 */}
      {cursorPosition && (
        <div className="flex items-center space-x-2 text-sm">
          <Move className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">光标位置:</span>
          <span className="font-mono text-gray-900">
            {cursorPosition.lat.toFixed(6)}°, {cursorPosition.lng.toFixed(6)}°
          </span>
        </div>
      )}
      
      {/* 地图边界 */}
      {boundingBox && (
        <div className="flex items-start space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
          <div className="space-y-1">
            <div className="font-medium text-gray-700">图面范围:</div>
            <div className="font-mono text-xs text-gray-600 space-y-0.5">
              <div>北: {boundingBox.north.toFixed(6)}°</div>
              <div>南: {boundingBox.south.toFixed(6)}°</div>
              <div>东: {boundingBox.east.toFixed(6)}°</div>
              <div>西: {boundingBox.west.toFixed(6)}°</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}