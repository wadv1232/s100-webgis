import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiErrorHandler } from '@/lib/api-error'

interface ServiceActionRequest {
  action: 'start' | 'stop' | 'restart'
}

interface ServiceActionResponse {
  service_id: string
  action: string
  status: 'success' | 'failed'
  message: string
  previous_status?: string
  new_status?: string
  timestamp: string
}

// POST /admin/services/{id}/actions - 对服务实例执行启停操作
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body: ServiceActionRequest = await request.json()

    // 验证操作类型
    if (!['start', 'stop', 'restart'].includes(body.action)) {
      return ApiErrorHandler.createErrorResponse('INVALID_ACTION', {
        action: body.action,
        valid_actions: ['start', 'stop', 'restart']
      })
    }

    // 验证服务是否存在
    const service = await db.service.findUnique({
      where: { id },
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
            productType: true,
            status: true
          }
        }
      }
    })

    if (!service) {
      return ApiErrorHandler.createErrorResponse('SERVICE_NOT_FOUND', {
        service_id: id
      })
    }

    const previousStatus = service.isActive ? 'running' : 'stopped'
    let newStatus: 'running' | 'stopped' = previousStatus
    let actionMessage = ''

    // 执行操作
    switch (body.action) {
      case 'start':
        if (!service.isActive) {
          await db.service.update({
            where: { id },
            data: { isActive: true }
          })
          newStatus = 'running'
          actionMessage = 'Service started successfully'
        } else {
          actionMessage = 'Service is already running'
        }
        break

      case 'stop':
        if (service.isActive) {
          await db.service.update({
            where: { id },
            data: { isActive: false }
          })
          newStatus = 'stopped'
          actionMessage = 'Service stopped successfully'
        } else {
          actionMessage = 'Service is already stopped'
        }
        break

      case 'restart':
        // 重启操作：先停止，然后启动
        await db.service.update({
          where: { id },
          data: { isActive: false }
        })

        // 模拟重启延迟
        await new Promise(resolve => setTimeout(resolve, 1000))

        await db.service.update({
          where: { id },
          data: { isActive: true }
        })

        newStatus = 'running'
        actionMessage = 'Service restarted successfully'
        break
    }

    // 记录操作日志
    try {
      const config = service.configuration ? JSON.parse(service.configuration as string) : {}
      const updatedConfig = {
        ...config,
        last_action: {
          action: body.action,
          timestamp: new Date().toISOString(),
          previous_status: previousStatus,
          new_status: newStatus
        }
      }

      await db.service.update({
        where: { id },
        data: {
          configuration: JSON.stringify(updatedConfig)
        }
      })
    } catch (logError) {
      console.warn('Failed to log service action:', logError)
    }

    const response: ServiceActionResponse = {
      service_id: id,
      action: body.action,
      status: 'success',
      message: actionMessage,
      previous_status: previousStatus,
      new_status: newStatus,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error executing service action:', error)
    
    const response: ServiceActionResponse = {
      service_id: params.id,
      action: body.action,
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// GET /admin/services/{id}/actions - 获取服务操作历史
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // 验证服务是否存在
    const service = await db.service.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
        configuration: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!service) {
      return ApiErrorHandler.createErrorResponse('SERVICE_NOT_FOUND', {
        service_id: id
      })
    }

    // 从配置中提取操作历史
    let actionHistory: any[] = []
    try {
      const config = service.configuration ? JSON.parse(service.configuration as string) : {}
      if (config.last_action) {
        actionHistory = [config.last_action]
      }
      if (config.action_history && Array.isArray(config.action_history)) {
        actionHistory = [...config.action_history, ...actionHistory]
      }
    } catch (error) {
      console.warn('Failed to parse service configuration:', error)
    }

    return NextResponse.json({
      service_id: id,
      current_status: service.isActive ? 'running' : 'stopped',
      action_history: actionHistory.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
      service_info: {
        created_at: service.createdAt.toISOString(),
        updated_at: service.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching service action history:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'get_service_actions' })
  }
}