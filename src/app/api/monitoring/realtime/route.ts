import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 实时监控数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nodeId = searchParams.get('nodeId')
    const serviceId = searchParams.get('serviceId')
    const metrics = searchParams.get('metrics')?.split(',').filter(Boolean)
    const duration = parseInt(searchParams.get('duration') || '300') // 默认5分钟

    // 验证参数
    if (duration > 3600) {
      return NextResponse.json(
        { success: false, error: '持续时间不能超过3600秒（1小时）' },
        { status: 400 }
      )
    }

    // 获取实时监控数据
    const monitoringData = await getRealtimeMonitoringData({
      nodeId,
      serviceId,
      metrics,
      duration
    })

    return NextResponse.json({
      success: true,
      data: {
        ...monitoringData,
        timestamp: new Date().toISOString(),
        duration
      }
    })

  } catch (error) {
    console.error('获取实时监控数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取实时监控数据失败' },
      { status: 500 }
    )
  }
}

// 获取实时监控数据
async function getRealtimeMonitoringData(params: {
  nodeId?: string
  serviceId?: string
  metrics?: string[]
  duration: number
}) {
  const now = new Date()
  const startTime = new Date(now.getTime() - params.duration * 1000)

  // 基础系统指标
  const systemMetrics = await getSystemMetrics(params)

  // 节点健康状态
  const nodeHealth = await getNodeHealthMetrics(params.nodeId)

  // 服务性能指标
  const serviceMetrics = await getServicePerformanceMetrics(params.serviceId)

  // 用户活动指标
  const userActivity = await getUserActivityMetrics(startTime, now)

  // 资源使用情况
  const resourceUsage = await getResourceUsageMetrics()

  // 告警状态
  const alertStatus = await getAlertStatus()

  return {
    system: systemMetrics,
    nodeHealth,
    serviceMetrics,
    userActivity,
    resourceUsage,
    alertStatus,
    summary: generateMonitoringSummary({
      systemMetrics,
      nodeHealth,
      serviceMetrics,
      userActivity,
      resourceUsage,
      alertStatus
    })
  }
}

// 获取系统指标
async function getSystemMetrics(params: { nodeId?: string }) {
  try {
    // 模拟系统指标 - 实际项目中应该从监控系统获取
    const baseMetrics = {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      diskUsage: Math.random() * 100,
      networkIn: Math.random() * 1000,
      networkOut: Math.random() * 1000,
      requestRate: Math.floor(Math.random() * 2000),
      responseTime: Math.random() * 500,
      errorRate: Math.random() * 5
    }

    // 如果指定了节点，获取节点特定指标
    if (params.nodeId) {
      const node = await db.node.findUnique({
        where: { id: params.nodeId }
      })

      if (node) {
        return {
          ...baseMetrics,
          nodeId: params.nodeId,
          nodeName: node.name,
          nodeType: node.type,
          healthStatus: node.healthStatus
        }
      }
    }

    return baseMetrics

  } catch (error) {
    console.error('获取系统指标失败:', error)
    return {
      error: '获取系统指标失败',
      timestamp: new Date().toISOString()
    }
  }
}

// 获取节点健康指标
async function getNodeHealthMetrics(nodeId?: string) {
  try {
    const whereClause = nodeId ? { id: nodeId } : {}
    
    const nodes = await db.node.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            datasets: true,
            capabilities: true
          }
        }
      }
    })

    const healthSummary = {
      total: nodes.length,
      healthy: nodes.filter(n => n.healthStatus === 'HEALTHY').length,
      warning: nodes.filter(n => n.healthStatus === 'WARNING').length,
      error: nodes.filter(n => n.healthStatus === 'ERROR').length,
      offline: nodes.filter(n => n.healthStatus === 'OFFLINE').length,
      details: nodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        healthStatus: node.healthStatus,
        lastHealthCheck: node.lastHealthCheck,
        datasetCount: node._count.datasets,
        capabilityCount: node._count.capabilities
      }))
    }

    return healthSummary

  } catch (error) {
    console.error('获取节点健康指标失败:', error)
    return {
      error: '获取节点健康指标失败',
      timestamp: new Date().toISOString()
    }
  }
}

