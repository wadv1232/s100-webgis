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
import { Progress } from '@/components/ui/progress'
import MainLayout from '@/components/MainLayout'
import ResponsiveContainer, { ResponsiveGrid } from '@/components/ResponsiveLayout'
import { AccessibleButton } from '@/components/AccessibleComponents'
import ThemeToggle from '@/components/ThemeToggle'
import { 
  Plus, 
  Upload, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Database,
  Map,
  Anchor,
  Waves,
  FileText,
  Settings,
  Eye,
  Download
} from 'lucide-react'

// 数据集状态枚举
const DATASET_STATUS = {
  UPLOADED: { label: '已上传', color: 'bg-blue-500', icon: Upload },
  PROCESSING: { label: '处理中', color: 'bg-yellow-500', icon: Clock },
  PUBLISHED: { label: '已发布', color: 'bg-green-500', icon: CheckCircle },
  ARCHIVED: { label: '已归档', color: 'bg-gray-500', icon: FileText },
  ERROR: { label: '错误', color: 'bg-red-500', icon: XCircle }
}

// S-100产品类型
const S100_PRODUCTS = [
  'S101',
  'S102',
  'S104',
  'S111',
  'S124',
  'S125',
  'S131'
]

// 数据集接口
interface Dataset {
  id: string
  name: string
  description: string
  productType: string
  version: string
  status: string
  fileName: string
  fileSize: number
  mimeType: string
  coverage: any
  metadata: any
  nodeId: string
  node: {
    id: string
    name: string
    type: string
    level: string
  }
  createdAt: string
  updatedAt: string
}

// 节点接口
interface Node {
  id: string
  name: string
  type: string
  level: string
  apiUrl: string
  coverage: any
}

// 筛选条件接口
interface Filters {
  nodeId: string
  productType: string
  status: string
  search: string
}

