'use client'

import { useState } from 'react'
import NodeMapEnhanced from '@/components/NodeMapEnhanced'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Layers, 
  Edit, 
  Save, 
  Settings,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

// 模拟节点数据，包含几何信息
const mockNodes = [
  {
    id: 'global-root',
    name: 'IHO全球根节点',
    type: 'GLOBAL_ROOT',
    level: 0,
    description: '国际海道测量组织全球协调节点',
    healthStatus: 'HEALTHY',
    isActive: true,
    apiUrl: 'https://global.iho.org/api',
    location: {
      lat: 51.5074,
      lng: -0.1278
    },
    geometry: {
      type: 'Point',
      coordinates: [-0.1278, 51.5074]
    },
    capabilities: [
      { id: 'cap1', productType: 'S101', serviceType: 'WMS' },
      { id: 'cap2', productType: 'S102', serviceType: 'WFS' }
    ],
    _count: {
      datasets: 12,
      childNodeRelations: 3
    }
  },
  {
    id: 'china-national',
    name: '中国海事局国家级节点',
    type: 'NATIONAL',
    level: 1,
    description: '中国海事局总部的技术负责人',
    healthStatus: 'HEALTHY',
    isActive: true,
    parentId: 'global-root',
    apiUrl: 'https://msa.gov.cn/api',
    location: {
      lat: 39.9042,
      lng: 116.4074
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [116.0, 39.5],
        [117.0, 39.5],
        [117.0, 40.5],
        [116.0, 40.5],
        [116.0, 39.5]
      ]]
    },
    capabilities: [
      { id: 'cap3', productType: 'S101', serviceType: 'WMS' },
      { id: 'cap4', productType: 'S104', serviceType: 'WFS' },
      { id: 'cap5', productType: 'S111', serviceType: 'WCS' }
    ],
    _count: {
      datasets: 45,
      childNodeRelations: 3
    }
  },
  {
    id: 'east-china-sea',
    name: '东海分局区域节点',
    type: 'REGIONAL',
    level: 2,
    description: '中国海事局东海分局',
    healthStatus: 'HEALTHY',
    isActive: true,
    parentId: 'china-national',
    apiUrl: 'https://east.msa.gov.cn/api',
    location: {
      lat: 31.2000,
      lng: 121.5000
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [121.0, 31.0],
        [122.0, 31.0],
        [122.0, 32.0],
        [121.0, 32.0],
        [121.0, 31.0]
      ]]
    },
    capabilities: [
      { id: 'cap6', productType: 'S101', serviceType: 'WMS' },
      { id: 'cap7', productType: 'S102', serviceType: 'WFS' },
      { id: 'cap8', productType: 'S124', serviceType: 'WMS' }
    ],
    _count: {
      datasets: 23,
      childNodeRelations: 3
    }
  },
  {
    id: 'shanghai-port',
    name: '上海港叶子节点',
    type: 'LEAF',
    level: 3,
    description: '上海港务局数据管理中心',
    healthStatus: 'HEALTHY',
    isActive: true,
    parentId: 'east-china-sea',
    apiUrl: 'https://shanghai-port.cn/api',
    location: {
      lat: 31.2304,
      lng: 121.4737
    },
    geometry: {
      type: 'Point',
      coordinates: [121.4737, 31.2304]
    },
    capabilities: [
      { id: 'cap9', productType: 'S101', serviceType: 'WMS' },
      { id: 'cap10', productType: 'S102', serviceType: 'WFS' },
      { id: 'cap11', productType: 'S104', serviceType: 'WMS' },
      { id: 'cap12', productType: 'S111', serviceType: 'WFS' },
      { id: 'cap13', productType: 'S124', serviceType: 'WMS' }
    ],
    _count: {
      datasets: 67,
      childNodeRelations: 0
    }
  },
  {
    id: 'ningbo-port',
    name: '宁波港叶子节点',
    type: 'LEAF',
    level: 3,
    description: '宁波港务局数据管理中心',
    healthStatus: 'WARNING',
    isActive: true,
    parentId: 'east-china-sea',
    apiUrl: 'https://ningbo-port.cn/api',
    location: {
      lat: 29.8683,
      lng: 121.5440
    },
    geometry: {
      type: 'Rectangle',
      coordinates: [[
        [121.4, 29.7],
        [121.7, 29.7],
        [121.7, 30.0],
        [121.4, 30.0],
        [121.4, 29.7]
      ]]
    },
    capabilities: [
      { id: 'cap14', productType: 'S101', serviceType: 'WMS' },
      { id: 'cap15', productType: 'S102', serviceType: 'WFS' }
    ],
    _count: {
      datasets: 34,
      childNodeRelations: 0
    }
  },
  {
    id: 'qingdao-port',
    name: '青岛港叶子节点',
    type: 'LEAF',
    level: 3,
    description: '青岛港务局数据管理中心',
    healthStatus: 'ERROR',
    isActive: false,
    parentId: 'east-china-sea',
    apiUrl: 'https://qingdao-port.cn/api',
    location: {
      lat: 36.0671,
      lng: 120.3826
    },
    capabilities: [
      { id: 'cap16', productType: 'S101', serviceType: 'WMS' }
    ],
    _count: {
      datasets: 28,
      childNodeRelations: 0
    }
  }
]

