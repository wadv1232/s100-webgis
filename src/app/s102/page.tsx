'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Slider } from '@/components/ui/slider'
import { 
  Waves, 
  Download, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Eye,
  Settings,
  Database,
  Anchor,
  Activity,
  Layers,
  Palette,
  Clock,
  Mountain,
  Maximize
} from 'lucide-react'
import { mockS102Datasets, COLOR_SCALES, RENDER_STYLES } from '@/mock-data'

interface S102Dataset {
  id: string
  name: string
  description: string
  version: string
  nodeId: string
  nodeName: string
  status: string
  publishedAt: string
  coverage: any
  resolution: string
  verticalDatum: string
  horizontalDatum: string
  depthRange: { min: number; max: number }
  gridSize: { width: number; height: number }
  timeRange: { start: string; end: string }
  metadata: {
    surveyMethod: string
    accuracy: string
    density: string
    processingLevel: string
  }
}

export default function S102Page() {
  const [datasets, setDatasets] = useState<S102Dataset[]>(mockS102Datasets)
  const [selectedDataset, setSelectedDataset] = useState<S102Dataset | null>(mockS102Datasets[0])
  const [mapCenter, setMapCenter] = useState<[number, number]>([121.5, 31.2])
  const [mapZoom, setMapZoom] = useState(10)
  const [serviceParams, setServiceParams] = useState({
    format: 'image/png',
    width: 800,
    height: 600,
    style: 'default',
    colorScale: 'viridis',
    elevation: 0,
    time: ''
  })
  const [loading, setLoading] = useState(false)
  const [depthRange, setDepthRange] = useState<[number, number]>([-50, 0])

  const mapRef = useRef<HTMLDivElement>(null)

  // 生成WCS URL
  const generateWcsUrl = (dataset: S102Dataset) => {
    const params = new URLSearchParams({
      service: 'WCS',
      version: '2.0.1',
      request: 'GetCoverage',
      coverageid: dataset.id,
      format: serviceParams.format === 'image/png' ? 'GeoTIFF' : serviceParams.format,
      bbox: '121.0,31.0,122.0,32.0',
      width: serviceParams.width.toString(),
      height: serviceParams.height.toString(),
      crs: 'EPSG:4326'
    })
    
    if (serviceParams.time) {
      params.append('time', serviceParams.time)
    }
    
    return `/api/s102/wcs?${params.toString()}`
  }

  // 生成WMS URL
  const generateWmsUrl = (dataset: S102Dataset) => {
    const params = new URLSearchParams({
      service: 'WMS',
      version: '1.3.0',
      request: 'GetMap',
      layers: dataset.id,
      styles: serviceParams.style,
      crs: 'EPSG:4326',
      bbox: '121.0,31.0,122.0,32.0',
      width: serviceParams.width.toString(),
      height: serviceParams.height.toString(),
      format: serviceParams.format,
      transparent: 'true',
      colorScale: serviceParams.colorScale
    })
    
    if (serviceParams.time) {
      params.append('time', serviceParams.time)
    }
    
    if (serviceParams.elevation !== 0) {
      params.append('elevation', serviceParams.elevation.toString())
    }
    
    return `/api/s102/wms?${params.toString()}`
  }

  // 缩放控制
  const zoomIn = () => setMapZoom(prev => Math.min(prev + 1, 18))
  const zoomOut = () => setMapZoom(prev => Math.max(prev - 1, 1))
  const resetView = () => {
    setMapCenter([121.5, 31.2])
    setMapZoom(10)
  }

  // 下载服务响应
  const downloadServiceResponse = async (url: string, filename: string) => {
    try {
      setLoading(true)
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('下载失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 格式化深度值
  const formatDepth = (depth: number) => {
    return `${Math.abs(depth).toFixed(1)}m`
  }

  useEffect(() => {
    if (selectedDataset) {
      setDepthRange([selectedDataset.depthRange.min, selectedDataset.depthRange.max])
    }
  }, [selectedDataset])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Waves className="h-8 w-8 text-blue-600" />
            S-102高精度水深服务
          </h1>
          <p className="text-gray-600 mt-2">
            基于S-102标准的高精度水深格网数据Web覆盖服务和地图服务
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/datasets">
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              数据集管理
            </Button>
          </Link>
          <Link href="/s101">
            <Button variant="outline">
              <Mountain className="h-4 w-4 mr-2" />
              S-101服务
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧控制面板 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 数据集选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">数据集选择</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedDataset?.id || ''} 
                onValueChange={(value) => {
                  const dataset = datasets.find(d => d.id === value)
                  setSelectedDataset(dataset || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择数据集" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* 渲染参数 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                渲染参数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>渲染样式</Label>
                  <Select 
                    value={serviceParams.style} 
                    onValueChange={(value) => setServiceParams(prev => ({ ...prev, style: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RENDER_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.icon} {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>颜色映射</Label>
                  <Select 
                    value={serviceParams.colorScale} 
                    onValueChange={(value) => setServiceParams(prev => ({ ...prev, colorScale: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_SCALES.map((scale) => (
                        <SelectItem key={scale.value} value={scale.value}>
                          {scale.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>输出格式</Label>
                  <Select 
                    value={serviceParams.format} 
                    onValueChange={(value) => setServiceParams(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image/png">PNG</SelectItem>
                      <SelectItem value="image/jpeg">JPEG</SelectItem>
                      <SelectItem value="image/svg+xml">SVG</SelectItem>
                      <SelectItem value="GeoTIFF">GeoTIFF</SelectItem>
                      <SelectItem value="NetCDF">NetCDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>图像尺寸</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">宽度</Label>
                      <Input
                        type="number"
                        value={serviceParams.width}
                        onChange={(e) => setServiceParams(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">高度</Label>
                      <Input
                        type="number"
                        value={serviceParams.height}
                        onChange={(e) => setServiceParams(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>时间维度</Label>
                  <Input
                    type="datetime-local"
                    value={serviceParams.time}
                    onChange={(e) => setServiceParams(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>高程维度: {serviceParams.elevation}m</Label>
                  <Slider
                    value={[serviceParams.elevation]}
                    onValueChange={(value) => setServiceParams(prev => ({ ...prev, elevation: value[0] }))}
                    min={depthRange[0]}
                    max={depthRange[1]}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧主内容区 */}
        <div className="lg:col-span-3 space-y-4">
          {/* 地图显示区 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Waves className="h-5 w-5" />
                  水深地图
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={zoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={zoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={resetView}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => window.open(generateWmsUrl(selectedDataset!), '_blank')}>
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={mapRef}
                className="relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden"
                style={{ height: '500px' }}
              >
                {/* 模拟水深地图显示 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Waves className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700">S-102高精度水深数据</p>
                    <p className="text-sm text-gray-600">
                      {selectedDataset?.name || '请选择数据集'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      分辨率: {selectedDataset?.resolution} | 缩放: {mapZoom}
                    </p>
                  </div>
                </div>

                {/* 模拟水深渐变区域 */}
                {selectedDataset && (
                  <>
                    <div className="absolute top-20 left-20 w-48 h-36 bg-gradient-to-br from-blue-800 via-blue-500 to-blue-300 opacity-70 rounded-lg">
                      <span className="text-xs text-white ml-2 mt-1 inline-block">深水区</span>
                    </div>
                    <div className="absolute top-40 right-32 w-32 h-24 bg-gradient-to-br from-green-500 via-green-300 to-yellow-300 opacity-70 rounded-lg">
                      <span className="text-xs text-gray-800 ml-2 mt-1 inline-block">浅水区</span>
                    </div>
                    <div className="absolute bottom-32 left-40 w-40 h-28 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 opacity-70 rounded-lg">
                      <span className="text-xs text-white ml-2 mt-1 inline-block">极浅区</span>
                    </div>
                    <div className="absolute top-60 right-20 w-24 h-24 bg-red-500 opacity-80 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">⚠</span>
                    </div>
                  </>
                )}

                {/* 地图控制按钮 */}
                <div className="absolute top-4 right-4 flex flex-col gap-1">
                  <Button variant="outline" size="sm" className="bg-white/90">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white/90">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white/90">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* 深度图例 */}
                <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg">
                  <h4 className="text-sm font-medium mb-2">深度图例 (m)</h4>
                  <div className="w-32 h-4 bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-400 to-blue-800 rounded"></div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>0</span>
                    <span>25</span>
                    <span>50+</span>
                  </div>
                </div>

                {/* 样式指示器 */}
                <div className="absolute top-4 left-4 bg-white/90 p-2 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2 text-xs">
                    <Palette className="h-3 w-3" />
                    <span>{serviceParams.style}</span>
                    <span>•</span>
                    <span>{serviceParams.colorScale}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 数据集详情和服务 */}
          <Card>
            <CardHeader>
              <CardTitle>数据集详情</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDataset ? (
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="info">基本信息</TabsTrigger>
                    <TabsTrigger value="quality">数据质量</TabsTrigger>
                    <TabsTrigger value="coverage">覆盖范围</TabsTrigger>
                    <TabsTrigger value="services">服务接口</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>数据集名称</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedDataset.name}</p>
                      </div>
                      <div>
                        <Label>版本</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedDataset.version}</p>
                      </div>
                      <div>
                        <Label>分辨率</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedDataset.resolution}</p>
                      </div>
                      <div>
                        <Label>网格尺寸</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedDataset.gridSize.width} × {selectedDataset.gridSize.height}
                        </p>
                      </div>
                      <div>
                        <Label>垂直基准</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedDataset.verticalDatum}</p>
                      </div>
                      <div>
                        <Label>水平基准</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedDataset.horizontalDatum}</p>
                      </div>
                      <div>
                        <Label>所属节点</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedDataset.nodeName}</p>
                      </div>
                      <div>
                        <Label>发布时间</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(selectedDataset.publishedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label>深度范围</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDepth(selectedDataset.depthRange.min)} ~ {formatDepth(selectedDataset.depthRange.max)}
                      </p>
                    </div>
                    <div>
                      <Label>时间范围</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(selectedDataset.timeRange.start).toLocaleDateString()} ~ {new Date(selectedDataset.timeRange.end).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label>描述</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedDataset.description}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="quality" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>测量方法</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedDataset.metadata.surveyMethod}</p>
                      </div>
                      <div>
                        <Label>精度</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedDataset.metadata.accuracy}</p>
                      </div>
                      <div>
                        <Label>数据密度</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedDataset.metadata.density}</p>
                      </div>
                      <div>
                        <Label>处理级别</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedDataset.metadata.processingLevel}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="coverage" className="space-y-4">
                    <div>
                      <Label>覆盖范围</Label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          多边形范围: {selectedDataset.coverage.coordinates[0][0][0].toFixed(2)}, {selectedDataset.coverage.coordinates[0][0][1].toFixed(2)} 
                          ~ {selectedDataset.coverage.coordinates[0][2][0].toFixed(2)}, {selectedDataset.coverage.coordinates[0][2][1].toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="services" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Web覆盖服务 (WCS)
                        </Label>
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-mono text-gray-600 break-all">
                            {generateWcsUrl(selectedDataset)}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(generateWcsUrl(selectedDataset), '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              预览
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => downloadServiceResponse(generateWcsUrl(selectedDataset), `${selectedDataset.name}_wcs.tif`)}
                              disabled={loading}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              下载GeoTIFF
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="flex items-center gap-2">
                          <Waves className="h-4 w-4" />
                          Web地图服务 (WMS)
                        </Label>
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-mono text-gray-600 break-all">
                            {generateWmsUrl(selectedDataset)}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(generateWmsUrl(selectedDataset), '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              预览
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => downloadServiceResponse(generateWmsUrl(selectedDataset), `${selectedDataset.name}_wms.png`)}
                              disabled={loading}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              下载图像
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">请选择一个数据集查看详情</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}