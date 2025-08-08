'use client'

import { useState } from 'react'
import EnhancedMap from '@/components/EnhancedMap'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Layers, 
  Code, 
  Settings, 
  Download,
  Upload,
  FileText,
  Database
} from 'lucide-react'

// Sample initial features
const sampleFeatures = [
  {
    id: 'sample_point_1',
    type: 'Point' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: [121.5000, 31.2000]
    },
    properties: {
      name: '上海样本点',
      created: new Date().toISOString(),
      type: 'sample'
    },
    style: {
      color: '#3b82f6',
      radius: 8
    }
  },
  {
    id: 'sample_polygon_1',
    type: 'Polygon' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[
        [121.4000, 31.1000],
        [121.6000, 31.1000],
        [121.6000, 31.3000],
        [121.4000, 31.3000],
        [121.4000, 31.1000]
      ]]
    },
    properties: {
      name: '上海样本区域',
      created: new Date().toISOString(),
      type: 'sample'
    },
    style: {
      color: '#f59e0b',
      weight: 2,
      fillColor: '#f59e0b',
      fillOpacity: 0.2
    }
  }
]

export default function EnhancedMapPage() {
  const [features, setFeatures] = useState(sampleFeatures)
  const [instructions, setInstructions] = useState<any[]>([])
  const [selectedTool, setSelectedTool] = useState('draw')

  const handleFeaturesChange = (newFeatures: any[]) => {
    setFeatures(newFeatures)
  }

  const handleInstructionsGenerated = (newInstructions: any[]) => {
    setInstructions(newInstructions)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">增强地图编辑器</h1>
          <p className="text-muted-foreground">
            基于 Leaflet + leaflet-draw 的 GIS 数据编辑工具
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <MapPin className="h-3 w-3 mr-1" />
            {features.length} 个要素
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Code className="h-3 w-3 mr-1" />
            {instructions.length} 条指令
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            地图编辑
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            要素管理
          </TabsTrigger>
          <TabsTrigger value="instructions" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            绘图指令
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            设置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <EnhancedMap
            initialFeatures={sampleFeatures}
            onFeaturesChange={handleFeaturesChange}
            onInstructionsGenerated={handleInstructionsGenerated}
            editable={true}
            height="600px"
            title="GIS 数据编辑器"
            description="使用工具栏绘制点、线、面等地理要素"
          />
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  要素列表
                </CardTitle>
                <CardDescription>
                  当前地图中的所有地理要素
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {features.map((feature) => (
                    <div key={feature.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{feature.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(feature.properties?.created).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{feature.properties?.name || '未命名要素'}</div>
                        <div className="text-muted-foreground mt-1">
                          ID: {feature.id}
                        </div>
                      </div>
                      <div className="mt-2 text-xs font-mono bg-muted p-2 rounded">
                        {JSON.stringify(feature.geometry, null, 2)}
                      </div>
                    </div>
                  ))}
                  {features.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      暂无要素，请在地图中绘制
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  要素统计
                </CardTitle>
                <CardDescription>
                  地理要素的类型分布和统计信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {features.filter(f => f.type === 'Point').length}
                      </div>
                      <div className="text-sm text-muted-foreground">点要素</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {features.filter(f => f.type === 'LineString').length}
                      </div>
                      <div className="text-sm text-muted-foreground">线要素</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {features.filter(f => f.type === 'Polygon').length}
                      </div>
                      <div className="text-sm text-muted-foreground">面要素</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {features.filter(f => f.type === 'Rectangle' || f.type === 'Circle').length}
                      </div>
                      <div className="text-sm text-muted-foreground">其他要素</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">操作</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        导出 GeoJSON
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        导入 GeoJSON
                      </Button>
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        生成报告
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  绘图指令
                </CardTitle>
                <CardDescription>
                  由地理要素生成的绘图指令，可用于后端渲染
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {instructions.length} 条指令
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      导出指令
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <pre className="text-sm overflow-x-auto">
                      {instructions.length > 0 ? (
                        JSON.stringify(instructions, null, 2)
                      ) : (
                        <div className="text-muted-foreground text-center py-4">
                          暂无指令，绘制要素后自动生成
                        </div>
                      )}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  指令说明
                </CardTitle>
                <CardDescription>
                  绘图指令的格式和使用方法
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">指令格式</h4>
                    <div className="bg-muted p-3 rounded text-xs font-mono">
{`{
  "id": "instruction_123",
  "type": "draw",
  "featureType": "Point",
  "geometry": {
    "type": "Point",
    "coordinates": [121.5, 31.2]
  },
  "properties": {...},
  "style": {...},
  "timestamp": 1234567890
}`}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">指令类型</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• <strong>draw</strong>: 绘制新要素</li>
                      <li>• <strong>edit</strong>: 编辑现有要素</li>
                      <li>• <strong>delete</strong>: 删除要素</li>
                      <li>• <strong>style</strong>: 修改要素样式</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">使用场景</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• 后端渲染引擎接收指令并绘制</li>
                      <li>• S-100 产品底图显示实现</li>
                      <li>• 地理数据批量处理</li>
                      <li>• 地图服务集成</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  编辑设置
                </CardTitle>
                <CardDescription>
                  配置地图编辑器的各种参数
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">绘制工具</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">启用点绘制</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">启用线绘制</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">启用面绘制</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">启用矩形绘制</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">启用圆形绘制</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">编辑功能</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">启用要素编辑</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">启用要素删除</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">启用样式修改</span>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  样式设置
                </CardTitle>
                <CardDescription>
                  配置各种要素的默认样式
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">颜色主题</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded border-2 border-blue-600"></div>
                      <div className="w-8 h-8 bg-green-500 rounded border-2 border-green-600"></div>
                      <div className="w-8 h-8 bg-orange-500 rounded border-2 border-orange-600"></div>
                      <div className="w-8 h-8 bg-red-500 rounded border-2 border-red-600"></div>
                      <div className="w-8 h-8 bg-purple-500 rounded border-2 border-purple-600"></div>
                      <div className="w-8 h-8 bg-yellow-500 rounded border-2 border-yellow-600"></div>
                      <div className="w-8 h-8 bg-pink-500 rounded border-2 border-pink-600"></div>
                      <div className="w-8 h-8 bg-gray-500 rounded border-2 border-gray-600"></div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">线宽设置</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">默认线宽</span>
                        <span className="text-sm font-mono">2px</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">选中线宽</span>
                        <span className="text-sm font-mono">3px</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">透明度设置</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">填充透明度</span>
                        <span className="text-sm font-mono">0.2</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">边框透明度</span>
                        <span className="text-sm font-mono">1.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}