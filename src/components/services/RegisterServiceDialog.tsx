'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface RegisterServiceDialogProps {
  onServiceRegistered?: () => void
}

export default function RegisterServiceDialog({ onServiceRegistered }: RegisterServiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nodeId: '',
    productType: '',
    serviceType: '',
    endpoint: '',
    version: '1.0.0',
    isEnabled: true
  })
  
  const { toast } = useToast()

  // 模拟节点数据
  const nodes = [
    { id: '1', name: '上海港', type: 'LEAF' },
    { id: '2', name: '东海分局', type: 'REGIONAL' },
    { id: '3', name: '中国海事局', type: 'NATIONAL' }
  ]

  // S-100产品类型
  const productTypes = [
    { value: 'S101', label: 'S-101 电子海图' },
    { value: 'S102', label: 'S-102 高精度水深' },
    { value: 'S104', label: 'S-104 动态水位' },
    { value: 'S111', label: 'S-111 实时海流' },
    { value: 'S124', label: 'S-124 航行警告' },
    { value: 'S125', label: 'S-125 航行信息' },
    { value: 'S131', label: 'S-131 海洋保护区' }
  ]

  // 服务类型
  const serviceTypes = [
    { value: 'WFS', label: 'WFS - Web要素服务' },
    { value: 'WMS', label: 'WMS - Web地图服务' },
    { value: 'WCS', label: 'WCS - Web覆盖服务' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to register service')
      }

      const result = await response.json()
      
      toast({
        title: '服务注册成功',
        description: `${formData.productType} ${formData.serviceType} 服务已成功注册`,
      })

      // 重置表单
      setFormData({
        nodeId: '',
        productType: '',
        serviceType: '',
        endpoint: '',
        version: '1.0.0',
        isEnabled: true
      })

      setOpen(false)
      onServiceRegistered?.()
    } catch (error) {
      console.error('Error registering service:', error)
      toast({
        title: '注册失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          注册新服务
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>注册新服务</DialogTitle>
          <DialogDescription>
            为指定节点注册新的S-100服务能力
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nodeId">选择节点 *</Label>
              <Select
                value={formData.nodeId}
                onValueChange={(value) => handleInputChange('nodeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择节点" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      <div className="flex items-center gap-2">
                        <span>{node.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {node.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productType">产品类型 *</Label>
              <Select
                value={formData.productType}
                onValueChange={(value) => handleInputChange('productType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择产品类型" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((product) => (
                    <SelectItem key={product.value} value={product.value}>
                      {product.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">服务类型 *</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) => handleInputChange('serviceType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择服务类型" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      {service.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">版本</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                placeholder="1.0.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint">服务端点 *</Label>
            <Input
              id="endpoint"
              value={formData.endpoint}
              onChange={(e) => handleInputChange('endpoint', e.target.value)}
              placeholder="/api/v1/s101/wms"
            />
            <p className="text-sm text-gray-500">
              服务端点URL，相对于节点API地址
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isEnabled"
              checked={formData.isEnabled}
              onChange={(e) => handleInputChange('isEnabled', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="isEnabled">启用服务</Label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">注册须知：</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>服务注册后将在指定节点上生效</li>
                  <li>相同节点上不能重复注册相同的产品和服务类型</li>
                  <li>服务端点必须符合OGC标准规范</li>
                  <li>注册后可通过试点功能进行本地测试</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.nodeId || !formData.productType || !formData.serviceType || !formData.endpoint}
            >
              {loading ? '注册中...' : '注册服务'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}