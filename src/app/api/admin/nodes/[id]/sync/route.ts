import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ServiceDirectory } from '@/lib/service-directory'
import { ApiErrorHandler } from '@/lib/api-error'

interface SyncResponse {
  task_id: string
  status: 'started' | 'completed' | 'failed'
  message: string
  results?: {
    capabilities_synced: number
    services_discovered: number
    errors_count: number
    duration_ms: number
  }
  error?: string
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  
  try {
    const { id } = await context.params

    // 验证节点是否存在
    const node = await db.node.findUnique({
      where: { id }
    })

    if (!node) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { node_id: id })
    }

    // 生成任务ID
    const taskId = `sync-${id}-${Date.now()}`

    try {
      // 获取服务目录实例
      const serviceDirectory = ServiceDirectory.getInstance()

      // 同步节点能力
      const syncResult = await serviceDirectory.syncNodeCapabilities(id)

      // 更新节点健康状态
      await db.node.update({
        where: { id },
        data: {
          healthStatus: 'HEALTHY',
          lastHealthCheck: new Date()
        }
      })

      const duration = Date.now() - startTime

      const response: SyncResponse = {
        task_id: taskId,
        status: 'completed',
        message: 'Node synchronization completed successfully',
        results: {
          capabilities_synced: syncResult.capabilitiesCount || 0,
          services_discovered: syncResult.servicesCount || 0,
          errors_count: syncResult.errorsCount || 0,
          duration_ms: duration
        }
      }

      // 记录同步日志
      console.log(`Node sync completed: ${id} (${node.name}) - ${duration}ms`)

      return NextResponse.json(response)

    } catch (syncError) {
      console.error('Node synchronization failed:', syncError)

      // 更新节点健康状态为错误
      await db.node.update({
        where: { id },
        data: {
          healthStatus: 'ERROR',
          lastHealthCheck: new Date()
        }
      })

      const response: SyncResponse = {
        task_id: taskId,
        status: 'failed',
        message: 'Node synchronization failed',
        error: syncError instanceof Error ? syncError.message : 'Unknown error'
      }

      return NextResponse.json(response, { status: 500 })
    }

  } catch (error) {
    console.error('Error in sync API:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'sync_node' })
  }
}

// GET /admin/nodes/{id}/sync - 获取同步状态和历史
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // 验证节点是否存在
    const node = await db.node.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        healthStatus: true,
        lastHealthCheck: true,
        serviceDirectoryEntries: {
          select: {
            productType: true,
            serviceType: true,
            lastSyncedAt: true,
            confidence: true,
            isEnabled: true
          },
          orderBy: { lastSyncedAt: 'desc' },
          take: 10
        }
      }
    })

    if (!node) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { node_id: id })
    }

    // 计算同步统计
    const syncStats = {
      total_entries: node.serviceDirectoryEntries.length,
      active_entries: node.serviceDirectoryEntries.filter(e => e.isEnabled).length,
      last_sync: node.serviceDirectoryEntries[0]?.lastSyncedAt || null,
      average_confidence: node.serviceDirectoryEntries.length > 0 
        ? node.serviceDirectoryEntries.reduce((sum, e) => sum + e.confidence, 0) / node.serviceDirectoryEntries.length
        : 0
    }

    // 按产品类型分组
    const productGroups = node.serviceDirectoryEntries.reduce((acc, entry) => {
      if (!acc[entry.productType]) {
        acc[entry.productType] = {
          productType: entry.productType,
          services: [],
          lastSyncedAt: null,
          averageConfidence: 0
        }
      }
      
      acc[entry.productType].services.push(entry.serviceType)
      
      if (entry.lastSyncedAt && (!acc[entry.productType].lastSyncedAt || 
          new Date(entry.lastSyncedAt) > new Date(acc[entry.productType].lastSyncedAt!))) {
        acc[entry.productType].lastSyncedAt = entry.lastSyncedAt
      }
      
      return acc
    }, {} as Record<string, any>)

    // 计算每个产品类型的平均置信度
    Object.keys(productGroups).forEach(productType => {
      const entries = node.serviceDirectoryEntries.filter(e => e.productType === productType)
      const avgConfidence = entries.reduce((sum, e) => sum + e.confidence, 0) / entries.length
      productGroups[productType].averageConfidence = avgConfidence
    })

    return NextResponse.json({
      node: {
        id: node.id,
        name: node.name,
        health_status: node.healthStatus,
        last_health_check: node.lastHealthCheck
      },
      sync_stats: syncStats,
      product_groups: Object.values(productGroups),
      recent_syncs: node.serviceDirectoryEntries.slice(0, 5)
    })

  } catch (error) {
    console.error('Error fetching sync status:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'get_sync_status' })
  }
}