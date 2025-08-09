'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Users,
  Activity,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'
import SharedMap, { SharedMapRef } from '@/components/maps/SharedMap'
import NodeTreeView from '@/components/nodes/NodeTreeView'

interface Node {
  id: string
  name: string
  type: string
  level: number
  description?: string
  coverage?: {
    type: string
    coordinates: number[][][]
  }
  isActive: boolean
  healthStatus: string
  parentId?: string
  parentName?: string
  children?: Node[]
  capabilities?: Array<{
    productType: string
    serviceType: string
    isEnabled: boolean
  }>
  createdAt: string
  updatedAt: string
  // NodeTreeView 组件需要的额外字段
  code: string
  apiUrl: string
  adminUrl?: string
  lastHealthCheck?: string
  _count?: {
    datasets: number
    childNodeRelations: number
  }
  location?: {
    lat: number
    lng: number
  }
}

interface CreateNodeForm {
  node_id: string
  node_name: string
  description: string
  level: number
  parent_id?: string
  required_products: string[]
  initial_coverage?: {
    type: string
    coordinates: number[][][]
  }
}

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCoverageDialogOpen, setIsCoverageDialogOpen] = useState(false)
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false)
  const [editingCoverage, setEditingCoverage] = useState<string>('')
  const [apiKey, setApiKey] = useState<string>('')
  const [createForm, setCreateForm] = useState<CreateNodeForm>({
    node_id: '',
    node_name: '',
    description: '',
    level: 3,
    required_products: ['S101', 'S124'],
    initial_coverage: {
      type: 'Polygon',
      coordinates: [[[120.0, 31.0], [122.0, 31.0], [122.0, 32.0], [120.0, 32.0], [120.0, 31.0]]]
    }
  })
  
  // 视图模式状态
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table')
  
  // 树形视图展开状态
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  
  // 地图组件引用
  const mapRef = useRef<SharedMapRef>(null)
  
  // 地图配置状态
  const [serviceConfig, setServiceConfig] = useState({
    // 图层和显示配置
    display: {
      showCoordinates: true,
      showLayerPanel: false,
      showLegendPanel: false,
      layerPanelPosition: 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
      coordinatePanelPosition: 'bottom-left', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
      panelOpacity: 95, // 0-100
      alwaysOnTop: true // 图层和坐标面板始终在最上层
    },
    // 底图配置
    baseMap: {
      type: 'osm', // 'osm', 'satellite', 'terrain', 'custom'
      customUrl: '',
      attribution: '',
      minZoom: 1,
      maxZoom: 18
    }
  })

  const productOptions = [
    { value: 'S101', label: 'S-101 电子海图' },
    { value: 'S102', label: 'S-102 高精度水深' },
    { value: 'S104', label: 'S-104 动态水位' },
    { value: 'S111', label: 'S-111 实时海流' },
    { value: 'S124', label: 'S-124 航行警告' },
    { value: 'S131', label: 'S-131 海洋保护区' }
  ]

  useEffect(() => {
    fetchNodes()
  }, [])

  useEffect(() => {
    // 当节点数据加载完成后，如果没有选中的节点，默认选择第一个节点
    if (nodes.length > 0 && !selectedNode) {
      console.log('Auto-selecting first node:', nodes[0])
      setSelectedNode(nodes[0])
    }
  }, [nodes, selectedNode])

  const fetchNodes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/nodes')
      if (response.ok) {
        const data = await response.json()
        setNodes(data.nodes || [])
      }
    } catch (error) {
      console.error('Error fetching nodes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNode = async () => {
    try {
      const response = await fetch('/api/admin/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      })

      if (response.ok) {
        const result = await response.json()
        setApiKey(result.apiKey)
        setIsCreateDialogOpen(false)
        fetchNodes()
        // 重置表单
        setCreateForm({
          node_id: '',
          node_name: '',
          description: '',
          level: 3,
          required_products: ['S101', 'S124'],
          initial_coverage: {
            type: 'Polygon',
            coordinates: [[[120.0, 31.0], [122.0, 31.0], [122.0, 32.0], [120.0, 32.0], [120.0, 31.0]]]
          }
        })
      } else {
        const error = await response.json()
        alert(`创建失败: ${error.error.message}`)
      }
    } catch (error) {
      console.error('Error creating node:', error)
      alert('创建节点失败')
    }
  }

  const handleUpdateCoverage = async () => {
    if (!selectedNode || !editingCoverage) return

    try {
      const coverage = JSON.parse(editingCoverage)
      const response = await fetch(`/api/admin/nodes/${selectedNode.id}/coverage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverage })
      })

      if (response.ok) {
        const result = await response.json()
        setSelectedNode({
          ...selectedNode,
          coverage: result.node.coverage,
          updatedAt: result.node.updatedAt
        })
        setIsCoverageDialogOpen(false)
        fetchNodes()
      } else {
        const error = await response.json()
        alert(`更新失败: ${error.error.message}`)
      }
    } catch (error) {
      console.error('Error updating coverage:', error)
      alert('更新覆盖范围失败')
    }
  }

  // 处理地图几何更新
  const handleGeometryUpdate = (nodeId: string, geometry: any) => {
    // 将几何数据转换为GeoJSON字符串
    const geojsonString = JSON.stringify(geometry)
    setEditingCoverage(geojsonString)
    
    // 直接调用更新API
    handleUpdateCoverageFromGeometry(nodeId, geometry)
  }

  const handleUpdateCoverageFromGeometry = async (nodeId: string, geometry: any) => {
    try {
      const response = await fetch(`/api/admin/nodes/${nodeId}/coverage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverage: geometry })
      })

      if (response.ok) {
        const result = await response.json()
        // 更新本地状态
        setSelectedNode(prev => prev ? {
          ...prev,
          coverage: result.node.coverage,
          updatedAt: result.node.updatedAt
        } : null)
        fetchNodes()
      } else {
        const error = await response.json()
        alert(`更新失败: ${error.error.message}`)
      }
    } catch (error) {
      console.error('Error updating coverage from geometry:', error)
      alert('更新覆盖范围失败')
    }
  }

  // NodeTreeView 组件所需的回调函数
  const handleNodeEdit = (node: Node) => {
    setSelectedNode(node)
    // 这里可以添加编辑逻辑，比如打开编辑对话框
  }

  const handleNodeDelete = async (nodeId: string) => {
    if (confirm('确定要删除这个节点吗？')) {
      try {
        const response = await fetch(`/api/admin/nodes/${nodeId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchNodes()
          if (selectedNode?.id === nodeId) {
            setSelectedNode(null)
          }
        } else {
          alert('删除失败')
        }
      } catch (error) {
        console.error('Error deleting node:', error)
        alert('删除失败')
      }
    }
  }

  const handleHealthCheck = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/admin/nodes/${nodeId}/health-check`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchNodes()
        alert('健康检查完成')
      } else {
        alert('健康检查失败')
      }
    } catch (error) {
      console.error('Error performing health check:', error)
      alert('健康检查失败')
    }
  }

  const handleNodePublish = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/admin/nodes/${nodeId}/publish`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchNodes()
        alert('节点发布成功')
      } else {
        alert('节点发布失败')
      }
    } catch (error) {
      console.error('Error publishing node:', error)
      alert('节点发布失败')
    }
  }

  const handleNodeOffline = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/admin/nodes/${nodeId}/offline`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchNodes()
        alert('节点已下线')
      } else {
        alert('节点下线失败')
      }
    } catch (error) {
      console.error('Error taking node offline:', error)
      alert('节点下线失败')
    }
  }

  const handlePushServices = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/admin/nodes/${nodeId}/push-services`, {
        method: 'POST'
      })
      if (response.ok) {
        alert('服务推送成功')
      } else {
        alert('服务推送失败')
      }
    } catch (error) {
      console.error('Error pushing services:', error)
      alert('服务推送失败')
    }
  }

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  // 转换节点数据为SharedMap格式
  const convertNodesToMapFormat = (nodes: Node[]) => {
    console.log('Converting nodes to map format:', nodes)
    const converted = nodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type as any,
      level: node.level,
      description: node.description || '',
      healthStatus: node.healthStatus as any,
      services: node.capabilities?.map(cap => cap.productType) || [],
      location: {
        // 如果有覆盖范围，计算中心点，否则使用默认位置
        lat: node.coverage ? calculateCenterFromGeoJSON(node.coverage)?.lat || 31.2000 : 31.2000,
        lng: node.coverage ? calculateCenterFromGeoJSON(node.coverage)?.lng || 121.5000 : 121.5000
      },
      coverage: node.coverage
    }))
    console.log('Converted nodes:', converted)
    return converted
  }

  // 获取用于地图的节点数据
  const getMapNodes = () => {
    console.log('Selected node:', selectedNode)
    console.log('All nodes:', nodes)
    if (!selectedNode) {
      console.log('No selected node, returning empty array')
      return []
    }
    console.log('Returning selected node for map:', [selectedNode])
    return [selectedNode]
  }

  // 从GeoJSON计算中心点
  const calculateCenterFromGeoJSON = (geojsonString: string) => {
    try {
      const geojson = JSON.parse(geojsonString)
      if (geojson.type === 'Polygon' && geojson.coordinates && geojson.coordinates[0]) {
        const coords = geojson.coordinates[0]
        const sumLat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0)
        const sumLng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0)
        return {
          lat: sumLat / coords.length,
          lng: sumLng / coords.length
        }
      }
    } catch (error) {
      console.error('Error calculating center from GeoJSON:', error)
    }
    return null
  }

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <Badge className="bg-green-500">健康</Badge>
      case 'WARNING':
        return <Badge variant="secondary">警告</Badge>
      case 'ERROR':
        return <Badge variant="destructive">错误</Badge>
      case 'OFFLINE':
        return <Badge variant="outline">离线</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const getNodeTypeBadge = (type: string) => {
    switch (type) {
      case 'GLOBAL_ROOT':
        return <Badge variant="outline">全球根节点</Badge>
      case 'NATIONAL':
        return <Badge className="bg-blue-500">国家级节点</Badge>
      case 'REGIONAL':
        return <Badge className="bg-purple-500">区域节点</Badge>
      case 'LEAF':
        return <Badge className="bg-green-500">叶子节点</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">节点管理</h1>
        <p className="text-muted-foreground">
          管理S-100网络中的所有节点，支持创建、配置和监控节点状态
        </p>
      </div>

      {apiKey && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>节点创建成功</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <p className="font-medium">API密钥 (请妥善保存):</p>
              <div className="bg-muted p-2 rounded font-mono text-sm mt-1 flex items-center justify-between">
                <code>{apiKey}</code>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey)
                    alert('已复制到剪贴板')
                  }}
                >
                  复制
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                此密钥仅显示一次，请立即复制并安全保存
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 节点列表 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>节点列表</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={fetchNodes}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        新建
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>创建新节点</DialogTitle>
                        <DialogDescription>
                          创建一个新的S-100服务节点，请填写节点基本信息和配置
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="node_id">节点ID *</Label>
                            <Input
                              id="node_id"
                              value={createForm.node_id}
                              onChange={(e) => setCreateForm(prev => ({ ...prev, node_id: e.target.value }))}
                              placeholder="例如: cn-js-msa"
                            />
                          </div>
                          <div>
                            <Label htmlFor="node_name">节点名称 *</Label>
                            <Input
                              id="node_name"
                              value={createForm.node_name}
                              onChange={(e) => setCreateForm(prev => ({ ...prev, node_name: e.target.value }))}
                              placeholder="例如: 江苏海事服务节点"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">描述</Label>
                          <Textarea
                            id="description"
                            value={createForm.description}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="节点描述信息"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="level">节点级别</Label>
                            <Select value={createForm.level.toString()} onValueChange={(value) => setCreateForm(prev => ({ ...prev, level: parseInt(value) }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">全球根节点 (0)</SelectItem>
                                <SelectItem value="1">国家级节点 (1)</SelectItem>
                                <SelectItem value="2">区域节点 (2)</SelectItem>
                                <SelectItem value="3">叶子节点 (3)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="parent_id">父节点</Label>
                            <Input
                              id="parent_id"
                              value={createForm.parent_id || ''}
                              onChange={(e) => setCreateForm(prev => ({ ...prev, parent_id: e.target.value || undefined }))}
                              placeholder="父节点ID (可选)"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>必需产品类型</Label>
                          <div className="space-y-2 mt-2">
                            {productOptions.map(product => (
                              <label key={product.value} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={createForm.required_products.includes(product.value)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCreateForm(prev => ({
                                        ...prev,
                                        required_products: [...prev.required_products, product.value]
                                      }))
                                    } else {
                                      setCreateForm(prev => ({
                                        ...prev,
                                        required_products: prev.required_products.filter(p => p !== product.value)
                                      }))
                                    }
                                  }}
                                />
                                <span className="text-sm">{product.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="coverage">初始覆盖范围 (GeoJSON)</Label>
                          <Textarea
                            id="coverage"
                            value={JSON.stringify(createForm.initial_coverage, null, 2)}
                            onChange={(e) => {
                              try {
                                setCreateForm(prev => ({
                                  ...prev,
                                  initial_coverage: JSON.parse(e.target.value)
                                }))
                              } catch {
                                // 忽略JSON解析错误
                              }
                            }}
                            className="font-mono text-xs h-32"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          取消
                        </Button>
                        <Button onClick={handleCreateNode}>
                          创建节点
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 视图切换 */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  表格视图
                </Button>
                <Button
                  variant={viewMode === 'tree' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('tree')}
                >
                  树形视图
                </Button>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">加载中...</p>
                </div>
              ) : viewMode === 'table' ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {nodes.map(node => (
                    <div
                      key={node.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedNode?.id === node.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getHealthBadge(node.healthStatus)}
                          <span className="font-medium text-sm">{node.name}</span>
                        </div>
                        {getNodeTypeBadge(node.type)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {node.id} • 级别: {node.level}
                      </div>
                      {node.capabilities && node.capabilities.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {node.capabilities.slice(0, 3).map(cap => (
                            <Badge key={cap.productType} variant="outline" className="text-xs">
                              {cap.productType}
                            </Badge>
                          ))}
                          {node.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{node.capabilities.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <NodeTreeView
                  nodes={nodes}
                  loading={isLoading}
                  selectedNode={selectedNode}
                  expandedNodes={expandedNodes}
                  onNodeSelect={setSelectedNode}
                  onNodeEdit={handleNodeEdit}
                  onNodeDelete={handleNodeDelete}
                  onHealthCheck={handleHealthCheck}
                  onNodePublish={handleNodePublish}
                  onNodeOffline={handleNodeOffline}
                  onPushServices={handlePushServices}
                  onToggleExpand={handleToggleExpand}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* 节点详情 */}
        <div className="lg:col-span-2">
          {selectedNode ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="coverage">覆盖范围</TabsTrigger>
                <TabsTrigger value="capabilities">服务能力</TabsTrigger>
                <TabsTrigger value="configuration">配置管理</TabsTrigger>
                <TabsTrigger value="policy">合规策略</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {selectedNode.name}
                          {getHealthBadge(selectedNode.healthStatus)}
                        </CardTitle>
                        <CardDescription>{selectedNode.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          配置
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">节点ID</Label>
                        <p className="text-sm text-muted-foreground">{selectedNode.id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">节点类型</Label>
                        <p className="text-sm text-muted-foreground">{selectedNode.type}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">节点级别</Label>
                        <p className="text-sm text-muted-foreground">Level {selectedNode.level}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">父节点</Label>
                        <p className="text-sm text-muted-foreground">{selectedNode.parentName || '无'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">状态</Label>
                        <div className="flex items-center gap-2">
                          {selectedNode.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">{selectedNode.isActive ? '活跃' : '离线'}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">最后更新</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedNode.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>覆盖范围</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SharedMap
                      ref={mapRef}
                      nodes={convertNodesToMapFormat(getMapNodes())}
                      selectedNode={convertNodesToMapFormat(getMapNodes())[0]}
                      onNodeSelect={(node) => {
                        // 找到原始节点并选中
                        const originalNode = nodes.find(n => n.id === node.id)
                        if (originalNode) setSelectedNode(originalNode)
                      }}
                      mode="edit"
                      editable={true}
                      height="400px"
                      onGeometryUpdate={handleGeometryUpdate}
                      baseMapConfig={serviceConfig.baseMap}
                      displayConfig={serviceConfig.display}
                    />
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {selectedNode.coverage ? '已配置覆盖范围' : '未配置覆盖范围'}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingCoverage(JSON.stringify(selectedNode.coverage, null, 2))
                          setIsCoverageDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        编辑GeoJSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="coverage" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>覆盖范围管理</CardTitle>
                    <CardDescription>
                      管理节点的地理覆盖范围，支持GeoJSON格式
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SharedMap
                      nodes={convertNodesToMapFormat(getMapNodes())}
                      selectedNode={convertNodesToMapFormat(getMapNodes())[0]}
                      onNodeSelect={(node) => {
                        // 找到原始节点并选中
                        const originalNode = nodes.find(n => n.id === node.id)
                        if (originalNode) setSelectedNode(originalNode)
                      }}
                      mode="edit"
                      editable={true}
                      height="500px"
                      onGeometryUpdate={handleGeometryUpdate}
                      baseMapConfig={serviceConfig.baseMap}
                      displayConfig={serviceConfig.display}
                    />
                    <div className="mt-4 space-y-4">
                      <div>
                        <Label className="text-sm font-medium">GeoJSON数据</Label>
                        <Textarea
                          value={selectedNode.coverage ? JSON.stringify(selectedNode.coverage, null, 2) : ''}
                          readOnly
                          className="font-mono text-xs h-32 mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => {
                            setEditingCoverage(JSON.stringify(selectedNode.coverage, null, 2))
                            setIsCoverageDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          编辑范围
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          导出GeoJSON
                        </Button>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-1" />
                          导入GeoJSON
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="capabilities" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>服务能力</CardTitle>
                        <CardDescription>
                          节点提供的S-100数据服务能力
                        </CardDescription>
                      </div>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        添加能力
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedNode.capabilities && selectedNode.capabilities.length > 0 ? (
                      <div className="space-y-3">
                        {selectedNode.capabilities.map((cap, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="font-medium">{cap.productType}</div>
                                <div className="text-sm text-muted-foreground">{cap.serviceType}</div>
                              </div>
                              {cap.isEnabled ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <X className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>暂无服务能力</p>
                        <p className="text-sm">点击&quot;添加能力&quot;为节点配置服务能力</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="configuration" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>节点配置管理</CardTitle>
                    <CardDescription>
                      配置节点的基本信息、联系方式和界面设置
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">节点名称</Label>
                          <p className="text-sm text-muted-foreground">{selectedNode.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">节点描述</Label>
                          <p className="text-sm text-muted-foreground">{selectedNode.description || '未设置'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">联系邮箱</Label>
                          <p className="text-sm text-muted-foreground">
                            {selectedNode.contactEmail || `contact@${selectedNode.code.toLowerCase().replace('_', '-')}.example.com`}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">联系电话</Label>
                          <p className="text-sm text-muted-foreground">{selectedNode.contactPhone || '+86-xxx-xxxx-xxxx'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">默认缩放级别</Label>
                          <p className="text-sm text-muted-foreground">{selectedNode.defaultZoom || 5}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">最小缩放级别</Label>
                          <p className="text-sm text-muted-foreground">{selectedNode.minZoom || 1}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">最大缩放级别</Label>
                          <p className="text-sm text-muted-foreground">{selectedNode.maxZoom || 18}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">默认视图中心</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedNode.longitude && selectedNode.latitude 
                            ? `${selectedNode.longitude}, ${selectedNode.latitude}`
                            : '116.4074, 39.9042'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          最后更新: {new Date(selectedNode.updatedAt).toLocaleString('zh-CN')}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => {
                              // 导航到专门的配置管理页面
                              window.location.href = '/node-configuration'
                            }}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            详细配置
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="policy" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>合规策略</CardTitle>
                        <CardDescription>
                          管理节点的服务能力合规要求和策略配置
                        </CardDescription>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => setIsPolicyDialogOpen(true)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        配置策略
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>策略状态</AlertTitle>
                        <AlertDescription>
                          该节点当前未配置合规策略。建议为节点设置必需的服务能力要求，
                          系统将自动监控合规状态并在发现问题时发出警告。
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="text-sm font-medium mb-2">必需产品</div>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">S-101 电子海图</div>
                            <div className="text-sm text-muted-foreground">S-124 航行警告</div>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="text-sm font-medium mb-2">监控设置</div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div>检查间隔: 24小时</div>
                            <div>警告阈值: 7天</div>
                            <div>状态监控: 已启用</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>请从左侧选择一个节点查看详情</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 编辑覆盖范围对话框 */}
      <Dialog open={isCoverageDialogOpen} onOpenChange={setIsCoverageDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>编辑覆盖范围</DialogTitle>
            <DialogDescription>
              使用GeoJSON格式编辑节点的地理覆盖范围
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="coverage_geojson">GeoJSON数据</Label>
              <Textarea
                id="coverage_geojson"
                value={editingCoverage}
                onChange={(e) => setEditingCoverage(e.target.value)}
                className="font-mono text-xs h-64"
                placeholder='{"type": "Polygon", "coordinates": [[[120.0, 31.0], [122.0, 31.0], [122.0, 32.0], [120.0, 32.0], [120.0, 31.0]]]}'
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium text-sm">注意</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                确保GeoJSON格式正确，坐标顺序为[经度, 纬度]，多边形必须闭合。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCoverageDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateCoverage}>
              <Save className="h-4 w-4 mr-1" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

