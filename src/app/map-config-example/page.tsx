'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import EnhancedMapWithConfig from '@/components/maps/EnhancedMapWithConfig'
import MapLayerSelector from '@/components/maps/MapLayerSelector'
import { useMapConfig } from '@/hooks/useMapConfig'
import { 
  MapPin, 
  Layers, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Globe,
  Satellite,
  Mountain,
  Car,
  RefreshCw,
  Copy,
  Download
} from 'lucide-react'

export default function MapConfigExample() {
  const {
    mapConfig,
    envConfig,
    isLoading: configLoading,
    error: configError,
    currentLayer,
    setCurrentLayer,
    getLayerUrl,
    getLayersByType,
    configWarnings,
    isValidConfig,
    reloadConfig
  } = useMapConfig()

  const [activeTab, setActiveTab] = useState('demo')

  // 示例数据
  const sampleFeatures = [
    {
      id: 'sample_1',
      type: 'Point' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [116.4074, 39.9042] // 北京
      },
      properties: {
        name: '北京',
        created: new Date().toISOString(),
        type: 'Point'
      },
      style: {
        color: '#3b82f6',
        radius: 8
      }
    },
    {
      id: 'sample_2',
      type: 'Point' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [121.4737, 31.2304] // 上海
      },
      properties: {
        name: '上海',
        created: new Date().toISOString(),
        type: 'Point'
      },
      style: {
        color: '#10b981',
        radius: 8
      }
    }
  ]

  // 获取图层类型统计
  const getLayerStats = () => {
    const stats = {
      vector: 0,
      satellite: 0,
      terrain: 0,
      traffic: 0,
      custom: 0
    }

    mapConfig.layers.forEach(layer => {
      stats[layer.type]++
    })

    return stats
  }

  const layerStats = getLayerStats()

  // 复制环境变量示例
  const copyEnvExample = () => {
    const envExample = `# 地图服务配置

# 天地图配置
# 申请地址: https://console.tianditu.gov.cn/api/key
NEXT_PUBLIC_TIANDITU_ENABLED=false
NEXT_PUBLIC_TIANDITU_TOKEN=your_tianditu_token_here

# 高德地图配置
# 申请地址: https://lbs.amap.com/api/javascript-api/guide/create-project/key
NEXT_PUBLIC_GAODE_MAP_ENABLED=true
NEXT_PUBLIC_GAODE_MAP_KEY=your_gaode_map_key_here

# 腾讯地图配置
# 申请地址: https://lbs.qq.com/webApi/javascriptGL/glGuide/glBasic
NEXT_PUBLIC_TENCENT_MAP_ENABLED=true
NEXT_PUBLIC_TENCENT_MAP_KEY=your_tencent_map_key_here

# 百度地图配置
# 申请地址: https://lbsyun.baidu.com/apiconsole/key
NEXT_PUBLIC_BAIDU_MAP_ENABLED=true
NEXT_PUBLIC_BAIDU_MAP_KEY=your_baidu_map_key_here`

    navigator.clipboard.writeText(envExample)
  }

  if (configLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>地图配置加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Globe className="h-8 w-8" />
          地图配置示例
        </h1>
        <p className="text-gray-600">
          支持多种底图配置，包括 OpenStreetMap、天地图、高德地图、腾讯地图、百度地图等
        </p>
      </div>

      {/* 配置状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            配置状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {isValidConfig ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span>配置状态: {isValidConfig ? '正常' : '有警告'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-500" />
              <span>可用图层: {mapConfig.layers.length} 个</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              <span>矢量地图: {layerStats.vector} 个</span>
            </div>
            <div className="flex items-center gap-2">
              <Satellite className="h-5 w-5 text-purple-500" />
              <span>卫星影像: {layerStats.satellite} 个</span>
            </div>
          </div>

          {configWarnings.length > 0 && (
            <Alert variant="warning" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">配置警告:</div>
                  {configWarnings.map((warning, index) => (
                    <div key={index} className="text-sm">• {warning}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 主要内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo">地图演示</TabsTrigger>
          <TabsTrigger value="layers">图层管理</TabsTrigger>
          <TabsTrigger value="config">配置说明</TabsTrigger>
          <TabsTrigger value="api">API文档</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>地图演示</CardTitle>
              <CardDescription>
                使用配置的地图服务，支持多种底图切换
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedMapWithConfig
                initialFeatures={sampleFeatures}
                title="地图配置演示"
                description="展示多种底图配置功能"
                height="600px"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 图层选择器 */}
            <Card>
              <CardHeader>
                <CardTitle>图层选择器</CardTitle>
                <CardDescription>
                  选择和切换不同的底图图层
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MapLayerSelector
                  currentLayerId={currentLayer?.id || mapConfig.defaultLayer}
                  onLayerChange={(layerId) => setCurrentLayer(layerId)}
                  mapConfig={mapConfig}
                  configWarnings={configWarnings}
                  onReloadConfig={reloadConfig}
                />
              </CardContent>
            </Card>

            {/* 图层统计 */}
            <Card>
              <CardHeader>
                <CardTitle>图层统计</CardTitle>
                <CardDescription>
                  按类型统计可用图层
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>矢量地图</span>
                    </div>
                    <Badge variant="secondary">{layerStats.vector}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Satellite className="h-4 w-4" />
                      <span>卫星影像</span>
                    </div>
                    <Badge variant="secondary">{layerStats.satellite}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4" />
                      <span>地形图</span>
                    </div>
                    <Badge variant="secondary">{layerStats.terrain}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span>路况图</span>
                    </div>
                    <Badge variant="secondary">{layerStats.traffic}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>自定义</span>
                    </div>
                    <Badge variant="secondary">{layerStats.custom}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 所有图层列表 */}
          <Card>
            <CardHeader>
              <CardTitle>所有图层</CardTitle>
              <CardDescription>
                当前配置的所有可用图层
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mapConfig.layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      currentLayer?.id === layer.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentLayer(layer.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{layer.name}</h3>
                      {layer.token && (
                        <Badge variant="outline" className="text-xs">
                          需要密钥
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      类型: {layer.type}
                    </div>
                    <div className="text-xs text-gray-500">
                      缩放: {layer.minZoom}-{layer.maxZoom}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 环境变量配置 */}
            <Card>
              <CardHeader>
                <CardTitle>环境变量配置</CardTitle>
                <CardDescription>
                  配置各种地图服务的API密钥
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">天地图</span>
                      <Badge variant={envConfig.tianditu.enabled ? 'default' : 'secondary'}>
                        {envConfig.tianditu.enabled ? '已启用' : '已禁用'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Token: {envConfig.tianditu.token ? '已配置' : '未配置'}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">高德地图</span>
                      <Badge variant={envConfig.gaode.enabled ? 'default' : 'secondary'}>
                        {envConfig.gaode.enabled ? '已启用' : '已禁用'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Key: {envConfig.gaode.key ? '已配置' : '未配置'}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">腾讯地图</span>
                      <Badge variant={envConfig.tencent.enabled ? 'default' : 'secondary'}>
                        {envConfig.tencent.enabled ? '已启用' : '已禁用'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Key: {envConfig.tencent.key ? '已配置' : '未配置'}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">百度地图</span>
                      <Badge variant={envConfig.baidu.enabled ? 'default' : 'secondary'}>
                        {envConfig.baidu.enabled ? '已启用' : '已禁用'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Key: {envConfig.baidu.key ? '已配置' : '未配置'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 配置文件说明 */}
            <Card>
              <CardHeader>
                <CardTitle>配置文件</CardTitle>
                <CardDescription>
                  地图配置相关文件说明
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded">
                    <h4 className="font-medium mb-1">config/map-config.ts</h4>
                    <p className="text-sm text-gray-600">
                      地图图层配置文件，定义所有可用的底图图层
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <h4 className="font-medium mb-1">config/map-env.ts</h4>
                    <p className="text-sm text-gray-600">
                      环境配置文件，处理API密钥和环境变量
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <h4 className="font-medium mb-1">src/hooks/useMapConfig.ts</h4>
                    <p className="text-sm text-gray-600">
                      地图配置Hook，提供配置管理和状态
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <h4 className="font-medium mb-1">src/components/maps/MapLayerSelector.tsx</h4>
                    <p className="text-sm text-gray-600">
                      图层选择器组件，提供图层切换界面
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 环境变量示例 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>环境变量示例</CardTitle>
                  <CardDescription>
                    复制此配置到您的 .env.local 文件中
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={copyEnvExample}>
                  <Copy className="h-4 w-4 mr-1" />
                  复制
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`# 地图服务配置

# 天地图配置
# 申请地址: https://console.tianditu.gov.cn/api/key
NEXT_PUBLIC_TIANDITU_ENABLED=false
NEXT_PUBLIC_TIANDITU_TOKEN=your_tianditu_token_here

# 高德地图配置
# 申请地址: https://lbs.amap.com/api/javascript-api/guide/create-project/key
NEXT_PUBLIC_GAODE_MAP_ENABLED=true
NEXT_PUBLIC_GAODE_MAP_KEY=your_gaode_map_key_here

# 腾讯地图配置
# 申请地址: https://lbs.qq.com/webApi/javascriptGL/glGuide/glBasic
NEXT_PUBLIC_TENCENT_MAP_ENABLED=true
NEXT_PUBLIC_TENCENT_MAP_KEY=your_tencent_map_key_here

# 百度地图配置
# 申请地址: https://lbsyun.baidu.com/apiconsole/key
NEXT_PUBLIC_BAIDU_MAP_ENABLED=true
NEXT_PUBLIC_BAIDU_MAP_KEY=your_baidu_map_key_here`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hook API */}
            <Card>
              <CardHeader>
                <CardTitle>useMapConfig Hook</CardTitle>
                <CardDescription>
                  地图配置管理的React Hook
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">基本用法</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const {
  mapConfig,
  envConfig,
  currentLayer,
  setCurrentLayer,
  getLayerUrl,
  configWarnings,
  isValidConfig,
  reloadConfig
} = useMapConfig()`}</pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">主要属性</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• mapConfig: 地图配置对象</li>
                      <li>• envConfig: 环境配置对象</li>
                      <li>• currentLayer: 当前选中的图层</li>
                      <li>• configWarnings: 配置警告信息</li>
                      <li>• isValidConfig: 配置是否有效</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">主要方法</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• setCurrentLayer(layerId): 设置当前图层</li>
                      <li>• getLayerUrl(layerId): 获取图层URL</li>
                      <li>• reloadConfig(): 重新加载配置</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 组件 API */}
            <Card>
              <CardHeader>
                <CardTitle>MapLayerSelector 组件</CardTitle>
                <CardDescription>
                  图层选择器组件API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Props</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`interface MapLayerSelectorProps {
  currentLayerId: string
  onLayerChange: (layerId: string) => void
  mapConfig: MapConfig
  configWarnings?: string[]
  onReloadConfig?: () => void
  showWarnings?: boolean
  compact?: boolean
}`}</pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">使用示例</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<MapLayerSelector
  currentLayerId={currentLayer?.id}
  onLayerChange={setCurrentLayer}
  mapConfig={mapConfig}
  configWarnings={configWarnings}
  onReloadConfig={reloadConfig}
/>`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 类型定义 */}
          <Card>
            <CardHeader>
              <CardTitle>类型定义</CardTitle>
              <CardDescription>
                主要的TypeScript类型定义
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`interface MapTileLayer {
  id: string
  name: string
  type: 'vector' | 'satellite' | 'terrain' | 'traffic' | 'custom'
  url: string
  attribution: string
  maxZoom?: number
  minZoom?: number
  tileSize?: number
  token?: string
  subdomains?: string[]
  options?: {
    [key: string]: any
  }
}

interface MapConfig {
  defaultLayer: string
  layers: MapTileLayer[]
  center: [number, number]
  zoom: number
  minZoom: number
  maxZoom: number
}`}</pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}