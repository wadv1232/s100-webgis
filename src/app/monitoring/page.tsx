'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import MainLayout from '@/components/MainLayout'
import ResponsiveContainer, { ResponsiveGrid } from '@/components/ResponsiveLayout'
import { AccessibleButton } from '@/components/AccessibleComponents'
import ThemeToggle from '@/components/ThemeToggle'
import { 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Server,
  Database,
  Globe,
  Building,
  Map,
  Anchor,
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Shield,
  Zap,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'


// 健康状态配置
const HEALTH_STATUS = {
  HEALTHY: { 
    label: '健康', 
    color: 'bg-green-500', 
    icon: CheckCircle, 
    textColor: 'text-green-600' 
  },
  WARNING: { 
    label: '警告', 
    color: 'bg-yellow-500', 
    icon: AlertTriangle, 
    textColor: 'text-yellow-600' 
  },
  ERROR: { 
    label: '错误', 
    color: 'bg-red-500', 
    icon: XCircle, 
    textColor: 'text-red-600' 
  },
  OFFLINE: { 
    label: '离线', 
    color: 'bg-gray-500', 
    icon: Clock, 
    textColor: 'text-gray-600' 
  }
}

// 节点类型配置
const NODE_TYPES = {
  GLOBAL_ROOT: { name: '全球根节点', icon: Globe },
  NATIONAL: { name: '国家级节点', icon: Building },
  REGIONAL: { name: '区域节点', icon: Map },
  LEAF: { name: '叶子节点', icon: Anchor }
}

// 数据集状态配置
const DATASET_STATUS = {
  UPLOADED: { label: '已上传', color: 'bg-blue-500' },
  PROCESSING: { label: '处理中', color: 'bg-yellow-500' },
  PUBLISHED: { label: '已发布', color: 'bg-green-500' },
  ARCHIVED: { label: '已归档', color: 'bg-gray-500' },
  ERROR: { label: '错误', color: 'bg-red-500' }
}

// S-100产品配置
const S100_PRODUCTS = {
  S101: { name: 'S-101 电子海图', color: 'bg-blue-400' },
  S102: { name: 'S-102 高精度水深', color: 'bg-cyan-400' },
  S104: { name: 'S-104 动态水位', color: 'bg-teal-400' },
  S111: { name: 'S-111 实时海流', color: 'bg-indigo-400' },
  S124: { name: 'S-124 航行警告', color: 'bg-orange-400' },
  S125: { name: 'S-125 航行信息', color: 'bg-yellow-400' },
  S131: { name: 'S-131 海洋保护区', color: 'bg-green-400' }
}

interface MonitoringData {
  nodeStats: {
    total: number
    healthy: number
    warning: number
    error: number
    offline: number
    byType: Record<string, number>
  }
  datasetStats: {
    total: number
    byStatus: Record<string, number>
    byProduct: Record<string, number>
  }
  serviceStats: {
    total: number
    byType: Record<string, number>
  }
  recentHealthChecks: Array<{
    nodeId: string
    nodeName: string
    status: string
    lastCheck: string
    type: string
  }>
  systemHealth: number
}

export default function MonitoringPage() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  // 获取监控数据
  const fetchMonitoringData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/monitoring')
      const result = await response.json()
      
      if (result.success) {
        setMonitoringData(result.data)
      } else {
        console.error('获取监控数据失败:', result.error)
      }
    } catch (error) {
      console.error('获取监控数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取健康状态图标
  const getHealthIcon = (status: string) => {
    const healthConfig = HEALTH_STATUS[status as keyof typeof HEALTH_STATUS]
    if (!healthConfig) return Clock
    return healthConfig.icon
  }

  // 获取健康状态徽章
  const getHealthBadge = (status: string) => {
    const healthConfig = HEALTH_STATUS[status as keyof typeof HEALTH_STATUS]
    if (!healthConfig) return <Badge variant="outline">未知</Badge>
    
    return (
      <Badge variant="outline" className={`${healthConfig.color} text-white`}>
        {healthConfig.label}
      </Badge>
    )
  }

  // 获取节点类型图标
  const getNodeTypeIcon = (type: string) => {
    const nodeType = NODE_TYPES[type as keyof typeof NODE_TYPES]
    return nodeType ? nodeType.icon : Server
  }

  // 格式化时间
  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}小时前`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}天前`
  }

  // 默认数据结构，防止空值错误
  const defaultData: MonitoringData = {
    nodeStats: {
      total: 0,
      healthy: 0,
      warning: 0,
      error: 0,
      offline: 0,
      byType: {
        GLOBAL_ROOT: 0,
        NATIONAL: 0,
        REGIONAL: 0,
        LEAF: 0
      }
    },
    datasetStats: {
      total: 0,
      byStatus: {
        UPLOADED: 0,
        PROCESSING: 0,
        PUBLISHED: 0,
        ARCHIVED: 0,
        ERROR: 0
      },
      byProduct: {
        S101: 0,
        S102: 0,
        S104: 0,
        S111: 0,
        S124: 0,
        S125: 0,
        S131: 0
      }
    },
    serviceStats: {
      total: 0,
      byType: {
        WFS: 0,
        WMS: 0,
        WCS: 0
      }
    },
    recentHealthChecks: [],
    systemHealth: 0
  }

  const displayData = monitoringData || defaultData

  useEffect(() => {
    fetchMonitoringData()
    
    // 设置自动刷新
    const interval = setInterval(fetchMonitoringData, 30000) // 30秒刷新一次
    
    return () => clearInterval(interval)
  }, [])

  return (
    <MainLayout>
      <ResponsiveContainer>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Activity className="h-8 w-8 text-green-600" />
                节点健康监控
              </h1>
              <p className="text-gray-600 mt-2">
                实时监控S-100架构中所有节点的健康状态和服务可用性
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1小时</SelectItem>
                  <SelectItem value="24h">24小时</SelectItem>
                  <SelectItem value="7d">7天</SelectItem>
                  <SelectItem value="30d">30天</SelectItem>
                </SelectContent>
              </Select>
              <AccessibleButton variant="outline" onClick={fetchMonitoringData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </AccessibleButton>
            </div>
          </div>

      {/* 系统健康概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">系统健康度</p>
                <p className="text-2xl font-bold text-green-600">{displayData.systemHealth}%</p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={displayData.systemHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">在线节点</p>
                <p className="text-2xl font-bold text-blue-600">
                  {displayData.nodeStats.healthy + displayData.nodeStats.warning}
                  <span className="text-sm text-gray-500">/{displayData.nodeStats.total}</span>
                </p>
              </div>
              <Server className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex gap-1 mt-2">
              <div className="text-xs text-green-600">
                ✓ {displayData.nodeStats.healthy}
              </div>
              <div className="text-xs text-yellow-600">
                ⚠ {displayData.nodeStats.warning}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">活跃服务</p>
                <p className="text-2xl font-bold text-purple-600">{displayData.serviceStats.total}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              WFS: {displayData.serviceStats.byType.WFS} | 
              WMS: {displayData.serviceStats.byType.WMS} | 
              WCS: {displayData.serviceStats.byType.WCS}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">已发布数据集</p>
                <p className="text-2xl font-bold text-orange-600">
                  {displayData.datasetStats.byStatus.PUBLISHED}
                  <span className="text-sm text-gray-500">/{displayData.datasetStats.total}</span>
                </p>
              </div>
              <Database className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              处理中: {displayData.datasetStats.byStatus.PROCESSING}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧图表区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 节点健康状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                节点健康状态分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(HEALTH_STATUS).map(([status, config]) => {
                  const count = displayData.nodeStats[status.toLowerCase() as keyof typeof displayData.nodeStats]
                  const percentage = displayData.nodeStats.total > 0 
                    ? Math.round((count / displayData.nodeStats.total) * 100) 
                    : 0
                  
                  return (
                    <div key={status} className="text-center">
                      <div className="relative inline-flex items-center justify-center w-16 h-16 mb-2">
                        <config.icon className={`h-8 w-8 ${config.textColor}`} />
                        <div className="absolute -top-1 -right-1">
                          <Badge variant="outline" className={`${config.color} text-white text-xs`}>
                            {count}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm font-medium">{config.label}</p>
                      <p className="text-xs text-gray-500">{percentage}%</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* 数据集和服务统计 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  数据集状态分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(DATASET_STATUS).map(([status, config]) => {
                    const count = displayData.datasetStats.byStatus[status]
                    const percentage = displayData.datasetStats.total > 0 
                      ? Math.round((count / displayData.datasetStats.total) * 100) 
                      : 0
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${config.color}`} />
                          <span className="text-sm">{config.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  S-100产品分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(S100_PRODUCTS).map(([product, config]) => {
                    const count = displayData.datasetStats.byProduct[product]
                    if (count === 0) return null
                    
                    const percentage = displayData.datasetStats.total > 0 
                      ? Math.round((count / displayData.datasetStats.total) * 100) 
                      : 0
                    
                    return (
                      <div key={product} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${config.color}`} />
                          <span className="text-sm">{config.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 右侧详细信息和历史记录 */}
        <div className="space-y-6">
          {/* 最近健康检查 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                最近健康检查
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {displayData.recentHealthChecks.map((check) => {
                  const HealthIcon = getHealthIcon(check.status)
                  const NodeTypeIcon = getNodeTypeIcon(check.type)
                  const nodeType = NODE_TYPES[check.type as keyof typeof NODE_TYPES]
                  
                  return (
                    <div key={check.nodeId} className="flex items-center gap-3 p-3 border rounded-lg">
                      <NodeTypeIcon className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{check.nodeName}</p>
                          <HealthIcon className={`h-4 w-4 ${HEALTH_STATUS[check.status as keyof typeof HEALTH_STATUS].textColor}`} />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{nodeType.name}</span>
                          <span className="text-xs text-gray-500">{formatTime(check.lastCheck)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* 系统状态摘要 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                系统状态摘要
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">节点可用性</span>
                    <span className="text-sm text-green-600">
                      {Math.round(((displayData.nodeStats.healthy + displayData.nodeStats.warning) / displayData.nodeStats.total) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={((displayData.nodeStats.healthy + displayData.nodeStats.warning) / displayData.nodeStats.total) * 100} 
                    className="h-2" 
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">服务可用性</span>
                    <span className="text-sm text-blue-600">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">数据处理成功率</span>
                    <span className="text-sm text-purple-600">
                      {Math.round((displayData.datasetStats.byStatus.PUBLISHED / displayData.datasetStats.total) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(displayData.datasetStats.byStatus.PUBLISHED / displayData.datasetStats.total) * 100} 
                    className="h-2" 
                  />
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">最后更新</span>
                    <span className="text-gray-500">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 详细状态表格 */}
      <Card>
        <CardHeader>
          <CardTitle>节点详细状态</CardTitle>
          <CardDescription>
            所有节点的详细健康状态和统计信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>节点名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>数据集</TableHead>
                <TableHead>服务</TableHead>
                <TableHead>最后检查</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.recentHealthChecks.map((check) => {
                const HealthIcon = getHealthIcon(check.status)
                const NodeTypeIcon = getNodeTypeIcon(check.type)
                const nodeType = NODE_TYPES[check.type as keyof typeof NODE_TYPES]
                
                return (
                  <TableRow key={check.nodeId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <NodeTypeIcon className="h-4 w-4" />
                        <span className="font-medium">{check.nodeName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{nodeType.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <HealthIcon className="h-4 w-4" />
                        {getHealthBadge(check.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">--</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">--</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">{formatTime(check.lastCheck)}</span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </div>
      </ResponsiveContainer>
    </MainLayout>
  )
}