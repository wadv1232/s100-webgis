'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Save, 
  X, 
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  Upload
} from 'lucide-react'
import { NodeResult } from '@/lib/services/node-service'
import { 
  GeoJSONGeometry, 
  parseGeoJSON, 
  stringifyGeoJSON, 
  createPoint,
  createBoundingBoxPolygon,
  generateDefaultCoverage,
  validateGeoJSON,
  formatCoverageForDisplay,
  calculateCenter,
  calculateBoundingBox
} from '@/lib/utils/geo-utils'

interface GeoDataEditorProps {
  node: NodeResult
  onUpdate: (updates: Partial<NodeResult>) => void
  onCancel: () => void
}

interface PresetArea {
  name: string
  description: string
  geometry: () => GeoJSONGeometry
}

export default function GeoDataEditor({
  node,
  onUpdate,
  onCancel
}: GeoDataEditorProps) {
  const [coverage, setCoverage] = useState<string>(node.coverage || '')
  const [latitude, setLatitude] = useState<string>(node.latitude?.toString() || '')
  const [longitude, setLongitude] = useState<string>(node.longitude?.toString() || '')
  const [editMode, setEditMode] = useState<'manual' | 'point' | 'bbox' | 'preset'>('manual')
  const [validation, setValidation] = useState<{ valid: boolean; error?: string }>({ valid: true })
  const [previewGeometry, setPreviewGeometry] = useState<GeoJSONGeometry | null>(null)

  // 预设区域模板
  const presetAreas: PresetArea[] = [
    {
      name: '港口区域',
      description: '典型港口管辖范围（约5km半径）',
      geometry: () => {
        if (node.latitude && node.longitude) {
          return generateDefaultCoverage(node.latitude, node.longitude, 5)
        }
        return createPoint(114.3055, 30.5928)
      }
    },
    {
      name: '区域分局',
      description: '区域分局管辖范围（约50km半径）',
      geometry: () => {
        if (node.latitude && node.longitude) {
          return generateDefaultCoverage(node.latitude, node.longitude, 50)
        }
        return createBoundingBoxPolygon({
          minLng: 114.0,
          minLat: 30.0,
          maxLng: 115.0,
          maxLat: 31.0
        })
      }
    },
    {
      name: '国家级节点',
      description: '国家级管辖范围（简化边界）',
      geometry: () => createBoundingBoxPolygon({
        minLng: 73.0,
        minLat: 18.0,
        maxLng: 135.0,
        maxLat: 54.0
      })
    }
  ]

  // 验证GeoJSON数据
  useEffect(() => {
    if (coverage.trim()) {
      const result = validateGeoJSON(coverage)
      setValidation(result)
      
      if (result.valid) {
        const geometry = parseGeoJSON(coverage)
        setPreviewGeometry(geometry)
      } else {
        setPreviewGeometry(null)
      }
    } else {
      setValidation({ valid: true })
      setPreviewGeometry(null)
    }
  }, [coverage])

  // 应用预设区域
  const applyPreset = (preset: PresetArea) => {
    const geometry = preset.geometry()
    setCoverage(stringifyGeoJSON(geometry))
    
    // 如果是点几何，更新经纬度
    if (geometry.type === 'Point') {
      setLatitude(geometry.coordinates[1].toString())
      setLongitude(geometry.coordinates[0].toString())
    } else {
      // 计算中心点
      const center = calculateCenter(geometry)
      if (center) {
        setLatitude(center.latitude.toString())
        setLongitude(center.longitude.toString())
      }
    }
  }

  // 从经纬度生成点
  const generateFromPoint = () => {
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    
    if (!isNaN(lat) && !isNaN(lng)) {
      const point = createPoint(lng, lat)
      setCoverage(stringifyGeoJSON(point))
      setEditMode('manual')
    }
  }

  // 从经纬度生成边界框
  const generateBBox = () => {
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    
    if (!isNaN(lat) && !isNaN(lng)) {
      const bbox = createBoundingBoxPolygon({
        minLng: lng - 0.01,
        minLat: lat - 0.01,
        maxLng: lng + 0.01,
        maxLat: lat + 0.01
      })
      setCoverage(stringifyGeoJSON(bbox))
      setEditMode('manual')
    }
  }

  // 保存更改
  const handleSave = () => {
    const updates: Partial<NodeResult> = {}
    
    if (coverage.trim()) {
      if (!validation.valid) {
        alert('GeoJSON数据无效: ' + validation.error)
        return
      }
      updates.coverage = coverage
    } else {
      updates.coverage = null
    }
    
    const lat = latitude.trim() ? parseFloat(latitude) : null
    const lng = longitude.trim() ? parseFloat(longitude) : null
    
    if (!isNaN(lat) && lat !== null) updates.latitude = lat
    if (!isNaN(lng) && lng !== null) updates.longitude = lng
    
    onUpdate(updates)
  }

  // 导入GeoJSON文件
  const importGeoJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const result = validateGeoJSON(content)
        if (result.valid) {
          setCoverage(content)
          
          const geometry = parseGeoJSON(content)
          if (geometry && geometry.type === 'Point') {
            setLatitude(geometry.coordinates[1].toString())
            setLongitude(geometry.coordinates[0].toString())
          } else {
            const center = calculateCenter(geometry)
            if (center) {
              setLatitude(center.latitude.toString())
              setLongitude(center.longitude.toString())
            }
          }
        } else {
          alert('文件格式无效: ' + result.error)
        }
      } catch (error) {
        alert('文件读取失败')
      }
    }
    reader.readAsText(file)
    
    // 重置文件输入
    event.target.value = ''
  }

  // 导出GeoJSON文件
  const exportGeoJSON = () => {
    if (!coverage.trim()) return
    
    const blob = new Blob([coverage], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${node.code || 'node'}_coverage.geojson`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            编辑地理数据 - {node.name}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" />
              取消
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              保存
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 编辑模式选择 */}
        <div>
          <Label className="text-sm font-medium">编辑模式</Label>
          <div className="flex gap-2 mt-2">
            {[
              { key: 'manual', label: '手动编辑', icon: Edit },
              { key: 'point', label: '坐标点', icon: MapPin },
              { key: 'bbox', label: '边界框', icon: Plus },
              { key: 'preset', label: '预设区域', icon: Eye }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={editMode === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditMode(key as any)}
                className="flex items-center gap-1"
              >
                <Icon className="h-3 w-3" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* 坐标输入 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">纬度</Label>
            <Input
              id="latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="例: 30.5928"
            />
          </div>
          <div>
            <Label htmlFor="longitude">经度</Label>
            <Input
              id="longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="例: 114.3055"
            />
          </div>
        </div>

        {/* 根据编辑模式显示不同内容 */}
        {editMode === 'point' && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">从坐标点生成</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              根据输入的经纬度坐标生成点几何对象
            </p>
            <Button onClick={generateFromPoint} disabled={!latitude || !longitude}>
              生成点几何
            </Button>
          </div>
        )}

        {editMode === 'bbox' && (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="h-4 w-4" />
              <span className="font-medium">生成边界框</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              根据输入的经纬度坐标生成小范围矩形区域
            </p>
            <Button onClick={generateBBox} disabled={!latitude || !longitude}>
              生成边界框
            </Button>
          </div>
        )}

        {editMode === 'preset' && (
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4" />
              <span className="font-medium">预设区域模板</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              选择预设的区域模板快速生成覆盖范围
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {presetAreas.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-3 text-left"
                  onClick={() => applyPreset(preset)}
                >
                  <div>
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {preset.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* GeoJSON编辑器 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">GeoJSON 覆盖范围</Label>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".json,.geojson"
                onChange={importGeoJSON}
                className="hidden"
                id="import-geojson"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('import-geojson')?.click()}
              >
                <Upload className="h-3 w-3 mr-1" />
                导入
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportGeoJSON}
                disabled={!coverage.trim()}
              >
                <Download className="h-3 w-3 mr-1" />
                导出
              </Button>
              {coverage.trim() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCoverage('')}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  清空
                </Button>
              )}
            </div>
          </div>
          
          <Textarea
            value={coverage}
            onChange={(e) => setCoverage(e.target.value)}
            placeholder={`输入GeoJSON格式的地理数据，例如:
{
  "type": "Point",
  "coordinates": [114.3055, 30.5928]
}`}
            className="font-mono text-sm min-h-[200px]"
          />
          
          {/* 验证状态 */}
          {coverage.trim() && (
            <div className="mt-2">
              {validation.valid ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ GeoJSON格式有效
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  ✗ {validation.error}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* 预览信息 */}
        {previewGeometry && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4" />
              <span className="font-medium">几何信息预览</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>类型:</strong> {previewGeometry.type}
              </div>
              {previewGeometry.type === 'Point' && (
                <>
                  <div>
                    <strong>经度:</strong> {previewGeometry.coordinates[0].toFixed(6)}
                  </div>
                  <div>
                    <strong>纬度:</strong> {previewGeometry.coordinates[1].toFixed(6)}
                  </div>
                </>
              )}
              {previewGeometry.type !== 'Point' && (
                <>
                  <div>
                    <strong>显示格式:</strong> {formatCoverageForDisplay(coverage)}
                  </div>
                  <div>
                    <strong>边界框:</strong> {
                      (() => {
                        const bbox = calculateBoundingBox(previewGeometry)
                        return bbox ? 
                          `${bbox.minLng.toFixed(4)},${bbox.minLat.toFixed(4)} - ${bbox.maxLng.toFixed(4)},${bbox.maxLat.toFixed(4)}` : 
                          '无法计算'
                      })()
                    }
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 当前状态 */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-sm">
            <strong>当前状态:</strong> {formatCoverageForDisplay(node.coverage)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            编辑后将{coverage.trim() ? '更新' : '清除'}地理覆盖范围数据
          </div>
        </div>
      </CardContent>
    </Card>
  )
}