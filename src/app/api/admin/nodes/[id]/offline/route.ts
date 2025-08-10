import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiErrorHandler } from '@/lib/api-error'

interface OfflineRequest {
  reason?: string
  graceful?: boolean
  timeout?: number
}

// POST /admin/nodes/{id}/offline - 将节点设置为离线状态
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const nodeId = id
    const body: OfflineRequest = await request.json()

    // 验证节点是否存在
    const node = await db.node.findUnique({
      where: { id: nodeId },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            isActive: true,
            healthStatus: true
          }
        },
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

    // 检查节点是否已经是离线状态
    if (!node.isActive) {
      return ApiErrorHandler.createErrorResponse('NODE_ALREADY_OFFLINE', {
        node_id: nodeId,
        current_status: node.healthStatus
      })
    }

    // 检查是否有活跃的子节点
    const activeChildren = node.children.filter(child => child.isActive)
    if (activeChildren.length > 0 && !body.graceful) {
      return ApiErrorHandler.createErrorResponse('NODE_HAS_ACTIVE_CHILDREN', {
        node_id: nodeId,
        active_children: activeChildren.length,
        children: activeChildren.map(child => ({
          id: child.id,
          name: child.name,
          health_status: child.healthStatus
        }))
      })
    }

    // 模拟离线过程
    const offlineResults = []
    let offlineSuccess = true

    // 优雅关闭：先停止服务
    if (body.graceful) {
      for (const capability of node.capabilities) {
        try {
          // 模拟服务停止延迟
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
          
          // 模拟服务停止结果（98%成功率）
          const isSuccess = Math.random() > 0.02
          
          const result = {
            service: capability.productType,
            operation: 'SERVICE_STOP',
            status: isSuccess ? 'STOPPED' : 'FAILED',
            timestamp: new Date().toISOString(),
            message: isSuccess ? 'Service stopped gracefully' : 'Service stop failed',
            endpoint: capability.endpoint
          }

          offlineResults.push(result)

          if (!isSuccess) {
            offlineSuccess = false
          }

        } catch (error) {
          const result = {
            service: capability.productType,
            operation: 'SERVICE_STOP',
            status: 'FAILED',
            timestamp: new Date().toISOString(),
            message: 'Service stop encountered an error',
            error: error instanceof Error ? error.message : 'Unknown error',
            endpoint: capability.endpoint
          }

          offlineResults.push(result)
          offlineSuccess = false
        }
      }

      // 如果有活跃子节点，尝试将它们也设置为离线
      if (activeChildren.length > 0) {
        for (const child of activeChildren) {
          try {
            // 模拟子节点离线延迟
            await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 250))
            
            // 更新子节点状态
            await db.node.update({
              where: { id: child.id },
              data: {
                isActive: false,
                healthStatus: 'OFFLINE',
                updatedAt: new Date()
              }
            })

            const result = {
              node: child.id,
              operation: 'CHILD_OFFLINE',
              status: 'OFFLINE',
              timestamp: new Date().toISOString(),
              message: `Child node ${child.name} set offline`
            }

            offlineResults.push(result)

          } catch (error) {
            const result = {
              node: child.id,
              operation: 'CHILD_OFFLINE',
              status: 'FAILED',
              timestamp: new Date().toISOString(),
              message: `Failed to set child node ${child.name} offline`,
              error: error instanceof Error ? error.message : 'Unknown error'
            }

            offlineResults.push(result)
            offlineSuccess = false
          }
        }
      }
    }

    // 更新节点状态为离线
    const updatedNode = await db.node.update({
      where: { id: nodeId },
      data: {
        isActive: false,
        healthStatus: 'OFFLINE',
        updatedAt: new Date()
      }
    })

    // 记录离线日志
    console.log(`Node set offline: ${nodeId}`, {
      success: offlineSuccess,
      graceful: body.graceful || false,
      reason: body.reason || 'Manual offline request',
      services_stopped: offlineResults.filter(r => r.operation === 'SERVICE_STOP').length,
      children_offlined: offlineResults.filter(r => r.operation === 'CHILD_OFFLINE').length
    })

    return NextResponse.json({
      node: {
        id: updatedNode.id,
        name: updatedNode.name,
        isActive: updatedNode.isActive,
        healthStatus: updatedNode.healthStatus,
        updatedAt: updatedNode.updatedAt
      },
      offline: {
        status: offlineSuccess ? 'SUCCESS' : 'PARTIAL_SUCCESS',
        timestamp: new Date().toISOString(),
        reason: body.reason || 'Node set offline',
        graceful: body.graceful || false,
        results: offlineResults,
        summary: {
          services_processed: offlineResults.filter(r => r.operation === 'SERVICE_STOP').length,
          services_stopped: offlineResults.filter(r => r.operation === 'SERVICE_STOP' && r.status === 'STOPPED').length,
          children_processed: offlineResults.filter(r => r.operation === 'CHILD_OFFLINE').length,
          children_offlined: offlineResults.filter(r => r.operation === 'CHILD_OFFLINE' && r.status === 'OFFLINE').length
        }
      },
      warning: !offlineSuccess ? 'Some operations failed during offline process' : undefined
    })

  } catch (error) {
    console.error('Error setting node offline:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', {
      operation: 'offline_node',
      node_id: nodeId
    })
  }
}