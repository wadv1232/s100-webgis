import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface HealthResponse {
  status: 'UP' | 'DOWN' | 'DEGRADED'
  timestamp: string
  version?: string
  uptime?: number
  components?: {
    database: 'UP' | 'DOWN'
    service_directory: 'UP' | 'DOWN'
    cache: 'UP' | 'DOWN'
    external_apis: 'UP' | 'DOWN'
  }
  metrics?: {
    active_nodes: number
    active_services: number
    total_datasets: number
    cache_hit_rate?: number
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 检查数据库连接
    let databaseStatus: 'UP' | 'DOWN' = 'DOWN'
    try {
      await db.$queryRaw`SELECT 1`
      databaseStatus = 'UP'
    } catch (error) {
      console.error('Database health check failed:', error)
    }

    // 检查服务目录状态
    let serviceDirectoryStatus: 'UP' | 'DOWN' = 'DOWN'
    try {
      const { ServiceDirectory } = await import('@/lib/service-directory')
      const serviceDirectory = ServiceDirectory.getInstance()
      await serviceDirectory.queryServices({ bbox: [0, 0, 1, 1] }, { maxResults: 1 })
      serviceDirectoryStatus = 'UP'
    } catch (error) {
      console.error('Service directory health check failed:', error)
    }

    // 检查缓存状态
    let cacheStatus: 'UP' | 'DOWN' = 'DOWN'
    try {
      const { CacheManager } = await import('@/lib/cache-manager')
      const cacheManager = CacheManager.getInstance()
      await cacheManager.get('health-check-test')
      cacheStatus = 'UP'
    } catch (error) {
      console.error('Cache health check failed:', error)
    }

    // 获取系统指标
    let metrics = null
    try {
      const [activeNodes, activeServices, totalDatasets] = await Promise.all([
        db.node.count({ where: { isActive: true, healthStatus: 'HEALTHY' } }),
        db.service.count({ where: { isActive: true } }),
        db.dataset.count({ where: { status: 'PUBLISHED' } })
      ])

      metrics = {
        active_nodes: activeNodes,
        active_services: activeServices,
        total_datasets: totalDatasets
      }
    } catch (error) {
      console.error('Failed to collect metrics:', error)
    }

    // 确定整体状态
    let overallStatus: 'UP' | 'DOWN' | 'DEGRADED' = 'UP'
    const downComponents = []
    
    if (databaseStatus === 'DOWN') downComponents.push('database')
    if (serviceDirectoryStatus === 'DOWN') downComponents.push('service_directory')
    if (cacheStatus === 'DOWN') downComponents.push('cache')

    if (downComponents.length >= 2) {
      overallStatus = 'DOWN'
    } else if (downComponents.length === 1) {
      overallStatus = 'DEGRADED'
    }

    // 构建响应
    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0', // 可以从package.json或配置中读取
      uptime: process.uptime(),
      components: {
        database: databaseStatus,
        service_directory: serviceDirectoryStatus,
        cache: cacheStatus,
        external_apis: 'UP' // 假设外部API正常，可以添加实际检查
      },
      metrics
    }

    // 如果状态不是UP，返回503
    const statusCode = overallStatus === 'UP' ? 200 : 503
    
    return NextResponse.json(response, { status: statusCode })

  } catch (error) {
    console.error('Health check failed:', error)
    
    // 即使出现异常，也要返回DOWN状态
    const errorResponse: HealthResponse = {
      status: 'DOWN',
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorResponse, { status: 503 })
  }
}