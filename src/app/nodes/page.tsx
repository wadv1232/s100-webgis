'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, RefreshCw } from 'lucide-react'
import NodeTableView from '@/components/nodes/NodeTableView'
import NodeTreeView from '@/components/nodes/NodeTreeView'
import NodeDetailPanel from '@/components/nodes/NodeDetailPanelNew'

// 节点类型枚举
const NODE_TYPES = {
  GLOBAL_ROOT: '全球根节点',
  NATIONAL: '国家级节点',
  REGIONAL: '区域节点',
  LEAF: '叶子节点'
}

interface Node {
  id: string
  code: string
  name: string
  type: string
  level: number
  description?: string
  apiUrl: string
  adminUrl?: string
  coverage?: string
  isActive: boolean
  healthStatus: string
  lastHealthCheck?: string
  parentId?: string
  parent?: Node
  children?: Node[]
  capabilities?: any[]
  _count?: {
    datasets: number
    childNodeRelations: number
  }
  location?: {
    lat: number
    lng: number
  }
}

interface Capability {
  id: string
  nodeId: string
  productType: string
  serviceType: string
  isEnabled: boolean
  endpoint?: string
  version?: string
}

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table')
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: '',
    description: '',
    apiUrl: '',
    adminUrl: '',
    coverage: '',
    parentId: 'none',
    latitude: '',
    longitude: ''
  })

  // 获取节点列表
  const fetchNodes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/nodes')
      const result = await response.json()
      
      if (result.success) {
        setNodes(result.data.nodes)
      } else {
        console.error('获取节点列表失败:', result.error)
      }
    } catch (error) {
      console.error('获取节点列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取节点详情
  const fetchNodeDetails = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/nodes/${nodeId}`)
      const result = await response.json()
      
      if (result.success) {
        setSelectedNode(result.data)
      } else {
        console.error('获取节点详情失败:', result.error)
      }
    } catch (error) {
      console.error('获取节点详情失败:', error)
    }
  }

  // 创建节点
  const createNode = async () => {
    try {
      // 计算level
      let level = 0
      if (formData.parentId && formData.parentId !== 'none') {
        const parentNode = nodes.find(n => n.id === formData.parentId)
        if (parentNode) {
          level = parentNode.level + 1
        }
      }

      const requestData = {
        ...formData,
        parentId: formData.parentId === 'none' ? null : formData.parentId,
        level,
        location: {
          lat: parseFloat(formData.latitude) || 0,
          lng: parseFloat(formData.longitude) || 0
        }
      }

      const response = await fetch('/api/nodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setIsCreateDialogOpen(false)
        resetForm()
        fetchNodes()
        // 显示成功消息
        alert('节点创建成功')
      } else {
        console.error('创建节点失败:', result.error)
        // 显示错误消息
        alert(`创建失败: ${result.error}`)
      }
    } catch (error) {
      console.error('创建节点失败:', error)
      alert('创建失败，请检查网络连接')
    }
  }

  // 更新节点
  const updateNode = async (nodeId: string, updates: Partial<Node>) => {
    try {
      // 计算level（如果父节点改变了）
      let level = updates.level
      if (updates.parentId !== undefined) {
        const currentNode = nodes.find(n => n.id === nodeId)
        const currentParentId = currentNode?.parentId || 'none'
        
        if (updates.parentId !== currentParentId) {
          if (updates.parentId && updates.parentId !== 'none') {
            const parentNode = nodes.find(n => n.id === updates.parentId)
            if (parentNode) {
              level = parentNode.level + 1
            }
          } else {
            level = 0
          }
        }
      }

      const requestData = {
        ...updates,
        level
      }

      const response = await fetch(`/api/nodes/${nodeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        fetchNodes()
        if (selectedNode?.id === nodeId) {
          fetchNodeDetails(nodeId)
        }
        // 显示成功消息
        alert('节点更新成功')
      } else {
        console.error('更新节点失败:', result.error)
        // 显示错误消息
        alert(`更新失败: ${result.error}`)
      }
    } catch (error) {
      console.error('更新节点失败:', error)
      alert('更新失败，请检查网络连接')
    }
  }

  // 删除节点
  const deleteNode = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/nodes/${nodeId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        fetchNodes()
        if (selectedNode?.id === nodeId) {
          setSelectedNode(null)
        }
        // 显示成功消息
        alert('节点删除成功')
      } else {
        console.error('删除节点失败:', result.error)
        // 显示错误消息
        alert(`删除失败: ${result.error}`)
      }
    } catch (error) {
      console.error('删除节点失败:', error)
      alert('删除失败，请检查网络连接')
    }
  }

  // 健康检查
  const healthCheck = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/nodes/${nodeId}/health`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.success) {
        fetchNodes()
        if (selectedNode?.id === nodeId) {
          fetchNodeDetails(nodeId)
        }
      } else {
        console.error('健康检查失败:', result.error)
      }
    } catch (error) {
      console.error('健康检查失败:', error)
    }
  }

  // 下线节点
  const offlineNode = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/nodes/${nodeId}/offline`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.success) {
        fetchNodes()
        if (selectedNode?.id === nodeId) {
          fetchNodeDetails(nodeId)
        }
      } else {
        console.error('下线节点失败:', result.error)
      }
    } catch (error) {
      console.error('下线节点失败:', error)
    }
  }

  // 发布节点
  const publishNode = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/nodes/${nodeId}/publish`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.success) {
        fetchNodes()
        if (selectedNode?.id === nodeId) {
          fetchNodeDetails(nodeId)
        }
      } else {
        console.error('发布节点失败:', result.error)
      }
    } catch (error) {
      console.error('发布节点失败:', error)
    }
  }

  // 向上推送服务
  const pushServicesUpward = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/nodes/${nodeId}/push-services`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.success) {
        fetchNodes()
        if (selectedNode?.id === nodeId) {
          fetchNodeDetails(nodeId)
        }
      } else {
        console.error('推送服务失败:', result.error)
      }
    } catch (error) {
      console.error('推送服务失败:', error)
    }
  }

  // 添加服务能力
  const addCapability = async (nodeId: string, capability: Omit<Capability, 'id' | 'nodeId'>) => {
    try {
      const response = await fetch(`/api/nodes/${nodeId}/capabilities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(capability)
      })
      
      const result = await response.json()
      
      if (result.success) {
        fetchNodeDetails(nodeId)
      } else {
        console.error('添加服务能力失败:', result.error)
      }
    } catch (error) {
      console.error('添加服务能力失败:', error)
    }
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: '',
      description: '',
      apiUrl: '',
      adminUrl: '',
      coverage: '',
      parentId: 'none',
      latitude: '',
      longitude: ''
    })
  }

  // 切换节点展开状态
  const toggleNodeExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  // 处理节点选择
  const handleNodeSelect = (node: Node) => {
    setSelectedNode(node)
    fetchNodeDetails(node.id)
  }

  // 处理节点编辑
  const handleNodeEdit = (node: Node) => {
    setSelectedNode(node)
    fetchNodeDetails(node.id)
  }

  useEffect(() => {
    fetchNodes()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">节点管理</h1>
          <p className="text-gray-600">管理架构中的所有节点</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNodes} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                创建节点
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>创建新节点</DialogTitle>
                <DialogDescription>
                  添加一个新的节点到系统中
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">节点标识符</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="输入唯一标识符（如：SHANGHAI_PORT）"
                  />
                </div>
                <div>
                  <Label htmlFor="name">节点名称</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="输入节点名称"
                  />
                </div>
                <div>
                  <Label htmlFor="type">节点类型</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择节点类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(NODE_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="parentId">父节点</Label>
                  <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择父节点（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无父节点（根节点）</SelectItem>
                      {nodes.filter(n => n.level < 3).map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.name} ({node.code}) - 层级 {node.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="apiUrl">API地址</Label>
                  <Input
                    id="apiUrl"
                    value={formData.apiUrl}
                    onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                    placeholder="http://example.com/api"
                  />
                </div>
                <div>
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="节点描述"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="latitude">纬度</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="39.9042"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">经度</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="116.4074"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={createNode}>
                    创建
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>节点列表</CardTitle>
                  <CardDescription>
                    系统中的所有节点
                  </CardDescription>
                </div>
                <div className="flex gap-2">
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
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'table' ? (
                <NodeTableView
                  nodes={nodes}
                  loading={loading}
                  selectedNode={selectedNode}
                  onNodeSelect={handleNodeSelect}
                  onNodeEdit={handleNodeEdit}
                  onNodeDelete={deleteNode}
                  onHealthCheck={healthCheck}
                  onNodePublish={publishNode}
                  onNodeOffline={offlineNode}
                  onPushServices={pushServicesUpward}
                />
              ) : (
                <NodeTreeView
                  nodes={nodes}
                  loading={loading}
                  selectedNode={selectedNode}
                  expandedNodes={expandedNodes}
                  onNodeSelect={handleNodeSelect}
                  onNodeEdit={handleNodeEdit}
                  onNodeDelete={deleteNode}
                  onHealthCheck={healthCheck}
                  onNodePublish={publishNode}
                  onNodeOffline={offlineNode}
                  onPushServices={pushServicesUpward}
                  onToggleExpand={toggleNodeExpand}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Node Details */}
        <div>
          <NodeDetailPanel
            selectedNode={selectedNode}
            nodes={nodes}
            onNodeUpdate={updateNode}
            onNodeDelete={deleteNode}
            onHealthCheck={healthCheck}
            onNodePublish={publishNode}
            onNodeOffline={offlineNode}
            onPushServices={pushServicesUpward}
            onAddCapability={addCapability}
          />
        </div>
      </div>
    </div>
  )
}