import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiErrorHandler } from '@/lib/api-error'

interface PushServicesRequest {
  services?: string[]
  targetNodes?: string[]
  forceUpdate?: boolean
  validateOnly?: boolean
}

// POST /admin/nodes/{id}/push-services - 推送服务配置到其他节点
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const nodeId = id
    const body: PushServicesRequest = await request.json()

    // 验证源节点是否存在
    const sourceNode = await db.node.findUnique({
      where: { id: nodeId },
      include: {
        capabilities: {
          where: { isEnabled: true },
          select: {
            productType: true,
            serviceType: true,
            endpoint: true,
            version: true,
            configuration: true
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

    if (!sourceNode) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { node_id: nodeId })
    }

    // 检查源节点状态
    if (sourceNode.healthStatus === 'ERROR') {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_READY', {
        node_id: nodeId,
        reason: 'Source node health status is ERROR',
        health_status: sourceNode.healthStatus
      })
    }

    // 获取要推送的服务列表
    const servicesToPush = body.services || sourceNode.capabilities.map(cap => cap.productType)
    
    // 验证服务是否在源节点上可用
    const unavailableServices = servicesToPush.filter(service => 
      !sourceNode.capabilities.some(cap => cap.productType === service)
    )

    if (unavailableServices.length > 0) {
      return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
        field: 'services',
        message: `Some services are not available on source node: ${unavailableServices.join(', ')}`,
        unavailable_services: unavailableServices
      })
    }

    // 确定目标节点
    let targetNodes = []
    if (body.targetNodes && body.targetNodes.length > 0) {
      // 使用指定的目标节点
      targetNodes = await db.node.findMany({
        where: {
          id: { in: body.targetNodes },
          isActive: true
        },
        include: {
          capabilities: {
            where: { isEnabled: true },
            select: {
              productType: true,
              serviceType: true,
              version: true
            }
          }
        }
      })
    } else {
      // 推送到同级别的兄弟节点
      targetNodes = await db.node.findMany({
        where: {
          parentId: sourceNode.parentId,
          id: { not: nodeId },
          isActive: true
        },
        include: {
          capabilities: {
            where: { isEnabled: true },
            select: {
              productType: true,
              serviceType: true,
              version: true
            }
          }
        }
      })
    }

    if (targetNodes.length === 0) {
      return ApiErrorHandler.createErrorResponse('NO_TARGET_NODES', {
        source_node_id: nodeId,
        reason: 'No suitable target nodes found'
      })
    }

    // 如果只是验证，返回验证结果
    if (body.validateOnly) {
      const validationResults = targetNodes.map(targetNode => ({
        targetNodeId: targetNode.id,
        targetNodeName: targetNode.name,
        compatible: true,
        services: servicesToPush.map(service => {
          const sourceCap = sourceNode.capabilities.find(cap => cap.productType === service)
          const targetCap = targetNode.capabilities.find(cap => cap.productType === service)
          
          return {
            service,
            sourceVersion: sourceCap?.version || 'unknown',
            targetVersion: targetCap?.version || 'not_installed',
            action: targetCap ? 'UPDATE' : 'INSTALL',
            compatible: true
          }
        })
      }))

      return NextResponse.json({
        validation: {
          status: 'VALID',
          timestamp: new Date().toISOString(),
          sourceNode: {
            id: sourceNode.id,
            name: sourceNode.name
          },
          targetNodes: validationResults,
          summary: {
            target_count: targetNodes.length,
            services_count: servicesToPush.length,
            total_operations: targetNodes.length * servicesToPush.length
          }
        }
      })
    }

    // 执行服务推送
    const pushResults = []
    let pushSuccess = true
    let successfulPushes = 0
    let failedPushes = 0

    for (const targetNode of targetNodes) {
      const nodeResults = []
      let nodeSuccess = true

      for (const service of servicesToPush) {
        try {
          // 模拟推送延迟
          await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400))
          
          // 模拟推送结果（90%成功率）
          const isSuccess = Math.random() > 0.1
          
          const sourceCap = sourceNode.capabilities.find(cap => cap.productType === service)
          const targetCap = targetNode.capabilities.find(cap => cap.productType === service)
          
          const result = {
            service,
            targetNodeId: targetNode.id,
            targetNodeName: targetNode.name,
            operation: targetCap ? 'UPDATE' : 'INSTALL',
            status: isSuccess ? 'SUCCESS' : 'FAILED',
            sourceVersion: sourceCap?.version || 'unknown',
            targetVersion: targetCap?.version || 'not_installed',
            timestamp: new Date().toISOString(),
            message: isSuccess 
              ? `Service ${targetCap ? 'updated' : 'installed'} successfully` 
              : `Service ${targetCap ? 'update' : 'installation'} failed`,
            details: {
              endpoint: targetNode.apiUrl || 'unknown',
              forced: body.forceUpdate || false
            }
          }

          nodeResults.push(result)

          if (isSuccess) {
            // 在实际应用中，这里会更新目标节点的服务配置
            // 为了演示，我们只记录结果
          } else {
            nodeSuccess = false
          }

        } catch (error) {
          const result = {
            service,
            targetNodeId: targetNode.id,
            targetNodeName: targetNode.name,
            operation: 'ERROR',
            status: 'FAILED',
            timestamp: new Date().toISOString(),
            message: 'Service push encountered an error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }

          nodeResults.push(result)
          nodeSuccess = false
        }
      }

      const nodeResult = {
        targetNodeId: targetNode.id,
        targetNodeName: targetNode.name,
        status: nodeSuccess ? 'SUCCESS' : 'PARTIAL_SUCCESS',
        results: nodeResults,
        summary: {
          services_processed: nodeResults.length,
          services_success: nodeResults.filter(r => r.status === 'SUCCESS').length,
          services_failed: nodeResults.filter(r => r.status === 'FAILED').length
        }
      }

      pushResults.push(nodeResult)

      if (nodeSuccess) {
        successfulPushes++
      } else {
        failedPushes++
        pushSuccess = false
      }
    }

    // 记录推送日志
    console.log(`Services pushed from node: ${nodeId}`, {
      success: pushSuccess,
      services_pushed: servicesToPush.length,
      target_nodes: targetNodes.length,
      successful_pushes,
      failed_pushes,
      forced: body.forceUpdate || false
    })

    return NextResponse.json({
      sourceNode: {
        id: sourceNode.id,
        name: sourceNode.name
      },
      push: {
        status: pushSuccess ? 'SUCCESS' : 'PARTIAL_SUCCESS',
        timestamp: new Date().toISOString(),
        services: servicesToPush,
        results: pushResults,
        summary: {
          target_nodes: targetNodes.length,
          services_count: servicesToPush.length,
          total_operations: targetNodes.length * servicesToPush.length,
          successful_nodes: successfulPushes,
          failed_nodes: failedPushes,
          success_rate: Math.round((successfulPushes / targetNodes.length) * 100)
        }
      },
      warning: !pushSuccess ? 'Some service pushes failed' : undefined
    })

  } catch (error) {
    console.error('Error pushing services:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', {
      operation: 'push_services',
      node_id: nodeId
    })
  }
}