'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Save, MapPin, Maximize2, Plus } from 'lucide-react'

interface EditToolsProps {
  node: any
  onSave: (geometry: any) => void
  onCancel: () => void
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export default function EditTools({
  node,
  onSave,
  onCancel,
  position = 'top-left'
}: EditToolsProps) {
  const [coverage, setCoverage] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-20 left-4'
      case 'top-right':
        return 'top-20 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-20 left-4'
    }
  }

  const handleSave = () => {
    const geometry = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    }
    onSave(geometry)
  }

  const startDrawing = (mode: 'marker' | 'rectangle' | 'polygon') => {
    setIsDrawing(true)
    console.log('Starting drawing mode:', mode)
  }

  const finishDrawing = () => {
    setIsDrawing(false)
  }

  const cancelDrawing = () => {
    setIsDrawing(false)
  }

  return (
    <div className={`absolute z-20 ${getPositionClasses()}`}>
      <div className="bg-white rounded-lg shadow-lg p-4 w-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">编辑节点几何图形</h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X size={16} />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">节点名称</Label>
            <div className="text-sm text-gray-600">{node.name}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-sm font-medium">纬度</Label>
              <Input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="纬度"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">经度</Label>
              <Input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="经度"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">覆盖范围 (GeoJSON)</Label>
            <Textarea
              value={coverage}
              onChange={(e) => setCoverage(e.target.value)}
              placeholder="GeoJSON 格式的覆盖范围"
              rows={4}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => startDrawing('marker')}
            >
              <MapPin size={16} className="mr-1" />
              标记
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => startDrawing('rectangle')}
            >
              <Maximize2 size={16} className="mr-1" />
              矩形
            </Button>
            <Button
              variant={isDrawing ? 'default' : 'outline'}
              size="sm"
              onClick={() => startDrawing('polygon')}
            >
              <Plus size={16} className="mr-1" />
              多边形
            </Button>
          </div>
          
          {isDrawing && (
            <div className="flex gap-2">
              <Button size="sm" onClick={finishDrawing}>
                完成
              </Button>
              <Button variant="outline" size="sm" onClick={cancelDrawing}>
                取消
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Save size={16} className="mr-1" />
              保存
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel}>
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}