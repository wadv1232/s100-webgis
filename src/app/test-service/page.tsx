'use client'

import { useState, useEffect } from 'react'

export default function TestServicePage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkServices()
  }, [])

  const checkServices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 检查主要服务
      const servicesToCheck = [
        { name: '主页', url: '/' },
        { name: '地图服务', url: '/map-services' },
        { name: 'API文档', url: '/api-docs' },
        { name: '用户管理', url: '/users' },
        { name: '服务管理', url: '/services' },
        { name: '节点管理', url: '/nodes' },
        { name: '数据集管理', url: '/datasets' },
        { name: '能力管理', url: '/capabilities' },
        { name: '监控页面', url: '/monitoring' },
        { name: '开发者门户', url: '/developer' }
      ]

      const results = []
      
      for (const service of servicesToCheck) {
        try {
          const response = await fetch(service.url, {
            method: 'HEAD',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          })
          
          results.push({
            ...service,
            status: response.status,
            statusText: response.statusText,
            available: response.ok
          })
        } catch (err) {
          results.push({
            ...service,
            status: 'ERROR',
            statusText: err instanceof Error ? err.message : '未知错误',
            available: false
          })
        }
      }
      
      setServices(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : '检查服务时发生错误')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>正在检查服务状态...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold mb-4">错误</h1>
          <p>{error}</p>
          <button 
            onClick={checkServices}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">服务状态检查</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">服务列表</h2>
            <button 
              onClick={checkServices}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              刷新检查
            </button>
          </div>
          
          <div className="space-y-4">
            {services.map((service, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  service.available 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.url}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.available ? '正常' : '异常'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {service.status} - {service.statusText}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">系统信息</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• 检查时间: {new Date().toLocaleString()}</p>
              <p>• 检查的服务数量: {services.length}</p>
              <p>• 正常服务数量: {services.filter(s => s.available).length}</p>
              <p>• 异常服务数量: {services.filter(s => !s.available).length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}