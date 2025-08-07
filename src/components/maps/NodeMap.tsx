'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Maximize2, 
  Minimize2, 
  Edit, 
  Save, 
  X,
  Layers,
  Search
} from 'lucide-react'
import { NodeResult } from '@/lib/services/node-service'
import { 
  GeoJSONGeometry, 
  parseGeoJSON, 
  stringifyGeoJSON, 
  createPoint,
  createBoundingBoxPolygon,
  formatCoverageForDisplay
} from '@/lib/utils/geo-utils'

interface NodeMapProps {
  nodes: NodeResult[]
  selectedNode?: NodeResult | null
  onNodeSelect?: (node: NodeResult) => void
  onNodeUpdate?: (nodeId: string, updates: Partial<NodeResult>) => void
  editable?: boolean
  height?: string
  className?: string
}

interface MapState {
  center: { lat: number; lng: number }
  zoom: number
  bounds?: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }
}

export default function NodeMap({
  nodes,
  selectedNode,
  onNodeSelect,
  onNodeUpdate,
  editable = false,
  height = '500px',
  className = ''
}: NodeMapProps) {
  const [mapState, setMapState] = useState<MapState>({
    center: { lat: 30.5928, lng: 114.3055 }, // 默认武汉坐标
    zoom: 6
  })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [editingNode, setEditingNode] = useState<NodeResult | null>(null)
  const [editMode, setEditMode] = useState<'point' | 'polygon' | 'bbox'>('point')
  const [tempGeometry, setTempGeometry] = useState<GeoJSONGeometry | null>(null)
  const [polygonPoints, setPolygonPoints] = useState<Array<[number, number]>>([])
  const [bboxStart, setBboxStart] = useState<{ x: number; y: number } | null>(null)
  const [bboxEnd, setBboxEnd] = useState<{ x: number; y: number } | null>(null)
  
  const mapRef = useRef<HTMLDivElement>(null)

  // 计算所有节点的边界框
  const calculateNodesBounds = () => {
    const validNodes = nodes.filter(node => node.latitude && node.longitude)
    if (validNodes.length === 0) return null

    const lats = validNodes.map(n => n.latitude!)
    const lngs = validNodes.map(n => n.longitude!)
    
    return {
      ne: { lat: Math.max(...lats), lng: Math.max(...lngs) },
      sw: { lat: Math.min(...lats), lng: Math.min(...lngs) }
    }
  }

  // 自动调整视图以包含所有节点
  const fitToNodes = () => {
    const bounds = calculateNodesBounds()
    if (bounds) {
      setMapState(prev => ({
        ...prev,
        bounds,
        center: {
          lat: (bounds.ne.lat + bounds.sw.lat) / 2,
          lng: (bounds.ne.lng + bounds.sw.lng) / 2
        },
        zoom: Math.max(4, 10 - Math.log2(Math.abs(bounds.ne.lat - bounds.sw.lat) + 0.1))
      }))
    }
  }

  // 初始化时自动调整视图
  useEffect(() => {
    if (nodes.length > 0) {
      fitToNodes()
    }
  }, [nodes])

  // 选择节点时调整视图
  useEffect(() => {
    if (selectedNode && selectedNode.latitude && selectedNode.longitude) {
      setMapState(prev => ({
        ...prev,
        center: { lat: selectedNode.latitude!, lng: selectedNode.longitude! },
        zoom: 10
      }))
    }
  }, [selectedNode])

  // 开始编辑节点地理数据
  const startEditing = (node: NodeResult) => {
    if (!editable) return
    
    setEditingNode(node)
    setPolygonPoints([])
    setBboxStart(null)
    setBboxEnd(null)
    
    if (node.coverage) {
      const geometry = parseGeoJSON(node.coverage)
      setTempGeometry(geometry)
    } else if (node.latitude && node.longitude) {
      setTempGeometry(createPoint(node.longitude, node.latitude))
    }
  }

  // 保存编辑的地理数据
  const saveEdit = () => {
    if (!editingNode || !tempGeometry) return

    const updates: Partial<NodeResult> = {
      coverage: stringifyGeoJSON(tempGeometry)
    }

    // 如果是点几何，更新经纬度
    if (tempGeometry.type === 'Point') {
      updates.latitude = tempGeometry.coordinates[1]
      updates.longitude = tempGeometry.coordinates[0]
    }

    onNodeUpdate?.(editingNode.id, updates)
    setEditingNode(null)
    setTempGeometry(null)
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingNode(null)
    setTempGeometry(null)
    setPolygonPoints([])
    setBboxStart(null)
    setBboxEnd(null)
  }

  // 处理地图点击（编辑模式）
  const handleMapClick = (event: React.MouseEvent) => {
    if (!editingNode || !editable) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // 转换为地理坐标（简化计算）
    const lng = mapState.center.lng + (x / rect.width - 0.5) * 10 / mapState.zoom
    const lat = mapState.center.lat - (y / rect.height - 0.5) * 10 / mapState.zoom

    switch (editMode) {
      case 'point':
        setTempGeometry(createPoint(lng, lat))
        break
      case 'polygon':
        // 添加多边形顶点
        const newPoint: [number, number] = [lng, lat]
        setPolygonPoints(prev => [...prev, newPoint])
        
        // 如果有至少3个点，自动创建多边形预览
        if (polygonPoints.length >= 2) {
          const polygonCoords = [...polygonPoints, newPoint] // 不自动闭合，让用户决定
          setTempGeometry({
            type: 'Polygon',
            coordinates: [polygonCoords]
          })
        }
        break
      case 'bbox':
        if (!bboxStart) {
          // 设置矩形起点
          setBboxStart({ x, y })
          setBboxEnd({ x, y })
        } else {
          // 设置矩形终点并创建矩形，然后重置状态
          setBboxEnd({ x, y })
          
          // 计算矩形的地理坐标
          const startLng = mapState.center.lng + (bboxStart.x / rect.width - 0.5) * 10 / mapState.zoom
          const startLat = mapState.center.lat - (bboxStart.y / rect.height - 0.5) * 10 / mapState.zoom
          const endLng = mapState.center.lng + (x / rect.width - 0.5) * 10 / mapState.zoom
          const endLat = mapState.center.lat - (y / rect.height - 0.5) * 10 / mapState.zoom
          
          const bbox = createBoundingBoxPolygon({
            minLng: Math.min(startLng, endLng),
            minLat: Math.min(startLat, endLat),
            maxLng: Math.max(startLng, endLng),
            maxLat: Math.max(startLat, endLat)
          })
          setTempGeometry(bbox)
          
          // 重置矩形绘制状态，但保留几何图形
          setBboxStart(null)
          setBboxEnd(null)
        }
        break
    }
  }

  // 处理鼠标移动（用于矩形编辑的实时预览）
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!editingNode || !editable || editMode !== 'bbox' || !bboxStart) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // 更新矩形终点以实现实时预览
    setBboxEnd({ x, y })
  }

  // 处理键盘事件（用于编辑模式）
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!editingNode || !editable) return

    if (editMode === 'polygon') {
      if (event.key === 'Enter' && polygonPoints.length >= 3) {
        // 完成多边形绘制 - 闭合多边形
        const polygonCoords = [...polygonPoints, polygonPoints[0]] // 闭合多边形
        setTempGeometry({
          type: 'Polygon',
          coordinates: [polygonCoords]
        })
      } else if (event.key === 'Escape') {
        // 取消当前多边形绘制
        setPolygonPoints([])
        setTempGeometry(null)
      } else if (event.key === 'Backspace' && polygonPoints.length > 0) {
        // 删除最后一个点
        setPolygonPoints(prev => prev.slice(0, -1))
        if (polygonPoints.length <= 3) {
          setTempGeometry(null)
        }
      }
    } else if (editMode === 'bbox' && bboxStart) {
      if (event.key === 'Escape') {
        // 取消矩形绘制
        setBboxStart(null)
        setBboxEnd(null)
      }
    }
  }

  // 完成当前编辑
  const completeEditing = () => {
    if (editMode === 'polygon' && polygonPoints.length >= 3) {
      // 闭合多边形
      const polygonCoords = [...polygonPoints, polygonPoints[0]]
      setTempGeometry({
        type: 'Polygon',
        coordinates: [polygonCoords]
      })
    }
    // 可以选择自动保存或让用户手动保存
  }

  // 重置当前编辑
  const resetEditing = () => {
    setPolygonPoints([])
    setBboxStart(null)
    setBboxEnd(null)
    setTempGeometry(null)
  }

  // 获取节点显示颜色
  const getNodeColor = (node: NodeResult) => {
    if (node.id === selectedNode?.id) return '#3b82f6' // 蓝色 - 选中
    if (node.id === editingNode?.id) return '#f59e0b' // 橙色 - 编辑中
    
    switch (node.healthStatus) {
      case 'HEALTHY': return '#10b981' // 绿色
      case 'WARNING': return '#f59e0b' // 橙色
      case 'ERROR': return '#ef4444' // 红色
      case 'OFFLINE': return '#6b7280' // 灰色
      default: return '#6b7280'
    }
  }

  // 获取节点类型显示名称
  const getNodeTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      'GLOBAL_ROOT': '全球根节点',
      'NATIONAL': '国家级节点',
      'REGIONAL': '区域节点',
      'LEAF': '叶子节点'
    }
    return typeMap[type] || type
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            节点地理分布
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fitToNodes}
            >
              <Search className="h-4 w-4 mr-1" />
              适应视图
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* 编辑工具栏 */}
        {editingNode && (
          <div className="flex flex-col gap-2 mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-800">编辑模式:</span>
              <div className="flex gap-1">
                {(['point', 'polygon', 'bbox'] as const).map(mode => (
                  <Button
                    key={mode}
                    variant={editMode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setEditMode(mode)
                      resetEditing()
                    }}
                    className="text-xs"
                  >
                    {mode === 'point' ? '点' : mode === 'polygon' ? '多边形' : '矩形'}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* 编辑模式特定工具 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {editMode === 'polygon' && (
                  <>
                    {polygonPoints.length >= 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={completeEditing}
                        className="text-xs"
                      >
                        完成多边形
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetEditing}
                      className="text-xs"
                    >
                      重置
                    </Button>
                  </>
                )}
                
                {editMode === 'bbox' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetEditing}
                    className="text-xs"
                  >
                    重置
                  </Button>
                )}
                
                {editMode === 'point' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetEditing}
                    className="text-xs"
                  >
                    重置
                  </Button>
                )}
              </div>
              
              {/* 状态指示器 */}
              <div className="text-xs text-orange-600">
                {editMode === 'point' && '点击地图设置点位置'}
                {editMode === 'polygon' && (
                  <span>
                    已添加 {polygonPoints.length} 个顶点
                    {polygonPoints.length >= 3 && ' (可完成多边形)'}
                  </span>
                )}
                {editMode === 'bbox' && bboxStart && '正在绘制矩形 (点击完成绘制)'}
                {editMode === 'bbox' && !bboxStart && '点击设置矩形起点'}
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex gap-1 ml-auto">
              <Button size="sm" onClick={saveEdit} disabled={!tempGeometry} className="text-xs">
                <Save className="h-3 w-3 mr-1" />
                保存
              </Button>
              <Button variant="outline" size="sm" onClick={cancelEdit} className="text-xs">
                <X className="h-3 w-3 mr-1" />
                取消
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        {/* 地图容器 */}
        <div
          ref={mapRef}
          className="relative bg-gray-100 border-t"
          style={{ 
            height: isFullscreen ? 'calc(100vh - 200px)' : height,
            cursor: editingNode ? 'crosshair' : 'default'
          }}
          onClick={handleMapClick}
          onMouseMove={handleMouseMove}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* 简化的地图显示 - 实际项目中应该使用真实的地图库如 Leaflet 或 Mapbox */}
          <div className="absolute inset-0 bg-blue-50">
            {/* 网格线 */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 10 }).map((_, i) => (
                <React.Fragment key={i}>
                  <div 
                    className="absolute top-0 bottom-0 border-r border-gray-300"
                    style={{ left: `${(i + 1) * 10}%` }}
                  />
                  <div 
                    className="absolute left-0 right-0 border-t border-gray-300"
                    style={{ top: `${(i + 1) * 10}%` }}
                  />
                </React.Fragment>
              ))}
            </div>

            {/* 节点标记 */}
            {nodes.map(node => {
              if (!node.latitude || !node.longitude) return null

              // 简化的坐标转换
              const x = ((node.longitude - mapState.center.lng) / (10 / mapState.zoom) + 0.5) * 100
              const y = ((mapState.center.lat - node.latitude) / (10 / mapState.zoom) + 0.5) * 100

              return (
                <div
                  key={node.id}
                  className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all cursor-pointer ${
                    node.id === selectedNode?.id ? 'scale-125 z-10' : 'hover:scale-110'
                  }`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    backgroundColor: getNodeColor(node),
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onNodeSelect?.(node)
                  }}
                  title={`${node.name}\n${formatCoverageForDisplay(node.coverage)}`}
                >
                  {/* 编辑中的节点特殊标记 */}
                  {node.id === editingNode?.id && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  )}
                </div>
              )
            })}

            {/* 编辑中的临时几何图形 */}
            {editingNode && (
              <div className="absolute inset-0 pointer-events-none">
                {/* 点编辑模式 */}
                {editMode === 'point' && tempGeometry?.type === 'Point' && (
                  <div
                    className="absolute w-6 h-6 rounded-full border-2 border-dashed border-orange-500"
                    style={{
                      left: `${((tempGeometry.coordinates[0] - mapState.center.lng) / (10 / mapState.zoom) + 0.5) * 100}%`,
                      top: `${((mapState.center.lat - tempGeometry.coordinates[1]) / (10 / mapState.zoom) + 0.5) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
                
                {/* 多边形编辑模式 */}
                {editMode === 'polygon' && (
                  <>
                    {/* 显示已点击的点 */}
                    {polygonPoints.map((point, index) => (
                      <div
                        key={`point-${index}`}
                        className="absolute w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-lg"
                        style={{
                          left: `${((point[0] - mapState.center.lng) / (10 / mapState.zoom) + 0.5) * 100}%`,
                          top: `${((mapState.center.lat - point[1]) / (10 / mapState.zoom) + 0.5) * 100}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        {/* 显示点的序号 */}
                        <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                    
                    {/* 显示连接线 */}
                    {polygonPoints.length > 1 && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <polyline
                          points={polygonPoints.map(coord => {
                            const x = ((coord[0] - mapState.center.lng) / (10 / mapState.zoom) + 0.5) * 100
                            const y = ((mapState.center.lat - coord[1]) / (10 / mapState.zoom) + 0.5) * 100
                            return `${x},${y}`
                          }).join(' ')}
                          fill="none"
                          stroke="rgb(251, 146, 60)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                        
                        {/* 如果有预览多边形，显示闭合线 */}
                        {tempGeometry?.type === 'Polygon' && polygonPoints.length >= 3 && (
                          <polyline
                            points={[...polygonPoints.map(coord => {
                              const x = ((coord[0] - mapState.center.lng) / (10 / mapState.zoom) + 0.5) * 100
                              const y = ((mapState.center.lat - coord[1]) / (10 / mapState.zoom) + 0.5) * 100
                              return `${x},${y}`
                            }), `${((polygonPoints[0][0] - mapState.center.lng) / (10 / mapState.zoom) + 0.5) * 100}%,${
                              ((mapState.center.lat - polygonPoints[0][1]) / (10 / mapState.zoom) + 0.5) * 100}%`].join(' ')}
                            fill="none"
                            stroke="rgb(34, 197, 94)"
                            strokeWidth="2"
                            strokeDasharray="3,3"
                          />
                        )}
                      </svg>
                    )}
                    
                    {/* 显示预览多边形填充 */}
                    {tempGeometry?.type === 'Polygon' && polygonPoints.length >= 3 && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <polygon
                          points={[...polygonPoints.map(coord => {
                            const x = ((coord[0] - mapState.center.lng) / (10 / mapState.zoom) + 0.5) * 100
                            const y = ((mapState.center.lat - coord[1]) / (10 / mapState.zoom) + 0.5) * 100
                            return `${x},${y}`
                          }), `${((polygonPoints[0][0] - mapState.center.lng) / (10 / mapState.zoom) + 0.5) * 100}%,${
                            ((mapState.center.lat - polygonPoints[0][1]) / (10 / mapState.zoom) + 0.5) * 100}%`].join(' ')}
                          fill="rgba(251, 146, 60, 0.2)"
                          stroke="rgb(251, 146, 60)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                      </svg>
                    )}
                  </>
                )}
                
                {/* 矩形编辑模式 */}
                {editMode === 'bbox' && (
                  <>
                    {/* 显示预览矩形（正在绘制中） */}
                    {bboxStart && bboxEnd && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <rect
                          x={`${Math.min(bboxStart.x, bboxEnd.x) / mapRef.current!.clientWidth * 100}%`}
                          y={`${Math.min(bboxStart.y, bboxEnd.y) / mapRef.current!.clientHeight * 100}%`}
                          width={`${Math.abs(bboxEnd.x - bboxStart.x) / mapRef.current!.clientWidth * 100}%`}
                          height={`${Math.abs(bboxEnd.y - bboxStart.y) / mapRef.current!.clientHeight * 100}%`}
                          fill="rgba(251, 146, 60, 0.2)"
                          stroke="rgb(251, 146, 60)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                        {/* 显示起点标记 */}
                        <circle
                          cx={`${bboxStart.x / mapRef.current!.clientWidth * 100}%`}
                          cy={`${bboxStart.y / mapRef.current!.clientHeight * 100}%`}
                          r="4"
                          fill="rgb(251, 146, 60)"
                          stroke="white"
                          strokeWidth="2"
                        />
                        {/* 显示当前鼠标位置标记 */}
                        <circle
                          cx={`${bboxEnd.x / mapRef.current!.clientWidth * 100}%`}
                          cy={`${bboxEnd.y / mapRef.current!.clientHeight * 100}%`}
                          r="4"
                          fill="rgb(251, 146, 60)"
                          stroke="white"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                    
                    {/* 显示已完成的矩形几何 */}
                    {tempGeometry?.type === 'Polygon' && !bboxStart && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <polygon
                          points={tempGeometry.coordinates[0].map(coord => {
                            const x = ((coord[0] - mapState.center.lng) / (10 / mapState.zoom) + 0.5) * 100
                            const y = ((mapState.center.lat - coord[1]) / (10 / mapState.zoom) + 0.5) * 100
                            return `${x},${y}`
                          }).join(' ')}
                          fill="rgba(34, 197, 94, 0.2)"
                          stroke="rgb(34, 197, 94)"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </>
                )}
                
                {/* 显示已完成的几何图形 */}
                {tempGeometry && (editMode === 'point' || (editMode === 'polygon' && polygonPoints.length === 0) || (editMode === 'bbox' && !bboxStart)) && (
                  <>
                    {tempGeometry.type === 'Point' && (
                      <div
                        className="absolute w-6 h-6 rounded-full border-2 border-dashed border-green-500"
                        style={{
                          left: `${((tempGeometry.coordinates[0] - mapState.center.lng) / (10 / mapState.zoom) + 0.5) * 100}%`,
                          top: `${((mapState.center.lat - tempGeometry.coordinates[1]) / (10 / mapState.zoom) + 0.5) * 100}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    )}
                    
                    {tempGeometry.type === 'Polygon' && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <polygon
                          points={tempGeometry.coordinates[0].map(coord => {
                            const x = ((coord[0] - mapState.center.lng) / (10 / mapState.zoom) + 0.5) * 100
                            const y = ((mapState.center.lat - coord[1]) / (10 / mapState.zoom) + 0.5) * 100
                            return `${x},${y}`
                          }).join(' ')}
                          fill="rgba(34, 197, 94, 0.2)"
                          stroke="rgb(34, 197, 94)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                      </svg>
                    )}
                    
                    {tempGeometry.type === 'MultiPolygon' && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {tempGeometry.coordinates.map((polygon, polygonIndex) => (
                          polygon.map((ring, ringIndex) => (
                            ringIndex === 0 && ( // 只渲染外环，忽略内环（孔洞）
                              <polygon
                                key={`${polygonIndex}-${ringIndex}`}
                                points={ring.map(coord => {
                                  const x = ((coord[0] - mapState.center.lng) / (10 / mapState.zoom) + 0.5) * 100
                                  const y = ((mapState.center.lat - coord[1]) / (10 / mapState.zoom) + 0.5) * 100
                                  return `${x},${y}`
                                }).join(' ')}
                                fill="rgba(34, 197, 94, 0.2)"
                                stroke="rgb(34, 197, 94)"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                              />
                            )
                          ))
                        ))}
                      </svg>
                    )}
                  </>
                )}
              </div>
            )}

            {/* 节点覆盖范围显示 */}
            {nodes.map(node => {
              if (!node.coverage) return null
              
              try {
                const geometry = JSON.parse(node.coverage)
                if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
                  const isSelected = node.id === selectedNode?.id
                  const isEditing = node.id === editingNode?.id
                  
                  return (
                    <svg key={`coverage-${node.id}`} className="absolute inset-0 w-full h-full pointer-events-none">
                      {geometry.type === 'Polygon' && geometry.coordinates.map((ring, ringIndex) => (
                        ringIndex === 0 && ( // 只渲染外环
                          <polygon
                            key={`ring-${ringIndex}`}
                            points={ring.map(coord => {
                              const x = ((coord[0] - mapState.center.lng) / (10 / mapState.zoom) + 0.5) * 100
                              const y = ((mapState.center.lat - coord[1]) / (10 / mapState.zoom) + 0.5) * 100
                              return `${x},${y}`
                            }).join(' ')}
                            fill={isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.1)'}
                            stroke={isSelected ? 'rgb(59, 130, 246)' : isEditing ? 'rgb(251, 146, 60)' : 'rgb(16, 185, 129)'}
                            strokeWidth={isSelected || isEditing ? 2 : 1}
                            strokeDasharray={isEditing ? "5,5" : "none"}
                          />
                        )
                      ))}
                      
                      {geometry.type === 'MultiPolygon' && geometry.coordinates.map((polygon, polygonIndex) => (
                        polygon.map((ring, ringIndex) => (
                          ringIndex === 0 && ( // 只渲染外环
                            <polygon
                              key={`polygon-${polygonIndex}-ring-${ringIndex}`}
                              points={ring.map(coord => {
                                const x = ((coord[0] - mapState.center.lng) / (10 / mapState.zoom) + 0.5) * 100
                                const y = ((mapState.center.lat - coord[1]) / (10 / mapState.zoom) + 0.5) * 100
                                return `${x},${y}`
                              }).join(' ')}
                              fill={isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.1)'}
                              stroke={isSelected ? 'rgb(59, 130, 246)' : isEditing ? 'rgb(251, 146, 60)' : 'rgb(16, 185, 129)'}
                              strokeWidth={isSelected || isEditing ? 2 : 1}
                              strokeDasharray={isEditing ? "5,5" : "none"}
                            />
                          )
                        ))
                      ))}
                    </svg>
                  )
                }
              } catch (error) {
                console.error('Failed to parse coverage for node:', node.id, error)
              }
              
              return null
            })}

            {/* 地图中心标记 */}
            <div
              className="absolute w-2 h-2 bg-red-500 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>

          {/* 地图信息叠加层 */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
            <div className="text-sm font-medium mb-2">地图信息</div>
            <div className="space-y-1 text-xs text-gray-600">
              <div>中心: {mapState.center.lat.toFixed(4)}, {mapState.center.lng.toFixed(4)}</div>
              <div>缩放: {mapState.zoom.toFixed(1)}</div>
              <div>节点数: {nodes.filter(n => n.latitude && n.longitude).length}</div>
            </div>
          </div>

          {/* 选中节点信息 */}
          {selectedNode && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">{selectedNode.name}</div>
                {editable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(selectedNode)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getNodeTypeName(selectedNode.type)}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ borderColor: getNodeColor(selectedNode) }}
                  >
                    {selectedNode.healthStatus}
                  </Badge>
                </div>
                <div>层级: {selectedNode.level}</div>
                <div>坐标: {selectedNode.latitude?.toFixed(4)}, {selectedNode.longitude?.toFixed(4)}</div>
                <div className="text-xs">
                  {formatCoverageForDisplay(selectedNode.coverage)}
                </div>
              </div>
            </div>
          )}

          {/* 编辑模式提示 */}
          {editingNode && (
            <div className="absolute bottom-4 left-4 bg-orange-100 border border-orange-300 rounded-lg px-3 py-2 max-w-xs">
              <div className="text-sm font-medium text-orange-800">
                正在编辑: {editingNode.name}
              </div>
              <div className="text-xs text-orange-600">
                {editMode === 'point' && '点击地图设置点位置'}
                {editMode === 'polygon' && (
                  <div>
                    <div>点击地图添加多边形顶点</div>
                    <div className="mt-1">• Enter: 完成多边形</div>
                    <div>• Backspace: 删除上一个点</div>
                    <div>• Esc: 取消绘制</div>
                  </div>
                )}
                {editMode === 'bbox' && (
                  <div>
                    <div>{bboxStart ? '点击设置矩形终点' : '点击设置矩形起点'}</div>
                    <div className="mt-1">• Esc: 取消绘制</div>
                    {bboxStart && <div>• 当前正在绘制矩形</div>}
                  </div>
                )}
              </div>
              {editMode === 'polygon' && polygonPoints.length > 0 && (
                <div className="text-xs text-orange-600 mt-1">
                  已添加 {polygonPoints.length} 个顶点 {polygonPoints.length >= 3 && '(可完成多边形)'}
                </div>
              )}
              {editMode === 'bbox' && bboxStart && (
                <div className="text-xs text-orange-600 mt-1">
                  正在绘制矩形 (点击完成绘制)
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}