'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MapPin, 
  Globe, 
  Database, 
  Settings, 
  Activity, 
  Eye, 
  Download,
  Link,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react'

interface ServiceDetail {
  id: string
  name: string
  description: string
  type: string
  status: 'active' | 'inactive' | 'error'
  endpoint: string
  version: string
  lastUpdated: string
  coverage?: string
  capabilities: string[]
  metadata?: Record<string, any>
  previewUrl?: string
  downloadUrl?: string
  documentationUrl?: string
}

interface ServiceDetailModalProps {
  service: ServiceDetail | null
  isOpen: boolean
  onClose: () => void
  onPreviewOnMap?: (service: ServiceDetail) => void
}

export default function ServiceDetailModal({ 
  service, 
  isOpen, 
  onClose, 
  onPreviewOnMap 
}: ServiceDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!service) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'inactive':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DialogTitle className="text-xl">{service.name}</DialogTitle>
              <Badge className={getStatusColor(service.status)}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(service.status)}
                  <span className="capitalize">{service.status}</span>
                </div>
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-base">
            {service.description}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="capabilities">能力</TabsTrigger>
            <TabsTrigger value="technical">技术</TabsTrigger>
            <TabsTrigger value="preview">预览</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="h-5 w-5" />
                    <span>基本信息</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">服务类型</span>
                    <span className="text-sm text-gray-900">{service.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">版本</span>
                    <span className="text-sm text-gray-900">{service.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">状态</span>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">最后更新</span>
                    <span className="text-sm text-gray-900">{service.lastUpdated}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>覆盖范围</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {service.coverage || '全球范围'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="capabilities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>服务能力</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {service.capabilities.map((capability, index) => (
                    <Badge key={index} variant="outline" className="justify-center p-2">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>技术信息</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">服务端点</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono text-gray-900">
                    {service.endpoint}
                  </div>
                </div>
                
                {service.metadata && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">元数据</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-900 max-h-32 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(service.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>预览与操作</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {onPreviewOnMap && (
                    <Button
                      onClick={() => onPreviewOnMap(service)}
                      className="w-full"
                      variant="outline"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      在地图上预览
                    </Button>
                  )}
                  
                  {service.previewUrl && (
                    <Button
                      onClick={() => window.open(service.previewUrl, '_blank')}
                      className="w-full"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      在线预览
                    </Button>
                  )}
                  
                  {service.downloadUrl && (
                    <Button
                      onClick={() => window.open(service.downloadUrl, '_blank')}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载数据
                    </Button>
                  )}
                  
                  {service.documentationUrl && (
                    <Button
                      onClick={() => window.open(service.documentationUrl, '_blank')}
                      className="w-full"
                      variant="outline"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      查看文档
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}