// 获取服务性能指标
async function getServicePerformanceMetrics(serviceId?: string) {
  try {
    const whereClause = serviceId ? { id: serviceId } : { isActive: true }
    
    const services = await db.service.findMany({
      where: whereClause,
      include: {
        dataset: {
          select: {
            name: true,
            productType: true
          }
        }
      }
    })

    // 模拟服务性能指标
    const performanceMetrics = services.map(service => ({
      id: service.id,
      name: `${service.dataset.name} - ${service.serviceType}`,
      serviceType: service.serviceType,
      productType: service.dataset.productType,
      isActive: service.isActive,
      // 模拟性能数据
      requestCount: Math.floor(Math.random() * 10000),
      avgResponseTime: Math.random() * 200,
      errorRate: Math.random() * 2,
      uptime: Math.random() * 100,
      lastAccess: new Date(Date.now() - Math.random() * 3600000)
    }))

    // 汇总统计
    const summary = {
      totalServices: services.length,
      activeServices: services.filter(s => s.isActive).length,
      avgResponseTime: performanceMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / performanceMetrics.length,
      totalRequests: performanceMetrics.reduce((sum, m) => sum + m.requestCount, 0),
      avgUptime: performanceMetrics.reduce((sum, m) => sum + m.uptime, 0) / performanceMetrics.length
    }

    return {
      services: performanceMetrics,
      summary
    }

  } catch (error) {
    console.error('获取服务性能指标失败:', error)
    return {
      error: '获取服务性能指标失败',
      timestamp: new Date().toISOString()
    }
  }
}

// 获取用户活动指标
async function getUserActivityMetrics(startTime: Date, endTime: Date) {
  try {
    // 模拟用户活动数据
    // 实际项目中应该从访问日志中统计
    const activityData = {
      activeUsers: Math.floor(Math.random() * 500) + 50,
      totalRequests: Math.floor(Math.random() * 50000) + 10000,
      uniqueUsers: Math.floor(Math.random() * 200) + 20,
      avgSessionDuration: Math.floor(Math.random() * 1800) + 300, // 秒
      topEndpoints: [
        { endpoint: '/api/v1/s102/wms', count: Math.floor(Math.random() * 5000) + 1000 },
        { endpoint: '/api/v1/s101/wfs', count: Math.floor(Math.random() * 3000) + 500 },
        { endpoint: '/api/capabilities', count: Math.floor(Math.random() * 2000) + 300 },
        { endpoint: '/api/monitoring', count: Math.floor(Math.random() * 1000) + 100 }
      ],
      hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        requests: Math.floor(Math.random() * 2000) + 100,
        users: Math.floor(Math.random() * 100) + 10
      }))
    }

    return activityData

  } catch (error) {
    console.error('获取用户活动指标失败:', error)
    return {
      error: '获取用户活动指标失败',
      timestamp: new Date().toISOString()
    }
  }
}

// 获取资源使用指标
async function getResourceUsageMetrics() {
  try {
    // 模拟资源使用数据
    const resourceData = {
      database: {
        connections: Math.floor(Math.random() * 50) + 10,
        maxConnections: 100,
        queryTime: Math.random() * 100,
        slowQueries: Math.floor(Math.random() * 5)
      },
      cache: {
        hitRate: Math.random() * 100,
        memoryUsage: Math.random() * 1024, // MB
        keyCount: Math.floor(Math.random() * 10000) + 1000
      },
      storage: {
        totalSpace: 1024 * 1024, // GB
        usedSpace: Math.floor(Math.random() * 500 * 1024) + 100 * 1024, // GB
        datasetCount: Math.floor(Math.random() * 1000) + 100
      },
      network: {
        bandwidth: Math.random() * 1000, // Mbps
        connections: Math.floor(Math.random() * 1000) + 100,
        packetsIn: Math.floor(Math.random() * 100000),
        packetsOut: Math.floor(Math.random() * 100000)
      }
    }

    return resourceData

  } catch (error) {
    console.error('获取资源使用指标失败:', error)
    return {
      error: '获取资源使用指标失败',
      timestamp: new Date().toISOString()
    }
  }
}

// 获取告警状态
async function getAlertStatus() {
  try {
    // 模拟告警数据
    const alertData = {
      activeAlerts: Math.floor(Math.random() * 10),
      criticalAlerts: Math.floor(Math.random() * 3),
      warningAlerts: Math.floor(Math.random() * 5),
      infoAlerts: Math.floor(Math.random() * 2),
      recentAlerts: [
        {
          id: 'alert-1',
          severity: 'WARNING',
          message: '节点响应时间超过阈值',
          timestamp: new Date(Date.now() - Math.random() * 3600000),
          resolved: false
        },
        {
          id: 'alert-2',
          severity: 'INFO',
          message: '数据集发布完成',
          timestamp: new Date(Date.now() - Math.random() * 3600000),
          resolved: true
        }
      ]
    }

    return alertData

  } catch (error) {
    console.error('获取告警状态失败:', error)
    return {
      error: '获取告警状态失败',
      timestamp: new Date().toISOString()
    }
  }
}

