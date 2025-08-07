'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Database, 
  Upload, 
  Download, 
  Settings, 
  Eye, 
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  BarChart3,
  Layers,
  Globe,
  Zap
} from 'lucide-react'

// 模拟提交数据
const mockSubmittedData = [
  {
    id: '1',
    name: '上海港航道水深数据',
    type: 'S102',
    status: 'PUBLISHED',
    submitter: '上海港务局',
    submitDate: '2024-01-15',
    publishDate: '2024-01-16',
    fileSize: '2.4 GB',
    coverage: '上海港区域',
    priority: 'HIGH',
    description: '上海港主航道及周边区域的高精度水深测量数据'
  },
  {
    id: '2',
    name: '东海电子海图更新',
    type: 'S101',
    status: 'PROCESSING',
    submitter: '东海分局',
    submitDate: '2024-01-14',
    publishDate: null,
    fileSize: '156 MB',
    coverage: '东海区域',
    priority: 'MEDIUM',
    description: '东海海域电子海图要素更新，包括航道、锚地等'
  },
  {
    id: '3',
    name: '长江口动态水位数据',
    type: 'S104',
    status: 'UPLOADED',
    submitter: '长江口海事局',
    submitDate: '2024-01-13',
    publishDate: null,
    fileSize: '89 MB',
    coverage: '长江口区域',
    priority: 'HIGH',
    description: '长江口区域实时动态水位监测数据'
  },
  {
    id: '4',
    name: '南海海流数据集',
    type: 'S111',
    status: 'ERROR',
    submitter: '南海分局',
    submitDate: '2024-01-12',
    publishDate: null,
    fileSize: '1.2 GB',
    coverage: '南海区域',
    priority: 'LOW',
    description: '南海海域实时海流监测数据'
  }
]

// 模拟服务范围配置
const mockServiceRanges = [
  {
    id: '1',
    name: '上海港服务范围',
    type: 'S101',
    bounds: {
      north: 31.5,
      south: 30.8,
      east: 122.2,
      west: 121.2
    },
    isActive: true,
    priority: 'HIGH',
    description: '上海港核心服务区域'
  },
  {
    id: '2',
    name: '东海区域服务',
    type: 'S102',
    bounds: {
      north: 34.0,
      south: 28.0,
      east: 127.0,
      west: 120.0
    },
    isActive: true,
    priority: 'MEDIUM',
    description: '东海分局管辖海域'
  }
]

// 模拟服务优先级配置
const mockServicePriorities = [
  {
    id: '1',
    service: 'S101-WMS',
    priority: 'HIGH',
    reason: '核心导航服务',
    maxConnections: 1000,
    timeout: 5000
  },
  {
    id: '2',
    service: 'S102-WMS',
    priority: 'MEDIUM',
    reason: '水深信息服务',
    maxConnections: 500,
    timeout: 10000
  },
  {
    id: '3',
    service: 'S101-WFS',
    priority: 'HIGH',
    reason: '要素查询服务',
    maxConnections: 800,
    timeout: 3000
  },
  {
    id: '4',
    service: 'S102-WCS',
    priority: 'LOW',
    reason: '数据下载服务',
    maxConnections: 200,
    timeout: 30000
  }
]

export default function ProviderDataPage() {
  const [submittedData, setSubmittedData] = useState(mockSubmittedData)
  const [serviceRanges, setServiceRanges] = useState(mockServiceRanges)
  const [servicePriorities, setServicePriorities] = useState(mockServicePriorities)
  const [selectedData, setSelectedData] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="default" className="bg-green-500">已发布</Badge>
      case 'PROCESSING':
        return <Badge variant="secondary">处理中</Badge>
      case 'UPLOADED':
        return <Badge variant="outline">已上传</Badge>
      case 'ERROR':
        return <Badge variant="destructive">错误</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="destructive">高</Badge>
      case 'MEDIUM':
        return <Badge variant="secondary">中</Badge>
      case 'LOW':
        return <Badge variant="outline">低</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const filteredData = submittedData.filter(data => {
    const matchesSearch = data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         data.submitter.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || data.status === statusFilter
    const matchesType = typeFilter === 'ALL' || data.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

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
            <Database className="h-8 w-8 text-blue-600" />
            服务商数据管理
          </h1>
          <p className="text-gray-600 mt-2">
            管理提交数据、服务范围和服务优先级配置
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            上传数据
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            数据统计
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="submitted-data" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submitted-data">提交数据</TabsTrigger>
          <TabsTrigger value="service-range">服务范围</TabsTrigger>
          <TabsTrigger value="service-priority">服务优先级</TabsTrigger>
        </TabsList>

        <TabsContent value="submitted-data" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>数据筛选</CardTitle>
              <CardDescription>
                根据状态、类型等条件筛选提交的数据
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">搜索</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="搜索数据名称或提交者..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status-filter">状态</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">全部状态</SelectItem>
                      <SelectItem value="UPLOADED">已上传</SelectItem>
                      <SelectItem value="PROCESSING">处理中</SelectItem>
                      <SelectItem value="PUBLISHED">已发布</SelectItem>
                      <SelectItem value="ERROR">错误</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type-filter">数据类型</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">全部类型</SelectItem>
                      <SelectItem value="S101">S-101</SelectItem>
                      <SelectItem value="S102">S-102</SelectItem>
                      <SelectItem value="S104">S-104</SelectItem>
                      <SelectItem value="S111">S-111</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>提交数据列表</CardTitle>
                  <CardDescription>
                    共 {filteredData.length} 条数据
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  新增数据
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>数据名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>提交者</TableHead>
                    <TableHead>提交日期</TableHead>
                    <TableHead>文件大小</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{data.name}</div>
                          <div className="text-sm text-gray-600">{data.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{data.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(data.status)}</TableCell>
                      <TableCell>{data.submitter}</TableCell>
                      <TableCell>{data.submitDate}</TableCell>
                      <TableCell>{data.fileSize}</TableCell>
                      <TableCell>{getPriorityBadge(data.priority)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service-range" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">服务范围配置</h2>
              <p className="text-gray-600">管理各服务的地理覆盖范围</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增范围
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {serviceRanges.map((range) => (
              <Card key={range.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        {range.name}
                      </CardTitle>
                      <CardDescription>
                        {range.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={range.isActive} />
                      {getPriorityBadge(range.priority)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">北纬</Label>
                        <div className="font-mono">{range.bounds.north}°</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">南纬</Label>
                        <div className="font-mono">{range.bounds.south}°</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">东经</Label>
                        <div className="font-mono">{range.bounds.east}°</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">西经</Label>
                        <div className="font-mono">{range.bounds.west}°</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        预览范围
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        编辑
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="service-priority" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">服务优先级配置</h2>
              <p className="text-gray-600">管理各服务的优先级和资源分配</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增配置
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>优先级配置列表</CardTitle>
              <CardDescription>
                配置各服务的优先级、最大连接数和超时时间
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>服务名称</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>原因</TableHead>
                    <TableHead>最大连接数</TableHead>
                    <TableHead>超时时间(ms)</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicePriorities.map((priority) => (
                    <TableRow key={priority.id}>
                      <TableCell className="font-medium">{priority.service}</TableCell>
                      <TableCell>{getPriorityBadge(priority.priority)}</TableCell>
                      <TableCell>{priority.reason}</TableCell>
                      <TableCell>{priority.maxConnections}</TableCell>
                      <TableCell>{priority.timeout}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
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
      </Tabs>
    </div>
  )
}