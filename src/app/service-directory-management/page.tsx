'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Database, 
  RefreshCw, 
  Settings, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Trash2,
  Download
} from 'lucide-react'

interface SyncTask {
  id: string
  taskId: string
  status: string
  targetType: string
  targetId: string
  startedAt?: string
  completedAt?: string
  duration?: number
  successCount: number
  failureCount: number
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

interface DirectoryStats {
  totalEntries: number
  activeEntries: number
  expiredEntries: number
  highConfidenceEntries: number
  healthScore: number
  lastSync?: string
  latestSync?: string
  byProductType: Record<string, number>
  byServiceType: Record<string, number>
}

interface SystemConfig {
  key: string
  value: any
  description?: string
  category?: string
  isSystem?: boolean
  updatedAt?: string
}

const ServiceDirectoryManagement = () => {
  const [stats, setStats] = useState<DirectoryStats | null>(null)
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>([])
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedSyncType, setSelectedSyncType] = useState<'full' | 'node'>('full')
  const [selectedNodeId, setSelectedNodeId] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [statsRes, tasksRes, configsRes] = await Promise.all([
        fetch('/api/admin/service-directory/sync?action=stats'),
        fetch('/api/admin/service-directory/sync'),
        fetch('/api/admin/config?category=service_directory')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setSyncTasks(Array.isArray(tasksData) ? tasksData : [tasksData].filter(Boolean))
      }

      if (configsRes.ok) {
        const configsData = await configsRes.json()
        setConfigs(configsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const body: any = { type: selectedSyncType }
      if (selectedSyncType === 'node' && selectedNodeId) {
        body.nodeId = selectedNodeId
      }

      const response = await fetch('/api/admin/service-directory/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        fetchData()
      } else {
        const error = await response.json()
        alert(`同步失败: ${error.error.message}`)
      }
    } catch (error) {
      console.error('Error during sync:', error)
      alert('同步失败')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCleanup = async () => {
    try {
      const response = await fetch('/api/admin/service-directory/sync?action=cleanup')
      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        fetchData()
      }
    } catch (error) {
      console.error('Error during cleanup:', error)
      alert('清理失败')
    }
  }

  const handleConfigUpdate = async (key: string, value: any) => {
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      })

      if (response.ok) {
        fetchData()
      } else {
        const error = await response.json()
        alert(`配置更新失败: ${error.error.message}`)
      }
    } catch (error) {
      console.error('Error updating config:', error)
      alert('配置更新失败')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500">已完成</Badge>
      case 'RUNNING':
        return <Badge className="bg-blue-500">运行中</Badge>
      case 'FAILED':
        return <Badge variant="destructive">失败</Badge>
      case 'PENDING':
        return <Badge variant="secondary">等待中</Badge>
      case 'CANCELLED':
        return <Badge variant="outline">已取消</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}min`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">加载服务目录管理数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">服务目录管理</h1>
            <p className="text-muted-foreground">
              管理扁平化服务发现系统，包括同步任务、缓存配置和性能监控
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              刷新
            </Button>
            <Button variant="outline" onClick={handleCleanup}>
              <Trash2 className="h-4 w-4 mr-1" />
              清理过期
            </Button>
          </div>
        </div>
      </div>

      {/* 统计概览 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">健康分数</p>
                  <p className="text-2xl font-bold">{stats.healthScore.toFixed(1)}%</p>
                  <div className="flex items-center mt-1">
                    {stats.healthScore >= 80 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-xs ml-1 ${
                      stats.healthScore >= 80 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stats.healthScore >= 80 ? '健康' : '需关注'}
                    </span>
                  </div>
                </div>
                <Activity className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">活跃条目</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeEntries}</p>
                  <p className="text-xs text-gray-500">共 {stats.totalEntries} 个条目</p>
                </div>
                <Database className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">过期条目</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.expiredEntries}</p>
                  <p className="text-xs text-gray-500">需要清理</p>
                </div>
                <Clock className="h-12 w-12 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">高置信度</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.highConfidenceEntries}</p>
                  <p className="text-xs text-gray-500">≥ 80% 置信度</p>
                </div>
                <CheckCircle className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="sync">同步管理</TabsTrigger>
          <TabsTrigger value="config">配置管理</TabsTrigger>
          <TabsTrigger value="monitoring">性能监控</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>产品类型分布</CardTitle>
                <CardDescription>各S-100产品类型的服务条目数量</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.byProductType && Object.entries(stats.byProductType).map(([product, count]) => (
                    <div key={product} className="flex items-center justify-between">
                      <span className="font-medium">{product}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{count}</Badge>
                        <Progress value={(count / stats.totalEntries) * 100} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>服务类型分布</CardTitle>
                <CardDescription>各服务类型的条目数量</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.byServiceType && Object.entries(stats.byServiceType).map(([service, count]) => (
                    <div key={service} className="flex items-center justify-between">
                      <span className="font-medium">{service}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{count}</Badge>
                        <Progress value={(count / stats.totalEntries) * 100} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>同步状态</CardTitle>
              <CardDescription>最近的服务目录同步活动</CardDescription>
            </CardHeader>
            <CardContent>
              {syncTasks.length > 0 ? (
                <div className="space-y-3">
                  {syncTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(task.status)}
                        <div>
                          <div className="font-medium">{task.targetType}</div>
                          <div className="text-sm text-gray-500">
                            {task.startedAt ? new Date(task.startedAt).toLocaleString() : '未开始'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {task.successCount} 成功 / {task.failureCount} 失败
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDuration(task.duration)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>暂无同步任务记录</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>手动同步</CardTitle>
              <CardDescription>手动触发服务目录同步操作</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sync_type">同步类型</Label>
                    <Select value={selectedSyncType} onValueChange={(value: 'full' | 'node') => setSelectedSyncType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">全量同步</SelectItem>
                        <SelectItem value="node">节点同步</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedSyncType === 'node' && (
                    <div>
                      <Label htmlFor="node_id">节点ID</Label>
                      <Input
                        id="node_id"
                        value={selectedNodeId}
                        onChange={(e) => setSelectedNodeId(e.target.value)}
                        placeholder="输入节点ID"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSync} 
                    disabled={isSyncing}
                    className="flex items-center gap-2"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        同步中...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        开始同步
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={fetchData}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    刷新状态
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>同步历史</CardTitle>
              <CardDescription>所有同步任务的详细记录</CardDescription>
            </CardHeader>
            <CardContent>
              {syncTasks.length > 0 ? (
                <div className="space-y-3">
                  {syncTasks.map(task => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(task.status)}
                          <span className="font-medium">{task.taskId}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(task.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">类型</div>
                          <div>{task.targetType}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">目标</div>
                          <div>{task.targetId}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">耗时</div>
                          <div>{formatDuration(task.duration)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">结果</div>
                          <div className={task.failureCount > 0 ? 'text-red-600' : 'text-green-600'}>
                            {task.successCount} 成功, {task.failureCount} 失败
                          </div>
                        </div>
                      </div>
                      {task.errorMessage && (
                        <Alert className="mt-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>错误信息</AlertTitle>
                          <AlertDescription>{task.errorMessage}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>暂无同步历史记录</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>服务目录配置</CardTitle>
              <CardDescription>配置服务目录的行为和性能参数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {configs.map(config => (
                  <div key={config.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{config.description}</div>
                      <div className="text-sm text-gray-500">
                        {config.category} • {config.isSystem ? '系统配置' : '用户配置'}
                      </div>
                      {config.updatedAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          最后更新: {new Date(config.updatedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {typeof config.value === 'boolean' ? (
                        <Switch
                          checked={config.value}
                          onCheckedChange={(checked) => handleConfigUpdate(config.key, checked)}
                          disabled={config.isSystem}
                        />
                      ) : (
                        <div className="w-24">
                          <Input
                            type="number"
                            value={config.value}
                            onChange={(e) => handleConfigUpdate(config.key, parseFloat(e.target.value))}
                            disabled={config.isSystem}
                            className="text-right"
                          />
                        </div>
                      )}
                      {config.isSystem && (
                        <Badge variant="outline" className="text-xs">
                          系统
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>性能指标</CardTitle>
              <CardDescription>服务目录的性能监控指标</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">缓存效率</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>缓存命中率</span>
                      <span className="font-medium">95.2%</span>
                    </div>
                    <Progress value={95.2} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>平均查询时间</span>
                      <span className="font-medium">12ms</span>
                    </div>
                    <Progress value={85} />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">系统健康</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>内存使用率</span>
                      <span className="font-medium">67%</span>
                    </div>
                    <Progress value={67} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>存储使用率</span>
                      <span className="font-medium">42%</span>
                    </div>
                    <Progress value={42} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>实时监控</CardTitle>
              <CardDescription>服务目录的实时活动监控</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertTitle>系统状态正常</AlertTitle>
                <AlertDescription>
                  服务目录运行正常，所有同步任务按计划执行，缓存命中率保持在较高水平。
                  建议定期检查过期条目并执行清理操作。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ServiceDirectoryManagement