export default function DatasetsPage() {
  // 状态管理
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    nodeId: '',
    productType: '',
    status: '',
    search: ''
  })
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // 表单状态
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    productType: '',
    nodeId: '',
    file: null as File | null
  })
  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    coverage: '',
    metadata: ''
  })

  // 加载数据集和节点数据
  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // 构建查询参数
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      // 并行加载数据
      const [datasetsResponse, nodesResponse] = await Promise.all([
        fetch(`/api/datasets?${params.toString()}`),
        fetch('/api/nodes')
      ])

      if (datasetsResponse.ok) {
        const datasetsData = await datasetsResponse.json()
        setDatasets(datasetsData.data || datasetsData.datasets || [])
      }

      if (nodesResponse.ok) {
        const nodesData = await nodesResponse.json()
        setNodes(nodesData.data || nodesData.nodes || [])
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadForm({ ...uploadForm, file })
    }
  }

  // 上传数据集
  const uploadDataset = async () => {
    if (!uploadForm.file || !uploadForm.name || !uploadForm.productType || !uploadForm.nodeId) {
      alert('请填写所有必需字段')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('name', uploadForm.name)
      formData.append('description', uploadForm.description)
      formData.append('productType', uploadForm.productType)
      formData.append('nodeId', uploadForm.nodeId)

      const response = await fetch('/api/datasets', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await loadData()
        setIsUploadDialogOpen(false)
        setUploadForm({
          name: '',
          description: '',
          productType: '',
          nodeId: '',
          file: null
        })
      } else {
        const error = await response.json()
        alert(error.error || '上传失败')
      }
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // 编辑数据集
  const updateDataset = async () => {
    if (!selectedDataset) return

    try {
      const response = await fetch(`/api/datasets/${selectedDataset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          coverage: editForm.coverage ? JSON.parse(editForm.coverage) : null,
          metadata: editForm.metadata ? JSON.parse(editForm.metadata) : null
        })
      })

      if (response.ok) {
        await loadData()
        setIsEditDialogOpen(false)
        setSelectedDataset(null)
      } else {
        const error = await response.json()
        alert(error.error || '更新失败')
      }
    } catch (error) {
      console.error('更新失败:', error)
      alert('更新失败')
    }
  }

  // 删除数据集
  const deleteDataset = async (id: string) => {
    try {
      const response = await fetch(`/api/datasets/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadData()
      } else {
        const error = await response.json()
        alert(error.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

  // 打开编辑对话框
  const openEditDialog = (dataset: Dataset) => {
    setSelectedDataset(dataset)
    setEditForm({
      name: dataset.name,
      description: dataset.description,
      coverage: dataset.coverage ? JSON.stringify(dataset.coverage, null, 2) : '',
      metadata: dataset.metadata ? JSON.stringify(dataset.metadata, null, 2) : ''
    })
    setIsEditDialogOpen(true)
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 获取状态信息
  const getStatusInfo = (status: string) => {
    return DATASET_STATUS[status as keyof typeof DATASET_STATUS] || {
      label: status,
      color: 'bg-gray-500',
      icon: FileText
    }
  }

  // 筛选后的数据集
  const filteredDatasets = datasets.filter(dataset => {
    if (filters.nodeId && dataset.nodeId !== filters.nodeId) return false
    if (filters.productType && dataset.productType !== filters.productType) return false
    if (filters.status && dataset.status !== filters.status) return false
    if (filters.search && !dataset.name.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  return (
    <MainLayout>
      <ResponsiveContainer>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">数据集管理</h1>
              <p className="text-gray-600">管理S-100海道测量数据集</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                上传数据集
              </Button>
            </div>
          </div>

          {/* Upload Dialog */}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>上传数据集</DialogTitle>
                <DialogDescription>
                  上传S-100海道测量数据集文件
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">数据集名称</Label>
                  <Input
                    id="name"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                    placeholder="输入数据集名称"
                  />
                </div>
                <div>
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="输入数据集描述"
                  />
                </div>
                <div>
                  <Label htmlFor="productType">产品类型</Label>
                  <Select value={uploadForm.productType} onValueChange={(value) => setUploadForm({ ...uploadForm, productType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择产品类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {S100_PRODUCTS.map(product => (
                        <SelectItem key={product} value={product}>{product}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nodeId">节点</Label>
                  <Select value={uploadForm.nodeId} onValueChange={(value) => setUploadForm({ ...uploadForm, nodeId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择节点" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map(node => (
                        <SelectItem key={node.id} value={node.id}>{node.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="file">文件</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".zip,.csv,.json"
                  />
                </div>
                {isUploading && (
                  <div>
                    <Label>上传进度</Label>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={isUploading}>
                    取消
                  </Button>
                  <Button onClick={uploadDataset} disabled={isUploading}>
                    {isUploading ? '上传中...' : '上传'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>编辑数据集</DialogTitle>
                <DialogDescription>
                  编辑数据集信息和元数据
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">名称</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                <div>
                  <Label htmlFor="edit-coverage">覆盖范围 (GeoJSON)</Label>
                  <Textarea
                    id="edit-coverage"
                    value={editForm.coverage}
                    onChange={(e) => setEditForm({ ...editForm, coverage: e.target.value })}
                    placeholder="GeoJSON格式"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-metadata">元数据 (JSON)</Label>
                  <Textarea
                    id="edit-metadata"
                    value={editForm.metadata}
                    onChange={(e) => setEditForm({ ...editForm, metadata: e.target.value })}
                    placeholder="JSON格式"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={updateDataset}>
                    保存
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>节点筛选</Label>
                  <Select value={filters.nodeId} onValueChange={(value) => setFilters({ ...filters, nodeId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择节点" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部节点</SelectItem>
                      {nodes.map(node => (
                        <SelectItem key={node.id} value={node.id}>{node.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>产品类型</Label>
                  <Select value={filters.productType} onValueChange={(value) => setFilters({ ...filters, productType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择产品类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部类型</SelectItem>
                      {S100_PRODUCTS.map(product => (
                        <SelectItem key={product} value={product}>{product}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>状态</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部状态</SelectItem>
                      {Object.entries(DATASET_STATUS).map(([key, status]) => (
                        <SelectItem key={key} value={key}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>搜索</Label>
                  <Input
                    placeholder="搜索数据集..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dataset Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatasets.map(dataset => {
              const statusInfo = getStatusInfo(dataset.status)
              const Icon = statusInfo.icon

              return (
                <Card key={dataset.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{dataset.name}</CardTitle>
                        <CardDescription>{dataset.productType} v{dataset.version}</CardDescription>
                      </div>
                      <Badge className={`${statusInfo.color} text-white`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {dataset.description}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Database className="h-4 w-4 mr-1" />
                        {formatFileSize(dataset.fileSize)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Map className="h-4 w-4 mr-1" />
                        {dataset.node.name}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(dataset.createdAt).toLocaleDateString()}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(dataset)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/api/datasets/${dataset.id}/download`, '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          下载
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3 mr-1" />
                              删除
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除数据集 &quot;{dataset.name}&quot; 吗？此操作不可撤销。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteDataset(dataset.id)}>
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>加载数据中...</p>
            </div>
          )}

          {!loading && filteredDatasets.length === 0 && (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">没有找到匹配的数据集</p>
            </div>
          )}
        </div>
      </ResponsiveContainer>
    </MainLayout>
  )
}