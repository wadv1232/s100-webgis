'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Globe,
  Building,
  MapIcon,
  Anchor,
  Database,
  Settings,
  Save,
  X
} from 'lucide-react'
import NodeMap from '@/components/maps/NodeMap'
import CollapsiblePanels from '@/components/ui/CollapsiblePanels'

// 节点类型枚举
const NODE_TYPES = {
  GLOBAL_ROOT: '全球根节点',
  NATIONAL: '国家级节点',
  REGIONAL: '区域节点',
  LEAF: '叶子节点'
}

// 健康状态枚举
const HEALTH_STATUS = {
  HEALTHY: { label: '健康', color: 'bg-green-500', icon: CheckCircle },
  WARNING: { label: '警告', color: 'bg-yellow-500', icon: AlertTriangle },
  ERROR: { label: '错误', color: 'bg-red-500', icon: XCircle },
  OFFLINE: { label: '离线', color: 'bg-gray-500', icon: Clock }
}

// S-100产品类型
const S100_PRODUCTS = [
  { value: 'S101', label: 'S-101 电子海图' },
  { value: 'S102', label: 'S-102 高精度水深' },
  { value: 'S104', label: 'S-104 动态水位' },
  { value: 'S111', label: 'S-111 实时海流' },
  { value: 'S124', label: 'S-124 航行警告' },
  { value: 'S125', label: 'S-125 航行信息' },
  { value: 'S131', label: 'S-131 海洋保护区' }
]

// 服务类型
const SERVICE_TYPES = [
  { value: 'WFS', label: 'Web要素服务 (WFS)' },
  { value: 'WMS', label: 'Web地图服务 (WMS)' },
  { value: 'WCS', label: 'Web覆盖服务 (WCS)' }
]

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
  capabilities?: Capability[]
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

interface NodeDetailPanelProps {
  selectedNode: Node | null
  nodes: Node[]
  onNodeUpdate: (nodeId: string, updates: Partial<Node>) => void
  onNodeDelete: (nodeId: string) => void
  onHealthCheck: (nodeId: string) => void
  onNodePublish: (nodeId: string) => void
  onNodeOffline: (nodeId: string) => void
  onPushServices: (nodeId: string) => void
  onAddCapability: (nodeId: string, capability: Omit<Capability, 'id' | 'nodeId'>) => void
}