// 生成监控摘要
function generateMonitoringSummary(data: any) {
  const {
    systemMetrics,
    nodeHealth,
    serviceMetrics,
    userActivity,
    resourceUsage,
    alertStatus
  } = data

  // 计算整体健康度
  const systemHealthScore = calculateSystemHealthScore({
    systemMetrics,
    nodeHealth,
    serviceMetrics,
    alertStatus
  })

  // 生成状态消息
  const statusMessages = []
  
  if (systemHealthScore >= 90) {
    statusMessages.push('系统运行良好')
  } else if (systemHealthScore >= 70) {
    statusMessages.push('系统运行正常，有轻微问题')
  } else if (systemHealthScore >= 50) {
    statusMessages.push('系统存在需要关注的问题')
  } else {
    statusMessages.push('系统存在严重问题，需要立即处理')
  }

  if (alertStatus.criticalAlerts > 0) {
    statusMessages.push(`有${alertStatus.criticalAlerts}个严重告警需要处理`)
  }

  if (nodeHealth.error > 0) {
    statusMessages.push(`${nodeHealth.error}个节点处于错误状态`)
  }

  return {
    healthScore: Math.round(systemHealthScore),
    status: systemHealthScore >= 80 ? 'HEALTHY' : systemHealthScore >= 60 ? 'WARNING' : 'ERROR',
    messages: statusMessages,
    recommendations: generateRecommendations(data)
  }
}

// 计算系统健康度分数
function calculateSystemHealthScore(data: any) {
  let score = 100

  // 基于节点健康状态
  const { nodeHealth } = data
  if (nodeHealth.total > 0) {
    const nodeHealthRatio = nodeHealth.healthy / nodeHealth.total
    score *= nodeHealthRatio
  }

  // 基于系统资源使用
  const { systemMetrics } = data
  if (systemMetrics.cpuUsage > 80) score *= 0.8
  if (systemMetrics.memoryUsage > 80) score *= 0.8
  if (systemMetrics.errorRate > 1) score *= 0.9

  // 基于告警状态
  const { alertStatus } = data
  if (alertStatus.criticalAlerts > 0) score *= 0.5
  if (alertStatus.warningAlerts > 0) score *= 0.8

  // 基于服务性能
  const { serviceMetrics } = data
  if (serviceMetrics.summary.avgResponseTime > 500) score *= 0.8
  if (serviceMetrics.summary.avgUptime < 95) score *= 0.7

  return Math.max(0, Math.min(100, score))
}

// 生成优化建议
function generateRecommendations(data: any) {
  const recommendations = []

  const { systemMetrics, nodeHealth, serviceMetrics, resourceUsage } = data

  // 系统资源建议
  if (systemMetrics.cpuUsage > 80) {
    recommendations.push('CPU使用率过高，建议检查系统负载或考虑扩容')
  }
  if (systemMetrics.memoryUsage > 80) {
    recommendations.push('内存使用率过高，建议检查内存泄漏或增加内存')
  }
  if (systemMetrics.errorRate > 1) {
    recommendations.push('错误率偏高，建议检查服务日志和错误处理')
  }

  // 节点健康建议
  if (nodeHealth.error > 0) {
    recommendations.push(`${nodeHealth.error}个节点处于错误状态，建议立即检查`)
  }
  if (nodeHealth.warning > 0) {
    recommendations.push(`${nodeHealth.warning}个节点有警告，建议关注`)
  }

  // 服务性能建议
  if (serviceMetrics.summary.avgResponseTime > 500) {
    recommendations.push('服务响应时间偏长，建议优化服务性能')
  }
  if (serviceMetrics.summary.avgUptime < 95) {
    recommendations.push('服务可用性偏低，建议检查服务稳定性')
  }

  // 资源使用建议
  if (resourceUsage.database.connections > resourceUsage.database.maxConnections * 0.8) {
    recommendations.push('数据库连接数偏高，建议优化连接池配置')
  }
  if (resourceUsage.cache.hitRate < 80) {
    recommendations.push('缓存命中率偏低，建议检查缓存策略')
  }

  return recommendations
}