import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiErrorHandler } from '@/lib/api-error'

interface PublishRequest {
  services?: string[]
  force?: boolean
  message?: string
}

// POST /admin/nodes/{id}/publish - 发布节点服务
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const nodeId = id
    const body: PublishRequest = await request.json()

    // 验证节点是否存在
    const node = await db.node.findUnique({
      where: { id: nodeId },
      include: {
        capabilities: {
          where: { isEnabled: true },
          include: {
            datasets: {
              select: {
                id: true,
                name: true,
                status: true,
                publishedAt: true
              }
            }
          }
        },
        parent: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!node) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { node_id: nodeId })
    }

    // 检查节点是否处于可发布状态
    if (node.healthStatus === 'ERROR') {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_READY', {
        node_id: nodeId,
        reason: 'Node health status is ERROR',
        health_status: node.healthStatus
      })
    }

    if (!node.isActive) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_READY', {
        node_id: nodeId,
        reason: 'Node is not active',
        is_active: node.isActive
      })
    }

    // 获取要发布的服务列表
    const servicesToPublish = body.services || node.capabilities.map(cap => cap.productType)
    
    // 验证服务是否可用
    const unavailableServices = servicesToPublish.filter(service => 
      !node.capabilities.some(cap => cap.productType === service)
    )

    if (unavailableServices.length > 0 && !body.force) {
      return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
        field: 'services',
        message: `Some services are not available: ${unavailableServices.join(', ')}`,
        unavailable_services: unavailableServices
      })
    }

    // 模拟发布过程
    const publishResults = []
    let publishSuccess = true
    let publishedServices = []

    for (const service of servicesToPublish) {
      try {
        // 模拟发布延迟
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
        
        // 模拟发布结果（95%成功率）
        const isSuccess = Math.random() > 0.05
        
        const result = {
          service,
          status: isSuccess ? 'PUBLISHED' : 'FAILED',
          timestamp: new Date().toISOString(),
          message: isSuccess ? 'Service published successfully' : 'Publish operation failed',
          details: {
            endpoint: node.capabilities.find(cap => cap.productType === service)?.endpoint || 'unknown',
            version: '1.0.0',
            datasets: node.capabilities.find(cap => cap.productType === service)?.datasets.length || 0
          }
        }

        publishResults.push(result)

        if (isSuccess) {
          publishedServices.push(service)
        } else {
          publishSuccess = false
        }

      } catch (error) {
        const result = {
          service,
          status: 'FAILED',
          timestamp: new Date().toISOString(),
          message: 'Publish operation encountered an error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }

        publishResults.push(result)
        publishSuccess = false
      }
    }

    // 更新节点的发布状态
    const updatedNode = await db.node.update({
      where: { id: nodeId },
      data: {
        isActive: publishSuccess,
        updatedAt: new Date()
      }
    })

    // 记录发布日志
    console.log(`Node publish operation completed: ${nodeId}`, {
      success: publishSuccess,
      services_requested: servicesToPublish.length,
      services_published: publishedServices.length,
      forced: body.force || false
    })

    return NextResponse.json({
      node: {
        id: updatedNode.id,
        name: updatedNode.name,
        isActive: updatedNode.isActive,
        updatedAt: updatedNode.updatedAt
      },
      publish: {
        status: publishSuccess ? 'SUCCESS' : 'PARTIAL_SUCCESS',
        timestamp: new Date().toISOString(),
        message: body.message || 'Node services published',
        results: publishResults,
        summary: {
          requested: servicesToPublish.length,
          published: publishedServices.length,
          failed: servicesToPublish.length - publishedServices.length,
          success_rate: Math.round((publishedServices.length / servicesToPublish.length) * 100)
        }
      },
      warning: !publishSuccess ? 'Some services failed to publish' : undefined
    })

  } catch (error) {
    console.error('Error publishing node:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', {
      operation: 'publish_node',
      node_id: nodeId
    })
  }
}