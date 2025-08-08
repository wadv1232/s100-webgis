'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Play, 
  Radio,
  AlertTriangle,
  Rocket,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ServiceActionsProps {
  service: {
    id: string
    nodeId: string
    nodeName: string
    productType: string
    serviceType: string
    endpoint: string
    version: string
    isEnabled: boolean
  }
  onServiceUpdated?: () => void
}

export default function ServiceActions({ service, onServiceUpdated }: ServiceActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showPilotDialog, setShowPilotDialog] = useState(false)
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false)
  const [editForm, setEditForm] = useState({
    endpoint: service.endpoint,
    version: service.version,
    isEnabled: service.isEnabled
  })
  const [publishForm, setPublishForm] = useState({
    isEmergency: false,
    priority: 'normal',
    message: ''
  })
  const [pilotForm, setPilotForm] = useState({
    pilotScope: 'local',
    targetUsers: '',
    description: '',
    duration: 7
  })

  const { toast } = useToast()

  const handleEdit = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update service')
      }

      toast({
        title: '服务更新成功',
        description: '服务配置已更新',
      })
      setShowEditDialog(false)
      onServiceUpdated?.()
    } catch (error) {
      console.error('Error updating service:', error)
      toast({
        title: '更新失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个服务吗？此操作不可撤销。')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete service')
      }

      toast({
        title: '服务删除成功',
        description: '服务已从系统中移除',
      })
      onServiceUpdated?.()
    } catch (error) {
      console.error('Error deleting service:', error)
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/services/${service.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publishForm),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to publish service')
      }

      const result = await response.json()
      
      toast({
        title: '服务发布成功',
        description: publishForm.isEmergency ? '紧急服务已立即发布' : '服务已成功发布',
      })
      setShowPublishDialog(false)
      onServiceUpdated?.()
    } catch (error) {
      console.error('Error publishing service:', error)
      toast({
        title: '发布失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartPilot = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/services/${service.id}/pilot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...pilotForm,
          targetUsers: pilotForm.targetUsers ? pilotForm.targetUsers.split(',').map(u => u.trim()) : []
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start pilot')
      }

      const result = await response.json()
      
      toast({
        title: '试点启动成功',
        description: `服务试点已启动，范围：${pilotForm.pilotScope}`,
      })
      setShowPilotDialog(false)
      onServiceUpdated?.()
    } catch (error) {
      console.error('Error starting pilot:', error)
      toast({
        title: '试点启动失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBroadcast = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/services/${service.id}/pilot`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addToBroadcast: true
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to broadcast service')
      }

      const result = await response.json()
      
      toast({
        title: '服务广播成功',
        description: '服务已成功广播到上级节点',
      })
      setShowBroadcastDialog(false)
      onServiceUpdated?.()
    } catch (error) {
      console.error('Error broadcasting service:', error)
      toast({
        title: '广播失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            编辑服务
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowPublishDialog(true)}>
            <Rocket className="mr-2 h-4 w-4" />
            发布服务
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowPilotDialog(true)}>
            <Play className="mr-2 h-4 w-4" />
            启动试点
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowBroadcastDialog(true)}>
            <Radio className="mr-2 h-4 w-4" />
            广播到上级
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            删除服务
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 编辑服务对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑服务</DialogTitle>
            <DialogDescription>
              修改服务配置信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint">服务端点</Label>
              <Input
                id="endpoint"
                value={editForm.endpoint}
                onChange={(e) => setEditForm(prev => ({ ...prev, endpoint: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">版本</Label>
              <Input
                id="version"
                value={editForm.version}
                onChange={(e) => setEditForm(prev => ({ ...prev, version: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isEnabled"
                checked={editForm.isEnabled}
                onChange={(e) => setEditForm(prev => ({ ...prev, isEnabled: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isEnabled">启用服务</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleEdit} disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 发布服务对话框 */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>发布服务</DialogTitle>
            <DialogDescription>
              将服务发布到生产环境
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="priority">发布优先级</Label>
              <Select
                value={publishForm.priority}
                onValueChange={(value) => setPublishForm(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="normal">正常</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isEmergency"
                checked={publishForm.isEmergency}
                onChange={(e) => setPublishForm(prev => ({ ...prev, isEmergency: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isEmergency" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                紧急发布
              </Label>
            </div>
            {publishForm.isEmergency && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  紧急发布将立即生效，跳过常规流程。请谨慎使用。
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="message">发布说明</Label>
              <Textarea
                id="message"
                value={publishForm.message}
                onChange={(e) => setPublishForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="描述此次发布的内容和原因..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              取消
            </Button>
            <Button onClick={handlePublish} disabled={loading}>
              {loading ? '发布中...' : '发布'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 启动试点对话框 */}
      <Dialog open={showPilotDialog} onOpenChange={setShowPilotDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>启动服务试点</DialogTitle>
            <DialogDescription>
              在指定范围内启动服务试点
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pilotScope">试点范围</Label>
              <Select
                value={pilotForm.pilotScope}
                onValueChange={(value) => setPilotForm(prev => ({ ...prev, pilotScope: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">本地试点（仅当前节点）</SelectItem>
                  <SelectItem value="internal">内部试点（组织内部）</SelectItem>
                  <SelectItem value="selected">指定用户试点</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {pilotForm.pilotScope === 'selected' && (
              <div className="space-y-2">
                <Label htmlFor="targetUsers">目标用户</Label>
                <Input
                  id="targetUsers"
                  value={pilotForm.targetUsers}
                  onChange={(e) => setPilotForm(prev => ({ ...prev, targetUsers: e.target.value }))}
                  placeholder="用户1,用户2,用户3"
                />
                <p className="text-sm text-gray-500">
                  用逗号分隔的用户名列表
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="duration">试点时长（天）</Label>
              <Input
                id="duration"
                type="number"
                value={pilotForm.duration}
                onChange={(e) => setPilotForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                min="1"
                max="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">试点描述</Label>
              <Textarea
                id="description"
                value={pilotForm.description}
                onChange={(e) => setPilotForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="描述试点的目的和预期效果..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPilotDialog(false)}>
              取消
            </Button>
            <Button onClick={handleStartPilot} disabled={loading}>
              {loading ? '启动中...' : '启动试点'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 广播到上级对话框 */}
      <Dialog open={showBroadcastDialog} onOpenChange={setShowBroadcastDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>广播服务到上级</DialogTitle>
            <DialogDescription>
              将服务正式广播给上级节点，使其在架构中可用
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Radio className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">广播说明：</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>广播后，上级节点将知道此服务的存在</li>
                    <li>上级节点可以将此服务纳入其能力列表</li>
                    <li>服务将在整个架构中可见</li>
                    <li>建议在试点成功后再进行广播</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>服务信息</Label>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">产品类型：</span>
                  <Badge variant="outline">{service.productType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">服务类型：</span>
                  <Badge variant="outline">{service.serviceType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">所属节点：</span>
                  <span className="text-sm">{service.nodeName}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBroadcastDialog(false)}>
              取消
            </Button>
            <Button onClick={handleBroadcast} disabled={loading}>
              {loading ? '广播中...' : '确认广播'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}