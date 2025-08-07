'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Database, 
  Upload, 
  Download, 
  RefreshCw, 
  Eye, 
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  FileText,
  FolderOpen,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Settings,
  Zap
} from 'lucide-react'

// 模拟数据文件结构
interface MockDataFile {
  path: string
  service: string
  type: string
  size: number
  lastModified: string
  format: string
  features?: number
  description?: string
}

// 模拟数据统计
interface MockDataStats {
  totalFiles: number
  totalSize: number
  services: {
    [key: string]: {
      fileCount: number
      totalSize: number
      lastUpdate: string
    }
  }
  types: {
    [key: string]: {
      fileCount: number
      totalSize: number
    }
  }
}

// 模拟数据
const mockFiles: MockDataFile[] = [
  {
    path: 's101/wms/navigation-layer.json',
    service: 'S101',
    type: 'WMS',
    size: 156000,
    lastModified: '2024-01-15T10:30:00Z',
    format: 'JSON',
    features: 1250,
    description: 'Navigation layer with routes and waypoints'
  },
  {
    path: 's101/wfs/depth-features.json',
    service: 'S101',
    type: 'WFS',
    size: 89000,
    lastModified: '2024-01-15T11:15:00Z',
    format: 'JSON',
    features: 3560,
    description: 'Depth features including soundings and contours'
  },
  {
    path: 's102/wms/bathymetry-layer.json',
    service: 'S102',
    type: 'WMS',
    size: 234000,
    lastModified: '2024-01-15T09:45:00Z',
    format: 'JSON',
    features: 12500,
    description: 'High resolution bathymetric grid visualization'
  },
  {
    path: 's102/wcs/bathymetry-grid.tiff.metadata',
    service: 'S102',
    type: 'WCS',
    size: 2048,
    lastModified: '2024-01-15T10:50:00Z',
    format: 'JSON',
    description: 'Bathymetric grid metadata'
  },
  {
    path: 's104/wms/water-level.json',
    service: 'S104',
    type: 'WMS',
    size: 125000,
    lastModified: '2024-01-15T16:20:00Z',
    format: 'JSON',
    features: 156,
    description: 'Real-time and predicted water levels'
  },
  {
    path: 's111/wfs/current-vectors.json',
    service: 'S111',
    type: 'WFS',
    size: 178000,
    lastModified: '2024-01-15T14:30:00Z',
    format: 'JSON',
    features: 8900,
    description: 'Ocean current vector data'
  }
]

const mockStats: MockDataStats = {
  totalFiles: 6,
  totalSize: 784048,
  services: {
    'S101': {
      fileCount: 2,
      totalSize: 245000,
      lastUpdate: '2024-01-15T11:15:00Z'
    },
    'S102': {
      fileCount: 2,
      totalSize: 236048,
      lastUpdate: '2024-01-15T10:50:00Z'
    },
    'S104': {
      fileCount: 1,
      totalSize: 125000,
      lastUpdate: '2024-01-15T16:20:00Z'
    },
    'S111': {
      fileCount: 1,
      totalSize: 178000,
      lastUpdate: '2024-01-15T14:30:00Z'
    }
  },
  types: {
    'WMS': {
      fileCount: 3,
      totalSize: 515000
    },
    'WFS': {
      fileCount: 2,
      totalSize: 267000
    },
    'WCS': {
      fileCount: 1,
      totalSize: 2048
    }
  }
}

