import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

interface RouteParams {
  params: { id: string }
}

// POST /api/services/[id]/publish - 发布服务（支持紧急航道变更）
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await auth(request)
    if (!user || !user.permissions.includes('DATASET_PUBLISH')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { isEmergency = false, priority = 'normal', message } = body

    // 检查服务是否存在
    const capability = await db.capability.findUnique({
      where: { id },
      include: {
        node: true
      }
    })
    if (!capability) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // 检查节点是否支持发布
    if (!capability.node.isActive) {
      return NextResponse.json({ error: 'Node is not active' }, { status: 400 })
    }

    // 如果是紧急发布，需要特殊处理
    if (isEmergency) {
      // 紧急发布：立即生效，跳过常规流程
      console.log(`Emergency service publish initiated by ${user.name}: ${message}`)
      
      // 记录紧急发布日志 - 不需要关联到具体数据集
      try {
        await db.service.create({
          data: {
            datasetId: 'emergency', // 系统服务
            serviceType: capability.serviceType,
            endpoint: capability.endpoint,
            configuration: JSON.stringify({
              action: 'emergency_publish',
              serviceId: id,
              nodeId: capability.nodeId,
              publishedBy: user.id,
              priority: 'emergency',
              message,
              timestamp: new Date().toISOString()
            })
          }
        })
      } catch (logError) {
        // 如果日志记录失败，不影响主要功能
        console.warn('Failed to log emergency service publish:', logError)
      }

      // 模拟立即发布到所有相关节点
      // 在实际系统中，这里会调用其他节点的API
      const publishResult = {
        success: true,
        publishedAt: new Date().toISOString(),
        affectedNodes: [capability.nodeId],
        message: 'Emergency service published successfully'
      }

      return NextResponse.json({
        message: 'Emergency service published successfully',
        publishResult
      })
    }

    // 常规发布流程
    const publishResult = {
      success: true,
      publishedAt: new Date().toISOString(),
      affectedNodes: [capability.nodeId],
      priority,
      message: message || 'Service published successfully'
    }

    // 记录发布日志 - 不需要关联到具体数据集
    try {
      await db.service.create({
        data: {
          datasetId: 'publish', // 系统服务
          serviceType: capability.serviceType,
          endpoint: capability.endpoint,
          configuration: JSON.stringify({
            action: 'publish',
            serviceId: id,
            nodeId: capability.nodeId,
            publishedBy: user.id,
            priority,
            message,
            timestamp: new Date().toISOString()
          })
        }
      })
    } catch (logError) {
      // 如果日志记录失败，不影响主要功能
      console.warn('Failed to log service publish:', logError)
    }

    return NextResponse.json({
      message: 'Service published successfully',
      publishResult
    })
  } catch (error) {
    console.error('Error publishing service:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}