export default function NodeDetailPanel({
  selectedNode,
  nodes,
  onNodeUpdate,
  onNodeDelete,
  onHealthCheck,
  onNodePublish,
  onNodeOffline,
  onPushServices,
  onAddCapability
}: NodeDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
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
  const [isCapabilityDialogOpen, setIsCapabilityDialogOpen] = useState(false)
  const [capabilityForm, setCapabilityForm] = useState({
    productType: '',
    serviceType: '',
    isEnabled: true,
    endpoint: '',
    version: ''
  })
  
  // 面板状态管理
  const [panelOrder, setPanelOrder] = useState([
    'basic-info',
    'operations', 
    'capabilities',
    'geo-info'
  ])
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({
    'basic-info': true,
    'operations': true,
    'capabilities': false,
    'geo-info': true
  })

  useEffect(() => {
    if (selectedNode) {
      setEditForm({
        code: selectedNode.code,
        name: selectedNode.name,
        type: selectedNode.type,
        description: selectedNode.description || '',
        apiUrl: selectedNode.apiUrl,
        adminUrl: selectedNode.adminUrl || '',
        coverage: selectedNode.coverage || '',
        parentId: selectedNode.parentId || 'none',
        latitude: selectedNode.location?.lat?.toString() || '',
        longitude: selectedNode.location?.lng?.toString() || ''
      })
    }
  }, [selectedNode])

  // 面板状态处理函数
  const handlePanelOrderChange = (newOrder: string[]) => {
    setPanelOrder(newOrder)
  }

  const handlePanelExpandChange = (panelId: string, expanded: boolean) => {
    setExpandedPanels(prev => ({
      ...prev,
      [panelId]: expanded
    }))
  }

  // 获取节点图标
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'GLOBAL_ROOT':
        return <Globe className="h-5 w-5" />
      case 'NATIONAL':
        return <Building className="h-5 w-5" />
      case 'REGIONAL':
        return <MapIcon className="h-5 w-5" />
      case 'LEAF':
        return <Anchor className="h-5 w-5" />
      default:
        return <Database className="h-5 w-5" />
    }
  }

  // 获取健康状态徽章
  const getHealthBadge = (status: string) => {
    const healthInfo = HEALTH_STATUS[status as keyof typeof HEALTH_STATUS]
    if (!healthInfo) return <Badge variant="outline">未知</Badge>
    
    return (
      <Badge variant="outline" className={`${healthInfo.color} text-white`}>
        {healthInfo.label}
      </Badge>
    )
  }

  // 保存编辑
  const handleSaveEdit = () => {
    if (!selectedNode) return

    const updates: Partial<Node> = {
      code: editForm.code,
      name: editForm.name,
      type: editForm.type,
      description: editForm.description,
      apiUrl: editForm.apiUrl,
      adminUrl: editForm.adminUrl,
      coverage: editForm.coverage,
      parentId: editForm.parentId === 'none' ? null : editForm.parentId,
      location: {
        lat: parseFloat(editForm.latitude) || 0,
        lng: parseFloat(editForm.longitude) || 0
      }
    }

    onNodeUpdate(selectedNode.id, updates)
    setIsEditing(false)
  }

  // 取消编辑
  const handleCancelEdit = () => {
    if (selectedNode) {
      setEditForm({
        code: selectedNode.code,
        name: selectedNode.name,
        type: selectedNode.type,
        description: selectedNode.description || '',
        apiUrl: selectedNode.apiUrl,
        adminUrl: selectedNode.adminUrl || '',
        coverage: selectedNode.coverage || '',
        parentId: selectedNode.parentId || 'none',
        latitude: selectedNode.location?.lat?.toString() || '',
        longitude: selectedNode.location?.lng?.toString() || ''
      })
    }
    setIsEditing(false)
  }

  // 添加服务能力
  const handleAddCapability = () => {
    if (!selectedNode) return
    
    onAddCapability(selectedNode.id, capabilityForm)
    setIsCapabilityDialogOpen(false)
    setCapabilityForm({
      productType: '',
      serviceType: '',
      isEnabled: true,
      endpoint: '',
      version: ''
    })
  }

  // 生成面板项配置
  const getPanelItems = () => {
    if (!selectedNode) return []

    const items = [
      {
        id: 'basic-info',
        title: '基本信息',
        icon: getNodeIcon(selectedNode.type),
        badge: NODE_TYPES[selectedNode.type as keyof typeof NODE_TYPES],
        editable: true,
        defaultCollapsed: false,
        defaultMinimized: false,
        onEdit: () => setIsEditing(true),
        onSave: handleSaveEdit,
        onCancel: handleCancelEdit,
        content: (
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-code">节点标识符</Label>
                    <Input
                      id="edit-code"
                      value={editForm.code}
                      onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-name">节点名称</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-type">节点类型</Label>
                    <Select value={editForm.type} onValueChange={(value) => setEditForm({ ...editForm, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(NODE_TYPES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-level">层级</Label>
                    <Select value={editForm.level?.toString()} onValueChange={(value) => setEditForm({ ...editForm, level: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 - 根节点</SelectItem>
                        <SelectItem value="1">1 - 国家级</SelectItem>
                        <SelectItem value="2">2 - 区域级</SelectItem>
                        <SelectItem value="3">3 - 叶子节点</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">描述</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="节点描述信息"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-apiUrl">API地址</Label>
                    <Input
                      id="edit-apiUrl"
                      value={editForm.apiUrl}
                      onChange={(e) => setEditForm({ ...editForm, apiUrl: e.target.value })}
                      placeholder="https://example.com/api"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-adminUrl">管理地址</Label>
                    <Input
                      id="edit-adminUrl"
                      value={editForm.adminUrl || ''}
                      onChange={(e) => setEditForm({ ...editForm, adminUrl: e.target.value })}
                      placeholder="https://admin.example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-parentId">父节点</Label>
                    <Select value={editForm.parentId || ''} onValueChange={(value) => setEditForm({ ...editForm, parentId: value || undefined })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择父节点" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">无父节点</SelectItem>
                        {nodes.filter(n => n.id !== selectedNode.id && (n.level || 0) < (selectedNode.level || 0)).map((node) => (
                          <SelectItem key={node.id} value={node.id}>{node.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-latitude">纬度</Label>
                    <Input
                      id="edit-latitude"
                      value={editForm.latitude || ''}
                      onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                      placeholder="30.5928"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-longitude">经度</Label>
                    <Input
                      id="edit-longitude"
                      value={editForm.longitude || ''}
                      onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                      placeholder="114.3055"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-coverage">覆盖范围 (GeoJSON)</Label>
                    <Textarea
                      id="edit-coverage"
                      value={editForm.coverage || ''}
                      onChange={(e) => setEditForm({ ...editForm, coverage: e.target.value })}
                      placeholder={`{
  "type": "Point",
  "coordinates": [114.3055, 30.5928]
}`}
                      className="font-mono text-sm"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">节点标识符</Label>
                    <p className="text-sm">{selectedNode.code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">节点类型</Label>
                    <p className="text-sm">{NODE_TYPES[selectedNode.type as keyof typeof NODE_TYPES]}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">层级</Label>
                    <p className="text-sm">{selectedNode.level}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">状态</Label>
                    <p className="text-sm">{getHealthBadge(selectedNode.healthStatus)}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">API地址</Label>
                  <p className="text-sm">{selectedNode.apiUrl}</p>
                </div>
                {selectedNode.adminUrl && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">管理地址</Label>
                    <p className="text-sm">{selectedNode.adminUrl}</p>
                  </div>
                )}
                {selectedNode.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">描述</Label>
                    <p className="text-sm">{selectedNode.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      },
      {
        id: 'operations',
        title: '节点操作',
        icon: <Settings className="h-4 w-4" />,
        defaultCollapsed: false,
        defaultMinimized: true,
        content: (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => onHealthCheck(selectedNode.id)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              健康检查
            </Button>
            {selectedNode.isActive ? (
              <Button
                variant="outline"
                onClick={() => onNodeOffline(selectedNode.id)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                下线节点
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => onNodePublish(selectedNode.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                发布节点
              </Button>
            )}
            {selectedNode.level > 0 && (
              <Button
                variant="outline"
                onClick={() => onPushServices(selectedNode.id)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                向上推送服务
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除节点
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    确定要删除节点 &quot;{selectedNode.name}&quot; 吗？此操作不可撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onNodeDelete(selectedNode.id)}>
                    删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
      {
        id: 'capabilities',
        title: '服务能力',
        icon: <Database className="h-4 w-4" />,
        badge: selectedNode.capabilities?.length ? `${selectedNode.capabilities.length}` : undefined,
        defaultCollapsed: false,
        defaultMinimized: true,
        content: (
          <div>
            <div className="flex justify-between items-center mb-4">
              <Dialog open={isCapabilityDialogOpen} onOpenChange={setIsCapabilityDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    添加能力
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>添加服务能力</DialogTitle>
                    <DialogDescription>
                      为节点添加新的服务能力
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="productType">产品类型</Label>
                      <Select value={capabilityForm.productType} onValueChange={(value) => setCapabilityForm({ ...capabilityForm, productType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择产品类型" />
                        </SelectTrigger>
                        <SelectContent>
                          {S100_PRODUCTS.map((product) => (
                            <SelectItem key={product.value} value={product.value}>
                              {product.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="serviceType">服务类型</Label>
                      <Select value={capabilityForm.serviceType} onValueChange={(value) => setCapabilityForm({ ...capabilityForm, serviceType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择服务类型" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_TYPES.map((service) => (
                            <SelectItem key={service.value} value={service.value}>
                              {service.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="endpoint">服务端点</Label>
                      <Input
                        id="endpoint"
                        value={capabilityForm.endpoint}
                        onChange={(e) => setCapabilityForm({ ...capabilityForm, endpoint: e.target.value })}
                        placeholder="http://example.com/service"
                      />
                    </div>
                    <div>
                      <Label htmlFor="version">版本</Label>
                      <Input
                        id="version"
                        value={capabilityForm.version}
                        onChange={(e) => setCapabilityForm({ ...capabilityForm, version: e.target.value })}
                        placeholder="1.0.0"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCapabilityDialogOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleAddCapability}>
                        添加
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {selectedNode.capabilities && selectedNode.capabilities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>产品类型</TableHead>
                    <TableHead>服务类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>版本</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedNode.capabilities.map((capability) => (
                    <TableRow key={capability.id}>
                      <TableCell>{capability.productType}</TableCell>
                      <TableCell>{capability.serviceType}</TableCell>
                      <TableCell>
                        <Badge variant={capability.isEnabled ? 'default' : 'secondary'}>
                          {capability.isEnabled ? '启用' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell>{capability.version || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 text-center py-4">暂无服务能力</p>
            )}
          </div>
        )
      },
      {
        id: 'geo-info',
        title: '地理信息',
        icon: <MapIcon className="h-4 w-4" />,
        defaultCollapsed: false,
        defaultMinimized: false,
        content: (
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="map">地图视图</TabsTrigger>
              <TabsTrigger value="geo">地理数据</TabsTrigger>
              <TabsTrigger value="edit">编辑地理</TabsTrigger>
            </TabsList>
            
            <TabsContent value="map" className="mt-4">
              <NodeMap 
                nodes={[selectedNode]} 
                selectedNode={selectedNode}
                onNodeUpdate={(nodeId, updates) => {
                  onNodeUpdate(nodeId, updates)
                }}
                editable={true}
              />
            </TabsContent>
            
            <TabsContent value="geo" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">纬度</Label>
                    <p className="text-sm font-mono">
                      {selectedNode.latitude ? selectedNode.latitude.toFixed(6) : '未设置'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">经度</Label>
                    <p className="text-sm font-mono">
                      {selectedNode.longitude ? selectedNode.longitude.toFixed(6) : '未设置'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">覆盖范围</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">
                      {selectedNode.coverageDisplay || '未设置覆盖范围'}
                    </p>
                  </div>
                </div>
                
                {selectedNode.coverage && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">GeoJSON 数据</Label>
                    <Textarea
                      value={JSON.stringify(JSON.parse(selectedNode.coverage), null, 2)}
                      readOnly
                      className="font-mono text-xs mt-1"
                      rows={8}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="edit" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editLatitude">纬度</Label>
                    <Input
                      id="editLatitude"
                      value={editForm.latitude || ''}
                      onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                      placeholder="30.5928"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLongitude">经度</Label>
                    <Input
                      id="editLongitude"
                      value={editForm.longitude || ''}
                      onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                      placeholder="114.3055"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="coverage">覆盖范围 (GeoJSON)</Label>
                  <Textarea
                    id="coverage"
                    value={editForm.coverage || ''}
                    onChange={(e) => setEditForm({ ...editForm, coverage: e.target.value })}
                    placeholder={`{
  "type": "Point",
  "coordinates": [114.3055, 30.5928]
}`}
                    className="font-mono text-sm"
                    rows={6}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      if (editForm.latitude && editForm.longitude) {
                        const lat = parseFloat(editForm.latitude)
                        const lng = parseFloat(editForm.longitude)
                        const defaultCoverage = {
                          type: 'Point',
                          coordinates: [lng, lat]
                        }
                        setEditForm({
                          ...editForm,
                          coverage: JSON.stringify(defaultCoverage, null, 2)
                        })
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    生成默认覆盖
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      setEditForm({
                        ...editForm,
                        coverage: ''
                      })
                    }}
                    variant="outline"
                    size="sm"
                  >
                    清空覆盖范围
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )
      }
    ]

    return items
  }

  // 处理面板重新排序
  const handlePanelReorder = (newOrder: string[]) => {
    // 这里可以保存用户的面板排序偏好
    console.log('面板重新排序:', newOrder)
  }

  if (!selectedNode) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center text-gray-500">
            <Database className="h-12 w-12 mx-auto mb-2" />
            <p>请选择一个节点查看详情</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 节点基本信息 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {getNodeIcon(selectedNode.type)}
              <div>
                <CardTitle className="flex items-center gap-2">
                  {selectedNode.name}
                  {getHealthBadge(selectedNode.healthStatus)}
                </CardTitle>
                <CardDescription>
                  {selectedNode.code} • {NODE_TYPES[selectedNode.type as keyof typeof NODE_TYPES]}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    取消
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    <Save className="h-4 w-4 mr-2" />
                    保存
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-code">节点标识符</Label>
                  <Input
                    id="edit-code"
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-name">节点名称</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-type">节点类型</Label>
                  <Select value={editForm.type} onValueChange={(value) => setEditForm({ ...editForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(NODE_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-parentId">父节点</Label>
                  <Select value={editForm.parentId} onValueChange={(value) => setEditForm({ ...editForm, parentId: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无父节点</SelectItem>
                      {nodes.filter(n => n.id !== selectedNode.id && n.level < 3).map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.name} ({node.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-apiUrl">API地址</Label>
                <Input
                  id="edit-apiUrl"
                  value={editForm.apiUrl}
                  onChange={(e) => setEditForm({ ...editForm, apiUrl: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-adminUrl">管理地址</Label>
                <Input
                  id="edit-adminUrl"
                  value={editForm.adminUrl}
                  onChange={(e) => setEditForm({ ...editForm, adminUrl: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">描述</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-latitude">纬度</Label>
                  <Input
                    id="edit-latitude"
                    type="number"
                    step="any"
                    value={editForm.latitude}
                    onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                    placeholder="39.9042"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-longitude">经度</Label>
                  <Input
                    id="edit-longitude"
                    type="number"
                    step="any"
                    value={editForm.longitude}
                    onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                    placeholder="116.4074"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">节点标识符</Label>
                  <p className="text-sm">{selectedNode.code}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">节点类型</Label>
                  <p className="text-sm">{NODE_TYPES[selectedNode.type as keyof typeof NODE_TYPES]}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">层级</Label>
                  <p className="text-sm">{selectedNode.level}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">状态</Label>
                  <p className="text-sm">{getHealthBadge(selectedNode.healthStatus)}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">API地址</Label>
                <p className="text-sm">{selectedNode.apiUrl}</p>
              </div>
              {selectedNode.adminUrl && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">管理地址</Label>
                  <p className="text-sm">{selectedNode.adminUrl}</p>
                </div>
              )}
              {selectedNode.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">描述</Label>
                  <p className="text-sm">{selectedNode.description}</p>
                </div>
              )}
              {selectedNode.location && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">纬度</Label>
                    <p className="text-sm">{selectedNode.location.lat}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">经度</Label>
                    <p className="text-sm">{selectedNode.location.lng}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>节点操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => onHealthCheck(selectedNode.id)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              健康检查
            </Button>
            {selectedNode.isActive ? (
              <Button
                variant="outline"
                onClick={() => onNodeOffline(selectedNode.id)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                下线节点
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => onNodePublish(selectedNode.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                发布节点
              </Button>
            )}
            {selectedNode.level > 0 && (
              <Button
                variant="outline"
                onClick={() => onPushServices(selectedNode.id)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                向上推送服务
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除节点
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    确定要删除节点 &quot;{selectedNode.name}&quot; 吗？此操作不可撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onNodeDelete(selectedNode.id)}>
                    删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* 服务能力 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>服务能力</CardTitle>
            <Dialog open={isCapabilityDialogOpen} onOpenChange={setIsCapabilityDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>添加服务能力</DialogTitle>
                  <DialogDescription>
                    为节点添加新的服务能力
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="productType">产品类型</Label>
                    <Select value={capabilityForm.productType} onValueChange={(value) => setCapabilityForm({ ...capabilityForm, productType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择产品类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {S100_PRODUCTS.map((product) => (
                          <SelectItem key={product.value} value={product.value}>
                            {product.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="serviceType">服务类型</Label>
                    <Select value={capabilityForm.serviceType} onValueChange={(value) => setCapabilityForm({ ...capabilityForm, serviceType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择服务类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            {service.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="endpoint">服务端点</Label>
                    <Input
                      id="endpoint"
                      value={capabilityForm.endpoint}
                      onChange={(e) => setCapabilityForm({ ...capabilityForm, endpoint: e.target.value })}
                      placeholder="http://example.com/service"
                    />
                  </div>
                  <div>
                    <Label htmlFor="version">版本</Label>
                    <Input
                      id="version"
                      value={capabilityForm.version}
                      onChange={(e) => setCapabilityForm({ ...capabilityForm, version: e.target.value })}
                      placeholder="1.0.0"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCapabilityDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleAddCapability}>
                      添加
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {selectedNode.capabilities && selectedNode.capabilities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>产品类型</TableHead>
                  <TableHead>服务类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>版本</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedNode.capabilities.map((capability) => (
                  <TableRow key={capability.id}>
                    <TableCell>{capability.productType}</TableCell>
                    <TableCell>{capability.serviceType}</TableCell>
                    <TableCell>
                      <Badge variant={capability.isEnabled ? 'default' : 'secondary'}>
                        {capability.isEnabled ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>{capability.version || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 text-center py-4">暂无服务能力</p>
          )}
        </CardContent>
      </Card>

      {/* 节点地图 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="h-5 w-5" />
            地理信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="map">地图视图</TabsTrigger>
              <TabsTrigger value="geo">地理数据</TabsTrigger>
              <TabsTrigger value="edit">编辑地理</TabsTrigger>
            </TabsList>
            
            <TabsContent value="map" className="mt-4">
              <NodeMap 
                nodes={[selectedNode]} 
                selectedNode={selectedNode}
                onNodeUpdate={(nodeId, updates) => {
                  onNodeUpdate(nodeId, updates)
                }}
                editable={true}
              />
            </TabsContent>
            
            <TabsContent value="geo" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">纬度</Label>
                    <p className="text-sm font-mono">
                      {selectedNode.latitude ? selectedNode.latitude.toFixed(6) : '未设置'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">经度</Label>
                    <p className="text-sm font-mono">
                      {selectedNode.longitude ? selectedNode.longitude.toFixed(6) : '未设置'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">覆盖范围</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">
                      {selectedNode.coverageDisplay || '未设置覆盖范围'}
                    </p>
                  </div>
                </div>
                
                {selectedNode.coverage && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">GeoJSON 数据</Label>
                    <Textarea
                      value={JSON.stringify(JSON.parse(selectedNode.coverage), null, 2)}
                      readOnly
                      className="font-mono text-xs mt-1"
                      rows={8}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="edit" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editLatitude">纬度</Label>
                    <Input
                      id="editLatitude"
                      value={editForm.latitude || ''}
                      onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                      placeholder="30.5928"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLongitude">经度</Label>
                    <Input
                      id="editLongitude"
                      value={editForm.longitude || ''}
                      onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                      placeholder="114.3055"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="coverage">覆盖范围 (GeoJSON)</Label>
                  <Textarea
                    id="coverage"
                    value={editForm.coverage || ''}
                    onChange={(e) => setEditForm({ ...editForm, coverage: e.target.value })}
                    placeholder={`{
  "type": "Point",
  "coordinates": [114.3055, 30.5928]
}`}
                    className="font-mono text-sm"
                    rows={6}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      // 生成默认覆盖范围
                      if (editForm.latitude && editForm.longitude) {
                        const lat = parseFloat(editForm.latitude)
                        const lng = parseFloat(editForm.longitude)
                        const defaultCoverage = {
                          type: 'Point',
                          coordinates: [lng, lat]
                        }
                        setEditForm({
                          ...editForm,
                          coverage: JSON.stringify(defaultCoverage, null, 2)
                        })
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    生成默认覆盖
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      // 清空覆盖范围
                      setEditForm({
                        ...editForm,
                        coverage: ''
                      })
                    }}
                    variant="outline"
                    size="sm"
                  >
                    清空覆盖范围
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}