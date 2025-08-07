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
  { value: 'S101', label: 'S-101 电子海图', icon: Map },
  { value: 'S102', label: 'S-102 高精度水深', icon: Anchor },
  { value: 'S104', label: 'S-104 动态水位', icon: Waves },
  { value: 'S111', label: 'S-111 实时海流', icon: Waves },
  { value: 'S124', label: 'S-124 航行警告', icon: AlertTriangle },
  { value: 'S125', label: 'S-125 航行信息', icon: FileText },
  { value: 'S131', label: 'S-131 海洋保护区', icon: Map }
]

// 服务类型
const SERVICE_TYPES = {
  WFS: 'Web要素服务',
  WMS: 'Web地图服务',
  WCS: 'Web覆盖服务'
}

interface Dataset {
  id: string
  name: string
  description?: string
  productType: string
  version: string
  status: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  coverage?: string
  metadata?: string
  publishedAt?: string
  nodeId: string
  nodeName?: string
  createdAt: string
  updatedAt: string
  services: Service[]
}

interface Service {
  id: string
  datasetId: string
  serviceType: string
  endpoint: string
  configuration?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Node {
  id: string
  name: string
  type: string
}

// 模拟要素数据
const mockFeatures = {
  S101: [
    { name: '航道要素', type: 'NavigationFeature', count: 1250 },
    { name: '水深点', type: 'DepthFeature', count: 3560 },
    { name: '陆标', type: 'LandmarkFeature', count: 890 },
    { name: '限制区域', type: 'RestrictedFeature', count: 340 },
    { name: '助航设施', type: 'AidToNavigationFeature', count: 2100 }
  ],
  S102: [
    { name: '水深网格', type: 'BathymetryGrid', count: 12500 },
    { name: '等深线', type: 'DepthContour', count: 890 },
    { name: '水深不确定性', type: 'DepthUncertainty', count: 12500 },
    { name: '质量标记', type: 'QualityFeature', count: 450 }
  ],
  S104: [
    { name: '水位点', type: 'WaterLevelPoint', count: 156 },
    { name: '潮汐站', type: 'TidalStation', count: 45 },
    { name: '水位预测', type: 'WaterLevelPrediction', count: 8900 }
  ],
  S111: [
    { name: '海流矢量', type: 'CurrentVector', count: 8900 },
    { name: '流速场', type: 'CurrentSpeedField', count: 12500 },
    { name: '流向场', type: 'CurrentDirectionField', count: 12500 }
  ]
}

// 获取产品类型的要素
const getFeaturesByProductType = (productType: string) => {
  return mockFeatures[productType as keyof typeof mockFeatures] || []
}

// 获取总要素数
const getTotalFeatures = (productType: string) => {
  const features = getFeaturesByProductType(productType)
  return features.reduce((total, feature) => total + feature.count, 0)
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [filters, setFilters] = useState({
    nodeId: 'all',
    productType: 'all',
    status: 'all'
  })

  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    nodeId: '',
    name: '',
    description: '',
    productType: '',
    version: '1.0'
  })

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    version: '',
    coverage: '',
    metadata: ''
  })

  // 获取数据集列表
  const fetchDatasets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.nodeId && filters.nodeId !== 'all') params.append('nodeId', filters.nodeId)
      if (filters.productType && filters.productType !== 'all') params.append('productType', filters.productType)
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)

      const response = await fetch(`/api/datasets?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setDatasets(result.data.datasets)
      } else {
        console.error('获取数据集列表失败:', result.error)
      }
    } catch (error) {
      console.error('获取数据集列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取节点列表
  const fetchNodes = async () => {
    try {
      const response = await fetch('/api/nodes')
      const result = await response.json()
      
      if (result.success) {
        setNodes(result.data.nodes)
      } else {
        console.error('获取节点列表失败:', result.error)
      }
    } catch (error) {
      console.error('获取节点列表失败:', error)
    }
  }

  // 获取数据集详情
  const fetchDatasetDetails = async (datasetId: string) => {
    try {
      const response = await fetch(`/api/datasets/${datasetId}`)
      const result = await response.json()
      
      if (result.success) {
        setSelectedDataset(result.data)
      } else {
        console.error('获取数据集详情失败:', result.error)
      }
    } catch (error) {
      console.error('获取数据集详情失败:', error)
    }
  }

  // 上传数据集
  const uploadDataset = async () => {
    if (!uploadForm.file || !uploadForm.nodeId || !uploadForm.name || !uploadForm.productType) {
      alert('请填写所有必填字段')
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('nodeId', uploadForm.nodeId)
      formData.append('name', uploadForm.name)
      formData.append('description', uploadForm.description)
      formData.append('productType', uploadForm.productType)
      formData.append('version', uploadForm.version)

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/datasets', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()
      
      if (result.success) {
        setIsUploadDialogOpen(false)
        resetUploadForm()
        fetchDatasets()
      } else {
        console.error('上传数据集失败:', result.error)
        alert(result.error)
      }
    } catch (error) {
      console.error('上传数据集失败:', error)
      alert('上传失败')
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  // 更新数据集
  const updateDataset = async () => {
    if (!editingDataset) return
    
    try {
      const response = await fetch(`/api/datasets/${editingDataset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setIsEditDialogOpen(false)
        resetEditForm()
        fetchDatasets()
        if (selectedDataset?.id === editingDataset.id) {
          fetchDatasetDetails(editingDataset.id)
        }
      } else {
        console.error('更新数据集失败:', result.error)
        alert(result.error)
      }
    } catch (error) {
      console.error('更新数据集失败:', error)
      alert('更新失败')
    }
  }

  // 删除数据集
  const deleteDataset = async (datasetId: string) => {
    try {
      const response = await fetch(`/api/datasets/${datasetId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        fetchDatasets()
        if (selectedDataset?.id === datasetId) {
          setSelectedDataset(null)
        }
      } else {
        console.error('删除数据集失败:', result.error)
        alert(result.error)
      }
    } catch (error) {
      console.error('删除数据集失败:', error)
      alert('删除失败')
    }
  }

  // 发布数据集
  const publishDataset = async (datasetId: string) => {
    try {
      const response = await fetch(`/api/datasets/${datasetId}/publish`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.success) {
        fetchDatasets()
        if (selectedDataset?.id === datasetId) {
          fetchDatasetDetails(datasetId)
        }
      } else {
        console.error('发布数据集失败:', result.error)
        alert(result.error)
      }
    } catch (error) {
      console.error('发布数据集失败:', error)
      alert('发布失败')
    }
  }

  // 重置上传表单
  const resetUploadForm = () => {
    setUploadForm({
      file: null,
      nodeId: '',
      name: '',
      description: '',
      productType: '',
      version: '1.0'
    })
    setUploadProgress(0)
  }

  // 重置编辑表单
  const resetEditForm = () => {
    setEditForm({
      name: '',
      description: '',
      version: '',
      coverage: '',
      metadata: ''
    })
    setEditingDataset(null)
  }

  // 打开编辑对话框
  const openEditDialog = (dataset: Dataset) => {
    setEditingDataset(dataset)
    setEditForm({
      name: dataset.name,
      description: dataset.description || '',
      version: dataset.version,
      coverage: dataset.coverage || '',
      metadata: dataset.metadata || ''
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

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const statusInfo = DATASET_STATUS[status as keyof typeof DATASET_STATUS]
    if (!statusInfo) return <Badge variant="outline">未知</Badge>
    
    return (
      <Badge variant="outline" className={`${statusInfo.color} text-white`}>
        {statusInfo.label}
      </Badge>
    )
  }

  // 获取产品图标
  const getProductIcon = (productType: string) => {
    const product = S100_PRODUCTS.find(p => p.value === productType)
    return product ? product.icon : Database
  }

  useEffect(() => {
    fetchDatasets()
    fetchNodes()
  }, [filters])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">数据集管理</h1>
          <p className="text-gray-600">管理S-100海事数据集的上传、处理和发布</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              上传数据集
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>上传数据集</DialogTitle>
              <DialogDescription>
                上传S-100标准海事数据文件
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">选择文件</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                  accept=".zip,.h5,.000,.geojson,.json"
                />
              </div>
              <div>
                <Label htmlFor="nodeId">所属节点</Label>
                <Select value={uploadForm.nodeId} onValueChange={(value) => setUploadForm({ ...uploadForm, nodeId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择节点" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <Label htmlFor="productType">产品类型</Label>
                <Select value={uploadForm.productType} onValueChange={(value) => setUploadForm({ ...uploadForm, productType: value })}>
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
                <Label htmlFor="version">版本</Label>
                <Input
                  id="version"
                  value={uploadForm.version}
                  onChange={(e) => setUploadForm({ ...uploadForm, version: e.target.value })}
                  placeholder="1.0"
                />
              </div>
              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="数据集描述"
                />
              </div>
              {isUploading && (
                <div>
                  <Label>上传进度</Label>
                  <Progress value={uploadProgress} className="mt-2" />
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
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>节点筛选</Label>
              <Select value={filters.nodeId} onValueChange={(value) => setFilters({ ...filters, nodeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择节点" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部节点</SelectItem>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.name}
                    </SelectItem>
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
                  <SelectItem value="all">全部类型</SelectItem>
                  {S100_PRODUCTS.map((product) => (
                    <SelectItem key={product.value} value={product.value}>
                      {product.label}
                    </SelectItem>
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
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(DATASET_STATUS).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dataset List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>数据集列表</CardTitle>
              <CardDescription>
                系统中的所有S-100数据集
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>数据集</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>节点</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>大小</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datasets.map((dataset) => {
                      const ProductIcon = getProductIcon(dataset.productType)
                      return (
                        <TableRow key={dataset.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ProductIcon className="h-5 w-5" />
                              <div>
                                <div className="font-medium">{dataset.name}</div>
                                <div className="text-sm text-gray-500">v{dataset.version}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{dataset.productType}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{dataset.nodeName}</div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(dataset.status)}
                          </TableCell>
                          <TableCell>
                            {formatFileSize(dataset.fileSize)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDataset(dataset)
                                  fetchDatasetDetails(dataset.id)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {dataset.status === 'UPLOADED' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => publishDataset(dataset.id)}
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(dataset)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      确定要删除数据集 "{dataset.name}" 吗？此操作不可撤销。
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
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dataset Details */}
        <div>
          {selectedDataset ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const ProductIcon = getProductIcon(selectedDataset.productType)
                    return <ProductIcon className="h-5 w-5" />
                  })()}
                  {selectedDataset.name}
                </CardTitle>
                <CardDescription>
                  {selectedDataset.productType} v{selectedDataset.version}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="info">基本信息</TabsTrigger>
                    <TabsTrigger value="services">服务</TabsTrigger>
                    <TabsTrigger value="features">要素管理</TabsTrigger>
                    <TabsTrigger value="files">文件</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="space-y-4">
                    <div>
                      <Label>状态</Label>
                      <div className="mt-1">
                        {getStatusBadge(selectedDataset.status)}
                      </div>
                    </div>
                    <div>
                      <Label>所属节点</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedDataset.nodeName}
                      </p>
                    </div>
                    <div>
                      <Label>描述</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedDataset.description || '无描述'}
                      </p>
                    </div>
                    <div>
                      <Label>文件信息</Label>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        <div>文件名: {selectedDataset.fileName}</div>
                        <div>大小: {formatFileSize(selectedDataset.fileSize)}</div>
                        <div>类型: {selectedDataset.mimeType}</div>
                      </div>
                    </div>
                    {selectedDataset.publishedAt && (
                      <div>
                        <Label>发布时间</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(selectedDataset.publishedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="services" className="space-y-4">
                    <div>
                      <Label>可用服务</Label>
                      <div className="space-y-2 mt-2">
                        {selectedDataset.services.map((service) => (
                          <div key={service.id} className="flex justify-between items-center p-2 border rounded">
                            <div>
                              <div className="font-medium">
                                {SERVICE_TYPES[service.serviceType as keyof typeof SERVICE_TYPES]}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {service.endpoint}
                              </div>
                            </div>
                            <Badge variant={service.isActive ? "default" : "secondary"}>
                              {service.isActive ? "启用" : "禁用"}
                            </Badge>
                          </div>
                        ))}
                        {selectedDataset.services.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">
                            暂无可用服务
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="features" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>数据要素</Label>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        添加要素
                      </Button>
                    </div>
                    <div className="space-y-2 mt-2">
                      {getFeaturesByProductType(selectedDataset.productType).map((feature, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded">
                          <div className="flex-1">
                            <div className="font-medium">{feature.name}</div>
                            <div className="text-sm text-gray-500">{feature.type}</div>
                            <div className="text-xs text-gray-400">{feature.count} 个要素</div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {getFeaturesByProductType(selectedDataset.productType).length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          暂无要素数据
                        </p>
                      )}
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <div className="text-sm font-medium mb-2">要素统计</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>总要素数: {getTotalFeatures(selectedDataset.productType)}</div>
                        <div>已验证: {Math.floor(getTotalFeatures(selectedDataset.productType) * 0.85)}</div>
                        <div>待处理: {Math.floor(getTotalFeatures(selectedDataset.productType) * 0.15)}</div>
                        <div>错误: {Math.floor(getTotalFeatures(selectedDataset.productType) * 0.02)}</div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="files" className="space-y-4">
                    <div>
                      <Label>文件路径</Label>
                      <p className="text-sm text-gray-600 mt-1 break-all">
                        {selectedDataset.filePath}
                      </p>
                    </div>
                    <div>
                      <Label>文件信息</Label>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        <div>文件名: {selectedDataset.fileName}</div>
                        <div>大小: {formatFileSize(selectedDataset.fileSize)}</div>
                        <div>类型: {selectedDataset.mimeType}</div>
                        <div>创建时间: {new Date(selectedDataset.createdAt).toLocaleString()}</div>
                        <div>更新时间: {new Date(selectedDataset.updatedAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div>
                      <Label>元数据</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                        {selectedDataset.metadata ? (
                          <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(JSON.parse(selectedDataset.metadata), null, 2)}</pre>
                        ) : (
                          <p className="text-gray-500">无元数据</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>覆盖范围</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                        {selectedDataset.coverage ? (
                          <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(JSON.parse(selectedDataset.coverage), null, 2)}</pre>
                        ) : (
                          <p className="text-gray-500">无覆盖范围信息</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>操作</Label>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          下载
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          预览
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          元数据
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">选择一个数据集查看详情</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑数据集</DialogTitle>
            <DialogDescription>
              修改数据集信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">数据集名称</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-version">版本</Label>
              <Input
                id="edit-version"
                value={editForm.version}
                onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
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
              <Label htmlFor="edit-coverage">覆盖范围</Label>
              <Textarea
                id="edit-coverage"
                value={editForm.coverage}
                onChange={(e) => setEditForm({ ...editForm, coverage: e.target.value })}
                placeholder="GeoJSON格式"
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
    </div>
  )
}