export default function MockDataPage() {
  const [files, setFiles] = useState<MockDataFile[]>(mockFiles)
  const [stats, setStats] = useState<MockDataStats>(mockStats)
  const [selectedFile, setSelectedFile] = useState<MockDataFile | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceFilter, setServiceFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    service: '',
    type: '',
    name: '',
    description: '',
    format: 'JSON'
  })

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesService = serviceFilter === 'ALL' || file.service === serviceFilter
    const matchesType = typeFilter === 'ALL' || file.type === typeFilter
    return matchesSearch && matchesService && matchesType
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const generateMockData = async () => {
    setIsGenerating(true)
    try {
      // Simulate API call to generate mock data
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add new mock file
      const newFile: MockDataFile = {
        path: `s124/wms/navigation-warnings.json`,
        service: 'S124',
        type: 'WMS',
        size: 45000,
        lastModified: new Date().toISOString(),
        format: 'JSON',
        features: 45,
        description: 'Navigation warnings and notices'
      }
      
      setFiles(prev => [...prev, newFile])
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalFiles: prev.totalFiles + 1,
        totalSize: prev.totalSize + 45000,
        services: {
          ...prev.services,
          'S124': {
            fileCount: 1,
            totalSize: 45000,
            lastUpdate: new Date().toISOString()
          }
        },
        types: {
          ...prev.types,
          'WMS': {
            fileCount: prev.types['WMS'].fileCount + 1,
            totalSize: prev.types['WMS'].totalSize + 45000
          }
        }
      }))
    } catch (error) {
      console.error('Failed to generate mock data:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const uploadMockData = async () => {
    try {
      // Simulate file upload
      const newFile: MockDataFile = {
        path: `${uploadForm.service.toLowerCase()}/${uploadForm.type.toLowerCase()}/${uploadForm.name}.${uploadForm.format.toLowerCase()}`,
        service: uploadForm.service,
        type: uploadForm.type,
        size: Math.floor(Math.random() * 100000) + 10000,
        lastModified: new Date().toISOString(),
        format: uploadForm.format,
        features: Math.floor(Math.random() * 1000) + 100,
        description: uploadForm.description
      }
      
      setFiles(prev => [...prev, newFile])
      setIsUploadDialogOpen(false)
      setUploadForm({
        service: '',
        type: '',
        name: '',
        description: '',
        format: 'JSON'
      })
    } catch (error) {
      console.error('Failed to upload mock data:', error)
    }
  }

  const updateDatabase = async () => {
    try {
      // Simulate database update
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('数据库更新成功！模拟数据已同步到数据库。')
    } catch (error) {
      console.error('Failed to update database:', error)
      alert('数据库更新失败！')
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'S101': return <FileText className="h-4 w-4" />
      case 'S102': return <Database className="h-4 w-4" />
      case 'S104': return <Clock className="h-4 w-4" />
      case 'S111': return <Zap className="h-4 w-4" />
      case 'S124': return <AlertTriangle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回首页
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderOpen className="h-8 w-8 text-blue-600" />
            模拟数据管理
          </h1>
          <p className="text-gray-600 mt-2">
            管理和生成S-100海事服务的模拟数据文件
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={updateDatabase}>
            <Database className="h-4 w-4 mr-2" />
            更新数据库
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                上传数据
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>上传模拟数据</DialogTitle>
                <DialogDescription>
                  创建新的模拟数据文件
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="service">服务类型</Label>
                  <Select value={uploadForm.service} onValueChange={(value) => setUploadForm({...uploadForm, service: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择服务类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S101">S-101</SelectItem>
                      <SelectItem value="S102">S-102</SelectItem>
                      <SelectItem value="S104">S-104</SelectItem>
                      <SelectItem value="S111">S-111</SelectItem>
                      <SelectItem value="S124">S-124</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">数据类型</Label>
                  <Select value={uploadForm.type} onValueChange={(value) => setUploadForm({...uploadForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择数据类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WMS">WMS</SelectItem>
                      <SelectItem value="WFS">WFS</SelectItem>
                      <SelectItem value="WCS">WCS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">文件名</Label>
                  <Input
                    id="name"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
                    placeholder="输入文件名"
                  />
                </div>
                <div>
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    placeholder="数据描述"
                  />
                </div>
                <div>
                  <Label htmlFor="format">格式</Label>
                  <Select value={uploadForm.format} onValueChange={(value) => setUploadForm({...uploadForm, format: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JSON">JSON</SelectItem>
                      <SelectItem value="GeoTIFF">GeoTIFF</SelectItem>
                      <SelectItem value="GML">GML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={uploadMockData}>
                    上传
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={generateMockData} disabled={isGenerating}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? '生成中...' : '生成数据'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="files">文件管理</TabsTrigger>
          <TabsTrigger value="statistics">统计信息</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总文件数</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFiles}</div>
                <p className="text-xs text-muted-foreground">
                  模拟数据文件
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总大小</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
                <p className="text-xs text-muted-foreground">
                  数据存储占用
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">服务类型</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(stats.services).length}</div>
                <p className="text-xs text-muted-foreground">
                  S-100产品系列
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">数据格式</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(stats.types).length}</div>
                <p className="text-xs text-muted-foreground">
                  支持格式
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Service Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>服务分布</CardTitle>
                <CardDescription>
                  各S-100服务的文件数量和大小
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.services).map(([service, data]) => (
                    <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getServiceIcon(service)}
                        <div>
                          <div className="font-medium">{service}</div>
                          <div className="text-sm text-gray-600">
                            {data.fileCount} 个文件 • {formatFileSize(data.totalSize)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          更新: {formatDate(data.lastUpdate).split(' ')[0]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>格式分布</CardTitle>
                <CardDescription>
                  不同数据格式的使用情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.types).map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">{type}</div>
                          <div className="text-sm text-gray-600">
                            {data.fileCount} 个文件 • {formatFileSize(data.totalSize)}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">搜索</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="搜索文件路径或描述..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="service-filter">服务类型</Label>
                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择服务类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">全部服务</SelectItem>
                      <SelectItem value="S101">S-101</SelectItem>
                      <SelectItem value="S102">S-102</SelectItem>
                      <SelectItem value="S104">S-104</SelectItem>
                      <SelectItem value="S111">S-111</SelectItem>
                      <SelectItem value="S124">S-124</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type-filter">数据类型</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择数据类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">全部类型</SelectItem>
                      <SelectItem value="WMS">WMS</SelectItem>
                      <SelectItem value="WFS">WFS</SelectItem>
                      <SelectItem value="WCS">WCS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Files Table */}
          <Card>
            <CardHeader>
              <CardTitle>模拟数据文件</CardTitle>
              <CardDescription>
                共 {filteredFiles.length} 个文件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>文件路径</TableHead>
                    <TableHead>服务</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>大小</TableHead>
                    <TableHead>要素数</TableHead>
                    <TableHead>最后修改</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.path}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{file.path}</div>
                          <div className="text-sm text-gray-500">{file.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getServiceIcon(file.service)}
                          <Badge variant="outline">{file.service}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{file.type}</Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>{file.features || '-'}</TableCell>
                      <TableCell>{formatDate(file.lastModified)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFile(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>服务统计</CardTitle>
                <CardDescription>
                  各服务的详细统计信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.services).map(([service, data]) => (
                    <div key={service} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getServiceIcon(service)}
                          <span className="font-medium">{service}</span>
                        </div>
                        <Badge variant="outline">{data.fileCount} 文件</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>总大小: {formatFileSize(data.totalSize)}</div>
                        <div>平均文件大小: {formatFileSize(data.totalSize / data.fileCount)}</div>
                        <div>最后更新: {formatDate(data.lastUpdate)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>格式统计</CardTitle>
                <CardDescription>
                  各数据格式的使用统计
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.types).map(([type, data]) => (
                    <div key={type} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{type}</span>
                        <Badge variant="outline">{data.fileCount} 文件</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>总大小: {formatFileSize(data.totalSize)}</div>
                        <div>平均文件大小: {formatFileSize(data.totalSize / data.fileCount)}</div>
                        <div>占比: {((data.totalSize / stats.totalSize) * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}