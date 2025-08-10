import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiErrorHandler } from '@/lib/api-error'

// POST /admin/nodes/{id}/health-check - 执行节点健康检查
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const nodeId = id

    // 验证节点是否存在
    const node = await db.node.findUnique({
      where: { id: nodeId },
      include: {
        capabilities: {
          where: { isEnabled: true },
          select: {
            productType: true,
            serviceType: true,
            endpoint: true
          }
        }
      }
    })

    if (!node) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { node_id: nodeId })
    }

    // 模拟健康检查过程
    // 在实际应用中，这里会向节点的API端点发送实际的健康检查请求
    const healthCheckResults = []
    let overallStatus = 'HEALTHY'
    let hasFailures = false
    let hasWarnings = false

    for (const capability of node.capabilities) {
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
        
        // 模拟健康检查结果（90%成功率）
        const isSuccess = Math.random() > 0.1
        
        const result = {
          productType: capability.productType,
          serviceType: capability.serviceType,
          endpoint: capability.endpoint,
          status: isSuccess ? 'HEALTHY' : 'ERROR',
          responseTime: Math.floor(Math.random() * 500) + 50, // 50-550ms
          timestamp: new Date().toISOString(),
          message: isSuccess ? 'Service is responding normally' : 'Service timeout or error'
        }

        healthCheckResults.push(result)

        if (!isSuccess) {
          hasFailures = true
          overallStatus = 'ERROR'
        }

      } catch (error) {
        const result = {
          productType: capability.productType,
          serviceType: capability.serviceType,
          endpoint: capability.endpoint,
          status: 'ERROR',
          responseTime: 0,
          timestamp: new Date().toISOString(),
          message: 'Failed to connect to service endpoint'
        }

        healthCheckResults.push(result)
        hasFailures = true
        overallStatus = 'ERROR'
      }
    }

    // 如果没有失败但有警告，设置为WARNING状态
    if (!hasFailures && hasWarnings) {
      overallStatus = 'WARNING'
    }

    // 更新节点的健康状态
    const updatedNode = await db.node.update({
      where: { id: nodeId },
      data: {
        healthStatus: overallStatus,
        lastHealthCheck: new Date(),
        updatedAt: new Date()
      }
    })

    // 记录健康检查日志
    console.log(`Health check completed for node: ${nodeId}`, {
      overallStatus,
      checksPerformed: healthCheckResults.length,
      failures: healthCheckResults.filter(r => r.status === 'ERROR').length
    })

    return NextResponse.json({
      node: {
        id: updatedNode.id,
        name: updatedNode.name,
        healthStatus: updatedNode.healthStatus,
        lastHealthCheck: updatedNode.lastHealthCheck,
        updatedAt: updatedNode.updatedAt
      },
      healthCheck: {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        results: healthCheckResults,
        summary: {
          total: healthCheckResults.length,
          healthy: healthCheckResults.filter(r => r.status === 'HEALTHY').length,
          warnings: healthCheckResults.filter(r => r.status === 'WARNING').length,
          errors: healthCheckResults.filter(r => r.status === 'ERROR').length,
          averageResponseTime: Math.floor(
            healthCheckResults.reduce((sum, r) => sum + r.responseTime, 0) / healthCheckResults.length
          )
        }
      }
    })

  } catch (error) {
    console.error('Error performing health check:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', {
      operation: 'health_check',
      node_id: nodeId
    })
  }
}