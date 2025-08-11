'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ExperimentalServiceManager from '@/components/services/ExperimentalServiceManager'
import { 
  FlaskConical, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  Filter,
  RefreshCw
} from 'lucide-react'

interface ExperimentalService {
  id: string
  name: string
  description: string
  productType: string
  status: 'UPLOADED' | 'PROCESSING' | 'PUBLISHED' | 'ARCHIVED' | 'EXPERIMENTAL' | 'ERROR'
  isExperimental: boolean
  experimentalNotes?: string
  experimentalExpires?: Date
  createdAt: Date
  updatedAt: Date
  node: {
    id: string
    name: string
    type: string
  }
  isExpiringSoon?: boolean
  daysUntilExpiry?: number
}

export default function ExperimentalServicesPage() {
  const [services, setServices] = useState<ExperimentalService[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showExpiringOnly, setShowExpiringOnly] = useState(false)

  // 加载实验性服务
  const loadServices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter)
      }
      if (showExpiringOnly) {
        params.append('expiringSoon', 'true')
      }

      const response = await fetch(`/api/datasets/experimental?${params}`)
      if (response.ok) {
        const data = await response.json()
        setServices(data.services)
      }
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [statusFilter, showExpiringOnly])

  // 过滤服务
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 更新服务
  const handleUpdateService = async (serviceId: string, updates: any) => {
    try {
      const response = await fetch(`/api/datasets/experimental/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        await loadServices()
      }
    } catch (error) {
      console.error('Error updating service:', error)
    }
  }

  // 删除服务
  const handleDeleteService = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/datasets/experimental/${serviceId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadServices()
      }
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  // 创建服务
  const handleCreateService = async (serviceData: any) => {
    try {
      const response = await fetch('/api/datasets/experimental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...serviceData,
          nodeId: 'default-node-id', // 应该从当前用户或上下文获取
          fileName: `${serviceData.name.toLowerCase().replace(/\s+/g, '_')}.zip`,
          filePath: `/uploads/experimental/${Date.now()}_${serviceData.name.toLowerCase().replace(/\s+/g, '_')}.zip`,
          fileSize: 0,
          mimeType: 'application/zip'
        })
      })
      
      if (response.ok) {
        await loadServices()
      }
    } catch (error) {
      console.error('Error creating service:', error)
    }
  }

  // 统计数据
  const stats = {
    total: services.length,
    active: services.filter(s => s.status === 'EXPERIMENTAL').length,
    expiring: services.filter(s => s.isExpiringSoon).length,
    published: services.filter(s => s.status === 'PUBLISHED').length
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">实验性服务管理</h1>
        <p className="text-gray-600">管理和监控S-100实验性服务，包括创建、配置和生命周期管理</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总实验性服务</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FlaskConical className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">活跃实验</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">即将过期</p>
                <p className="text-2xl font-bold">{stats.expiring}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">已发布</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">P</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 过滤和搜索 */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索实验性服务..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">所有状态</SelectItem>
                <SelectItem value="EXPERIMENTAL">实验性</SelectItem>
                <SelectItem value="PUBLISHED">已发布</SelectItem>
                <SelectItem value="PROCESSING">处理中</SelectItem>
                <SelectItem value="ERROR">错误</SelectItem>
                <SelectItem value="ARCHIVED">已归档</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="expiringOnly"
                checked={showExpiringOnly}
                onChange={(e) => setShowExpiringOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="expiringOnly" className="text-sm">
                仅显示即将过期
              </label>
            </div>

            <Button variant="outline" onClick={loadServices}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 主要内容 */}
      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="manage">服务管理</TabsTrigger>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <ExperimentalServiceManager
            services={filteredServices}
            onUpdateService={handleUpdateService}
            onDeleteService={handleDeleteService}
            onCreateService={handleCreateService}
          />
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>实验性服务概览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">什么是实验性服务？</h3>
                  <p className="text-gray-600">
                    实验性服务是用于测试新功能、新技术或新数据格式的服务。它们通常有明确的过期时间，
                    并且可能包含不稳定的功能或数据。
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">实验性服务特点</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>有明确的过期时间</li>
                    <li>可能包含不稳定功能</li>
                    <li>用于创新和测试</li>
                    <li>需要特殊权限访问</li>
                    <li>自动归档处理</li>
                  </ul>
                </div>

                {services.some(s => s.isExpiringSoon) && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold text-orange-800">即将过期的服务</h3>
                    </div>
                    <p className="text-orange-700">
                      有 {services.filter(s => s.isExpiringSoon).length} 个实验性服务将在7天内过期，
                      请及时处理这些服务。
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>实验性服务分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500">分析功能开发中...</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}