export default function NodeMapEnhancedPage() {
  const [nodes, setNodes] = useState(mockNodes)
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [editingHistory, setEditingHistory] = useState<any[]>([])

  const handleNodeSelect = (node: any) => {
    setSelectedNode(node)
  }

  const handleNodeUpdate = (nodeId: string, updates: Partial<any>) => {
    const updatedNodes = nodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    )
    setNodes(updatedNodes)
    
    // Add to editing history
    const historyEntry = {
      id: Date.now(),
      nodeId,
      nodeName: nodes.find(n => n.id === nodeId)?.name,
      updates,
      timestamp: new Date().toISOString()
    }
    setEditingHistory(prev => [historyEntry, ...prev])
    
    // Update selected node if it's the one being edited
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, ...updates })
    }
  }

  const getHealthStats = () => {
    const stats = {
      healthy: nodes.filter(n => n.healthStatus === 'HEALTHY').length,
      warning: nodes.filter(n => n.healthStatus === 'WARNING').length,
      error: nodes.filter(n => n.healthStatus === 'ERROR').length,
      offline: nodes.filter(n => n.healthStatus === 'OFFLINE').length,
      total: nodes.length
    }
    return stats
  }

  const getGeometryStats = () => {
    const stats = {
      point: nodes.filter(n => n.geometry?.type === 'Point').length,
      polygon: nodes.filter(n => n.geometry?.type === 'Polygon').length,
      rectangle: nodes.filter(n => n.geometry?.type === 'Rectangle').length,
      none: nodes.filter(n => !n.geometry).length,
      total: nodes.length
    }
    return stats
  }

  const healthStats = getHealthStats()
  const geometryStats = getGeometryStats()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">节点地理分布 (增强版)</h1>
          <p className="text-muted-foreground">
            基于 Leaflet + leaflet-draw 的节点几何信息编辑系统
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <MapPin className="h-3 w-3 mr-1" />
            {nodes.length} 个节点
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Edit className="h-3 w-3 mr-1" />
            {editingHistory.length} 次编辑
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            地图编辑
          </TabsTrigger>
          <TabsTrigger value="nodes" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            节点管理
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            统计分析
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            编辑历史
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <NodeMapEnhanced
            nodes={nodes}
            selectedNode={selectedNode}
            onNodeSelect={handleNodeSelect}
            onNodeUpdate={handleNodeUpdate}
          />
        </TabsContent>

        <TabsContent value="nodes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  节点列表
                </CardTitle>
                <CardDescription>
                  所有节点的详细信息和几何数据
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {nodes.map((node) => (
                    <div key={node.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{node.type}</Badge>
                          <Badge 
                            variant="outline" 
                            className={
                              node.healthStatus === 'HEALTHY' ? 'text-green-600 border-green-600' :
                              node.healthStatus === 'WARNING' ? 'text-yellow-600 border-yellow-600' :
                              node.healthStatus === 'ERROR' ? 'text-red-600 border-red-600' :
                              'text-gray-600 border-gray-600'
                            }
                          >
                            {node.healthStatus}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Level {node.level}
                        </span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{node.name}</div>
                        <div className="text-muted-foreground mt-1">{node.description}</div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">位置:</span>
                            <span className="ml-1">
                              {node.location ? `${node.location.lat.toFixed(4)}, ${node.location.lng.toFixed(4)}` : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">几何:</span>
                            <span className="ml-1">
                              {node.geometry ? node.geometry.type : '无'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">数据集:</span>
                            <span className="ml-1">{node._count?.datasets || 0}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">状态:</span>
                            <span className="ml-1">{node.isActive ? '活跃' : '离线'}</span>
                          </div>
                        </div>
                      </div>
                      {node.geometry && (
                        <div className="mt-2 text-xs font-mono bg-muted p-2 rounded">
                          <div className="text-muted-foreground mb-1">几何数据:</div>
                          {JSON.stringify(node.geometry, null, 2).substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  选中节点详情
                </CardTitle>
                <CardDescription>
                  当前选中节点的详细信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedNode ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedNode.name}</h3>
                      <p className="text-muted-foreground">{selectedNode.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">类型:</span>
                        <div className="font-medium">{selectedNode.type}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">层级:</span>
                        <div className="font-medium">{selectedNode.level}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">健康状态:</span>
                        <div className="font-medium">
                          <Badge 
                            variant="outline" 
                            className={
                              selectedNode.healthStatus === 'HEALTHY' ? 'text-green-600 border-green-600' :
                              selectedNode.healthStatus === 'WARNING' ? 'text-yellow-600 border-yellow-600' :
                              selectedNode.healthStatus === 'ERROR' ? 'text-red-600 border-red-600' :
                              'text-gray-600 border-gray-600'
                            }
                          >
                            {selectedNode.healthStatus}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">活跃状态:</span>
                        <div className="font-medium">{selectedNode.isActive ? '是' : '否'}</div>
                      </div>
                    </div>
                    
                    {selectedNode.location && (
                      <div>
                        <h4 className="font-medium mb-2">位置信息</h4>
                        <div className="text-sm bg-muted p-3 rounded">
                          <div>纬度: {selectedNode.location.lat.toFixed(6)}</div>
                          <div>经度: {selectedNode.location.lng.toFixed(6)}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedNode.geometry && (
                      <div>
                        <h4 className="font-medium mb-2">几何信息</h4>
                        <div className="text-sm bg-muted p-3 rounded font-mono">
                          <div>类型: {selectedNode.geometry.type}</div>
                          <div className="mt-2">
                            坐标: {JSON.stringify(selectedNode.geometry.coordinates, null, 2)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedNode.capabilities && (
                      <div>
                        <h4 className="font-medium mb-2">服务能力</h4>
                        <div className="space-y-1">
                          {selectedNode.capabilities.map((cap: any) => (
                            <div key={cap.id} className="text-sm bg-muted p-2 rounded">
                              {cap.productType} - {cap.serviceType}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    请在地图上选择一个节点查看详情
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  健康状态统计
                </CardTitle>
                <CardDescription>
                  节点健康状态分布情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{healthStats.healthy}</div>
                      <div className="text-sm text-muted-foreground">健康</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{healthStats.warning}</div>
                      <div className="text-sm text-muted-foreground">警告</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{healthStats.error}</div>
                      <div className="text-sm text-muted-foreground">错误</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{healthStats.offline}</div>
                      <div className="text-sm text-muted-foreground">离线</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">总节点数</span>
                      <span className="font-bold">{healthStats.total}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm">健康率</span>
                      <span className="font-bold text-green-600">
                        {((healthStats.healthy / healthStats.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  几何类型统计
                </CardTitle>
                <CardDescription>
                  节点几何信息类型分布
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{geometryStats.point}</div>
                      <div className="text-sm text-muted-foreground">点</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{geometryStats.polygon}</div>
                      <div className="text-sm text-muted-foreground">多边形</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{geometryStats.rectangle}</div>
                      <div className="text-sm text-muted-foreground">矩形</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{geometryStats.none}</div>
                      <div className="text-sm text-muted-foreground">无几何</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">总节点数</span>
                      <span className="font-bold">{geometryStats.total}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm">几何覆盖率</span>
                      <span className="font-bold text-blue-600">
                        {(((geometryStats.total - geometryStats.none) / geometryStats.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                编辑历史
              </CardTitle>
              <CardDescription>
                节点几何信息的编辑操作记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {editingHistory.length > 0 ? (
                  editingHistory.map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{entry.nodeName}</div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <div className="text-muted-foreground mb-1">更新内容:</div>
                        <div className="bg-muted p-2 rounded font-mono text-xs">
                          {Object.keys(entry.updates).map(key => (
                            <div key={key}>
                              {key}: {JSON.stringify(entry.updates[key])}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无编辑记录
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}