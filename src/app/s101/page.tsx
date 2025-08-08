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
import { 
  Map, 
  Layers, 
  Download, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Eye,
  Settings,
  Database,
  Anchor,
  AlertTriangle,
  Info,
  Maximize
} from 'lucide-react'
import { mockS101Datasets, S101_FEATURE_TYPES } from '@/mock-data'

interface S101Dataset {
  id: string
  name: string
  description: string
  version: string
  nodeId: string
  nodeName: string
  status: string
  publishedAt: string
  coverage: any
  scale: string
  edition: number
  updateNumber: number
  features: Array<{
    type: string
    count: number
  }>
}

export default function S101Page() {
  const [datasets, setDatasets] = useState<S101Dataset[]>(mockS101Datasets)
  const [selectedDataset, setSelectedDataset] = useState<S101Dataset | null>(mockS101Datasets[0])
  const [mapCenter, setMapCenter] = useState<[number, number]>([121.5, 31.2])
  const [mapZoom, setMapZoom] = useState(10)
  const [visibleLayers, setVisibleLayers] = useState<string[]>(['DEPARE', 'BOYLAT', 'LIGHTS'])
  const [serviceParams, setServiceParams] = useState({
    format: 'image/png',
    transparent: true,
    width: 800,
    height: 600
  })
  const [loading, setLoading] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)

  // 切换图层可见性
  const toggleLayer = (layerType: string) => {
    setVisibleLayers(prev => 
      prev.includes(layerType) 
        ? prev.filter(l => l !== layerType)
        : [...prev, layerType]
    )
  }

  // 生成WMS URL
  const generateWmsUrl = (dataset: S101Dataset) => {
    const params = new URLSearchParams({
      service: 'WMS',
      version: '1.3.0',
      request: 'GetMap',
      layers: dataset.id,
      styles: '',
      crs: 'EPSG:4326',
      bbox: '121.0,31.0,122.0,32.0',
      width: serviceParams.width.toString(),
      height: serviceParams.height.toString(),
      format: serviceParams.format,
      transparent: serviceParams.transparent.toString()
    })
    
    return `/api/s101/wms?${params.toString()}`
  }

  // 生成WFS URL
  const generateWfsUrl = (dataset: S101Dataset) => {
    const params = new URLSearchParams({
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: 'S101',
      dataset: dataset.id,
      outputFormat: 'GeoJSON',
      maxFeatures: '1000'
    })
    
    return `/api/s101/wfs?${params.toString()}`
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Map className="h-8 w-8 text-blue-600" />
            S-101电子海图服务
          </h1>
          <p className="text-gray-600 mt-2">
            基于S-101标准的电子海图Web地图服务和要素服务
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/datasets">
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              数据集管理
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

          {/* 图层控制 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5" />
                图层控制
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(S101_FEATURE_TYPES).map(([type, info]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: info.color }}
                      />
                      <span className="text-sm">{info.name}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={visibleLayers.includes(type)}
                      onChange={() => toggleLayer(type)}
                      className="rounded"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 服务参数 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                服务参数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>透明背景</Label>
                  <Select 
                    value={serviceParams.transparent.toString()} 
                    onValueChange={(value) => setServiceParams(prev => ({ ...prev, transparent: value === 'true' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">是</SelectItem>
                      <SelectItem value="false">否</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>宽度</Label>
                    <Input
                      type="number"
                      value={serviceParams.width}
                      onChange={(e) => setServiceParams(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>高度</Label>
                    <Input
                      type="number"
                      value={serviceParams.height}
                      onChange={(e) => setServiceParams(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                    />
                  </div>
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
                  <Map className="h-5 w-5" />
                  地图显示
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
                className="relative bg-blue-50 rounded-lg overflow-hidden"
                style={{ height: '500px' }}
              >
                {/* 模拟地图显示 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700">S-101电子海图</p>
                    <p className="text-sm text-gray-500">
                      {selectedDataset?.name || '请选择数据集'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      缩放级别: {mapZoom} | 中心: {mapCenter[0].toFixed(2)}, {mapCenter[1].toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* 模拟海图要素 */}
                {selectedDataset && (
                  <>
                    <div className="absolute top-20 left-20 w-32 h-24 bg-blue-400 opacity-30 border-2 border-blue-600 rounded">
                      <span className="text-xs text-blue-800 ml-1">DEPARE</span>
                    </div>
                    <div className="absolute top-40 right-32 w-8 h-8 bg-red-400 opacity-60 border-2 border-red-600 rounded-full">
                      <span className="text-xs text-red-800 ml-1">⚓</span>
                    </div>
                    <div className="absolute bottom-32 left-40 w-16 h-4 bg-yellow-400 opacity-80 border border-yellow-600">
                      <span className="text-xs text-yellow-800 ml-1">LIGHTS</span>
                    </div>
                    <div className="absolute top-60 right-20 w-6 h-12 bg-green-400 opacity-60 border border-green-600 rounded">
                      <span className="text-xs text-green-800 ml-1">BUOY</span>
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

                {/* 图例 */}
                <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg">
                  <h4 className="text-sm font-medium mb-2">图例</h4>
                  <div className="space-y-1">
                    {visibleLayers.map(layerType => {
                      const info = S101_FEATURE_TYPES[layerType as keyof typeof S101_FEATURE_TYPES]
                      return (
                        <div key={layerType} className="flex items-center gap-2 text-xs">
                          <div 
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: info.color }}
                          />
                          <span>{info.name}</span>
                        </div>
                      )
                    })}
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
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info">基本信息</TabsTrigger>
                    <TabsTrigger value="features">要素统计</TabsTrigger>
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
                        <Label>比例尺</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedDataset.scale}</p>
                      </div>
                      <div>
                        <Label>版本号</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedDataset.edition}年 第{selectedDataset.updateNumber}版</p>
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
                      <Label>描述</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedDataset.description}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="features" className="space-y-4">
                    <div>
                      <Label>要素类型统计</Label>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>要素类型</TableHead>
                            <TableHead>名称</TableHead>
                            <TableHead>数量</TableHead>
                            <TableHead>颜色</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedDataset.features.map((feature) => {
                            const info = S101_FEATURE_TYPES[feature.type as keyof typeof S101_FEATURE_TYPES]
                            return (
                              <TableRow key={feature.type}>
                                <TableCell className="font-mono">{feature.type}</TableCell>
                                <TableCell>{info?.name || feature.type}</TableCell>
                                <TableCell>{feature.count}</TableCell>
                                <TableCell>
                                  <div 
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: info?.color || '#ccc' }}
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="services" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Map className="h-4 w-4" />
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
                              下载
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Web要素服务 (WFS)
                        </Label>
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-mono text-gray-600 break-all">
                            {generateWfsUrl(selectedDataset)}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(generateWfsUrl(selectedDataset), '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              查看数据
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => downloadServiceResponse(generateWfsUrl(selectedDataset), `${selectedDataset.name}_wfs.geojson`)}
                              disabled={loading}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              下载GeoJSON
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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