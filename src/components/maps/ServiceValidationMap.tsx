'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, MapPin, Layers } from 'lucide-react'

// Dynamically import map components to avoid SSR issues
const LeafletMapSimple = dynamic(
  () => import('./LeafletMapSimple'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
)

interface ServiceValidationMapProps {
  service: any
  validationResult?: any
  onRevalidate?: () => void
  height?: string
}

interface ValidationStatus {
  type: 'success' | 'error' | 'warning'
  title: string
  message: string
  details?: any
}

export default function ServiceValidationMap({
  service,
  validationResult,
  onRevalidate,
  height = '600px'
}: ServiceValidationMapProps) {
  const [mapCenter, setMapCenter] = useState([31.2000, 121.5000])
  const [mapZoom, setMapZoom] = useState(8)
  const [validationStatus, setValidationStatus] = useState<ValidationStatus[]>([])
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // 处理验证结果
  useEffect(() => {
    if (validationResult) {
      const status: ValidationStatus[] = []
      
      // 总体状态
      if (validationResult.isValid) {
        status.push({
          type: 'success',
          title: '服务验证通过',
          message: '所有检查项目均符合要求'
        })
      } else {
        status.push({
          type: 'error',
          title: '服务验证失败',
          message: validationResult.errors?.[0] || '存在未通过的检查项目'
        })
      }

      // 各项检查结果
      validationResult.checks?.forEach((check: any) => {
        if (check.success) {
          status.push({
            type: 'success',
            title: `${getCheckTypeName(check.type)} - 通过`,
            message: getCheckSuccessMessage(check)
          })
        } else {
          status.push({
            type: 'error',
            title: `${getCheckTypeName(check.type)} - 失败`,
            message: check.error || '检查失败'
          })
        }
      })

      // 警告信息
      if (validationResult.warnings?.length > 0) {
        status.push({
          type: 'warning',
          title: '注意事项',
          message: validationResult.warnings.join(', ')
        })
      }

      setValidationStatus(status)
    }
  }, [validationResult])

  // 获取检查类型名称
  const getCheckTypeName = (type: string) => {
    const names: { [key: string]: string } = {
      endpoint_reachability: '端点可达性',
      wms_validation: 'WMS服务验证',
      wfs_validation: 'WFS服务验证',
      wcs_validation: 'WCS服务验证',
      dataset_consistency: '数据集一致性'
    }
    return names[type] || type
  }

  // 获取检查成功消息
  const getCheckSuccessMessage = (check: any) => {
    if (check.type === 'endpoint_reachability') {
      return `响应时间: ${check.responseTime}ms`
    }
    if (check.details?.hasValidCapabilities) {
      return 'GetCapabilities请求成功'
    }
    return '检查通过'
  }

  // 处理地图就绪
  const handleMapReady = (map: any) => {
    setIsMapLoaded(true)
    
    // 如果服务有覆盖范围，调整地图视图
    if (service.dataset?.coverage) {
      try {
        const coverage = JSON.parse(service.dataset.coverage)
        if (coverage.type === 'Point' && coverage.coordinates) {
          setMapCenter([coverage.coordinates[1], coverage.coordinates[0]])
          setMapZoom(10)
        }
      } catch (error) {
        console.error('Error parsing coverage:', error)
      }
    }
  }

  // 获取状态图标
  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  // 获取状态颜色
  const getStatusColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* 验证状态卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              服务验证地图
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={validationResult?.isValid ? 'default' : 'destructive'}>
                {validationResult?.isValid ? '验证通过' : '验证失败'}
              </Badge>
              {onRevalidate && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRevalidate}
                  disabled={!isMapLoaded}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  重新验证
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">服务信息</h4>
              <div className="space-y-2 text-sm">
                <div><strong>服务类型:</strong> {service.serviceType}</div>
                <div><strong>端点:</strong> {service.endpoint}</div>
                <div><strong>版本:</strong> {service.version}</div>
                {service.dataset && (
                  <>
                    <div><strong>数据集:</strong> {service.dataset.name}</div>
                    <div><strong>产品类型:</strong> {service.dataset.productType}</div>
                  </>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">验证结果</h4>
              <div className="space-y-2 text-sm">
                {validationResult && (
                  <>
                    <div><strong>响应时间:</strong> {validationResult.responseTime}ms</div>
                    <div><strong>检查项目:</strong> {validationResult.checks?.length || 0}</div>
                    <div><strong>错误数量:</strong> {validationResult.errors?.length || 0}</div>
                    <div><strong>警告数量:</strong> {validationResult.warnings?.length || 0}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 验证状态列表 */}
      {validationStatus.length > 0 && (
        <div className="space-y-2">
          {validationStatus.map((status, index) => (
            <Alert key={index} className={getStatusColor(status.type)}>
              <div className="flex items-start gap-2">
                {getStatusIcon(status.type)}
                <div className="flex-1">
                  <AlertDescription className="font-medium">
                    {status.title}
                  </AlertDescription>
                  <AlertDescription className="text-sm mt-1">
                    {status.message}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* 地图容器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            服务覆盖范围
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full" style={{ height }}>
            <LeafletMapSimple
              center={mapCenter}
              zoom={mapZoom}
              onMapReady={handleMapReady}
              className="w-full h-full"
              style={{ height }}
            />
            
            {/* 服务覆盖范围标记 */}
            {service.dataset?.coverage && isMapLoaded && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-white rounded-lg shadow-lg p-3">
                  <div className="text-sm font-medium">服务覆盖范围</div>
                  <div className="text-xs text-gray-600 mt-1">
                    基于 {service.dataset.name} 数据集
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}