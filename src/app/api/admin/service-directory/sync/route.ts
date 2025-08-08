import { NextRequest, NextResponse } from 'next/server'
import { ServiceDirectorySync } from '@/lib/service-directory-sync'
import { ApiErrorHandler, withApiHandler } from '@/lib/api-error'

const syncHandler = withApiHandler(async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'full'
  const nodeId = searchParams.get('nodeId')

  const syncService = ServiceDirectorySync.getInstance()

  let result
  switch (type) {
    case 'full':
      result = await syncService.fullSync()
      break
    case 'node':
      if (!nodeId) {
        return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
          required: ['nodeId'],
          provided: Object.fromEntries(searchParams.entries())
        })
      }
      result = await syncService.syncNode(nodeId)
      break
    default:
      return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
        parameter: 'type',
        message: 'Invalid sync type. Must be "full" or "node"'
      })
  }

  return NextResponse.json(result)
})

export { syncHandler as POST }

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const action = searchParams.get('action')

    const syncService = ServiceDirectorySync.getInstance()

    switch (action) {
      case 'status':
        const status = await syncService.getSyncStatus(taskId || undefined)
        return NextResponse.json(status)

      case 'stats':
        const stats = await syncService.getDirectoryStats()
        return NextResponse.json(stats)

      case 'cleanup':
        const cleanedCount = await syncService.cleanupExpiredEntries()
        return NextResponse.json({
          success: true,
          message: `清理了 ${cleanedCount} 个过期条目`,
          cleanedCount
        })

      default:
        // 默认返回最近的同步状态
        const recentStatus = await syncService.getSyncStatus()
        return NextResponse.json(recentStatus)
    }
  } catch (error) {
    console.error('Error in service directory sync API:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR')
  }
}