'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMapConfig } from '@/hooks/useMapConfig'
import { MapLayerSelector } from '@/components/maps/MapLayerSelector'
import { 
  Layers, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Globe
} from 'lucide-react'

export default function TestMapConfigPage() {
  const {
    mapConfig,
    envConfig,
    isLoading: configLoading,
    error: configError,
    currentLayer,
    setCurrentLayer,
    getLayerUrl,
    configWarnings,
    isValidConfig,
    reloadConfig
  } = useMapConfig()

  const [testResult, setTestResult] = useState<string | null>(null)

  const testConfiguration = () => {
    try {
      const tests = []
      
      // 测试1: 检查配置是否加载
      if (mapConfig && mapConfig.layers.length > 0) {
        tests.push('✅ 地图配置加载成功')
      } else {
        tests.push('❌ 地图配置加载失败')
      }
      
      // 测试2: 检查环境配置
      if (envConfig) {
        tests.push('✅ 环境配置加载成功')
      } else {
        tests.push('❌ 环境配置加载失败')
      }
      
      // 测试3: 检查当前图层
      if (currentLayer) {
        tests.push('✅ 当前图层设置成功')
      } else {
        tests.push('❌ 当前图层设置失败')
      }
      
      // 测试4: 检查URL获取
      if (currentLayer && getLayerUrl(currentLayer.id)) {
        tests.push('✅ 图层URL获取成功')
      } else {
        tests.push('❌ 图层URL获取失败')
      }
      
      // 测试5: 检查配置验证
      if (isValidConfig) {
        tests.push('✅ 配置验证通过')
      } else {
        tests.push('❌ 配置验证失败')
      }
      
      setTestResult(tests.join('\n'))
    } catch (error) {
      setTestResult(`❌ 测试失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  if (configLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>地图配置加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Globe className="h-8 w-8" />
          地图配置测试页面
        </h1>
        <p className="text-gray-600">
          测试地图配置系统是否正常工作
        </p>
      </div>

      {/* 配置状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            配置状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {isValidConfig ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span>配置状态: {isValidConfig ? '正常' : '有警告'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-500" />
              <span>可用图层: {mapConfig.layers.length} 个</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              <span>当前图层: {currentLayer?.name || '未选择'}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>警告: {configWarnings.length} 个</span>
            </div>
          </div>

          {configWarnings.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="font-medium text-yellow-800 mb-2">配置警告:</div>
              {configWarnings.map((warning, index) => (
                <div key={index} className="text-sm text-yellow-700">• {warning}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 测试区域 */}
      <Card>
        <CardHeader>
          <CardTitle>配置测试</CardTitle>
          <CardDescription>
            测试地图配置系统的各个功能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={testConfiguration}>
              运行测试
            </Button>
            
            {testResult && (
              <div className="p-4 bg-gray-50 rounded">
                <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 图层选择器测试 */}
      <Card>
        <CardHeader>
          <CardTitle>图层选择器测试</CardTitle>
          <CardDescription>
            测试图层选择器组件是否正常工作
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MapLayerSelector
            currentLayerId={currentLayer?.id || mapConfig.defaultLayer}
            onLayerChange={(layerId) => setCurrentLayer(layerId)}
            mapConfig={mapConfig}
            configWarnings={configWarnings}
            onReloadConfig={reloadConfig}
          />
        </CardContent>
      </Card>

      {/* 配置详情 */}
      <Card>
        <CardHeader>
          <CardTitle>配置详情</CardTitle>
          <CardDescription>
            查看当前配置的详细信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">当前图层信息</h3>
              {currentLayer && (
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <div><strong>ID:</strong> {currentLayer.id}</div>
                  <div><strong>名称:</strong> {currentLayer.name}</div>
                  <div><strong>类型:</strong> {currentLayer.type}</div>
                  <div><strong>URL:</strong> {currentLayer.url}</div>
                  <div><strong>缩放级别:</strong> {currentLayer.minZoom}-{currentLayer.maxZoom}</div>
                  <div><strong>需要密钥:</strong> {currentLayer.token ? '是' : '否'}</div>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-medium mb-2">环境配置</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <div><strong>天地图:</strong> {envConfig.tianditu.enabled ? '启用' : '禁用'}</div>
                  <div><strong>Token:</strong> {envConfig.tianditu.token ? '已配置' : '未配置'}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div><strong>高德地图:</strong> {envConfig.gaode.enabled ? '启用' : '禁用'}</div>
                  <div><strong>Key:</strong> {envConfig.gaode.key ? '已配置' : '未配置'}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div><strong>腾讯地图:</strong> {envConfig.tencent.enabled ? '启用' : '禁用'}</div>
                  <div><strong>Key:</strong> {envConfig.tencent.key ? '已配置' : '未配置'}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div><strong>百度地图:</strong> {envConfig.baidu.enabled ? '启用' : '禁用'}</div>
                  <div><strong>Key:</strong> {envConfig.baidu.key ? '已配置' : '未配置'}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}