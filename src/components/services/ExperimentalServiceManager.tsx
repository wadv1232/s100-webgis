'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  FlaskConical, 
  Clock, 
  Users, 
  Shield, 
  Settings, 
  Eye, 
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react'

interface ExperimentalService {
  id: string
  name: string
  description: string
  productType: string
  status: 'UPLOADED' | 'PROCESSING' | 'PUBLISHED' | 'ARCHIVED' | 'EXPERIMENTAL' | 'ERROR'
  isExperimental: boolean
  accessControl: any
  experimentalNotes?: string
  experimentalExpires?: Date
  createdAt: Date
  updatedAt: Date
  node: {
    id: string
    name: string
    type: string
  }
}

interface ExperimentalServiceManagerProps {
  services?: ExperimentalService[]
  onUpdateService?: (serviceId: string, updates: any) => void
  onDeleteService?: (serviceId: string) => void
  onCreateService?: (service: any) => void
}

export default function ExperimentalServiceManager({
  services = [],
  onUpdateService,
  onDeleteService,
  onCreateService
}: ExperimentalServiceManagerProps) {
  const [selectedService, setSelectedService] = useState<ExperimentalService | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [createForm, setCreateForm] = useState<any>({})

  // 过滤实验性服务
  const experimentalServices = services.filter(s => s.isExperimental)

  // 处理编辑服务
  const handleEditService = (service: ExperimentalService) => {
    setSelectedService(service)
    setEditForm({
      name: service.name,
      description: service.description,
      experimentalNotes: service.experimentalNotes || '',
      experimentalExpires: service.experimentalExpires ? 
        new Date(service.experimentalExpires).toISOString().split('T')[0] : '',
      accessControl: service.accessControl || {}
    })
    setIsEditDialogOpen(true)
  }

  // 处理保存编辑
  const handleSaveEdit = () => {
    if (selectedService && onUpdateService) {
      const updates = {
        ...editForm,
        experimentalExpires: editForm.experimentalExpires ? 
          new Date(editForm.experimentalExpires) : null
      }
      onUpdateService(selectedService.id, updates)
      setIsEditDialogOpen(false)
      setSelectedService(null)
    }
  }

  // 处理创建服务
  const handleCreateService = () => {
    if (onCreateService) {
      const newService = {
        ...createForm,
        isExperimental: true,
        status: 'EXPERIMENTAL',
        experimentalExpires: createForm.experimentalExpires ? 
          new Date(createForm.experimentalExpires) : null
      }
      onCreateService(newService)
      setIsCreateDialogOpen(false)
      setCreateForm({})
    }
  }

  // 处理删除服务
  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('确定要删除这个实验性服务吗？')) {
      onDeleteService?.(serviceId)
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXPERIMENTAL':
        return 'bg-purple-100 text-purple-800'
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'ERROR':
        return 'bg-red-100 text-red-800'
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 检查是否即将过期
  const isExpiringSoon = (expires?: Date) => {
    if (!expires) return false
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 // 7天内过期
  }

  // 格式化日期
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('zh-CN')
  }

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-purple-600" />
              实验性服务管理
            </CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FlaskConical className="h-4 w-4 mr-2" />
                  创建实验性服务
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>创建实验性服务</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="serviceName">服务名称</Label>
                    <Input
                      id="serviceName"
                      value={createForm.name || ''}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      placeholder="输入服务名称"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceDescription">服务描述</Label>
                    <Textarea
                      id="serviceDescription"
                      value={createForm.description || ''}
                      onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                      placeholder="输入服务描述"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experimentalNotes">实验性说明</Label>
                    <Textarea
                      id="experimentalNotes"
                      value={createForm.experimentalNotes || ''}
                      onChange={(e) => setCreateForm({...createForm, experimentalNotes: e.target.value})}
                      placeholder="说明实验性服务的目的和预期效果"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">过期时间</Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={createForm.experimentalExpires || ''}
                      onChange={(e) => setCreateForm({...createForm, experimentalExpires: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleCreateService}>
                    创建
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{experimentalServices.length}</div>
              <div className="text-sm text-gray-600">实验性服务</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {experimentalServices.filter(s => isExpiringSoon(s.experimentalExpires)).length}
              </div>
              <div className="text-sm text-gray-600">即将过期</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {experimentalServices.filter(s => s.status === 'EXPERIMENTAL').length}
              </div>
              <div className="text-sm text-gray-600">活跃实验</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 实验性服务列表 */}
      <Card>
        <CardHeader>
          <CardTitle>实验性服务列表</CardTitle>
        </CardHeader>
        <CardContent>
          {experimentalServices.length === 0 ? (
            <div className="text-center py-8">
              <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500">暂无实验性服务</div>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                创建第一个实验性服务
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>服务名称</TableHead>
                  <TableHead>产品类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>过期时间</TableHead>
                  <TableHead>所属节点</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experimentalServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">{service.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.productType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {service.experimentalExpires ? (
                          <>
                            <Calendar className="h-4 w-4" />
                            <span className={isExpiringSoon(service.experimentalExpires) ? 'text-orange-600 font-medium' : ''}>
                              {formatDate(service.experimentalExpires)}
                            </span>
                            {isExpiringSoon(service.experimentalExpires) && (
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500">无限制</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{service.node.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // TODO: 查看服务详情
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑实验性服务</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">服务名称</Label>
              <Input
                id="editName"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editDescription">服务描述</Label>
              <Textarea
                id="editDescription"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editNotes">实验性说明</Label>
              <Textarea
                id="editNotes"
                value={editForm.experimentalNotes || ''}
                onChange={(e) => setEditForm({...editForm, experimentalNotes: e.target.value})}
                placeholder="说明实验性服务的目的和预期效果"
              />
            </div>
            <div>
              <Label htmlFor="editExpires">过期时间</Label>
              <Input
                id="editExpires"
                type="date"
                value={editForm.experimentalExpires || ''}
                onChange={(e) => setEditForm({...editForm, experimentalExpires: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}